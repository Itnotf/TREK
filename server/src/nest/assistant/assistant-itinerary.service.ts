import { AssistantItineraryDrafts } from '../../db/entities/AssistantItineraryDrafts.entity';
import { AssistantThreads } from '../../db/entities/AssistantThreads.entity';
import { ASSISTANT_ITINERARY_PLAN } from '../../db/json-columns';
import type {
  AssistantItineraryDraftRow,
  AssistantItineraryDraftsRepository,
} from '../../db/repositories/AssistantItineraryDrafts.repository';
import type { AssistantThreadsRepository } from '../../db/repositories/AssistantThreads.repository';
import { dbNow } from '../../db/types';
import { decodeJsonResult, encodeJson } from '../../utils/json-column';
import { AssignmentsService } from '../assignments/assignments.service';
import { DomainError } from '../common/domain-error';
import { UnitOfWork } from '../database/unit-of-work';
import { DayNotesService } from '../day-notes/day-notes.service';
import { DaysService } from '../days/days.service';
import { isGooglePlaceId, OSM_PLACE_ID } from '../maps/maps.service';
import { McpToolGuardsService } from '../mcp-shared/mcp-tool-guards.service';
import { PermissionsService } from '../permissions/permissions.service';
import { PlacesService } from '../places/places.service';
import { RealtimeService } from '../realtime/realtime.service';
import { TripsService } from '../trips/trips.service';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import {
  addIsoDays,
  dayNoteCreateRequestSchema,
  itineraryApplyRequestSchema,
  itinerarySaveRequestSchema,
  tripSchema,
  type ItineraryApplyRequest,
  type ItineraryDraft,
  type ItineraryPlan,
  type ItinerarySaveRequest,
} from '@trek/shared';

/** Chat edits only append drafts. An explicit confirmation commits the complete itinerary exactly once. */
@Injectable()
export class AssistantItineraryService {
  constructor(
    @InjectRepository(AssistantItineraryDrafts) private readonly drafts: AssistantItineraryDraftsRepository,
    @InjectRepository(AssistantThreads) private readonly threads: AssistantThreadsRepository,
    private readonly uow: UnitOfWork,
    private readonly trips: TripsService,
    private readonly days: DaysService,
    private readonly dayNotes: DayNotesService,
    private readonly places: PlacesService,
    private readonly assignments: AssignmentsService,
    private readonly permissions: PermissionsService,
    private readonly guards: McpToolGuardsService,
    private readonly realtime: RealtimeService,
  ) {}

  async get(userId: number, id: number): Promise<ItineraryDraft> {
    const row = await this.requireDraft(userId, id);
    const latest = await this.drafts.latest(userId, row.thread_id);
    return this.toDraft(row, latest?.revision ?? row.revision);
  }

  async current(userId: number, threadId: number): Promise<ItineraryDraft | null> {
    await this.requireThread(userId, threadId);
    const row = await this.drafts.latest(userId, threadId);
    return row ? this.toDraft(row, row.revision) : null;
  }

  async save(userId: number, threadId: number, input: ItinerarySaveRequest): Promise<ItineraryDraft> {
    const parsed = itinerarySaveRequestSchema.safeParse(input);
    if (!parsed.success) throw new DomainError(400, 'Invalid itinerary draft');
    return this.uow.transactional(async () => {
      await this.requireThread(userId, threadId);
      const previous = await this.drafts.latest(userId, threadId);
      if (previous?.applied_at) {
        throw new DomainError(409, 'This itinerary was confirmed. Continue editing in its trip.');
      }
      const revision = previous?.revision ?? 0;
      if (parsed.data.base_revision !== revision) {
        throw new DomainError(409, 'The itinerary has changed. Read its latest revision before editing.');
      }
      const id = await this.drafts.insertRevision(
        threadId,
        revision + 1,
        encodeJson(ASSISTANT_ITINERARY_PLAN, parsed.data.plan),
      );
      return this.toDraft(await this.requireDraft(userId, id), revision + 1);
    });
  }

  async apply(userId: number, id: number, input: ItineraryApplyRequest) {
    const parsed = itineraryApplyRequestSchema.safeParse(input);
    if (!parsed.success) throw new DomainError(400, 'Invalid itinerary confirmation');
    const result = await this.uow.transactional(async () => {
      const row = await this.requireDraft(userId, id);
      const latest = await this.drafts.latest(userId, row.thread_id);
      if (parsed.data.revision !== row.revision || latest?.id !== id) {
        throw new DomainError(409, 'This draft is out of date. Confirm the latest itinerary.');
      }
      if (row.applied_at) {
        const trip = row.applied_trip_id ? await this.trips.get(row.applied_trip_id, userId) : undefined;
        if (!trip) throw new DomainError(410, 'The trip created from this itinerary was deleted.');
        return { trip: tripSchema.parse(trip), created: false };
      }

      await this.requireCreatePermissions(userId);
      const { plan } = this.toDraft(row, row.revision);
      const { tripId } = await this.trips.create(userId, {
        title: plan.title,
        description: tripDescription(plan),
        start_date: plan.start_date ?? undefined,
        end_date: plan.start_date ? addIsoDays(plan.start_date, plan.days.length - 1) : undefined,
        day_count: plan.days.length,
        currency: plan.currency,
        reminder_days: 0,
        roadtrip_preferences: plan.roadtrip_preferences,
      });
      const { days } = await this.days.list(tripId);
      if (days.length !== plan.days.length) throw new DomainError(500, 'Could not create all itinerary days');
      await plan.days.reduce<Promise<void>>(async (previousDay, dayPlan, index) => {
        await previousDay;
        const day = days[index];
        await this.days.update(day.id, day, {
          title: dayPlan.title,
        });
        await itineraryNotes(dayPlan).reduce<Promise<void>>(async (previousNote, text, order) => {
          await previousNote;
          await this.dayNotes.create(day.id, tripId, text, undefined, undefined, order);
        }, Promise.resolve());
        await this.days.setDefaultTransportMode(day.id, plan.transport_mode);
        await dayPlan.stops.reduce<Promise<void>>(async (previousStop, stop) => {
          await previousStop;
          const location = stop.location;
          const place = await this.places.create(String(tripId), {
            name: stop.name,
            description: stop.description,
            address: location?.address || stop.city,
            notes: stop.city,
            lat: location?.lat,
            lng: location?.lng,
            ...providerIds(location?.place_id),
            place_time: stop.arrival_time ?? undefined,
            duration_minutes: stop.duration_minutes,
            transport_mode: plan.transport_mode,
          });
          await this.assignments.createAssignment(day.id, place.id);
        }, Promise.resolve());
      }, Promise.resolve());
      await this.drafts.markApplied(id, tripId, dbNow());
      return { trip: tripSchema.parse(await this.trips.get(tripId, userId)), created: true };
    });
    if (result.created) this.realtime.broadcastToUser(userId, { type: 'trips:changed' });
    return { trip: result.trip };
  }

  private async requireThread(userId: number, threadId: number): Promise<void> {
    if (!(await this.threads.findOwnedAtHome(threadId, userId))) {
      throw new DomainError(404, 'Conversation not found');
    }
  }

  private async requireDraft(userId: number, id: number): Promise<AssistantItineraryDraftRow> {
    const row = await this.drafts.findOwned(userId, id);
    if (!row) throw new DomainError(404, 'Itinerary draft not found');
    return row;
  }

  private toDraft(row: AssistantItineraryDraftRow, latestRevision: number): ItineraryDraft {
    const decoded = decodeJsonResult(ASSISTANT_ITINERARY_PLAN, row.plan);
    if (!decoded.ok || !decoded.value) throw new DomainError(500, 'Stored itinerary draft is invalid');
    return {
      id: row.id,
      thread_id: row.thread_id,
      revision: row.revision,
      plan: decoded.value,
      created_trip_id: row.applied_trip_id,
      latest_revision: latestRevision,
    };
  }

  private async requireCreatePermissions(userId: number): Promise<void> {
    const role = (await this.guards.isAdminUser(userId)) ? 'admin' : 'user';
    const allowed = await Promise.all(
      ['trip_create', 'day_edit', 'place_edit'].map((action) =>
        this.permissions.checkPermission(action, role, action === 'trip_create' ? null : userId, userId, false),
      ),
    );
    if (allowed.includes(false)) throw new DomainError(403, 'No permission to create this itinerary');
  }
}

function itineraryNotes(day: ItineraryPlan['days'][number]): string[] {
  const maxLength = dayNoteCreateRequestSchema.shape.text.maxLength ?? 500;
  return [day.notes, day.overnight_city ? `Overnight / 住宿城市: ${day.overnight_city}` : ''].flatMap((text) => {
    const chunks: string[] = [];
    let chunk = '';
    // Saved notes must fit the same editable limit as notes entered by a user.
    for (const character of text.trim()) {
      if (chunk.length + character.length > maxLength) {
        if (chunk.trim()) chunks.push(chunk);
        chunk = '';
      }
      chunk += character;
    }
    if (chunk.trim()) chunks.push(chunk);
    return chunks;
  });
}

function tripDescription(plan: ItineraryPlan): string {
  return [
    plan.summary,
    plan.requirements.length
      ? `Requirements / 旅行需求:\n${plan.requirements.map((item) => `- ${item}`).join('\n')}`
      : '',
    plan.assumptions.length
      ? `Assumptions / 待核实事项:\n${plan.assumptions.map((item) => `- ${item}`).join('\n')}`
      : '',
    plan.sources?.length
      ? `Sources / 参考来源:\n${plan.sources.map((source) => `${source.title}: ${source.url}`).join('\n')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

function providerIds(id: string | undefined) {
  if (!id) return {};
  if (id.startsWith('amap:')) return { amap_poi_id: id };
  if (OSM_PLACE_ID.test(id) || id.startsWith('gers:')) return { osm_id: id };
  if (isGooglePlaceId(id)) return { google_place_id: id };
  return {};
}
