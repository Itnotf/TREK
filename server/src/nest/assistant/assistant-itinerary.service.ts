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
import { AccommodationsService } from '../accommodations/accommodations.service';
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
  itineraryApplyRequestSchema,
  itinerarySaveRequestSchema,
  itineraryStopEndTime,
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
    private readonly accommodations: AccommodationsService,
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
        if (dayPlan.notes.trim()) {
          // Day notes use text as their title and time as their Markdown body.
          await this.dayNotes.create(day.id, tripId, dayPlan.title, dayPlan.notes, 'FileText', 0);
        }
        if (plan.schedule_version !== 2 && dayPlan.overnight_city.trim()) {
          await this.dayNotes.create(
            day.id,
            tripId,
            dayPlan.overnight_city,
            undefined,
            'BedDouble',
            dayPlan.notes.trim() ? 1 : 0,
          );
        }
        await this.days.setDefaultTransportMode(day.id, plan.transport_mode);
        const stopPlaces = new Map<string, number>();
        let previousAssignmentId: number | null = null;
        await dayPlan.stops.reduce<Promise<void>>(async (previousStop, stop, stopIndex) => {
          await previousStop;
          const location = stop.location;
          const place = await this.places.create(
            String(tripId),
            {
              name: stop.name,
              description: [stop.description, stop.travel_from_previous?.notes].filter(Boolean).join('\n\n'),
              address: location?.address || stop.city,
              notes: stop.city,
              lat: location?.lat,
              lng: location?.lng,
              ...providerIds(location?.place_id),
              place_time: stop.arrival_time ?? undefined,
              end_time: plan.schedule_version === 2 ? (itineraryStopEndTime(stop) ?? undefined) : undefined,
              duration_minutes: stop.duration_minutes,
              transport_mode: plan.transport_mode,
              stop_type: location ? activityStopType(stop.kind) : undefined,
            },
            plan.schedule_version === 2 ? 'assistant' : undefined,
          );
          const assignment = await this.assignments.createAssignment(day.id, place.id);
          if (plan.schedule_version === 2) {
            if (stop.id) stopPlaces.set(stop.id, place.id);
            if (stop.time_kind === 'fixed') {
              await this.assignments.updateTime(assignment.id, stop.arrival_time, itineraryStopEndTime(stop));
            }
            const travel = stop.travel_from_previous;
            if (travel) {
              await this.assignments.setIncomingLegTransportMode(assignment.id, travel.mode);
              if (previousAssignmentId !== null) {
                await this.assignments.setLegTransportMode(previousAssignmentId, travel.mode);
              }
            }
            if (travel && travel.duration_minutes !== 0) {
              await this.dayNotes.create(
                day.id,
                tripId,
                travelTitle(stop),
                travel.duration_minutes !== null && stop.arrival_time
                  ? travelStart(stop.arrival_time, travel.duration_minutes)
                  : undefined,
                'ArrowRight',
                stopIndex - 0.5,
              );
            }
          }
          previousAssignmentId = assignment.id;
        }, Promise.resolve());
        if (plan.schedule_version === 2 && dayPlan.stay) {
          const stay = dayPlan.stay;
          const nextDay = days[index + 1];
          if (!nextDay) throw new DomainError(400, 'An overnight stay needs a following checkout day');
          if (stay.name && stay.location) {
            const existing = dayPlan.stops.find(
              (stop) => stop.location?.place_id === stay.location?.place_id && stop.name === stay.name,
            );
            let placeId = existing?.id ? stopPlaces.get(existing.id) : undefined;
            if (!placeId) {
              const place = await this.places.create(
                String(tripId),
                {
                  name: stay.name,
                  description: stay.notes,
                  address: stay.location.address || stay.area,
                  lat: stay.location.lat,
                  lng: stay.location.lng,
                  ...providerIds(stay.location.place_id),
                  stop_type: 'hotel',
                  duration_minutes: 0,
                  transport_mode: plan.transport_mode,
                },
                'assistant',
              );
              placeId = place.id;
            }
            await this.accommodations.createAccommodation(tripId, {
              place_id: placeId,
              start_day_id: day.id,
              end_day_id: nextDay.id,
              check_in: stay.check_in ?? undefined,
              check_out: stay.check_out ?? undefined,
              notes: stay.notes,
            });
          } else {
            await this.dayNotes.create(
              day.id,
              tripId,
              [`${stay.area} · 酒店待选 / Hotel to choose`, stay.name, stay.notes].filter(Boolean).join('\n'),
              stay.check_in ?? undefined,
              'BedDouble',
              dayPlan.stops.length,
            );
          }
        }
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

function travelStart(start: string, duration: number): string | undefined {
  const [hour, minute] = start.split(':').map(Number);
  const minutes = hour * 60 + minute - duration;
  if (minutes < 0 || minutes >= 1440) return undefined;
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

function activityStopType(kind: ItineraryPlan['days'][number]['stops'][number]['kind']) {
  if (kind === 'meal') return 'restaurant';
  if (kind === 'rest') return 'rest_area';
  return undefined;
}

function travelTitle(stop: ItineraryPlan['days'][number]['stops'][number]): string {
  const travel = stop.travel_from_previous;
  if (!travel) return '';
  const modes = {
    driving: '驾车 / Drive',
    walking: '步行 / Walk',
    transit: '公共交通 / Transit',
    cycling: '骑行 / Cycle',
  };
  const duration =
    travel.duration_minutes === null ? '车程待核实 / Time unknown' : `约 ${travel.duration_minutes} min · Estimate`;
  return `${modes[travel.mode]} → ${stop.name}\n${duration} · 路线待核实 / Route unverified`;
}
