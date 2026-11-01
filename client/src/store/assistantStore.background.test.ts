import type { AssistantMessage, UiStreamChunk } from '@trek/shared';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { assistantRepo } from '../repo/assistantRepo';
import { HOME_CHAT_KEY } from './assistantChatKey';
import { chatOf, useAssistantStore } from './assistantStore';

const INITIAL = useAssistantStore.getState();
const AT = '2026-10-31T15:08:25.000Z';
const THREAD = { id: 9, title: 'Five days in Sichuan', lastMessageAt: AT };
const QUESTION: AssistantMessage = {
  id: '87',
  role: 'user',
  status: 'complete',
  createdAt: AT,
  parts: [{ type: 'text', text: 'Plan five days' }],
};
const ANSWER: AssistantMessage = {
  id: '88',
  role: 'assistant',
  status: 'complete',
  createdAt: AT,
  parts: [{ type: 'text', text: 'Your five-day plan' }],
};
const store = () => useAssistantStore.getState();
const chat = () => chatOf(store(), HOME_CHAT_KEY);

afterEach(() => {
  useAssistantStore.setState(INITIAL, true);
  vi.restoreAllMocks();
});

describe('home planning in the background', () => {
  it('restores a running server turn after a reload and prevents a duplicate question', async () => {
    vi.spyOn(assistantRepo, 'thread').mockResolvedValueOnce({ thread: THREAD, messages: [QUESTION], running: true });
    const send = vi.spyOn(assistantRepo, 'send');
    await store().openThread(HOME_CHAT_KEY, 9);
    expect(chat()).toMatchObject({ threadId: 9, isRunning: true, abort: null, messages: [QUESTION] });
    await store().send(HOME_CHAT_KEY, 'Continue');
    expect(send).not.toHaveBeenCalled();
  });

  it('reloads the saved result when the background turn finishes', async () => {
    vi.spyOn(assistantRepo, 'thread')
      .mockResolvedValueOnce({ thread: THREAD, messages: [QUESTION], running: true })
      .mockResolvedValueOnce({ thread: THREAD, messages: [QUESTION, ANSWER], running: false });
    await store().openThread(HOME_CHAT_KEY, 9);
    await store().refreshThread(HOME_CHAT_KEY);
    expect(chat()).toMatchObject({ isRunning: false, error: null, messages: [QUESTION, ANSWER] });
  });

  it('a lost stream rechecks the server rather than treating its running work as a failed answer', async () => {
    async function* broken(): AsyncGenerator<UiStreamChunk> {
      yield { type: 'data-trek-thread', data: { threadId: 9, title: THREAD.title } };
      yield { type: 'start', messageId: '88' };
      throw new TypeError('network lost');
    }
    vi.spyOn(assistantRepo, 'send').mockResolvedValueOnce(broken());
    vi.spyOn(assistantRepo, 'thread').mockResolvedValueOnce({ thread: THREAD, messages: [QUESTION], running: true });
    await store().send(HOME_CHAT_KEY, 'Plan five days');
    expect(chat()).toMatchObject({ threadId: 9, isRunning: true, error: null, abort: null });
  });

  it('retains a provider error when its stream ends normally without a finish chunk', async () => {
    async function* failed(): AsyncGenerator<UiStreamChunk> {
      yield { type: 'data-trek-thread', data: { threadId: 9, title: THREAD.title } };
      yield { type: 'start', messageId: '88' };
      yield { type: 'error', errorText: 'provider_unavailable' };
    }
    vi.spyOn(assistantRepo, 'send').mockResolvedValueOnce(failed());
    const read = vi.spyOn(assistantRepo, 'thread');
    await store().send(HOME_CHAT_KEY, 'Plan five days');
    expect(chat()).toMatchObject({ isRunning: false, error: 'provider_unavailable', abort: null });
    expect(read).not.toHaveBeenCalled();
  });

  it('ignores a refresh that arrives after the user starts a fresh conversation', async () => {
    vi.spyOn(assistantRepo, 'thread').mockResolvedValueOnce({ thread: THREAD, messages: [QUESTION], running: true });
    await store().openThread(HOME_CHAT_KEY, 9);
    let resolve = (_value: { thread: typeof THREAD; messages: AssistantMessage[]; running: boolean }) => {};
    vi.spyOn(assistantRepo, 'thread').mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        })
    );
    const refreshing = store().refreshThread(HOME_CHAT_KEY);
    store().newThread(HOME_CHAT_KEY);
    resolve({ thread: THREAD, messages: [QUESTION, ANSWER], running: false });
    await refreshing;
    expect(chat()).toMatchObject({ threadId: null, isRunning: false, messages: [] });
  });

  it('does not overwrite a local stream with older background history', async () => {
    vi.spyOn(assistantRepo, 'thread').mockResolvedValueOnce({ thread: THREAD, messages: [QUESTION], running: false });
    await store().openThread(HOME_CHAT_KEY, 9);
    let resolve = (_value: { thread: typeof THREAD; messages: AssistantMessage[]; running: boolean }) => {};
    vi.spyOn(assistantRepo, 'thread').mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        })
    );
    const refreshing = store().refreshThread(HOME_CHAT_KEY);
    let finish = () => {};
    const gate = new Promise<void>((done) => {
      finish = done;
    });
    async function* delayed(): AsyncGenerator<UiStreamChunk> {
      yield { type: 'start', messageId: '90' };
      await gate;
      yield { type: 'finish' };
    }
    vi.spyOn(assistantRepo, 'send').mockResolvedValueOnce(delayed());
    const sending = store().send(HOME_CHAT_KEY, 'Make it slower');
    resolve({ thread: THREAD, messages: [QUESTION, ANSWER], running: false });
    await refreshing;
    expect(chat().isRunning).toBe(true);
    expect(chat().messages.some((m) => m.parts.some((p) => p.type === 'text' && p.text === 'Make it slower'))).toBe(
      true
    );
    finish();
    await sending;
  });

  it('keeps an explicit reload usable when an older poll of the same thread finishes first', async () => {
    vi.spyOn(assistantRepo, 'thread').mockResolvedValueOnce({ thread: THREAD, messages: [QUESTION], running: true });
    await store().openThread(HOME_CHAT_KEY, 9);
    let finishPoll = (_value: { thread: typeof THREAD; messages: AssistantMessage[]; running: boolean }) => {};
    let finishReload = (_value: { thread: typeof THREAD; messages: AssistantMessage[]; running: boolean }) => {};
    vi.spyOn(assistantRepo, 'thread')
      .mockImplementationOnce(
        () =>
          new Promise((done) => {
            finishPoll = done;
          })
      )
      .mockImplementationOnce(
        () =>
          new Promise((done) => {
            finishReload = done;
          })
      );
    const polling = store().refreshThread(HOME_CHAT_KEY);
    const reopening = store().openThread(HOME_CHAT_KEY, 9);
    finishPoll({ thread: THREAD, messages: [QUESTION, ANSWER], running: false });
    await polling;
    finishReload({ thread: THREAD, messages: [QUESTION, ANSWER], running: false });
    await reopening;
    expect(chat()).toMatchObject({ loading: false, isRunning: false, messages: [QUESTION, ANSWER] });
  });

  it('stops the server turn even after a reload left no local stream to abort', async () => {
    vi.spyOn(assistantRepo, 'thread').mockResolvedValueOnce({ thread: THREAD, messages: [QUESTION], running: true });
    const stop = vi.spyOn(assistantRepo, 'stop').mockResolvedValueOnce(undefined);
    await store().openThread(HOME_CHAT_KEY, 9);
    store().cancel(HOME_CHAT_KEY);
    await vi.waitFor(() => expect(stop).toHaveBeenCalledWith({ kind: 'home' }));
    await vi.waitFor(() => expect(chat().isRunning).toBe(false));
  });

  it('a failed recovery keeps the pending turn, and Retry reads its status without sending again', async () => {
    vi.spyOn(assistantRepo, 'thread')
      .mockResolvedValueOnce({ thread: THREAD, messages: [QUESTION], running: true })
      .mockRejectedValueOnce(new TypeError('offline'))
      .mockResolvedValueOnce({ thread: THREAD, messages: [QUESTION, ANSWER], running: false });
    const send = vi.spyOn(assistantRepo, 'send');
    await store().openThread(HOME_CHAT_KEY, 9);
    await store().refreshThread(HOME_CHAT_KEY);
    expect(chat()).toMatchObject({ isRunning: true, error: 'generic' });
    await store().retry(HOME_CHAT_KEY);
    expect(chat()).toMatchObject({ isRunning: false, error: null, messages: [QUESTION, ANSWER] });
    expect(send).not.toHaveBeenCalled();
  });
});
