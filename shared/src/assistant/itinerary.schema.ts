import { idSchema } from '../common/primitives.schema';
import { tripCreateRequestSchema, tripSchema } from '../trip/trip.schema';

import { z } from 'zod';

const text = (max: number) => z.string().trim().min(1).max(max);
const clock = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const date = z.iso.date();
const transportMode = z.enum(['driving', 'walking', 'transit', 'cycling']);

const itineraryTravelSchema = z
  .object({
    mode: transportMode,
    // A planning estimate, never a routing result or a transport booking.
    duration_minutes: z.number().int().min(0).max(1440).nullable(),
    notes: z.string().max(500),
  })
  .strict();

export const itineraryLocationSchema = z
  .object({
    lat: z.number().finite().min(-90).max(90),
    lng: z.number().finite().min(-180).max(180),
    place_id: text(300),
    address: z.string().max(500),
  })
  .strict();

export const itineraryStopSchema = z
  .object({
    id: text(80).optional(),
    kind: z.enum(['visit', 'meal', 'rest', 'departure', 'arrival', 'activity']).optional(),
    time_kind: z.enum(['suggested', 'fixed']).optional(),
    travel_from_previous: itineraryTravelSchema.nullable().optional(),
    name: text(200),
    city: text(120),
    description: z.string().max(1500),
    arrival_time: clock.nullable(),
    duration_minutes: z.number().int().min(0).max(1440),
    place_ref: z.string().max(300).nullable().optional(),
    // Populated from actual place-search results, never model-supplied coordinates.
    location: itineraryLocationSchema.nullable().optional(),
  })
  .strict();

export const itineraryStaySchema = z
  .object({
    area: text(120),
    name: text(200).nullable(),
    place_ref: z.string().max(300).nullable().optional(),
    location: itineraryLocationSchema.nullable().optional(),
    check_in: clock.nullable(),
    check_out: clock.nullable(),
    notes: z.string().max(500),
  })
  .strict();

const itineraryGuideSchema = z
  .object({
    route: text(500),
    rationale: text(1200),
    highlights: z.array(text(250)).min(1).max(6),
    budget: z
      .object({
        scope: text(200),
        estimate: text(300),
        breakdown: z
          .array(z.object({ category: text(80), estimate: text(200), notes: text(400) }).strict())
          .min(1)
          .max(8),
      })
      .strict(),
    preparation: z.array(text(500)).min(1).max(8),
  })
  .strict();

const itineraryDayGuideSchema = z
  .object({
    overview: text(1200),
    dining: text(1000),
    accommodation: z.string().trim().max(1000),
    alternative: text(600),
  })
  .strict();

export const itineraryDaySchema = z
  .object({
    title: text(200),
    overnight_city: z.string().max(120),
    notes: z.string().max(2000),
    guide: itineraryDayGuideSchema.optional(),
    stay: itineraryStaySchema.nullable().optional(),
    stops: z.array(itineraryStopSchema).max(20),
  })
  .strict();

export const itineraryPlanSchema = z
  .object({
    schedule_version: z.literal(2).optional(),
    title: text(200),
    summary: text(2000),
    // Optional when reading earlier drafts; new model saves require the complete guide.
    guide: itineraryGuideSchema.optional(),
    start_date: date.nullable(),
    currency: z.string().regex(/^[A-Z]{3}$/),
    transport_mode: transportMode,
    requirements: z.array(text(500)).max(20),
    assumptions: z.array(text(500)).max(12),
    sources: z
      .array(
        z
          .object({
            url: z.url().max(2048),
            title: z.string().max(500),
            extraction: z.enum(['article', 'metadata', 'text']),
          })
          .strict(),
      )
      .max(5)
      .optional(),
    roadtrip_preferences: tripCreateRequestSchema.shape.roadtrip_preferences,
    days: z.array(itineraryDaySchema).min(1).max(30),
  })
  .strict()
  .refine(
    (plan) => plan.days.reduce((sum, day) => sum + day.stops.length, 0) <= 120,
    'A draft can contain at most 120 stops',
  )
  .refine((plan) => JSON.stringify(plan).length <= 60000, 'Keep the full draft under 60000 characters')
  .superRefine(checkDailySchedule);
export type ItineraryPlan = z.infer<typeof itineraryPlanSchema>;

/** Keep legacy drafts readable; new schedules must account for every activity and transfer. */
function checkDailySchedule(
  plan: {
    schedule_version?: 2;
    days: z.infer<typeof itineraryDaySchema>[];
    roadtrip_preferences?: z.infer<typeof tripCreateRequestSchema>['roadtrip_preferences'];
  },
  ctx: z.RefinementCtx,
) {
  if (plan.schedule_version !== 2) return;
  const ids = new Set<string>();
  const fail = (path: (string | number)[], message: string) => ctx.addIssue({ code: 'custom', path, message });
  plan.days.forEach((day, dayIndex) => {
    const path = ['days', dayIndex];
    if (day.stay === undefined) fail([...path, 'stay'], 'Specify a stay plan, or null when there is no overnight stay');
    if (day.stay && dayIndex === plan.days.length - 1)
      fail([...path, 'stay'], 'A stay needs a following checkout day; add it or set stay to null');
    if (!day.stops.length) fail([...path, 'stops'], 'Include the day activities, even on a rest day');
    if (day.notes.length > 600)
      fail([...path, 'notes'], 'Keep notes brief; meals, rest and visits belong in separate activities');
    let cursor: number | null = null;
    let occupied = 0;
    let driving = 0;
    day.stops.forEach((stop, index) => {
      const itemPath = [...path, 'stops', index];
      if (!stop.id || ids.has(stop.id)) fail([...itemPath, 'id'], 'Use a unique stable id for each activity');
      if (stop.id) ids.add(stop.id);
      if (!stop.kind || !stop.time_kind)
        fail(itemPath, 'Specify activity kind and whether its time is suggested or fixed');
      if (stop.time_kind === 'fixed' && !stop.arrival_time)
        fail([...itemPath, 'arrival_time'], 'A fixed activity needs a start time');
      if (stop.kind !== 'departure' && stop.kind !== 'arrival' && stop.duration_minutes === 0)
        fail([...itemPath, 'duration_minutes'], 'Visits, meals and rest must occupy time');
      if (stop.travel_from_previous === undefined || (index > 0 && stop.travel_from_previous === null))
        fail(
          [...itemPath, 'travel_from_previous'],
          'Include each transfer; use zero for the same location, null duration when unknown',
        );
      const travel = stop.travel_from_previous?.duration_minutes ?? 0;
      occupied += travel + stop.duration_minutes;
      if (stop.travel_from_previous?.mode === 'driving') {
        driving += travel;
        const limit = plan.roadtrip_preferences?.roadtrip_leg_minutes;
        if (limit && travel > limit)
          fail(
            [...itemPath, 'travel_from_previous'],
            'Driving leg exceeds the requested limit; insert a real rest stop',
          );
      }
      const start = stop.arrival_time ? clockMinutes(stop.arrival_time) : null;
      const earliest = cursor === null ? null : cursor + travel;
      if (start !== null && earliest !== null && start < earliest)
        fail(
          [...itemPath, 'arrival_time'],
          'This activity overlaps the previous activity or leaves insufficient transfer time',
        );
      if (index === 0 && start !== null && start < travel)
        fail([...itemPath, 'arrival_time'], 'The incoming transfer starts before this day');
      cursor = start === null ? earliest : start;
      if (cursor !== null) cursor += stop.duration_minutes;
      if (cursor !== null && cursor > 1440)
        fail(itemPath, 'This activity extends beyond the day; split it across days');
    });
    if (occupied > 1440) fail([...path, 'stops'], 'Activities and transfers do not fit within one day');
    const driveLimit = plan.roadtrip_preferences?.roadtrip_day_minutes;
    if (driveLimit && driving > driveLimit) fail(path, 'Estimated driving exceeds the requested daily limit');
  });
}

function clockMinutes(value: string): number {
  const [hour = 0, minute = 0] = value.split(':').map(Number);
  return hour * 60 + minute;
}

export function itineraryStopEndTime(
  stop: Pick<z.infer<typeof itineraryStopSchema>, 'arrival_time' | 'duration_minutes'>,
): string | null {
  if (!stop.arrival_time) return null;
  const minutes = clockMinutes(stop.arrival_time) + stop.duration_minutes;
  if (minutes >= 1440) return null;
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

export const itinerarySaveRequestSchema = z
  .object({
    base_revision: z.number().int().nonnegative(),
    plan: itineraryPlanSchema,
  })
  .strict();
export type ItinerarySaveRequest = z.infer<typeof itinerarySaveRequestSchema>;

export const itineraryApplyRequestSchema = z.object({ revision: z.number().int().positive() }).strict();
export type ItineraryApplyRequest = z.infer<typeof itineraryApplyRequestSchema>;

export const itineraryDraftSchema = z.object({
  id: idSchema,
  thread_id: idSchema,
  revision: z.number().int().positive(),
  plan: itineraryPlanSchema,
  created_trip_id: idSchema.nullable(),
  latest_revision: z.number().int().positive(),
});
export type ItineraryDraft = z.infer<typeof itineraryDraftSchema>;
export const itineraryDraftResponseSchema = z.object({ draft: itineraryDraftSchema });
export const itineraryApplyResponseSchema = z.object({ trip: tripSchema });

/** The model supplies names; only the server can attach a verified location. */
const { sources: _sources, ...modelPlanShape } = itineraryPlanSchema.shape;
export const itineraryModelPlanSchema = z
  .object({
    ...modelPlanShape,
    days: z
      .array(
        itineraryDaySchema.extend({
          stops: z.array(itineraryStopSchema.omit({ location: true })).max(20),
          stay: itineraryStaySchema.omit({ location: true }).nullable().optional(),
        }),
      )
      .min(1)
      .max(30),
  })
  .strict()
  .refine(
    (plan) => plan.days.reduce((sum, day) => sum + day.stops.length, 0) <= 120,
    'A draft can contain at most 120 stops',
  )
  .refine((plan) => JSON.stringify(plan).length <= 60000, 'Keep the full draft under 60000 characters')
  .superRefine(checkDailySchedule);
export const itineraryModelSaveSchema = itinerarySaveRequestSchema.extend({ plan: itineraryModelPlanSchema });

export const travelLinkReadRequestSchema = z.object({ url: z.url().max(2048) }).strict();
