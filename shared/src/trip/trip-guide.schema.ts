import { itineraryPlanSchema } from '../assistant/itinerary.schema';
import { daySchema } from '../day/day.schema';
import { accommodationSchema, reservationSchema } from '../reservation/reservation.schema';

import { z } from 'zod';

/** Live trip data has no draft-only limits on days, activities or overlapping times. */
export const tripGuideCurrentSchema = z.object({
  title: z.string(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  currency: z.string(),
  days: z.array(daySchema),
  accommodations: z.array(accommodationSchema),
  reservations: z.array(reservationSchema),
});
export type TripGuideCurrent = z.infer<typeof tripGuideCurrentSchema>;

/** The original prose is current only while the confirmed trip data is unchanged. */
export const tripGuideResponseSchema = z.object({
  plan: itineraryPlanSchema.nullable(),
  current: tripGuideCurrentSchema,
  status: z.enum(['unchanged', 'changed', 'unverified']),
});
export type TripGuideResponse = z.infer<typeof tripGuideResponseSchema>;
