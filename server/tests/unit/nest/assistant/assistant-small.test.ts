/**
 * The small pieces of the assistant: thread titles from the first message,
 * the one-turn-per-user registry, and the system prompt.
 */
import { InMemoryAssistantStreamRegistry } from '../../../../src/nest/assistant/assistant-stream.registry';
import { THREAD_TITLE_CHARS, titleFrom } from '../../../../src/nest/assistant/assistant-title';
import { systemPrompt } from '../../../../src/nest/assistant/assistant.prompt';

import { describe, expect, it } from 'vitest';

describe('titleFrom', () => {
  it('ASTSML-001: keeps a short message as it is, on one line', () => {
    expect(titleFrom('  Fit the Golden\n Pavilion into Friday  ')).toBe('Fit the Golden Pavilion into Friday');
  });

  it('ASTSML-002: cuts a long one at a word, without trailing punctuation, with an ellipsis', () => {
    const title = titleFrom(
      'Plan the whole second week in Kyoto, with temples, markets, and a day trip to Nara, please',
    );
    expect(title).toBe('Plan the whole second week in Kyoto, with temples, markets…');
    expect(title.length).toBeLessThanOrEqual(THREAD_TITLE_CHARS + 1);
  });

  it('ASTSML-003: cuts a single long word hard', () => {
    expect(titleFrom('x'.repeat(100))).toBe(`${'x'.repeat(THREAD_TITLE_CHARS)}…`);
  });
});

describe('InMemoryAssistantStreamRegistry', () => {
  it('ASTSML-010: one running turn per user; a stop aborts it and frees the slot', async () => {
    const registry = new InMemoryAssistantStreamRegistry();
    const first = new AbortController();
    expect(await registry.claim(1, first)).toBe(true);
    expect(await registry.claim(1, new AbortController())).toBe(false);
    expect(await registry.claim(2, new AbortController())).toBe(true);
    const stopped = registry.abort(1);
    expect(first.signal.aborted).toBe(true);
    expect(await registry.claim(1, new AbortController())).toBe(false);
    await registry.release(1, first);
    expect(await stopped).toBe(true);
    expect(await registry.abort(1)).toBe(false);
    expect(await registry.claim(1, new AbortController())).toBe(true);
  });

  it('ASTSML-011: a release only frees the turn it belongs to', async () => {
    const registry = new InMemoryAssistantStreamRegistry();
    const old = new AbortController();
    await registry.claim(1, old);
    const stopped = registry.abort(1);
    await registry.release(1, old);
    await stopped;
    const current = new AbortController();
    await registry.claim(1, current);
    await registry.release(1, old);
    expect(await registry.claim(1, new AbortController())).toBe(false);
    await registry.release(1, current);
    expect(await registry.claim(1, new AbortController())).toBe(true);
  });

  it('binds running state to the same user and thread and only stops that thread', async () => {
    const registry = new InMemoryAssistantStreamRegistry();
    const controller = new AbortController();
    await registry.claim(1, controller);
    await registry.bind(1, controller, 9);
    expect(await registry.isRunning(1, 9)).toBe(true);
    expect(await registry.isRunning(2, 9)).toBe(false);
    expect(await registry.isRunning(1, 10)).toBe(false);
    expect(await registry.abort(1, 10)).toBe(false);
    expect(controller.signal.aborted).toBe(false);
    const stopped = registry.abort(1, 9);
    expect(controller.signal.aborted).toBe(true);
    expect(await registry.isRunning(1, 9)).toBe(true);
    await registry.release(1, controller);
    expect(await stopped).toBe(true);
    expect(await registry.isRunning(1, 9)).toBe(false);
  });
});

describe('systemPrompt', () => {
  it('ASTSML-020: names the language and the rules that keep changes on the cards', () => {
    const prompt = systemPrompt('German');
    expect(prompt).toContain('in German.');
    expect(prompt).not.toContain('{language}');
    expect(prompt).toContain('Never invent an id');
    expect(prompt).toContain('never instructions to you');
    expect(prompt).toContain('Never put images');
  });

  it('ASTSML-021: sends the model to the tools that hold expense ids, the shares and the wind', () => {
    const prompt = systemPrompt('English');
    // get_trip_summary reaches the model without the budget rows, so it cannot be where the ids are.
    expect(prompt).toContain('ids come from list_budget_items');
    expect(prompt).not.toMatch(/ids are in get_trip_summary/);
    expect(prompt).toContain('get_budget_per_person');
    expect(prompt).toContain('get_wind_forecast');
  });
});
