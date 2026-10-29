import type { RoadtripStop, UnlocatedActivity } from '@trek/shared/roadtrip';
import type { Accommodation, Assignment, AssignmentsMap, Day } from '../../types';
import { stayStartingOn } from '../../utils/dayMerge';

export const asStop = (
  a: Assignment,
  ownerDayId: number,
  ownerIndex: number,
  accommodations: Accommodation[]
): RoadtripStop | null => {
  const p = a.place;
  if (!p || typeof p.lat !== 'number' || typeof p.lng !== 'number') return null;
  // Check-in only. A check-out is the LATEST the room has to be handed back, not the
  // earliest anybody may leave, so it says nothing about when the drive sets off and
  // has no business in the chain. It stays a booking detail, shown under Days.
  const stay = stayStartingOn(accommodations, a.place_id, ownerDayId);
  return {
    assignmentId: a.id,
    ownerDayId,
    ownerIndex,
    placeId: a.place_id,
    name: p.name,
    lat: p.lat,
    lng: p.lng,
    time: a.assignment_time ?? (p.source === 'assistant' ? null : (p.place_time ?? null)),
    // The visit's End is when the drive leaves it. Unlike a check-out it is the
    // traveller's own statement about this stop, and the stay then runs until it.
    leaveAt: a.assignment_end_time ?? (p.source === 'assistant' ? null : (p.end_time ?? null)),
    checkInTime: stay?.check_in ?? null,
    night: stay !== undefined,
    bookedNightId: a.accommodation_id ?? null,
    dwellMinutes: typeof p.duration_minutes === 'number' ? p.duration_minutes : null,
    endDay: a.end_day === true,
    legMode: a.leg_transport_mode ?? null,
    incomingLegMode: a.incoming_leg_transport_mode ?? null,
    stopType: p.stop_type ?? null,
    fillPercent: typeof p.fill_percent === 'number' ? p.fill_percent : null,
  };
};

export function unlocatedActivitiesOf(days: Day[], assignments: AssignmentsMap): UnlocatedActivity[] {
  return [...days]
    .sort((a, b) => (a.day_number ?? 0) - (b.day_number ?? 0))
    .flatMap((day) =>
      [...(assignments[String(day.id)] ?? [])]
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
        .flatMap((a) => {
          const p = a.place;
          if (!p || (typeof p.lat === 'number' && typeof p.lng === 'number')) return [];
          return [
            {
              assignmentId: a.id,
              dayId: day.id,
              dayNumber: day.day_number ?? 0,
              stopType: p.stop_type,
              name: p.name,
              time: a.assignment_time ?? p.place_time ?? null,
              leaveAt: a.assignment_end_time ?? p.end_time ?? null,
              dwellMinutes: p.duration_minutes ?? null,
            },
          ];
        })
    );
}
