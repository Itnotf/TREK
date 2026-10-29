import { itineraryPlanSchema } from '../assistant/itinerary.schema';

import { z } from 'zod';

/** The confirmed guide is a snapshot; subsequent edits to the daily plan do not rewrite it. */
export const tripGuideResponseSchema = z.object({ plan: itineraryPlanSchema.nullable() });
export type TripGuideResponse = z.infer<typeof tripGuideResponseSchema>;
