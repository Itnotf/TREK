import type { ItineraryApplyRequest } from '@trek/shared';

import apiClient from './client';

const base = '/assistant/itinerary-drafts';

export const tripPlanApi = {
  get: (id: number): Promise<unknown> => apiClient.get<unknown>(`${base}/${id}`).then((response) => response.data),
  apply: (id: number, body: ItineraryApplyRequest): Promise<unknown> =>
    apiClient.post<unknown>(`${base}/${id}/apply`, body).then((response) => response.data),
  share: (id: number, body: ItineraryApplyRequest): Promise<unknown> =>
    apiClient.post<unknown>(`${base}/${id}/share`, body).then((response) => response.data),
};
