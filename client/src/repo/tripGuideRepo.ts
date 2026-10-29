import { tripGuideResponseSchema } from '@trek/shared';

import { tripGuideApi } from '../api/tripGuide';
import { requireOnline } from './onlineOnly';

export const tripGuideRepo = {
  async get(tripId: number) {
    requireOnline();
    return tripGuideResponseSchema.parse(await tripGuideApi.get(tripId)).plan;
  },
};
