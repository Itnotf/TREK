import type { TripPlanningState } from '@trek/shared';
import { isAxiosError } from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';

import { tripPlanningRepo } from '../../repo/tripPlanningRepo';

export type PlanningError =
  | 'unavailable'
  | 'load'
  | 'stale_revision'
  | 'baseline_changed'
  | 'ai_unavailable'
  | 'privacy_required'
  | 'daily_limit'
  | 'rate_limited'
  | 'busy'
  | 'ai_failed'
  | 'forbidden';

const providerErrors: PlanningError[] = [
  'stale_revision',
  'baseline_changed',
  'ai_unavailable',
  'privacy_required',
  'daily_limit',
  'rate_limited',
  'busy',
  'ai_failed',
];
const statusErrors: Partial<Record<number, PlanningError>> = {
  401: 'unavailable',
  404: 'unavailable',
  403: 'forbidden',
  409: 'stale_revision',
  429: 'rate_limited',
  502: 'ai_failed',
  504: 'ai_failed',
  503: 'ai_unavailable',
};

export function planningError(error: unknown): PlanningError {
  if (!isAxiosError(error)) return 'load';
  const body: unknown = error.response?.data;
  const details = body !== null && typeof body === 'object' && 'details' in body ? body.details : null;
  const code =
    body !== null && typeof body === 'object' && 'code' in body
      ? body.code
      : details !== null && typeof details === 'object' && 'code' in details
        ? details.code
        : null;
  return providerErrors.find((known) => known === code) ?? statusErrors[error.response?.status ?? 0] ?? 'load';
}

type Loaded = { tripId: number; data: TripPlanningState | null; error: PlanningError | null };
type Working = 'discussion' | 'detailed' | 'confirm' | 'collaborators' | 'privacy' | null;

/** Proposals belong to the trip; chat drafts and personal assistant histories stay elsewhere. */
export function useTripPlanning(tripId: number) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [working, setWorking] = useState<Working>(null);
  const [actionError, setActionError] = useState<PlanningError | null>(null);
  const currentTrip = useRef(tripId);
  const serial = useRef(0);
  const running = useRef(false);
  const valid = Number.isSafeInteger(tripId) && tripId > 0;

  const refresh = useCallback(async () => {
    if (!Number.isSafeInteger(tripId) || tripId <= 0) return;
    const request = ++serial.current;
    try {
      const data = await tripPlanningRepo.get(tripId);
      if (request === serial.current && currentTrip.current === tripId) setLoaded({ tripId, data, error: null });
    } catch (error) {
      if (request !== serial.current || currentTrip.current !== tripId) return;
      const reason = planningError(error);
      setLoaded((previous) => ({
        tripId,
        data:
          reason === 'unavailable' || reason === 'forbidden'
            ? null
            : previous?.tripId === tripId
              ? previous.data
              : null,
        error: reason,
      }));
    }
  }, [tripId]);

  useEffect(() => {
    currentTrip.current = tripId;
    const initial = setTimeout(() => {
      void refresh();
    }, 0);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    const unsubscribe = valid
      ? tripPlanningRepo.subscribe(tripId, () => {
          void refresh();
        })
      : () => {};
    window.addEventListener('focus', onVisible);
    window.addEventListener('online', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    // Polling also covers a lost socket, including membership being revoked.
    const timer = setInterval(onVisible, 15_000);
    return () => {
      currentTrip.current = -1;
      clearTimeout(initial);
      clearInterval(timer);
      unsubscribe();
      window.removeEventListener('focus', onVisible);
      window.removeEventListener('online', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [tripId, valid, refresh]);

  const run = useCallback(
    async (operation: Exclude<Working, null>, request: () => Promise<TripPlanningState>) => {
      if (running.current || currentTrip.current !== tripId) return false;
      running.current = true;
      ++serial.current;
      setWorking(operation);
      setActionError(null);
      try {
        const data = await request();
        if (currentTrip.current !== tripId) return false;
        ++serial.current;
        setLoaded({ tripId, data, error: null });
        return true;
      } catch (error) {
        if (currentTrip.current !== tripId) return false;
        const reason = planningError(error);
        setActionError(reason);
        if (reason === 'unavailable') setLoaded({ tripId, data: null, error: reason });
        else if (reason === 'stale_revision' || reason === 'baseline_changed' || reason === 'forbidden')
          await refresh();
        return false;
      } finally {
        running.current = false;
        if (currentTrip.current === tripId) setWorking(null);
      }
    },
    [tripId, refresh]
  );

  return {
    data: loaded?.tripId === tripId ? loaded.data : null,
    loading: valid && loaded?.tripId !== tripId,
    error: !valid ? ('unavailable' as const) : loaded?.tripId === tripId ? loaded.error : null,
    actionError,
    working,
    refresh,
    run,
  };
}
