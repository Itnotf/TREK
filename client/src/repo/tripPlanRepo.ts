import {
  itineraryApplyResponseSchema,
  itineraryDraftResponseSchema,
  tripPlanningShareDraftResponseSchema,
} from '@trek/shared';

import { tripPlanApi } from '../api/tripPlan';
import { requireOnline } from './onlineOnly';

/** Like the chat, drafts are online-only. Confirmation creates the trip atomically on the server. */
export const tripPlanRepo = {
  async get(id: number) {
    requireOnline();
    return itineraryDraftResponseSchema.parse(await tripPlanApi.get(id)).draft;
  },
  async apply(id: number, revision: number) {
    requireOnline();
    return itineraryApplyResponseSchema.parse(await tripPlanApi.apply(id, { revision })).trip;
  },
  async share(id: number, revision: number) {
    requireOnline();
    return tripPlanningShareDraftResponseSchema.parse(await tripPlanApi.share(id, { revision })).trip_id;
  },
};
