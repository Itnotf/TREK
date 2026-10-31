import type { AssistantErrorCode } from '@trek/shared';

import { assistantRepo } from '../repo/assistantRepo';
import { assistantScopeOf, assistantTargetOf } from './assistantChatKey';
import type { AssistantTripChat } from './assistantStore';

interface ThreadContext {
  chat: (key: number) => AssistantTripChat;
  patch: (key: number, next: Partial<AssistantTripChat>) => void;
  clearRoute: () => void;
  errorCodeOf: (err: unknown) => AssistantErrorCode;
  httpStatus: (err: unknown) => number | undefined;
}

export function assistantThreadActions({ chat, patch, clearRoute, errorCodeOf, httpStatus }: ThreadContext) {
  const refreshing = new Set<number>();
  const loadThreads = async (tripId: number) => {
    try {
      patch(tripId, { threads: await assistantRepo.threads(assistantTargetOf(tripId)) });
    } catch (err) {
      patch(tripId, { error: errorCodeOf(err) });
    }
  };

  const openThread = async (tripId: number, threadId: number) => {
    const home = assistantScopeOf(tripId).kind === 'home';
    const previous = chat(tripId);
    if (previous.abort || (!home && previous.isRunning)) return;
    clearRoute();
    patch(tripId, { threadId, fresh: false, loading: true, isRunning: false, error: null, unsent: null });
    const current = () => chat(tripId).threadId === threadId && chat(tripId).messages === previous.messages;
    try {
      const { messages, running } = await assistantRepo.thread(assistantTargetOf(tripId), threadId);
      // Another thread may have been opened while this one loaded.
      if (current()) patch(tripId, { messages, loading: false, isRunning: home && running === true });
    } catch (err) {
      if (!current()) return;
      if (httpStatus(err) !== 404) {
        patch(tripId, { loading: false, isRunning: home, error: errorCodeOf(err) });
        return;
      }
      // Deleted elsewhere: start fresh and forget it.
      const threads = chat(tripId).threads;
      patch(tripId, {
        threadId: null,
        messages: [],
        isRunning: false,
        loading: false,
        threads: threads ? threads.filter((t) => t.id !== threadId) : null,
      });
    }
  };

  const refreshThread = async (tripId: number) => {
    const before = chat(tripId);
    if (
      assistantScopeOf(tripId).kind !== 'home' ||
      before.threadId === null ||
      before.abort ||
      before.loading ||
      refreshing.has(tripId)
    )
      return;
    refreshing.add(tripId);
    const current = () => {
      const c = chat(tripId);
      return c.threadId === before.threadId && c.messages === before.messages && !c.abort && !c.loading;
    };
    try {
      const { messages, running } = await assistantRepo.thread(assistantTargetOf(tripId), before.threadId);
      if (current()) patch(tripId, { messages, isRunning: running === true, error: null });
    } catch (err) {
      if (!current()) return;
      if (httpStatus(err) === 404) {
        patch(tripId, { threadId: null, messages: [], isRunning: false, error: null });
      } else patch(tripId, { error: errorCodeOf(err) });
    } finally {
      refreshing.delete(tripId);
    }
  };

  const newThread = (tripId: number) => {
    chat(tripId).abort?.abort();
    clearRoute();
    // The block a comparison belonged to leaves the screen with its thread.
    patch(tripId, {
      threadId: null,
      fresh: true,
      loading: false,
      messages: [],
      isRunning: false,
      error: null,
      unsent: null,
      abort: null,
      live: { activity: null },
      compare: null,
    });
  };

  return {
    loadThreads,
    openThread,
    refreshThread,
    newThread,
    resume: async (tripId: number) => {
      await loadThreads(tripId);
      const c = chat(tripId);
      const latest = c.threads?.[0];
      if (latest && !c.fresh && c.threadId === null && c.messages.length === 0 && !c.isRunning)
        await openThread(tripId, latest.id);
    },
    deleteThread: async (tripId: number, threadId: number) => {
      await assistantRepo.deleteThread(assistantTargetOf(tripId), threadId);
      const c = chat(tripId);
      patch(tripId, { threads: c.threads ? c.threads.filter((t) => t.id !== threadId) : null });
      if (c.threadId === threadId) newThread(tripId);
    },
  };
}
