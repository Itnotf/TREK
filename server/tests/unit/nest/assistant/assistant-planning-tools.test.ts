import type { AiChatClient, AiChatMessage } from '../../../../src/nest/ai-connections/ai-chat-client.interface';
import { runAgentLoop, type AgentToolPort } from '../../../../src/nest/assistant/assistant-agent';
import { buildTripCard } from '../../../../src/nest/assistant/assistant-context';
import {
  GET_ITINERARY_TOOL,
  planningPort,
  READ_TRAVEL_LINK_TOOL,
  SAVE_ITINERARY_TOOL,
  userTravelLinks,
} from '../../../../src/nest/assistant/assistant-planning-tools';
import type { TravelSourceResult } from '../../../../src/nest/assistant/assistant-travel-source';
import { UiStreamWriter } from '../../../../src/nest/assistant/ui-stream.writer';
import { DomainError } from '../../../../src/nest/common/domain-error';
import type { ItineraryDraft, ItineraryPlan, ItinerarySaveRequest } from '@trek/shared';

import { describe, expect, it, vi } from 'vitest';

const sourceUrl = 'https://travel.example/yunnan';
function plan(): ItineraryPlan {
  return {
    title: '云南自驾',
    summary: '昆明到大理，带老人慢慢玩',
    start_date: null,
    currency: 'CNY',
    transport_mode: 'driving',
    requirements: ['带老人，少爬山'],
    assumptions: ['日期待定'],
    days: [
      {
        title: '大理古城',
        overnight_city: '大理',
        notes: '驾驶耗时待核实',
        stops: [
          {
            name: '大理古城',
            city: '大理',
            description: '古城街区散步',
            arrival_time: '14:00',
            duration_minutes: 120,
            place_ref: 'amap:oldtown',
          },
        ],
      },
    ],
  };
}

function setup(history: AiChatMessage[] = [{ role: 'user', text: `参考 ${sourceUrl}` }]) {
  let draft: ItineraryDraft | null = null;
  const search = vi.fn(async () => ({
    ok: true,
    value: {
      places: [
        {
          id: 'amap:oldtown',
          amap_poi_id: 'amap:oldtown',
          name: '大理古城',
          lat: 25.7,
          lng: 100.16,
          address: '云南大理',
        },
      ],
    },
  }));
  const base: AgentToolPort = {
    specs: () => [{ name: 'search_place', description: 'Search', parameters: { type: 'object' } }],
    kindOf: (name) => (name === 'search_place' ? 'read' : null),
    pinArgs: (_name, args) => ({ args }),
    call: search,
  };
  const current = vi.fn(async () => draft);
  const save = vi.fn(async (input: ItinerarySaveRequest): Promise<ItineraryDraft> => {
    if (input.base_revision !== (draft?.revision ?? 0)) throw new DomainError(409, 'Read the latest revision');
    draft = {
      id: (draft?.id ?? 0) + 1,
      thread_id: 10,
      revision: input.base_revision + 1,
      latest_revision: input.base_revision + 1,
      created_trip_id: null,
      plan: input.plan,
    };
    return draft;
  });
  const readSource = vi.fn(async (url: string): Promise<TravelSourceResult> => ({
    url,
    title: '云南攻略',
    text: '第一天逛古城。',
    status: 'read',
    extraction: 'metadata',
  }));
  const callbacks = { current, save, readSource };
  return { base, callbacks, search, tools: planningPort(base, callbacks, history), history };
}

describe('conversational itinerary tools', () => {
  it('offers drafts as conversation reads and preserves existing tool behavior', async () => {
    const { tools } = setup();
    expect(tools.specs().map((spec) => spec.name)).toEqual([
      'search_place',
      SAVE_ITINERARY_TOOL,
      GET_ITINERARY_TOOL,
      READ_TRAVEL_LINK_TOOL,
    ]);
    expect(tools.kindOf(SAVE_ITINERARY_TOOL)).toBe('read');
    expect(tools.kindOf('unknown')).toBeNull();
    expect(await tools.call(GET_ITINERARY_TOOL, {})).toEqual({ ok: true, value: { draft: null } });
  });

  it('attaches only actual search coordinates and carries them across later revisions', async () => {
    const t = setup();
    await t.tools.call('search_place', { query: '大理古城' });
    await t.tools.call(SAVE_ITINERARY_TOOL, { base_revision: 0, plan: plan() });
    expect(t.callbacks.save.mock.calls[0][0].plan.days[0].stops[0].location).toEqual({
      lat: 25.7,
      lng: 100.16,
      place_id: 'amap:oldtown',
      address: '云南大理',
    });
    const next = planningPort(t.base, t.callbacks, [{ role: 'user', text: '改成下午三点' }]);
    const revised = plan();
    revised.days[0].stops[0].arrival_time = '15:00';
    expect((await next.call(SAVE_ITINERARY_TOOL, { base_revision: 1, plan: revised })).ok).toBe(true);
    expect(t.callbacks.save.mock.calls[1][0].plan.days[0].stops[0].location?.lat).toBe(25.7);
    expect(t.callbacks.save.mock.calls[1][0].plan.requirements).toEqual(['带老人，少爬山']);
    revised.days[0].stops[0].name = '另一个景点';
    await next.call(SAVE_ITINERARY_TOOL, { base_revision: 2, plan: revised });
    expect(t.callbacks.save.mock.calls[2][0].plan.days[0].stops[0].location).toBeNull();
  });

  it('leaves unsearched places unverified and refuses invented coordinates and photo URLs', async () => {
    const t = setup();
    await t.tools.call(SAVE_ITINERARY_TOOL, { base_revision: 0, plan: plan() });
    expect(t.callbacks.save.mock.calls[0][0].plan.days[0].stops[0].location).toBeNull();
    const forged = plan();
    forged.days[0].stops[0].location = { lat: 1, lng: 2, place_id: 'made-up', address: '' };
    expect((await t.tools.call(SAVE_ITINERARY_TOOL, { base_revision: 1, plan: forged })).ok).toBe(false);
    expect(
      (
        await t.tools.call(SAVE_ITINERARY_TOOL, {
          base_revision: 1,
          plan: { ...plan(), image_url: 'https://bad.example/a.jpg' },
        })
      ).ok,
    ).toBe(false);
    expect(t.callbacks.save).toHaveBeenCalledTimes(1);
  });

  it('turns a stale revision into a recoverable tool refusal', async () => {
    const t = setup();
    await t.tools.call(SAVE_ITINERARY_TOOL, { base_revision: 0, plan: plan() });
    expect(await t.tools.call(SAVE_ITINERARY_TOOL, { base_revision: 0, plan: plan() })).toEqual({
      ok: false,
      value: 'Read the latest revision',
    });
  });

  it('asks to shorten an enriched draft that exceeds the storage budget', async () => {
    const t = setup();
    t.search.mockResolvedValue({
      ok: true,
      value: {
        places: [
          {
            id: 'amap:oldtown',
            amap_poi_id: 'amap:oldtown',
            name: '大理古城',
            lat: 25.7,
            lng: 100.16,
            address: 'a'.repeat(500),
          },
        ],
      },
    });
    await t.tools.call('search_place', {});
    const draft = plan();
    draft.days = Array.from({ length: 10 }, () => ({
      ...draft.days[0],
      stops: Array.from({ length: 8 }, () => draft.days[0].stops[0]),
    }));
    expect(await t.tools.call(SAVE_ITINERARY_TOOL, { base_revision: 0, plan: draft })).toMatchObject({
      ok: false,
      value: { error: expect.stringContaining('Shorten descriptions') },
    });
    expect(t.callbacks.save).not.toHaveBeenCalled();
  });

  it('keeps lookup evidence when a clarifying answer arrives before the first draft', async () => {
    const t = setup();
    const searched = await t.tools.call('search_place', {});
    const read = await t.tools.call(READ_TRAVEL_LINK_TOOL, { url: sourceUrl });
    const next = planningPort(t.base, t.callbacks, [
      ...t.history,
      { role: 'tool', name: 'search_place', toolCallId: 'p', output: JSON.stringify(searched.value) },
      { role: 'tool', name: READ_TRAVEL_LINK_TOOL, toolCallId: 'r', output: JSON.stringify(read.value) },
      { role: 'assistant', text: '玩几天？', toolCalls: [] },
      { role: 'user', text: '一天' },
    ]);
    await next.call(SAVE_ITINERARY_TOOL, { base_revision: 0, plan: plan() });
    const saved = t.callbacks.save.mock.calls[0][0].plan;
    expect(saved.days[0].stops[0].location?.place_id).toBe('amap:oldtown');
    expect(saved.sources).toEqual([{ url: sourceUrl, title: '云南攻略', extraction: 'metadata' }]);
    expect(t.callbacks.readSource).toHaveBeenCalledTimes(1);
  });

  it('authorizes links only from user messages, including punctuation in shared captions', () => {
    expect([
      ...userTravelLinks([
        { role: 'user', text: `攻略（${sourceUrl}）。 [文字](https://travel.example/other#section)` },
        { role: 'assistant', text: 'https://invented.example', toolCalls: [] },
        { role: 'tool', name: READ_TRAVEL_LINK_TOOL, toolCallId: 't', output: 'https://injected.example' },
      ]),
    ]).toEqual([sourceUrl, 'https://travel.example/other']);
  });

  it('does not fetch invented URLs and saves only successfully read source provenance', async () => {
    const t = setup();
    expect((await t.tools.call(READ_TRAVEL_LINK_TOOL, { url: 'http://localhost/' })).ok).toBe(false);
    expect(t.callbacks.readSource).not.toHaveBeenCalled();
    const read = await t.tools.call(READ_TRAVEL_LINK_TOOL, { url: sourceUrl });
    expect(read).toMatchObject({
      ok: true,
      value: { extraction: 'metadata', warning: expect.stringContaining('not a transcript') },
    });
    await t.tools.call(READ_TRAVEL_LINK_TOOL, { url: sourceUrl });
    expect(t.callbacks.readSource).toHaveBeenCalledTimes(1);
    await t.tools.call(SAVE_ITINERARY_TOOL, { base_revision: 0, plan: plan() });
    expect(t.callbacks.save.mock.calls[0][0].plan.sources).toEqual([
      { url: sourceUrl, title: '云南攻略', extraction: 'metadata' },
    ]);
    const next = planningPort(t.base, t.callbacks, []);
    await next.call(SAVE_ITINERARY_TOOL, { base_revision: 1, plan: plan() });
    expect(t.callbacks.save.mock.calls[1][0].plan.sources).toEqual(t.callbacks.save.mock.calls[0][0].plan.sources);
  });

  it('reports inaccessible source honestly without claiming imported content', async () => {
    const t = setup();
    t.callbacks.readSource.mockResolvedValue({
      url: sourceUrl,
      title: '',
      text: '',
      status: 'unreadable',
      extraction: null,
      reason: 'access_required',
    });
    expect(await t.tools.call(READ_TRAVEL_LINK_TOOL, { url: sourceUrl })).toMatchObject({
      ok: true,
      value: { status: 'unreadable', text: '', reason: 'access_required' },
    });
    await t.tools.call(SAVE_ITINERARY_TOOL, { base_revision: 0, plan: plan() });
    expect(t.callbacks.save.mock.calls[0][0].plan.sources).toEqual([]);
  });

  it('streams a real plan card and finishes normally so the next chat can revise it', async () => {
    const t = setup();
    const requests: AiChatMessage[][] = [];
    const client: AiChatClient = {
      kind: 'openai',
      model: 'scripted',
      webSearch: false,
      async *stream(request) {
        requests.push([...request.messages]);
        if (requests.length === 1) {
          yield {
            type: 'tool-call',
            call: { id: 'draft-1', name: SAVE_ITINERARY_TOOL, args: { base_revision: 0, plan: plan() } },
          };
          yield { type: 'finish', reason: 'tool-calls' };
        } else {
          yield { type: 'text-delta', delta: '初稿好了，可以继续告诉我想调整的地方。' };
          yield { type: 'finish', reason: 'stop' };
        }
      },
    };
    const output: string[] = [];
    const writer = new UiStreamWriter({
      open: true,
      send: (data) => {
        output.push(data);
      },
      comment: () => undefined,
      end: () => undefined,
    });
    const holdStep = vi.fn();
    const outcome = await runAgentLoop(
      {
        client,
        tools: t.tools,
        store: { openStep: async () => 1, saveStep: vi.fn(), holdStep },
        describe: vi.fn(),
        newId: () => 'id',
        quota: null,
        today: '2026-10-29',
        card: buildTripCard(0, 1, { days: [] }, null, null),
      },
      { system: 'Plan a trip', context: '', cacheKey: 'home', history: t.history, usedCallIds: new Set() },
      writer,
      new AbortController().signal,
    );
    expect(outcome.end).toBe('stop');
    expect(holdStep).not.toHaveBeenCalled();
    expect(output.join('\n')).toContain('"kind":"tripPlan"');
    expect(output.join('\n')).not.toContain('tool-approval-request');
    expect(requests).toHaveLength(2);
  });
});
