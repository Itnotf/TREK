import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useTranslation } from '../../i18n';
import { assistantScopeOf } from '../../store/assistantChatKey';
import { chatOf, useAssistantStore } from '../../store/assistantStore';
import { useToast } from '../shared/Toast';

/**
 * The chat around the messages, shared by the desktop window and the phone
 * screen: which conversation is open, the latest ones to switch to, starting
 * a new one or deleting this one, and how long chats are kept. Each view
 * draws its own header from it.
 *
 * Home planning keeps running after its screen closes; other scopes stop
 * when hidden. A disconnected home stream reads back the saved result.
 */
export function useAssistantThread(tripId: number) {
  const { t } = useTranslation();
  const toast = useToast();
  const { threadId, threads, isRunning, streaming, loading } = useAssistantStore(
    useShallow((s) => {
      const chat = chatOf(s, tripId);
      return {
        threadId: chat.threadId,
        threads: chat.threads,
        isRunning: chat.isRunning,
        streaming: chat.abort !== null,
        loading: chat.loading,
      };
    })
  );
  const retention = useAssistantStore((s) => s.status?.retention ?? null);
  const resume = useAssistantStore((s) => s.resume);
  const loadThreads = useAssistantStore((s) => s.loadThreads);
  const openThread = useAssistantStore((s) => s.openThread);
  const newThread = useAssistantStore((s) => s.newThread);
  const deleteThread = useAssistantStore((s) => s.deleteThread);
  const cancel = useAssistantStore((s) => s.cancel);
  const refreshThread = useAssistantStore((s) => s.refreshThread);
  const home = assistantScopeOf(tripId).kind === 'home';

  useEffect(() => {
    void resume(tripId);
    return () => {
      if (!home) cancel(tripId);
    };
  }, [tripId, resume, cancel, home]);

  useEffect(() => {
    if (!home || threadId === null || streaming || loading) return;
    let closed = false;
    let checking = false;
    const refresh = async (force = false) => {
      if (closed || checking || document.hidden) return;
      const chat = chatOf(useAssistantStore.getState(), tripId);
      if (!force && (!chat.isRunning || chat.error)) return;
      checking = true;
      try {
        await refreshThread(tripId);
      } finally {
        checking = false;
      }
    };
    const foreground = () => {
      void refresh(true);
    };
    void refresh(true);
    const timer = setInterval(() => void refresh(), 5_000);
    document.addEventListener('visibilitychange', foreground);
    window.addEventListener('focus', foreground);
    return () => {
      closed = true;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', foreground);
      window.removeEventListener('focus', foreground);
    };
  }, [home, tripId, threadId, streaming, loading, refreshThread]);

  const title = (threadId !== null && threads?.find((th) => th.id === threadId)?.title) || null;

  let retentionNote: string | null = null;
  if (retention?.mode === 'forever') retentionNote = t('assistant.history.forever');
  else if (retention?.mode === 'days') retentionNote = t('assistant.history.retention', { count: retention.days });

  const removeThread = async () => {
    if (threadId === null) return;
    try {
      await deleteThread(tripId, threadId);
    } catch {
      toast.error(t('assistant.error.generic'));
    }
  };

  return {
    threadId,
    /** The latest conversations of this trip; null until loaded. */
    threads,
    /** The open conversation's title; null for a new one. */
    title,
    isRunning,
    retentionNote,
    refreshThreads: () => void loadThreads(tripId),
    openThread: (id: number) => void openThread(tripId, id),
    newThread: () => newThread(tripId),
    removeThread,
    stop: () => cancel(tripId),
  };
}
