import { tripGuideResponseSchema } from '@trek/shared';

import { tripGuideApi } from '../api/tripGuide';
import { addListener, joinTrip, leaveTrip, removeListener, subscribeTripRefetch } from '../api/websocket';
import { requireOnline } from './onlineOnly';

export const tripGuideRepo = {
  subscribe(tripId: number, refresh: () => void) {
    const onEvent = (event: Record<string, unknown>) => {
      if (
        event.type === 'trips:changed' ||
        (String(event.tripId) === String(tripId) &&
          /^(day|days|assignment|place|accommodation|reservation|trip|tours|member):/.test(String(event.type)))
      )
        refresh();
    };
    joinTrip(tripId);
    addListener(onEvent);
    const unsubscribeRefetch = subscribeTripRefetch((activeTripId) => {
      if (activeTripId === String(tripId)) refresh();
    });
    return () => {
      unsubscribeRefetch();
      leaveTrip(tripId);
      removeListener(onEvent);
    };
  },
  async get(tripId: number) {
    requireOnline();
    return tripGuideResponseSchema.parse(await tripGuideApi.get(tripId));
  },
};
