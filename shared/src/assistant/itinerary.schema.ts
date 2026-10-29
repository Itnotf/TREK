import { idSchema } from '../common/primitives.schema';
import { tripCreateRequestSchema, tripSchema } from '../trip/trip.schema';

import { z } from 'zod';

const text = (max: number) => z.string().trim().min(1).max(max);
const clock = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const date = z.iso.date();

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

export const itineraryDaySchema = z
  .object({
    title: text(200),
    overnight_city: z.string().max(120),
    notes: z.string().max(2000),
    stops: z.array(itineraryStopSchema).max(8),
  })
  .strict();

export const itineraryPlanSchema = z
  .object({
    title: text(200),
    summary: text(2000),
    start_date: date.nullable(),
    currency: z.string().regex(/^[A-Z]{3}$/),
    transport_mode: z.enum(['driving', 'walking', 'transit', 'cycling']),
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
  .refine((plan) => JSON.stringify(plan).length <= 32000, 'Keep the full draft under 32000 characters');
export type ItineraryPlan = z.infer<typeof itineraryPlanSchema>;

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
          stops: z.array(itineraryStopSchema.omit({ location: true })).max(8),
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
  .refine((plan) => JSON.stringify(plan).length <= 32000, 'Keep the full draft under 32000 characters');
export const itineraryModelSaveSchema = itinerarySaveRequestSchema.extend({ plan: itineraryModelPlanSchema });

export const travelLinkReadRequestSchema = z.object({ url: z.url().max(2048) }).strict();
