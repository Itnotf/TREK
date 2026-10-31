import type { ItineraryDraft, TripPlanCard } from '@trek/shared';
import { isAxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';

import { useNetworkMode } from '../../../../hooks/useNetworkMode';
import { tripPlanRepo } from '../../../../repo/tripPlanRepo';
import { useAssistantStore } from '../../../../store/assistantStore';
import { useAssistantView } from '../../assistantViewContext';

export function useTripPlan(card: TripPlanCard) {
  const { tripId, onOpen } = useAssistantView();
  const { offline } = useNetworkMode();
  const running = useAssistantStore((state) => state.byTrip[tripId]?.isRunning ?? false);
  const latestVisible = useAssistantStore((state) => {
    let revision = card.revision;
    for (const message of state.byTrip[tripId]?.messages ?? []) {
      for (const part of message.parts) {
        if (part.type === 'data-trek-card' && part.data.card?.kind === 'tripPlan') {
          revision = Math.max(revision, part.data.card.revision);
        }
      }
    }
    return revision;
  });
  const [draft, setDraft] = useState<ItineraryDraft | null>(null);
  const [settledRequest, setSettledRequest] = useState<string | null>(null);
  const [failure, setFailure] = useState<{ request: string; kind: 'load' | 'apply' | 'unavailable' } | null>(null);
  const [applying, setApplying] = useState(false);
  const [reload, setReload] = useState(0);
  const busy = useRef(false);
  const request = `${card.draftId}:${latestVisible}:${reload}`;
  const loading = settledRequest !== request;
  const error = failure?.request === request ? failure.kind : null;

  useEffect(() => {
    let cancelled = false;
    void tripPlanRepo
      .get(card.draftId)
      .then(
        (value) => {
          if (!cancelled) {
            setDraft(value);
            setFailure(null);
          }
        },
        () => {
          if (!cancelled) setFailure({ request, kind: 'load' });
        }
      )
      .finally(() => {
        if (!cancelled) setSettledRequest(request);
      });
    return () => {
      cancelled = true;
    };
  }, [card.draftId, request]);

  const stale = card.revision < Math.max(latestVisible, draft?.latest_revision ?? card.revision);
  const canApply =
    !!draft &&
    !!onOpen &&
    !stale &&
    !loading &&
    !running &&
    !offline &&
    !applying &&
    error !== 'load' &&
    error !== 'unavailable';
  const openTrip = (id: number) => onOpen?.({ kind: 'page', path: `/trips/${id}${draft?.plan.guide ? '/guide' : ''}` });
  const confirm = async () => {
    if (!draft || !canApply || busy.current) return;
    if (draft.created_trip_id) {
      onOpen?.({ kind: 'page', path: `/trips/${draft.created_trip_id}/planning` });
      return;
    }
    busy.current = true;
    setApplying(true);
    setFailure(null);
    try {
      const trip = await tripPlanRepo.apply(draft.id, draft.revision);
      setDraft((current) => (current ? { ...current, created_trip_id: trip.id } : current));
      openTrip(trip.id);
    } catch (err) {
      setFailure({ request, kind: isAxiosError(err) && err.response?.status === 410 ? 'unavailable' : 'apply' });
      // A conflicting revision or another tab's confirmation is reflected immediately.
      try {
        setDraft(await tripPlanRepo.get(card.draftId));
      } catch {
        /* Keep the readable draft. */
      }
    } finally {
      busy.current = false;
      setApplying(false);
    }
  };

  const share = async () => {
    if (!draft || !canApply || busy.current) return;
    busy.current = true;
    setApplying(true);
    setFailure(null);
    try {
      const id = draft.created_trip_id ?? (await tripPlanRepo.share(draft.id, draft.revision));
      setDraft((current) => (current ? { ...current, created_trip_id: id } : current));
      onOpen?.({ kind: 'page', path: `/trips/${id}/planning` });
    } catch (err) {
      setFailure({ request, kind: isAxiosError(err) && err.response?.status === 410 ? 'unavailable' : 'apply' });
    } finally {
      busy.current = false;
      setApplying(false);
    }
  };

  return {
    draft,
    loading,
    error,
    applying,
    stale,
    offline,
    canApply,
    confirm,
    share,
    retry: () => setReload((n) => n + 1),
  };
}
