import { tripPlanningHistorySchema, tripPlanningStateSchema, type TripPlanningGenerateRequest } from '@trek/shared';

import apiClient from './client';

const base = (tripId: number) => `/trips/${tripId}/planning`;

export const tripPlanningApi = {
  async get(tripId: number) {
    return tripPlanningStateSchema.parse((await apiClient.get(base(tripId))).data);
  },
  async generate(tripId: number, input: TripPlanningGenerateRequest) {
    return tripPlanningStateSchema.parse(
      (await apiClient.post(`${base(tripId)}/generate`, input, { timeout: 510_000 })).data
    );
  },
  async confirm(tripId: number, revision: number) {
    return tripPlanningStateSchema.parse((await apiClient.post(`${base(tripId)}/confirm`, { revision })).data);
  },
  async collaborators(tripId: number, userIds: number[]) {
    return tripPlanningStateSchema.parse(
      (await apiClient.put(`${base(tripId)}/collaborators`, { user_ids: userIds })).data
    );
  },
  async history(tripId: number) {
    return tripPlanningHistorySchema.parse((await apiClient.get(`${base(tripId)}/history`)).data);
  },
};
