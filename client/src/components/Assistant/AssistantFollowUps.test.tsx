import type { AssistantMessage } from '@trek/shared';
import en from '@trek/shared/i18n/en';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '../../../tests/helpers/render';
import { HOME_CHAT_KEY } from '../../store/assistantChatKey';
import { chatOf, useAssistantStore } from '../../store/assistantStore';
import AssistantFollowUps from './AssistantFollowUps';
import { AssistantViewContext } from './assistantViewContext';

const INITIAL = useAssistantStore.getState();
const QUESTION = '大概准备玩几天？';
const CHOICES = ['玩 3 天左右', '玩 5 天左右', '玩 7 天左右'];

afterEach(() => useAssistantStore.setState(INITIAL, true));

function clarification(over: Partial<AssistantMessage> = {}): AssistantMessage {
  return {
    id: 'question-1',
    role: 'assistant',
    status: 'complete',
    createdAt: '2026-11-01T03:00:00.000Z',
    parts: [{ type: 'data-trek-follow-ups', data: { question: QUESTION, questions: CHOICES } }],
    ...over,
  };
}

function inView(node: ReactNode, tripId = HOME_CHAT_KEY) {
  return <AssistantViewContext.Provider value={{ tripId, variant: 'window' }}>{node}</AssistantViewContext.Provider>;
}

function seed(messages: AssistantMessage[], over: Record<string, unknown> = {}, tripId = HOME_CHAT_KEY) {
  const send = vi.fn(async () => {});
  useAssistantStore.setState({
    send,
    byTrip: { [tripId]: { ...chatOf(INITIAL, tripId), messages, ...over } },
  });
  return send;
}

describe('guided trip questions', () => {
  it('shows a saved question without prose and sends the selected answer as written', () => {
    const message = clarification();
    const send = seed([message]);
    render(inView(<AssistantFollowUps message={message} />));

    expect(screen.getByRole('group', { name: QUESTION })).toBeInTheDocument();
    expect(screen.getByText(en['assistant.followUp.answerHint'])).toBeInTheDocument();
    for (const choice of CHOICES) expect(screen.getByRole('button', { name: choice })).toBeInTheDocument();
    expect(send).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: CHOICES[1] }));
    expect(send).toHaveBeenCalledExactlyOnceWith(HOME_CHAT_KEY, CHOICES[1]);
  });

  it('only skips to generation when the user explicitly chooses to use assumptions', () => {
    const message = clarification();
    const send = seed([message]);
    render(inView(<AssistantFollowUps message={message} />));
    expect(send).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: en['assistant.followUp.useDefaults'] }));
    expect(send).toHaveBeenCalledExactlyOnceWith(HOME_CHAT_KEY, en['assistant.followUp.useDefaultsPrompt']);
  });

  it('keeps an answered question readable without offering obsolete choices', () => {
    const message = clarification();
    seed([
      message,
      {
        id: 'user-1',
        role: 'user',
        status: 'complete',
        createdAt: '2026-11-01T03:00:01.000Z',
        parts: [{ type: 'text', text: CHOICES[1] }],
      },
    ]);
    render(inView(<AssistantFollowUps message={message} />));

    expect(screen.getByText(QUESTION)).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toEqual([]);
    expect(screen.queryByText(en['assistant.followUp.answerHint'])).not.toBeInTheDocument();
  });

  it.each([{ isRunning: true }, { loading: true }, { error: 'generic' }])('waits while chat state is %j', (state) => {
    const message = clarification();
    seed([message], state);
    render(inView(<AssistantFollowUps message={message} />));

    expect(screen.getByText(QUESTION)).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toEqual([]);
  });

  it.each(['aborted', 'error', 'awaiting_approval'] as const)('does not offer choices for a %s answer', (status) => {
    const message = clarification({ status });
    seed([message]);
    render(inView(<AssistantFollowUps message={message} />));
    expect(screen.queryAllByRole('button')).toEqual([]);
  });

  it.each([9, -9])('does not offer itinerary generation outside HOME (chat %s)', (chatKey) => {
    const message = clarification();
    seed([message], {}, chatKey);
    render(inView(<AssistantFollowUps message={message} />, chatKey));

    expect(screen.getByRole('button', { name: CHOICES[0] })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: en['assistant.followUp.useDefaults'] })).not.toBeInTheDocument();
  });

  it('retains ordinary follow-up chips without question-specific controls', () => {
    const message = clarification({
      parts: [
        { type: 'text', text: 'Here is your plan.' },
        { type: 'data-trek-follow-ups', data: { questions: ['Make it more relaxed', 'Show the budget'] } },
      ],
    });
    const send = seed([message]);
    render(inView(<AssistantFollowUps message={message} />));
    expect(screen.queryByText(en['assistant.followUp.answerHint'])).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: en['assistant.followUp.useDefaults'] })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Make it more relaxed' }));
    expect(send).toHaveBeenCalledExactlyOnceWith(HOME_CHAT_KEY, 'Make it more relaxed');
  });

  it('uses only the final structured offer on the message', () => {
    const message = clarification({
      parts: [
        ...clarification().parts,
        { type: 'data-trek-follow-ups', data: { question: '从哪里出发？', questions: ['从成都出发', '从重庆出发'] } },
      ],
    });
    seed([message]);
    render(inView(<AssistantFollowUps message={message} />));

    expect(screen.queryByText(QUESTION)).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: '从哪里出发？' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '从成都出发' })).toBeInTheDocument();
  });
});
