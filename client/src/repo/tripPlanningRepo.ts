import type { TripPlanningGenerateRequest } from '@trek/shared';

import { aiApi } from '../api/assistant';
import { tripPlanningApi } from '../api/tripPlanning';
import { addListener, joinTrip, leaveTrip, removeListener, subscribeTripRefetch } from '../api/websocket';
import { requireOnline } from './onlineOnly';

/** Shared proposals require a current server revision; they are never queued for offline replay. */
export const tripPlanningRepo = {
  async get(tripId: number) {
    requireOnline();
    return tripPlanningApi.get(tripId);
  },
  async generate(tripId: number, input: TripPlanningGenerateRequest) {
    requireOnline();
    return tripPlanningApi.generate(tripId, input);
  },
  async confirm(tripId: number, revision: number) {
    requireOnline();
    return tripPlanningApi.confirm(tripId, revision);
  },
  async collaborators(tripId: number, userIds: number[]) {
    requireOnline();
    return tripPlanningApi.collaborators(tripId, userIds);
  },
  async history(tripId: number) {
    requireOnline();
    return tripPlanningApi.history(tripId);
  },
  async acknowledgeAI(tripId: number) {
    requireOnline();
    const status = await aiApi.status();
    if (!status.effective) throw new Error('AI unavailable');
    await aiApi.ackPrivacy({ kind: status.effective.kind, host: status.effective.host });
    return tripPlanningApi.get(tripId);
  },
  subscribe(tripId: number, onChange: () => void) {
    const onEvent = (event: Record<string, unknown>) => {
      if (
        String(event.tripId) === String(tripId) &&
        /^(planning|trip-planning|member|day|days|assignment|place|accommodation|reservation|trip):/.test(
          String(event.type)
        )
      )
        onChange();
    };
    const unsubscribe = subscribeTripRefetch((id) => {
      if (id === String(tripId)) onChange();
    });
    joinTrip(tripId);
    addListener(onEvent);
    return () => {
      unsubscribe();
      leaveTrip(tripId);
      removeListener(onEvent);
    };
  },
};
