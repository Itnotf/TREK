import { idSchema } from '../../common/primitives.schema';

import { z } from 'zod';

export const tripPlanCardSchema = z.object({
  kind: z.literal('tripPlan'),
  draftId: idSchema,
  revision: z.number().int().positive(),
  title: z.string().min(1).max(200),
  dayCount: z.number().int().min(1).max(30),
  summary: z.string().max(2000),
});
export type TripPlanCard = z.infer<typeof tripPlanCardSchema>;
