import type { AiChatRequest } from '../../../../src/nest/ai-connections/ai-chat-client.interface';
import { AiChatClientService } from '../../../../src/nest/ai-connections/ai-chat-client.service';
import { AiConnectionsService } from '../../../../src/nest/ai-connections/ai-connections.service';
import { AiUsageService } from '../../../../src/nest/ai-connections/ai-usage.service';
import { AiProviderError } from '../../../../src/nest/ai-connections/providers/provider-errors';
import { RateLimitService } from '../../../../src/nest/common/rate-limit.service';
import { MapsService } from '../../../../src/nest/maps/maps.service';
import { TripPlanningAiService } from '../../../../src/nest/trip-planning/trip-planning-ai.service';
import { createSnapshotTestDb } from '../../../helpers/db-mock';
import { itineraryDayGuideFixture, itineraryGuideFixture } from '../../../helpers/itinerary-guide';
import { createTestModule, type TestModule } from '../../../helpers/test-module';
import type { ItineraryPlan, TripPlanningContent } from '@trek/shared';

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const db = createSnapshotTestDb();
let t: TestModule;
let service: TripPlanningAiService;
const connection = {
  id: 1,
  kind: 'custom',
  model: 'test',
  baseUrl: 'https://test.example',
  paidBy: 'instance',
  status: 'ok',
  credential: { type: 'api_key', apiKey: null },
};
const connections = { status: vi.fn(), resolveForUser: vi.fn(), readSettings: vi.fn(), noteOutcome: vi.fn() };
const usage = { instanceTurnsToday: vi.fn(), record: vi.fn() };
const rate = { check: vi.fn() };
const maps = { search: vi.fn() };
const client = { stream: vi.fn() };

const discussion = (): TripPlanningContent => ({
  kind: 'discussion',
  summary: '成都公园茶馆慢游。',
  questions: ['哪天出发？'],
  agreements: ['带老人'],
  disagreements: ['有人想爬山，有人希望少走路'],
  outline: [{ day: 1, title: '公园茶馆', description: '轻松体验成都生活。' }],
  changes: ['整理大家的意见'],
  plan: null,
});
function plan(): ItineraryPlan {
  return {
    schedule_version: 2,
    title: '成都慢游',
    summary: '到公园喝茶，少走路。',
    guide: itineraryGuideFixture(),
    start_date: '2026-12-01',
    currency: 'CNY',
    transport_mode: 'walking',
    requirements: ['带老人'],
    assumptions: ['营业时间待核实'],
    days: [
      {
        title: '人民公园',
        overnight_city: '',
        notes: '',
        guide: itineraryDayGuideFixture(),
        stay: null,
        stops: [
          {
            id: 'park',
            kind: 'visit',
            time_kind: 'suggested',
            name: '人民公园',
            city: '成都',
            description: '逛公园与茶馆。',
            arrival_time: '10:00',
            duration_minutes: 90,
            travel_from_previous: null,
            place_ref: 'amap:park',
          },
        ],
      },
    ],
  };
}

beforeAll(async () => {
  t = await createTestModule({
    db,
    imports: [],
    providers: [
      TripPlanningAiService,
      { provide: AiConnectionsService, useValue: connections },
      { provide: AiChatClientService, useValue: { create: () => client } },
      { provide: AiUsageService, useValue: usage },
      { provide: RateLimitService, useValue: rate },
      { provide: MapsService, useValue: maps },
    ],
  });
  service = t.get(TripPlanningAiService);
}, 60_000);
beforeEach(() => {
  vi.resetAllMocks();
  connections.status.mockResolvedValue({ available: true, privacyAcked: true });
  connections.resolveForUser.mockResolvedValue(connection);
  connections.readSettings.mockResolvedValue({ dailyTurns: 100 });
  connections.noteOutcome.mockResolvedValue(undefined);
  usage.instanceTurnsToday.mockResolvedValue(0);
  usage.record.mockResolvedValue(undefined);
  rate.check.mockResolvedValue(true);
});
afterAll(async () => {
  await t?.close();
  db.close();
});

const generate = (previous: ItineraryPlan | null = null) =>
  service.generate(1, 1, { shared: 'A希望爬山，B希望少走路，C尚未发言。' }, 'detailed', [], previous);

describe('shared planning AI boundary', () => {
  it.each([
    ['not connected', { available: false, privacyAcked: false }, 503],
    ['privacy not acknowledged', { available: true, privacyAcked: false }, 403],
  ])('refuses %s before calling the provider or charging usage', async (_name, status, code) => {
    connections.status.mockResolvedValue(status);
    await expect(generate()).rejects.toMatchObject({ status: code });
    expect(client.stream).not.toHaveBeenCalled();
    expect(usage.record).not.toHaveBeenCalled();
  });

  it('enforces the instance daily quota and per-user request rate', async () => {
    usage.instanceTurnsToday.mockResolvedValue(100);
    await expect(generate()).rejects.toMatchObject({ status: 429 });
    expect(client.stream).not.toHaveBeenCalled();
    usage.instanceTurnsToday.mockResolvedValue(0);
    rate.check.mockResolvedValue(false);
    await expect(generate()).rejects.toMatchObject({ status: 429 });
    expect(usage.record).not.toHaveBeenCalled();
  });

  it('repairs an answer with more than two questions before accepting it', async () => {
    const requests: AiChatRequest[] = [];
    client.stream
      .mockImplementationOnce(async function* (request: AiChatRequest) {
        requests.push(structuredClone(request));
        yield {
          type: 'tool-call',
          call: { id: 'bad', name: 'submit_proposal', args: { ...discussion(), questions: ['一？', '二？', '三？'] } },
        };
      })
      .mockImplementationOnce(async function* (request: AiChatRequest) {
        requests.push(structuredClone(request));
        yield { type: 'tool-call', call: { id: 'good', name: 'submit_proposal', args: discussion() } };
      });
    const result = await generate();
    expect(result.questions).toHaveLength(1);
    expect(requests[1].messages.some((message) => message.role === 'tool' && message.isError)).toBe(true);
    expect(requests[0].system).toContain('silence is not agreement');
    expect(usage.record).toHaveBeenCalledWith(1, 'instance', { turns: 1 });
  });

  it('hydrates locations only from real search results and preserves known locations in later revisions', async () => {
    maps.search.mockResolvedValue({
      places: [
        {
          id: 'amap:park',
          amap_poi_id: 'amap:park',
          name: '人民公园',
          lat: 30.657,
          lng: 104.055,
          address: '成都市青羊区',
        },
      ],
    });
    const content = { ...discussion(), kind: 'detailed', questions: [], plan: plan() };
    client.stream
      .mockImplementationOnce(async function* () {
        yield { type: 'tool-call', call: { id: 'search', name: 'search_place', args: { query: '成都人民公园' } } };
      })
      .mockImplementationOnce(async function* () {
        yield { type: 'tool-call', call: { id: 'save', name: 'submit_proposal', args: content } };
      });
    const result = await generate();
    expect(result.plan?.days[0].stops[0].location).toEqual({
      lat: 30.657,
      lng: 104.055,
      place_id: 'amap:park',
      address: '成都市青羊区',
    });
    client.stream.mockImplementationOnce(async function* () {
      yield { type: 'tool-call', call: { id: 'revise', name: 'submit_proposal', args: content } };
    });
    const revised = await generate(result.plan);
    expect(revised.plan?.days[0].stops[0].location).toEqual(result.plan?.days[0].stops[0].location);
  });

  it('leaves unresolved places without coordinates and rejects fabricated model-supplied locations', async () => {
    const content = { ...discussion(), kind: 'detailed', questions: [], plan: plan() };
    const forged = structuredClone(content);
    forged.plan.days[0].stops[0].location = { lat: 1, lng: 2, place_id: 'invented', address: 'fake' };
    client.stream
      .mockImplementationOnce(async function* () {
        yield { type: 'tool-call', call: { id: 'forged', name: 'submit_proposal', args: forged } };
      })
      .mockImplementationOnce(async function* () {
        yield { type: 'tool-call', call: { id: 'fixed', name: 'submit_proposal', args: content } };
      });
    const result = await generate();
    expect(client.stream).toHaveBeenCalledTimes(2);
    expect(result.plan?.days[0].stops[0].location).toBeNull();
  });

  it('marks a refused provider and releases its busy state for a retry', async () => {
    client.stream.mockImplementationOnce(async function* () {
      yield* [];
      throw new AiProviderError('invalid_key', 401, false);
    });
    await expect(generate()).rejects.toMatchObject({ status: 502 });
    expect(connections.noteOutcome).toHaveBeenCalledWith(connection, 'invalid_key');
    client.stream.mockImplementationOnce(async function* () {
      yield { type: 'tool-call', call: { id: 'retry', name: 'submit_proposal', args: discussion() } };
    });
    await expect(generate()).resolves.toMatchObject({ kind: 'discussion' });
  });

  it('rejects an incomplete provider stream rather than saving a partial plan', async () => {
    client.stream.mockImplementationOnce(async function* () {
      yield { type: 'text-delta', delta: '{"kind":"detailed"' };
      yield { type: 'finish', reason: 'length' };
    });
    await expect(generate()).rejects.toMatchObject({ status: 502 });
  });
});
