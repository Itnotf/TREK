import { tripGuideResponseSchema } from '@trek/shared';

import { tripGuideApi } from '../api/tripGuide';
import { addListener, joinTrip, leaveTrip, removeListener } from '../api/websocket';
import { requireOnline } from './onlineOnly';

export const tripGuideRepo = {
  subscribe(tripId: number, refresh: () => void) {
    const onEvent = (event: Record<string, unknown>) => {
      if (
        event.type === 'trips:changed' ||
        (String(event.tripId) === String(tripId) &&
          /^(day|days|assignment|place|accommodation|reservation|trip|tours):/.test(String(event.type)))
      )
        refresh();
    };
    joinTrip(tripId);
    addListener(onEvent);
    return () => {
      leaveTrip(tripId);
      removeListener(onEvent);
    };
  },
  async get(tripId: number) {
    requireOnline();
    return tripGuideResponseSchema.parse(await tripGuideApi.get(tripId));
  },
};
