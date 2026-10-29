import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildTrip } from '../../tests/helpers/factories';
import { buildItineraryDraft } from '../../tests/helpers/itinerary';
import { server } from '../../tests/helpers/msw/server';
import { tripPlanApi } from '../api/tripPlan';
import { _resetNetworkMode, setForcedOffline } from '../sync/networkMode';
import { OnlineOnlyError } from './onlineOnly';
import { tripPlanRepo } from './tripPlanRepo';

afterEach(() => {
  _resetNetworkMode();
  vi.restoreAllMocks();
});

describe('tripPlanRepo', () => {
  it('reads the full draft and confirms its exact revision', async () => {
    const draft = buildItineraryDraft();
    const trip = buildTrip({ id: 31, title: draft.plan.title });
    const sent: unknown[] = [];
    server.use(
      http.get('/api/assistant/itinerary-drafts/7', () => HttpResponse.json({ draft })),
      http.post('/api/assistant/itinerary-drafts/7/apply', async ({ request }) => {
        sent.push(await request.json());
        return HttpResponse.json({ trip });
      })
    );
    await expect(tripPlanRepo.get(7)).resolves.toEqual(draft);
    await expect(tripPlanRepo.apply(7, 1)).resolves.toEqual(trip);
    expect(sent).toEqual([{ revision: 1 }]);
  });

  it('rejects invalid drafts and trips at the repository boundary', async () => {
    vi.spyOn(tripPlanApi, 'get').mockResolvedValue({ draft: { id: 7 } });
    vi.spyOn(tripPlanApi, 'apply').mockResolvedValue({ trip: { id: 31 } });
    await expect(tripPlanRepo.get(7)).rejects.toThrow();
    await expect(tripPlanRepo.apply(7, 1)).rejects.toThrow();
  });

  it('makes no requests while offline', async () => {
    setForcedOffline(true);
    const get = vi.spyOn(tripPlanApi, 'get');
    const apply = vi.spyOn(tripPlanApi, 'apply');
    await expect(tripPlanRepo.get(7)).rejects.toBeInstanceOf(OnlineOnlyError);
    await expect(tripPlanRepo.apply(7, 1)).rejects.toBeInstanceOf(OnlineOnlyError);
    expect(get).not.toHaveBeenCalled();
    expect(apply).not.toHaveBeenCalled();
  });
});
