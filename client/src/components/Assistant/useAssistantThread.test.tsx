/**
 * FE-AI-THREAD-001 to FE-AI-THREAD-004
 *
 * The chat around the messages: showing it resumes the latest conversation,
 * hiding it stops an answer still being written, and the header's actions
 * reach the store for this trip.
 */
import { act, renderHook } from '@testing-library/react';
import type { AiStatusResponse } from '@trek/shared';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TranslationProvider } from '../../i18n/TranslationContext';
import { HOME_CHAT_KEY } from '../../store/assistantChatKey';
import { chatOf, useAssistantStore } from '../../store/assistantStore';
import { useAssistantThread } from './useAssistantThread';

const { addToast } = vi.hoisted(() => ({ addToast: vi.fn() }));
// The toasts a component raises, read as (message, type) the way the toast host takes them.
vi.mock('../shared/Toast', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../shared/Toast')>()),
  useToast: () => ({
    success: (message: string) => addToast(message, 'success', undefined),
    error: (message: string) => addToast(message, 'error', undefined),
    warning: (message: string) => addToast(message, 'warning', undefined),
    info: (message: string) => addToast(message, 'info', undefined),
  }),
}));

const TRIP = 4;
const INITIAL = useAssistantStore.getState();

const resume = vi.fn(async () => {});
const cancel = vi.fn();
const deleteThread = vi.fn(async () => {});
const openThread = vi.fn(async () => {});

const wrapper = ({ children }: { children: ReactNode }) => <TranslationProvider>{children}</TranslationProvider>;

function seed(threadId: number | null, retention: AiStatusResponse['retention']) {
  useAssistantStore.setState({
    status: { retention } as AiStatusResponse,
    resume,
    cancel,
    deleteThread,
    openThread,
    byTrip: {
      [TRIP]: {
        ...chatOf(useAssistantStore.getState(), TRIP),
        threadId,
        threads: [
          { id: 7, title: 'Friday in Kyoto', lastMessageAt: '2026-10-20T10:00:00.000Z' },
          { id: 8, title: 'Packing', lastMessageAt: '2026-10-19T10:00:00.000Z' },
        ],
      },
    },
  });
}

beforeEach(() => {});

afterEach(() => {
  useAssistantStore.setState(INITIAL, true);
  vi.clearAllMocks();
});

describe('useAssistantThread', () => {
  it('refreshes background work without overlapping requests and stops polling when it finishes', async () => {
    vi.useFakeTimers();
    let release = () => {};
    const gate = new Promise<void>((done) => {
      release = done;
    });
    const refresh = vi
      .fn()
      .mockImplementationOnce(() => gate)
      .mockImplementationOnce(async () => {
        const chat = chatOf(useAssistantStore.getState(), HOME_CHAT_KEY);
        useAssistantStore.setState({ byTrip: { [HOME_CHAT_KEY]: { ...chat, isRunning: false } } });
      });
    seed(7, { mode: 'days', days: 90 });
    useAssistantStore.setState({
      refreshThread: refresh,
      byTrip: {
        [HOME_CHAT_KEY]: { ...chatOf(useAssistantStore.getState(), HOME_CHAT_KEY), threadId: 9, isRunning: true },
      },
    });
    const { unmount } = renderHook(() => useAssistantThread(HOME_CHAT_KEY), { wrapper });
    try {
      expect(refresh).toHaveBeenCalledTimes(1);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(10_000);
        window.dispatchEvent(new Event('focus'));
      });
      expect(refresh).toHaveBeenCalledTimes(1);
      await act(async () => {
        release();
        await gate;
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5_000);
      });
      expect(refresh).toHaveBeenCalledTimes(2);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(10_000);
      });
      expect(refresh).toHaveBeenCalledTimes(2);
    } finally {
      unmount();
      vi.useRealTimers();
    }
  });

  it('leaves a home planning answer running when its screen is closed', () => {
    seed(7, { mode: 'days', days: 90 });
    const { unmount } = renderHook(() => useAssistantThread(HOME_CHAT_KEY), { wrapper });
    expect(resume).toHaveBeenCalledWith(HOME_CHAT_KEY);
    unmount();
    expect(cancel).not.toHaveBeenCalled();
  });

  it('FE-AI-THREAD-001: resumes the trip on show and stops a running answer on hide', () => {
    seed(7, { mode: 'days', days: 90 });
    const { unmount } = renderHook(() => useAssistantThread(TRIP), { wrapper });
    expect(resume).toHaveBeenCalledWith(TRIP);
    expect(cancel).not.toHaveBeenCalled();
    unmount();
    expect(cancel).toHaveBeenCalledWith(TRIP);
  });

  it('FE-AI-THREAD-002: names the open conversation and how long chats are kept', () => {
    seed(7, { mode: 'days', days: 90 });
    const { result, rerender } = renderHook(() => useAssistantThread(TRIP), { wrapper });
    expect(result.current.title).toBe('Friday in Kyoto');
    expect(result.current.retentionNote).toBe('Chats are deleted after 90 days.');

    act(() => seed(null, { mode: 'forever' }));
    rerender();
    expect(result.current.title).toBeNull();
    expect(result.current.retentionNote).toBe('Chats are kept until you delete them.');
  });

  it('FE-AI-THREAD-003: opens and deletes conversations of this trip only', async () => {
    seed(7, { mode: 'days', days: 30 });
    const { result } = renderHook(() => useAssistantThread(TRIP), { wrapper });
    await act(() => result.current.openThread(8));
    expect(openThread).toHaveBeenCalledWith(TRIP, 8);
    await act(() => result.current.removeThread());
    expect(deleteThread).toHaveBeenCalledWith(TRIP, 7);
  });

  it('FE-AI-THREAD-004: a failed delete says so and keeps the conversation', async () => {
    seed(7, { mode: 'days', days: 30 });
    deleteThread.mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(() => useAssistantThread(TRIP), { wrapper });
    await act(() => result.current.removeThread());
    expect(addToast).toHaveBeenCalledWith('Something went wrong.', 'error', undefined);
    expect(chatOf(useAssistantStore.getState(), TRIP).threadId).toBe(7);
  });
});
