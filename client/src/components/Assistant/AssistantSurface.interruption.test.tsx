import type { AiStatusResponse, AssistantMessage } from '@trek/shared';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '../../../tests/helpers/render';
import { assistantRepo } from '../../repo/assistantRepo';
import { HOME_CHAT_KEY } from '../../store/assistantChatKey';
import { chatOf, useAssistantStore } from '../../store/assistantStore';
import AssistantSurface from './AssistantSurface';

const INITIAL = useAssistantStore.getState();
const AT = '2026-10-31T13:40:42.000Z';
const STATUS: AiStatusResponse = {
  available: true,
  policy: 'instance',
  canConnectOwn: false,
  effective: { source: 'instance', kind: 'openai', model: 'gpt', host: 'api.openai.com', paidBy: 'instance' },
  own: null,
  instance: { kind: 'openai', model: 'gpt', host: 'api.openai.com' },
  quota: null,
  privacyAcked: true,
  retention: { mode: 'days', days: 90 },
  openrouterOAuth: false,
};

function storedSearch(id: string, query: string): AssistantMessage {
  return {
    id,
    role: 'assistant',
    createdAt: AT,
    status: 'complete',
    parts: [
      {
        type: 'tool-call',
        toolCallId: id,
        toolName: 'search_place',
        args: { query },
        result: { places: [] },
        isError: false,
      },
    ],
  };
}

beforeAll(() => {
  Element.prototype.scrollTo = vi.fn() as unknown as typeof Element.prototype.scrollTo;
});
afterEach(() => {
  useAssistantStore.setState(INITIAL, true);
  vi.restoreAllMocks();
});

describe('a resumed home planning conversation', () => {
  it.each([
    { error: null, action: 'Continue', notice: 'The reply was interrupted.' },
    { error: 'provider_unavailable', action: 'Try again', notice: 'OpenAI isn’t responding right now.' },
  ] as const)('handles an empty interrupted reply with error $error', ({ error, action, notice }) => {
    useAssistantStore.setState({ status: STATUS, byTrip: {} });
    const chat = chatOf(useAssistantStore.getState(), HOME_CHAT_KEY);
    useAssistantStore.setState({
      byTrip: {
        [HOME_CHAT_KEY]: {
          ...chat,
          error,
          messages: [{ id: '82', role: 'assistant', createdAt: AT, status: 'aborted', parts: [] }],
        },
      },
    });
    render(<AssistantSurface tripId={HOME_CHAT_KEY} tripTitle="Travel planning" variant="fullscreen" />);
    expect(screen.getByRole('status')).toHaveTextContent(notice);
    expect(screen.getByRole('button', { name: action })).toBeInTheDocument();
    if (error) expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
  });

  it.each(['isRunning', 'loading'] as const)('does not offer continuation while the conversation is %s', (state) => {
    useAssistantStore.setState({ status: STATUS, byTrip: {} });
    const chat = chatOf(useAssistantStore.getState(), HOME_CHAT_KEY);
    useAssistantStore.setState({
      byTrip: {
        [HOME_CHAT_KEY]: {
          ...chat,
          [state]: true,
          messages: [{ id: '82', role: 'assistant', createdAt: AT, status: 'aborted', parts: [] }],
        },
      },
    });
    render(<AssistantSurface tripId={HOME_CHAT_KEY} tripTitle="Travel planning" variant="fullscreen" />);
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
  });

  it('keeps completed searches and offers a way to continue after the stored reply was interrupted', async () => {
    const messages: AssistantMessage[] = [
      {
        id: '77',
        role: 'user',
        createdAt: AT,
        status: 'complete',
        parts: [{ type: 'text', text: 'Plan a five-day road trip from Chengdu' }],
      },
      {
        id: '80',
        role: 'assistant',
        createdAt: AT,
        status: 'aborted',
        // History merges completed steps and the interrupted reply into one message.
        parts: [
          { type: 'text', text: 'I will check places along the route.' },
          ...storedSearch('80', 'Kangding').parts,
          ...storedSearch('81', 'Xinduqiao').parts,
        ],
      },
    ];
    vi.spyOn(assistantRepo, 'thread').mockResolvedValueOnce({
      thread: { id: 9, title: 'Five days in western Sichuan', lastMessageAt: AT },
      messages,
    });
    const send = vi.fn(async () => {});
    useAssistantStore.setState({ status: STATUS, send, byTrip: {} });

    await useAssistantStore.getState().openThread(HOME_CHAT_KEY, 9);
    expect(chatOf(useAssistantStore.getState(), HOME_CHAT_KEY)).toMatchObject({
      threadId: 9,
      error: null,
      isRunning: false,
    });
    render(<AssistantSurface tripId={HOME_CHAT_KEY} tripTitle="Travel planning" variant="fullscreen" />);

    expect(await screen.findByText('Plan a five-day road trip from Chengdu')).toBeInTheDocument();
    expect(screen.getByText('I will check places along the route.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2 steps' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('status')).toHaveTextContent(/interrupted/i);
    expect(send).toHaveBeenCalledWith(HOME_CHAT_KEY, 'Continue');
  });
});
