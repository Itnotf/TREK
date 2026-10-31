import apiClient from './client';

export const tripGuideApi = {
  get: (tripId: number): Promise<unknown> =>
    apiClient.get<unknown>(`/trips/${tripId}/guide`).then((response) => response.data),
};
