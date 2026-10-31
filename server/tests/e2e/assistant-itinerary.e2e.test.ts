import { buildApp } from '../../src/bootstrap';
import { TripMembers } from '../../src/db/entities/TripMembers.entity';
import { createRow, deleteRows } from '../helpers/factories/rows';
import { setAddonEnabled } from '../helpers/factories/settings';
import { makeUser } from '../helpers/factories/users';
import { itineraryDayGuideFixture, itineraryGuideFixture } from '../helpers/itinerary-guide';
import { resetRateLimits } from '../helpers/test-db';
import { sessionCookie } from './harness';
import { MikroORM } from '@mikro-orm/core';
import type { INestApplication } from '@nestjs/common';
import {
  assistantThreadResponseSchema,
  itineraryApplyResponseSchema,
  itineraryDraftResponseSchema,
  tripGuideResponseSchema,
  tripPlanCardSchema,
  uiStreamChunkSchema,
  type ItineraryPlan,
  type UiStreamChunk,
} from '@trek/shared';

import { createServer, type IncomingMessage, type Server as HttpServer, type ServerResponse } from 'node:http';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

type Reply = { id: string; name: string; args: Record<string, unknown> } | { text: string };
const replies: Reply[] = [];
const modelRequests: string[] = [];

// Match assistant-home's local OpenAI-compatible provider, keeping the real
// adapter, tool loop, HTTP guards and persisted conversations in this test.
async function answer(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method === 'GET' && req.url?.startsWith('/api/tags')) {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ models: [{ name: 'fake-model', size: 1 }] }));
    return;
  }
  if (req.method !== 'POST' || req.url !== '/v1/chat/completions') {
    res.writeHead(404).end();
    return;
  }
  let body = '';
  for await (const chunk of req) body += String(chunk);
  modelRequests.push(body);
  const reply = replies.shift();
  if (!reply) {
    res.writeHead(500).end('No scripted response remains');
    return;
  }
  const delta =
    'text' in reply
      ? { content: reply.text }
      : {
          tool_calls: [
            {
              index: 0,
              id: reply.id,
              type: 'function',
              function: { name: reply.name, arguments: JSON.stringify(reply.args) },
            },
          ],
        };
  res.writeHead(200, { 'content-type': 'text/event-stream' });
  res.write(`data: ${JSON.stringify({ choices: [{ index: 0, delta }] })}\n\n`);
  res.write(
    `data: ${JSON.stringify({ choices: [{ index: 0, delta: {}, finish_reason: 'text' in reply ? 'stop' : 'tool_calls' }] })}\n\n`,
  );
  res.end('data: [DONE]\n\n');
}

let app: INestApplication;
let orm: MikroORM;
let fake: HttpServer;
const BASE = '/api/assistant';

beforeAll(async () => {
  fake = createServer((req, res) => {
    answer(req, res).catch(() => res.destroy());
  });
  await new Promise<void>((resolve) => fake.listen(0, '127.0.0.1', resolve));
  app = await buildApp();
  orm = app.get(MikroORM);
  await setAddonEnabled(orm, 'ai_assistant', true);
  await setAddonEnabled(orm, 'roadtrip', true);
  const { user: admin } = await makeUser(orm, { role: 'admin' });
  const address = fake.address();
  if (!address || typeof address === 'string') throw new Error('Fake provider did not bind a TCP port');
  const configured = await request(app.getHttpServer())
    .put('/api/admin/ai/connection')
    .set('Cookie', sessionCookie(admin.id))
    .send({ kind: 'custom', baseUrl: `http://127.0.0.1:${address.port}/v1`, model: 'fake-model' });
  expect(configured.status).toBe(200);
  await resetRateLimits(app);
});

afterAll(async () => {
  await app?.close();
  if (fake) await new Promise<void>((resolve) => fake.close(() => resolve()));
});

function get(path: string, userId: number) {
  return request(app.getHttpServer()).get(path).set('Cookie', sessionCookie(userId));
}

function apply(draftId: number, revision: number, userId: number) {
  return request(app.getHttpServer())
    .post(`${BASE}/itinerary-drafts/${draftId}/apply`)
    .set('Cookie', sessionCookie(userId))
    .send({ revision });
}

async function chat(userId: number, threadId: number | null, text: string): Promise<UiStreamChunk[]> {
  const response = await request(app.getHttpServer())
    .post(`${BASE}/chat`)
    .set('Cookie', sessionCookie(userId))
    .send({ locale: 'zh', timeZone: 'Asia/Shanghai', threadId, text })
    .buffer(true)
    .parse((stream, done) => {
      let content = '';
      stream.setEncoding('utf8');
      stream.on('data', (chunk: string) => (content += chunk));
      stream.on('end', () => done(null, content));
    });
  expect(response.status).toBe(200);
  const chunks = String(response.body)
    .split('\n\n')
    .filter((event) => event.startsWith('data: ') && event !== 'data: [DONE]')
    .map((event) => uiStreamChunkSchema.parse(JSON.parse(event.slice('data: '.length))));
  expect(
    chunks.filter((chunk) => ['error', 'tool-output-error', 'tool-approval-request'].includes(chunk.type)),
  ).toEqual([]);
  return chunks;
}

function savedCard(chunks: UiStreamChunk[], toolCallId: string) {
  const event = chunks.find((chunk) => chunk.type === 'data-trek-card' && chunk.data.toolCallId === toolCallId);
  if (event?.type !== 'data-trek-card') throw new Error(`Missing itinerary card for ${toolCallId}`);
  return tripPlanCardSchema.parse(event.data.card);
}

function plan(): ItineraryPlan {
  return {
    schedule_version: 2,
    guide: itineraryGuideFixture(),
    title: '成都到乐山两日自驾',
    summary: '先逛成都，再去乐山慢游。',
    start_date: '2026-12-31',
    currency: 'CNY',
    transport_mode: 'driving',
    requirements: ['带老人，少爬山'],
    assumptions: ['门票和开放时间出发前核实'],
    roadtrip_preferences: { roadtrip_day_minutes: 240, roadtrip_day_start: '09:00', roadtrip_vehicle: 'electric' },
    days: [
      {
        title: '成都慢游',
        guide: itineraryDayGuideFixture(),
        overnight_city: '成都',
        notes: '午后休息。',
        stay: { area: '成都', name: null, check_in: '15:00', check_out: '10:00', notes: '酒店待选。' },
        stops: [
          {
            id: 'day-1-park',
            kind: 'visit',
            time_kind: 'suggested',
            travel_from_previous: null,
            name: '人民公园',
            city: '成都',
            description: '逛公园、体验茶馆。',
            arrival_time: '09:30',
            duration_minutes: 90,
          },
          {
            id: 'day-1-lunch',
            kind: 'meal',
            time_kind: 'suggested',
            name: '午餐',
            city: '成都',
            description: '餐厅待选。',
            arrival_time: '12:00',
            duration_minutes: 50,
            travel_from_previous: { mode: 'walking', duration_minutes: 15, notes: '短距离步行，待核实。' },
          },
          {
            id: 'day-1-rest',
            kind: 'rest',
            time_kind: 'suggested',
            name: '坐休',
            city: '成都',
            description: '留足休息时间。',
            arrival_time: '12:50',
            duration_minutes: 40,
            travel_from_previous: { mode: 'walking', duration_minutes: 0, notes: '同一地点休息。' },
          },
        ],
      },
      {
        title: '成都到乐山',
        guide: itineraryDayGuideFixture(),
        overnight_city: '乐山',
        notes: '上午出发。',
        stay: null,
        stops: [
          {
            id: 'day-2-visit',
            kind: 'visit',
            time_kind: 'suggested',
            travel_from_previous: null,
            name: '乐山老街',
            city: '乐山',
            description: '沿街散步，品尝当地小吃。',
            arrival_time: '14:00',
            duration_minutes: 60,
          },
        ],
      },
    ],
  };
}

describe('assistant itinerary over HTTP', () => {
  it('revises daily activities three times, confirms once and exports meals and rest as separate calendar events', async () => {
    const { user } = await makeUser(orm);
    const { user: other } = await makeUser(orm);
    expect((await get('/api/trips', user.id)).body.trips).toEqual([]);

    const firstPlan = plan();
    replies.push(
      { id: 'save_v1', name: 'save_itinerary_draft', args: { base_revision: 0, plan: firstPlan } },
      { text: '已整理两天行程，可以继续告诉我想调整哪里。' },
    );
    const firstTurn = await chat(user.id, null, '帮我规划成都到乐山两日自驾，12月31日出发，带老人少爬山。');
    const threadEvent = firstTurn.find((chunk) => chunk.type === 'data-trek-thread');
    if (threadEvent?.type !== 'data-trek-thread') throw new Error('The first turn did not identify its conversation');
    const threadId = threadEvent.data.threadId;
    const firstCard = savedCard(firstTurn, 'save_v1');
    expect(firstCard).toMatchObject({ revision: 1, dayCount: 2, title: firstPlan.title });
    expect(modelRequests[0]).toContain('save_itinerary_draft');
    expect((await get('/api/trips', user.id)).body.trips).toEqual([]);

    const revisedPlan = plan();
    revisedPlan.title = '成都到乐山两日慢游';
    revisedPlan.requirements.push('第二天晚一点出发');
    revisedPlan.days[1].notes = '上午在成都休息，午后出发。';
    revisedPlan.days[1].stops[0].arrival_time = '16:00';
    replies.push(
      { id: 'read_v1', name: 'get_itinerary_draft', args: {} },
      { id: 'save_v2', name: 'save_itinerary_draft', args: { base_revision: 1, plan: revisedPlan } },
      { text: '第二天已改为午后出发，其余需求保留。' },
    );
    const secondTurn = await chat(user.id, threadId, '第二天晚一点出发，其余安排保留。');
    let latestCard = savedCard(secondTurn, 'save_v2');
    const expectedCards = [firstCard, latestCard];
    expect(secondTurn.filter((chunk) => chunk.type === 'data-trek-card')).toHaveLength(1);
    expect(latestCard).toMatchObject({ revision: 2, dayCount: 2, title: revisedPlan.title });
    expect(latestCard.draftId).not.toBe(firstCard.draftId);
    expect(replies).toHaveLength(0);
    expect(modelRequests).toHaveLength(5);

    await [3, 4].reduce<Promise<void>>(async (previous, revision) => {
      await previous;
      if (revision === 3) {
        revisedPlan.days[0].stops[1].arrival_time = '12:30';
        revisedPlan.days[0].stops[2].arrival_time = '13:20';
        revisedPlan.requirements.push('第一天午餐延后半小时，随后休息同步延后');
      } else {
        revisedPlan.days[0].stops[2].duration_minutes = 60;
        revisedPlan.requirements.push('第一天下午坐休一小时');
      }
      replies.push(
        { id: `read_v${revision - 1}`, name: 'get_itinerary_draft', args: {} },
        {
          id: `save_v${revision}`,
          name: 'save_itinerary_draft',
          args: { base_revision: revision - 1, plan: revisedPlan },
        },
        { text: '已调整对应活动，保留其他旅行需求。' },
      );
      const turn = await chat(user.id, threadId, revisedPlan.requirements.at(-1) ?? '调整休息');
      latestCard = savedCard(turn, `save_v${revision}`);
      expectedCards.push(latestCard);
      expect(latestCard.revision).toBe(revision);
    }, Promise.resolve());
    expect(replies).toHaveLength(0);
    expect(modelRequests).toHaveLength(11);

    const oldResponse = await get(`${BASE}/itinerary-drafts/${firstCard.draftId}`, user.id);
    expect(oldResponse.status).toBe(200);
    expect(itineraryDraftResponseSchema.parse(oldResponse.body).draft).toMatchObject({
      revision: 1,
      latest_revision: 4,
      plan: { title: firstPlan.title },
    });
    const latestPath = `${BASE}/itinerary-drafts/${latestCard.draftId}`;
    const latestResponse = await get(latestPath, user.id);
    expect(latestResponse.status).toBe(200);
    expect(itineraryDraftResponseSchema.parse(latestResponse.body).draft).toMatchObject({
      thread_id: threadId,
      revision: 4,
      latest_revision: 4,
      created_trip_id: null,
      plan: revisedPlan,
    });
    const persisted = await get(`${BASE}/threads/${threadId}`, user.id);
    expect(persisted.status).toBe(200);
    const cards = assistantThreadResponseSchema
      .parse(persisted.body)
      .messages.flatMap((message) => message.parts)
      .filter((part) => part.type === 'data-trek-card')
      .map((part) => part.data.card);
    expect(cards).toEqual(expectedCards);

    expect((await request(app.getHttpServer()).get(latestPath)).status).toBe(401);
    expect((await request(app.getHttpServer()).post(`${latestPath}/apply`).send({ revision: 4 })).status).toBe(401);
    expect((await get(latestPath, other.id)).status).toBe(404);
    expect((await apply(latestCard.draftId, 4, other.id)).status).toBe(404);
    expect((await apply(firstCard.draftId, 1, user.id)).status).toBe(409);
    expect((await get('/api/trips', user.id)).body.trips).toEqual([]);

    const confirmed = await apply(latestCard.draftId, 4, user.id);
    expect(confirmed.status).toBe(200);
    const { trip } = itineraryApplyResponseSchema.parse(confirmed.body);
    expect(trip).toMatchObject({
      user_id: user.id,
      title: revisedPlan.title,
      start_date: '2026-12-31',
      end_date: '2027-01-01',
      currency: 'CNY',
      day_count: 2,
      place_count: 4,
    });
    expect(trip.description).toContain('带老人，少爬山');
    expect(trip.description).toContain('第二天晚一点出发');
    const daysResponse = await get(`/api/trips/${trip.id}/days`, user.id);
    expect(daysResponse.status).toBe(200);
    expect(daysResponse.body.days).toEqual([
      expect.objectContaining({
        title: '成都慢游',
        date: '2026-12-31',
        default_transport_mode: 'driving',
        assignments: [
          expect.objectContaining({ order_index: 0, place: expect.objectContaining({ name: '人民公园' }) }),
          expect.objectContaining({
            order_index: 1,
            place: expect.objectContaining({ name: '午餐', place_time: '12:30', end_time: '13:20' }),
          }),
          expect.objectContaining({
            order_index: 2,
            place: expect.objectContaining({ name: '坐休', place_time: '13:20', end_time: '14:20' }),
          }),
        ],
      }),
      expect.objectContaining({
        title: '成都到乐山',
        date: '2027-01-01',
        notes_items: [expect.objectContaining({ text: revisedPlan.days[1].title, time: revisedPlan.days[1].notes })],
        assignments: [
          expect.objectContaining({
            order_index: 0,
            place: expect.objectContaining({ name: '乐山老街', place_time: '16:00', duration_minutes: 60 }),
          }),
        ],
      }),
    ]);
    const calendar = await get(`/api/trips/${trip.id}/export.ics`, user.id);
    expect(calendar.status).toBe(200);
    const events = calendar.text.split('BEGIN:VEVENT');
    const lunch = events.find((event) => event.includes('SUMMARY:午餐'));
    const rest = events.find((event) => event.includes('SUMMARY:坐休'));
    expect(lunch).toContain('20261231T123000');
    expect(lunch).toContain('20261231T132000');
    expect(rest).toContain('20261231T132000');
    expect(rest).toContain('20261231T142000');
    expect(lunch).not.toBe(rest);

    const preferences = await get(`/api/trips/${trip.id}/roadtrip/preferences`, user.id);
    expect(preferences.status).toBe(200);
    expect(preferences.body.preferences).toMatchObject(revisedPlan.roadtrip_preferences);

    const repeated = await apply(latestCard.draftId, 4, user.id);
    expect(repeated.status).toBe(200);
    expect(itineraryApplyResponseSchema.parse(repeated.body)).toEqual({ trip });
    expect((await get('/api/trips', user.id)).body.trips).toEqual([expect.objectContaining({ id: trip.id })]);
    expect(itineraryDraftResponseSchema.parse((await get(latestPath, user.id)).body).draft.created_trip_id).toBe(
      trip.id,
    );

    const guidePath = `/api/trips/${trip.id}/guide`;
    expect((await request(app.getHttpServer()).get(guidePath)).status).toBe(401);
    expect((await get(guidePath, other.id)).status).toBe(404);
    const guide = await get(guidePath, user.id);
    expect(guide.status).toBe(200);
    const savedGuide = tripGuideResponseSchema.parse(guide.body);
    expect(savedGuide.plan).toMatchObject(revisedPlan);
    expect(savedGuide.status).toBe('unchanged');
    expect(savedGuide.current.days).toHaveLength(revisedPlan.days.length);
    expect(savedGuide.current.days[0].assignments?.map((item) => item.place.name)).toEqual(
      revisedPlan.days[0].stops.map((stop) => stop.name),
    );
    await createRow(orm, TripMembers, { trip: trip.id, user: other.id });
    expect((await get(guidePath, other.id)).body).toEqual(guide.body);
    await deleteRows(orm, TripMembers, { trip_id: trip.id, user_id: other.id });
    expect((await get(guidePath, other.id)).status).toBe(404);

    const deletedChat = await request(app.getHttpServer())
      .delete(`${BASE}/threads/${threadId}`)
      .set('Cookie', sessionCookie(user.id));
    expect(deletedChat.status).toBe(200);
    await setAddonEnabled(orm, 'ai_assistant', false);
    try {
      expect((await get(guidePath, user.id)).body).toEqual(guide.body);
    } finally {
      await setAddonEnabled(orm, 'ai_assistant', true);
    }
  });
});
