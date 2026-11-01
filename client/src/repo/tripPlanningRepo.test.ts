import { afterEach, describe, expect, it, vi } from 'vitest';

import { aiApi } from '../api/assistant';
import { tripPlanningApi } from '../api/tripPlanning';
import { addListener, joinTrip, leaveTrip, removeListener, subscribeTripRefetch } from '../api/websocket';
import { _resetNetworkMode, setForcedOffline } from '../sync/networkMode';
import { OnlineOnlyError } from './onlineOnly';
import { tripPlanningRepo } from './tripPlanningRepo';

vi.mock('../api/websocket', () => ({
  joinTrip: vi.fn(),
  leaveTrip: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  subscribeTripRefetch: vi.fn(() => vi.fn()),
  getSocketId: () => null,
}));

afterEach(() => {
  _resetNetworkMode();
  vi.restoreAllMocks();
});

describe('tripPlanningRepo', () => {
  it('never sends or queues shared revisions, confirmation or AI consent while offline', async () => {
    setForcedOffline(true);
    const requests = [
      vi.spyOn(tripPlanningApi, 'get'),
      vi.spyOn(tripPlanningApi, 'generate'),
      vi.spyOn(tripPlanningApi, 'confirm'),
      vi.spyOn(tripPlanningApi, 'collaborators'),
      vi.spyOn(tripPlanningApi, 'history'),
      vi.spyOn(aiApi, 'status'),
    ];
    const operations = [
      tripPlanningRepo.get(7),
      tripPlanningRepo.generate(7, { mode: 'detailed', base_revision: 1 }),
      tripPlanningRepo.confirm(7, 1),
      tripPlanningRepo.collaborators(7, [2]),
      tripPlanningRepo.history(7),
      tripPlanningRepo.acknowledgeAI(7),
    ];
    await Promise.all(operations.map((operation) => expect(operation).rejects.toBeInstanceOf(OnlineOnlyError)));
    for (const request of requests) expect(request).not.toHaveBeenCalled();
  });

  it('refreshes only for this trip and removes its subscriptions on exit', () => {
    const onChange = vi.fn();
    const stop = tripPlanningRepo.subscribe(7, onChange);
    expect(joinTrip).toHaveBeenCalledWith(7);
    const listener = vi.mocked(addListener).mock.calls.slice(-1)[0]?.[0];
    const refetch = vi.mocked(subscribeTripRefetch).mock.calls.slice(-1)[0]?.[0];
    const unsubscribe = vi.mocked(subscribeTripRefetch).mock.results.slice(-1)[0]?.value;
    if (!listener || !refetch) throw new Error('Missing planning subscriptions');
    listener({ type: 'planning:updated', tripId: 8 });
    listener({ type: 'packing:updated', tripId: 7 });
    refetch('8');
    expect(onChange).not.toHaveBeenCalled();
    listener({ type: 'planning:updated', tripId: 7 });
    listener({ type: 'member:removed', tripId: 7 });
    refetch('7');
    expect(onChange).toHaveBeenCalledTimes(3);
    stop();
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(leaveTrip).toHaveBeenCalledWith(7);
    expect(removeListener).toHaveBeenCalledWith(listener);
  });
});
