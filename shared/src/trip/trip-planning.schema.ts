import { itineraryModelPlanSchema, itineraryPlanSchema } from '../assistant/itinerary.schema';

import { z } from 'zod';

const line = z.string().trim().min(1).max(1200);
const lines = (max: number) => z.array(line).max(max);
const id = z.number().int().positive();

export const tripPlanningContentSchema = z
  .object({
    kind: z.enum(['discussion', 'detailed']),
    summary: line,
    questions: lines(2),
    agreements: lines(20),
    disagreements: lines(12),
    outline: z.array(z.object({ day: id.max(30), title: line, description: line }).strict()).max(30),
    changes: lines(20),
    plan: itineraryPlanSchema.nullable(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (
      value.kind === 'detailed' &&
      (!value.plan ||
        value.plan.schedule_version !== 2 ||
        !value.plan.guide ||
        value.plan.days.some((day) => !day.guide || (day.stay && !day.guide.accommodation)))
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['plan'],
        message: 'A detailed proposal needs a complete version 2 travel guide and daily itinerary',
      });
    }
    if (value.kind === 'discussion' && value.plan !== null) {
      ctx.addIssue({
        code: 'custom',
        path: ['plan'],
        message: 'A discussion contains a daily outline; the formal itinerary remains separate',
      });
    }
  });
export type TripPlanningContent = z.infer<typeof tripPlanningContentSchema>;

/** Model coordinates and source claims are never accepted as verified data. */
export const tripPlanningModelContentSchema = tripPlanningContentSchema.safeExtend({
  plan: itineraryModelPlanSchema.nullable(),
});
export const tripPlanningRevisionSchema = tripPlanningContentSchema.safeExtend({
  id,
  revision: id,
  created_at: z.string(),
  created_by: id,
});
export type TripPlanningRevision = z.infer<typeof tripPlanningRevisionSchema>;
export const tripPlanningStateSchema = z
  .object({
    trip_id: id,
    title: z.string(),
    revision: z.number().int().nonnegative(),
    phase: z.enum(['discussion', 'detailed', 'confirmed']),
    can_confirm: z.boolean(),
    can_discuss: z.boolean(),
    is_owner: z.boolean(),
    collaborators: z.array(id),
    members: z.array(z.object({ id, username: z.string() }).strict()),
    latest: tripPlanningRevisionSchema.nullable(),
    confirmed_revision: id.nullable(),
    baseline_changed: z.boolean(),
    ai_available: z.boolean(),
    ai_privacy_required: z.boolean(),
  })
  .strict();
export type TripPlanningState = z.infer<typeof tripPlanningStateSchema>;
export const tripPlanningHistorySchema = z.object({ revisions: z.array(tripPlanningRevisionSchema) }).strict();
export const tripPlanningGenerateRequestSchema = z
  .object({
    base_revision: z.number().int().nonnegative(),
    instruction: z.string().trim().max(5000).optional(),
    mode: z.enum(['discussion', 'detailed']),
  })
  .strict();
export type TripPlanningGenerateRequest = z.infer<typeof tripPlanningGenerateRequestSchema>;
export const tripPlanningConfirmRequestSchema = z.object({ revision: id }).strict();
export const tripPlanningCollaboratorsRequestSchema = z.object({ user_ids: z.array(id).max(50) }).strict();
export const tripPlanningAdoptRequestSchema = z
  .object({ draft_id: id, base_revision: z.number().int().nonnegative() })
  .strict();
export const tripPlanningShareDraftRequestSchema = z.object({ revision: id }).strict();
export const tripPlanningShareDraftResponseSchema = z.object({ trip_id: id }).strict();
