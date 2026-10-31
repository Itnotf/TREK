/* eslint-disable no-await-in-loop -- Publication writes stay sequential inside the caller's transaction to preserve activity order. */
import { AssignmentParticipants } from '../../db/entities/AssignmentParticipants.entity';
import { DayAccommodations } from '../../db/entities/DayAccommodations.entity';
import { DayAssignments } from '../../db/entities/DayAssignments.entity';
import { DayNotes } from '../../db/entities/DayNotes.entity';
import { Days } from '../../db/entities/Days.entity';
import { Places } from '../../db/entities/Places.entity';
import { Reservations } from '../../db/entities/Reservations.entity';
import { TripPlanPublications } from '../../db/entities/TripPlanPublications.entity';
import { Trips } from '../../db/entities/Trips.entity';
import { DomainError } from '../common/domain-error';
import { DaysService } from '../days/days.service';
import { FilesService } from '../files/files.service';
import { isGooglePlaceId, OSM_PLACE_ID } from '../maps/maps.service';
import { PlacesService } from '../places/places.service';
import { TripGuideService } from '../trips/trip-guide.service';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import {
  addIsoDays,
  itineraryPlanSchema,
  itineraryStopEndTime,
  type ItineraryPlan,
  type TripGuideCurrent,
} from '@trek/shared';

import { createHash } from 'node:crypto';
import { z } from 'zod';

const itemMapping = z.object({ assignmentId: z.number().int(), placeId: z.number().int() });
const publicationMapping = z.object({
  stops: z.record(z.string(), itemMapping),
  stays: z.record(
    z.string(),
    z.object({
      noteId: z.number().int().optional(),
      noteText: z.string().optional(),
      noteTime: z.string().nullable().optional(),
    }),
  ),
});
type Mapping = z.infer<typeof publicationMapping>;
type Stop = ItineraryPlan['days'][number]['stops'][number];

/** Publishes a confirmed proposal in place. It never deletes catalog places, orders or user notes. */
@Injectable()
export class TripPlanPublisher {
  constructor(
    private readonly em: EntityManager,
    private readonly guides: TripGuideService,
    private readonly days: DaysService,
    private readonly places: PlacesService,
    private readonly files: FilesService,
  ) {}

  async snapshot(userId: number, tripId: number) {
    const read = await this.guides.read(userId, tripId);
    const mapping = await this.mapping(tripId, read.plan, read.current);
    return {
      plan: read.plan ? this.withCurrentActivities(read.plan, read.current, mapping) : null,
      current: read.current,
      activity_ids: Object.fromEntries(
        Object.entries(mapping.stops).map(([id, item]) => [String(item.assignmentId), id]),
      ),
      baseline: hash(read.current),
    };
  }

  /** The caller holds the revision lock and the transaction for both publication and confirmation. */
  async publish(userId: number, tripId: number, input: ItineraryPlan, baseline: string): Promise<void> {
    const plan = itineraryPlanSchema.parse(input);
    const { current, plan: original } = await this.guides.read(userId, tripId);
    if (hash(current) !== baseline) {
      throw new DomainError(409, 'The itinerary or its bookings changed. Ask AI for a new proposal before confirming.');
    }
    if (plan.schedule_version !== 2) throw new DomainError(400, 'A detailed daily schedule is required');
    const mapping = await this.mapping(tripId, original, current);
    await this.assertSafeRange(current, plan);
    const wantedIds = new Set(plan.days.flatMap((day) => day.stops.map(stopId)));
    for (const [id, item] of Object.entries(mapping.stops)) {
      if (!wantedIds.has(id)) {
        if (id.startsWith('formal-')) {
          throw new DomainError(
            409,
            'Keep the existing manual activities and their formal IDs in the proposal, or remove them explicitly from the daily itinerary first.',
          );
        }
        await this.removeUnlinkedStop(item.assignmentId, tripId);
        delete mapping.stops[id];
      }
    }
    // A fixed booking keeps its actual dates; shifting the trip around it needs explicit booking review.
    if (plan.start_date !== current.start_date && (current.reservations.length || current.accommodations.length)) {
      throw new DomainError(409, 'Review the existing bookings and stays before changing the travel dates.');
    }
    const formalDays = [...current.days];
    while (formalDays.length < plan.days.length) {
      const index = formalDays.length;
      const created = await this.days.create(tripId, plan.start_date ? addIsoDays(plan.start_date, index) : undefined);
      formalDays.push({ ...created, notes_items: [] });
    }
    for (let index = 0; index < plan.days.length; index++) {
      const dayPlan = plan.days[index];
      const day = formalDays[index];
      await this.em.getRepository(Days).nativeUpdate(
        { id: day.id },
        {
          title: dayPlan.title,
          date: plan.start_date ? addIsoDays(plan.start_date, index) : null,
          default_transport_mode: plan.transport_mode,
        },
      );
      const ordered: number[] = [];
      for (const stop of dayPlan.stops) {
        const id = stopId(stop);
        let item = mapping.stops[id];
        if (item) {
          const existing = await this.em.getRepository(DayAssignments).findOne({ id: item.assignmentId });
          if (!existing || !(await this.em.getRepository(Places).findOne({ id: item.placeId, trip: tripId }))) {
            throw new DomainError(409, 'An activity was removed. Ask AI for a new proposal.');
          }
          await this.assertBookingUnchanged(existing, stop, day.id);
          const place = await this.em.getRepository(Places).findOneOrFail({ id: item.placeId });
          // A place used by another visit must not change its description/time behind that visit's back.
          if (await this.em.getRepository(DayAssignments).count({ place: item.placeId, id: { $ne: existing.id } })) {
            if (place.name !== stop.name || (place.description ?? '') !== stop.description) {
              throw new DomainError(
                409,
                'This place is used by another activity. Edit the shared place before replanning.',
              );
            }
          } else {
            await this.places.update(String(tripId), String(item.placeId), this.placeFields(stop, plan));
          }
          if (existing.day_id !== day.id)
            await this.em.getRepository(DayAssignments).moveToDay(existing.id, day.id, ordered.length);
        } else {
          const place = await this.places.create(String(tripId), this.placeFields(stop, plan), 'assistant');
          const assignmentId = await this.em.getRepository(DayAssignments).insertAssignment({
            day_id: day.id,
            place_id: place.id,
            order_index: ordered.length,
            notes: null,
            accommodation_id: null,
          });
          item = { placeId: place.id, assignmentId };
          mapping.stops[id] = item;
        }
        // Suggested times remain editable; all visits nevertheless display the agreed start/end times.
        await this.em
          .getRepository(DayAssignments)
          .setTimes(item.assignmentId, stop.arrival_time, itineraryStopEndTime(stop));
        await this.em
          .getRepository(DayAssignments)
          .setIncomingLegMode(item.assignmentId, stop.travel_from_previous?.mode ?? null);
        ordered.push(item.assignmentId);
      }
      // Preserve system-owned hotel mirrors (and any unrelated user additions), after the planned activities.
      const other = await this.em
        .getRepository(DayAssignments)
        .find({ day: day.id }, { orderBy: { order_index: 'asc' } });
      await this.em.getRepository(DayAssignments).setOrderIndexes(
        [...ordered, ...other.map((row) => row.id).filter((id) => !ordered.includes(id))].map((id, order_index) => ({
          id,
          order_index,
        })),
        day.id,
      );
      await this.publishStay(tripId, day.id, dayPlan.stay ?? null, mapping);
    }
    for (const day of current.days.slice(plan.days.length)) {
      await this.em.getRepository(Days).nativeDelete({ id: day.id });
    }
    await this.em.getRepository(Trips).nativeUpdate(
      { id: tripId },
      {
        title: plan.title,
        start_date: plan.start_date,
        end_date: plan.start_date ? addIsoDays(plan.start_date, plan.days.length - 1) : null,
      },
    );
    const row = await this.em.getRepository(TripPlanPublications).findOne({ trip: tripId });
    if (row)
      await this.em
        .getRepository(TripPlanPublications)
        .nativeUpdate({ id: row.id }, { mapping: JSON.stringify(mapping) });
    else await this.em.getRepository(TripPlanPublications).insert({ trip: tripId, mapping: JSON.stringify(mapping) });
    await this.guides.saveConfirmed(tripId, plan);
  }

  private placeFields(stop: Stop, plan: ItineraryPlan) {
    const location = stop.location;
    const id = location?.place_id;
    return {
      name: stop.name,
      description: stop.description,
      address: location?.address || stop.city,
      lat: location?.lat ?? null,
      lng: location?.lng ?? null,
      google_place_id: id && isGooglePlaceId(id) ? id : null,
      osm_id: id && OSM_PLACE_ID.test(id) ? id : null,
      duration_minutes: stop.duration_minutes,
      transport_mode: plan.transport_mode,
      stop_type:
        stop.kind === 'meal' ? ('restaurant' as const) : stop.kind === 'rest' ? ('rest_area' as const) : undefined,
    };
  }

  private async mapping(tripId: number, original: ItineraryPlan | null, current: TripGuideCurrent): Promise<Mapping> {
    const stored = await this.em.getRepository(TripPlanPublications).findOne({ trip: tripId });
    const result: Mapping = stored ? publicationMapping.parse(JSON.parse(stored.mapping)) : { stops: {}, stays: {} };
    const currentIds = new Set(current.days.flatMap((day) => (day.assignments ?? []).map((item) => item.id)));
    for (const [key, item] of Object.entries(result.stops)) {
      if (!currentIds.has(item.assignmentId)) delete result.stops[key];
    }
    const known = new Set(Object.values(result.stops).map((item) => item.assignmentId));
    current.days.forEach((day, index) => {
      const candidates = [...(original?.days[index]?.stops ?? [])];
      for (const assignment of day.assignments ?? []) {
        if (known.has(assignment.id) || assignment.accommodation_id) continue;
        const old = candidates.find((stop) => stop.id && !result.stops[stop.id] && stop.name === assignment.place.name);
        const id = old?.id ?? `formal-${assignment.id}`;
        result.stops[id] = { assignmentId: assignment.id, placeId: assignment.place.id };
        known.add(assignment.id);
      }
    });
    return result;
  }

  private withCurrentActivities(plan: ItineraryPlan, current: TripGuideCurrent, mapping: Mapping): ItineraryPlan {
    const ids = new Map(Object.entries(mapping.stops).map(([id, item]) => [item.assignmentId, id]));
    const oldStops = new Map(plan.days.flatMap((day) => day.stops.map((stop) => [stop.id, stop] as const)));
    return {
      ...plan,
      title: current.title,
      start_date: current.start_date,
      currency: current.currency,
      days: current.days.map((day, index) => ({
        ...(plan.days[index] ?? { overnight_city: '', notes: '', stay: null }),
        title: day.title || plan.days[index]?.title || `Day ${index + 1}`,
        stops: (day.assignments ?? [])
          .filter((assignment) => !assignment.accommodation_id)
          .map((assignment, stopIndex) => {
            const id = ids.get(assignment.id) ?? `formal-${assignment.id}`;
            const old = oldStops.get(id);
            return {
              ...old,
              id,
              kind: old?.kind ?? 'activity',
              time_kind: old?.time_kind ?? 'suggested',
              name: assignment.place.name,
              city: old?.city || assignment.place.address || current.title,
              description: assignment.place.description || '',
              arrival_time: assignment.assignment_time ?? assignment.place.place_time ?? null,
              duration_minutes: assignment.place.duration_minutes ?? 60,
              travel_from_previous:
                old?.travel_from_previous ??
                (stopIndex ? { mode: plan.transport_mode, duration_minutes: null, notes: '待核实交通时间' } : null),
            };
          }),
      })),
    };
  }

  private async removeUnlinkedStop(assignmentId: number, tripId: number): Promise<void> {
    const row = await this.em.getRepository(DayAssignments).findOne({ id: assignmentId });
    if (!row) throw new DomainError(409, 'An activity was removed. Ask AI for a new proposal.');
    const booking = await this.em
      .getRepository(Reservations)
      .findOne({ trip: tripId, $or: [{ assignment: assignmentId }, { place: row.place_id }] });
    if (
      row.notes ||
      row.reservation_notes ||
      row.reservation_datetime ||
      (row.reservation_status && row.reservation_status !== 'none') ||
      booking ||
      row.accommodation_id ||
      (await this.em.getRepository(AssignmentParticipants).count({ assignment: assignmentId })) ||
      (await this.files.hasAssignmentLinks(assignmentId))
    ) {
      throw new DomainError(
        409,
        'This activity has notes, participants, files or a booking. Keep it in the proposal or resolve its links first.',
      );
    }
    await this.em.getRepository(DayAssignments).deleteById(assignmentId);
  }

  private async assertBookingUnchanged(row: DayAssignments, stop: Stop, dayId: number) {
    const booked = await this.em
      .getRepository(Reservations)
      .findOne({ $or: [{ assignment: row.id }, { place: row.place_id }] });
    if (!booked && !row.reservation_datetime && (!row.reservation_status || row.reservation_status === 'none')) return;
    const place = await this.em.getRepository(Places).findOneOrFail({ id: row.place_id });
    if (row.day_id !== dayId || (row.assignment_time ?? null) !== stop.arrival_time || place.name !== stop.name) {
      throw new DomainError(
        409,
        'An activity is linked to a booking. Review its booked place, date and time before changing it.',
      );
    }
  }

  private async assertSafeRange(current: TripGuideCurrent, plan: ItineraryPlan) {
    if (current.currency !== plan.currency)
      throw new DomainError(409, 'Keep the trip currency when revising an itinerary.');
    for (const day of current.days.slice(plan.days.length)) {
      if (
        day.notes ||
        (day.notes_items?.length ?? 0) ||
        (day.assignments?.length ?? 0) ||
        current.accommodations.some((stay) => stay.start_day_id === day.id || stay.end_day_id === day.id) ||
        current.reservations.some((booking) => booking.day_id === day.id || booking.end_day_id === day.id)
      ) {
        throw new DomainError(
          409,
          'A day being removed contains activities, notes or bookings. Keep the day or clear it explicitly first.',
        );
      }
    }
    // Days with photos, tracks or other relations cannot be silently cascade-deleted either.
    if (plan.days.length < current.days.length) {
      throw new DomainError(
        409,
        'Shortening an existing trip requires reviewing its days first. Keep its current day count in this proposal.',
      );
    }
  }

  private async publishStay(
    tripId: number,
    dayId: number,
    stay: ItineraryPlan['days'][number]['stay'],
    mapping: Mapping,
  ) {
    const old = mapping.stays[String(dayId)];
    const existing = await this.em.getRepository(DayAccommodations).find({ trip: tripId, startDay: dayId });
    if (existing.length) {
      // Actual stays are constraints. Recommendations never replace a stay or create a reservation.
      const current = existing[0];
      const place = current.place_id ? await this.em.getRepository(Places).findOne({ id: current.place_id }) : null;
      if (
        !stay ||
        (place && stay.name !== place.name) ||
        (current.check_in && stay.check_in !== current.check_in) ||
        (current.check_out && stay.check_out !== current.check_out)
      ) {
        throw new DomainError(
          409,
          'Keep the existing accommodation and its times in the proposal or change it explicitly in bookings first.',
        );
      }
      return;
    }
    const note = old?.noteId ? await this.em.getRepository(DayNotes).findOne({ id: old.noteId }) : null;
    const unchanged = note && note.text === old?.noteText && (note.time ?? null) === (old?.noteTime ?? null);
    if (!stay) {
      if (unchanged) await this.em.getRepository(DayNotes).nativeDelete({ id: note.id });
      delete mapping.stays[String(dayId)];
      return;
    }
    const values = {
      text: `住宿建议 · ${stay.area}${stay.name ? ` · ${stay.name}` : ''}`,
      time: stay.check_in,
      icon: 'BedDouble',
      sort_order: 1000,
    };
    let noteId: number;
    if (unchanged) {
      await this.em.getRepository(DayNotes).nativeUpdate({ id: note.id }, values);
      noteId = note.id;
    } else {
      // A member's edited note becomes theirs; keep it and publish the recommendation separately.
      noteId = Number(await this.em.getRepository(DayNotes).insert({ trip: tripId, day: dayId, ...values }));
    }
    mapping.stays[String(dayId)] = { noteId, noteText: values.text, noteTime: values.time };
  }
}

function stopId(stop: Stop): string {
  if (!stop.id) throw new DomainError(400, 'Each activity needs a stable ID before publication.');
  return stop.id;
}

function hash(value: unknown): string {
  function stable(item: unknown): unknown {
    if (Array.isArray(item)) return item.map(stable);
    if (item !== null && typeof item === 'object')
      return Object.fromEntries(
        Object.entries(item)
          .filter(([key]) => !['created_at', 'updated_at', 'avatar', 'avatar_url', 'external_synced_at'].includes(key))
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, entry]) => [key, stable(entry)]),
      );
    return item;
  }
  return createHash('sha256')
    .update(JSON.stringify(stable(value)))
    .digest('hex');
}
