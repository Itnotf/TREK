import type { ItineraryPlan } from '@trek/shared';
import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';

import { tripGuideRepo } from '../../repo/tripGuideRepo';

type Result = { key: string; plan: ItineraryPlan | null; error: 'load' | 'unavailable' | null };

export function useTripGuide(tripId: number) {
  const [result, setResult] = useState<Result | null>(null);
  const [attempt, setAttempt] = useState(0);
  const key = `${tripId}:${attempt}`;
  useEffect(() => {
    let cancelled = false;
    if (!Number.isSafeInteger(tripId) || tripId <= 0) return;
    void tripGuideRepo.get(tripId).then(
      (plan) => {
        if (!cancelled) setResult({ key, plan, error: null });
      },
      (error) => {
        if (!cancelled)
          setResult({
            key,
            plan: null,
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
    plan: result?.key === key ? result.plan : null,
    error: invalid ? 'unavailable' : result?.key === key ? result.error : null,
    retry: () => setAttempt((value) => value + 1),
  };
}
