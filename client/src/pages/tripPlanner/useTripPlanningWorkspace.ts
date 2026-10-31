import type { TripPlanningRevision } from '@trek/shared';
import { useState } from 'react';

import { tripPlanningRepo } from '../../repo/tripPlanningRepo';
import { useAuthStore } from '../../store/authStore';
import { useTripPlanning } from './useTripPlanning';

export function useTripPlanningWorkspace(tripId: number) {
  const user = useAuthStore((s) => s.user);
  const planning = useTripPlanning(tripId);
  const { data, working } = planning;
  const [instruction, setInstruction] = useState('');
  const [mobileTab, setMobileTab] = useState<'chat' | 'proposal'>('chat');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [history, setHistory] = useState<TripPlanningRevision[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFailed, setHistoryFailed] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const latest = data?.latest;
  const viewingHistory = selectedVersion !== null && selectedVersion !== latest?.revision;
  const shown = viewingHistory ? history.find((revision) => revision.revision === selectedVersion) : latest;
  const confirmed = !!shown && data?.confirmed_revision === shown.revision && !data.baseline_changed;
  const busy = working !== null;
  const tripPath = Number.isSafeInteger(tripId) && tripId > 0 ? `/trips/${tripId}` : '/dashboard';

  const generate = async (mode: 'discussion' | 'detailed') => {
    if (!data || viewingHistory) return;
    const success = await planning.run(mode, () =>
      tripPlanningRepo.generate(tripId, {
        mode,
        base_revision: data.revision,
        instruction: instruction.trim() || undefined,
      })
    );
    if (success) {
      setInstruction('');
      setMobileTab('proposal');
      setHistoryOpen(false);
    }
  };

  const openHistory = async () => {
    if (historyOpen) {
      setHistoryOpen(false);
      return;
    }
    setHistoryOpen(true);
    setHistoryLoading(true);
    setHistoryFailed(false);
    try {
      setHistory((await tripPlanningRepo.history(tripId)).revisions);
    } catch {
      setHistoryFailed(true);
    } finally {
      setHistoryLoading(false);
    }
  };

  const acknowledgeAI = () => planning.run('privacy', () => tripPlanningRepo.acknowledgeAI(tripId));

  return {
    planning,
    user,
    data,
    working,
    instruction,
    setInstruction,
    mobileTab,
    setMobileTab,
    inviteOpen,
    setInviteOpen,
    history,
    historyOpen,
    historyLoading,
    historyFailed,
    setSelectedVersion,
    latest,
    viewingHistory,
    shown,
    confirmed,
    busy,
    tripPath,
    generate,
    openHistory,
    acknowledgeAI,
    confirm: () => {
      if (shown && !viewingHistory)
        return planning.run('confirm', () => tripPlanningRepo.confirm(tripId, shown.revision));
    },
    saveCollaborators: (ids: number[]) =>
      planning.run('collaborators', () => tripPlanningRepo.collaborators(tripId, ids)),
  };
}

export type TripPlanningWorkspaceState = ReturnType<typeof useTripPlanningWorkspace>;
