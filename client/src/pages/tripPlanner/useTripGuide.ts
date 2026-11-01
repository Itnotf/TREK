import type { TripGuideResponse } from '@trek/shared';
import { isAxiosError } from 'axios';
import { useCallback, useEffect, useState } from 'react';

import { tripGuideRepo } from '../../repo/tripGuideRepo';

type Result = { key: string; data: TripGuideResponse | null; error: 'load' | 'unavailable' | null };

export function useTripGuide(tripId: number) {
  const [result, setResult] = useState<Result | null>(null);
  const [attempt, setAttempt] = useState(0);
  const key = `${tripId}:${attempt}`;
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  useEffect(() => {
    if (!Number.isSafeInteger(tripId) || tripId <= 0) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(retry, 150);
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    const unsubscribe = tripGuideRepo.subscribe(tripId, refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('online', refresh);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(timer);
      unsubscribe();
      window.removeEventListener('focus', refresh);
      window.removeEventListener('online', refresh);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [tripId, retry]);
  useEffect(() => {
    let cancelled = false;
    if (!Number.isSafeInteger(tripId) || tripId <= 0) return;
    void tripGuideRepo.get(tripId).then(
      (data) => {
        if (!cancelled) setResult({ key, data, error: null });
      },
      (error) => {
        if (!cancelled)
          setResult({
            key,
            data: null,
            error: isAxiosError(error) && [403, 404].includes(error.response?.status ?? 0) ? 'unavailable' : 'load',
          });
      }
    );
    return () => {
      cancelled = true;
    };
  }, [tripId, key]);
  const invalid = !Number.isSafeInteger(tripId) || tripId <= 0;
  return {
    loading: !invalid && result?.key !== key,
    data: result?.key === key ? result.data : null,
    error: invalid ? 'unavailable' : result?.key === key ? result.error : null,
    retry,
  };
}
