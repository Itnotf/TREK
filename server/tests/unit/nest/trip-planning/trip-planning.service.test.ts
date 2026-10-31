import { AssignmentParticipants } from '../../../../src/db/entities/AssignmentParticipants.entity';
import { AssistantMessages } from '../../../../src/db/entities/AssistantMessages.entity';
import { AssistantThreads } from '../../../../src/db/entities/AssistantThreads.entity';
import { CollabMessages } from '../../../../src/db/entities/CollabMessages.entity';
import { DayAssignments } from '../../../../src/db/entities/DayAssignments.entity';
import { DayNotes } from '../../../../src/db/entities/DayNotes.entity';
import { Days } from '../../../../src/db/entities/Days.entity';
import { Places } from '../../../../src/db/entities/Places.entity';
import { TripMembers } from '../../../../src/db/entities/TripMembers.entity';
import { TripPlanningRevisions } from '../../../../src/db/entities/TripPlanningRevisions.entity';
import { Trips } from '../../../../src/db/entities/Trips.entity';
import { AiConnectionsService } from '../../../../src/nest/ai-connections/ai-connections.service';
import { AssistantItineraryService } from '../../../../src/nest/assistant/assistant-itinerary.service';
import { CollabService } from '../../../../src/nest/collab/collab.service';
import { DomainError } from '../../../../src/nest/common/domain-error';
import { TripPlanningAiService } from '../../../../src/nest/trip-planning/trip-planning-ai.service';
import { TripPlanningModule } from '../../../../src/nest/trip-planning/trip-planning.module';
import { TripPlanningService } from '../../../../src/nest/trip-planning/trip-planning.service';
import { TripsService } from '../../../../src/nest/trips/trips.service';
import type { User } from '../../../../src/types';
import { createSnapshotTestDb } from '../../../helpers/db-mock';
import { createRow, deleteRows, findRows, updateRows } from '../../../helpers/factories/rows';
import { makeUser } from '../../../helpers/factories/users';
import { itineraryDayGuideFixture, itineraryGuideFixture } from '../../../helpers/itinerary-guide';
import { resetTestDb } from '../../../helpers/test-db';
import { createTestModule, type TestModule } from '../../../helpers/test-module';
import { MikroORM } from '@mikro-orm/core';
import type { ItineraryPlan, TripPlanningContent } from '@trek/shared';

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const db = createSnapshotTestDb();
let t: TestModule;
let service: TripPlanningService;
const ai = { generate: vi.fn() };

function detailed(): TripPlanningContent {
  const plan: ItineraryPlan = {
    schedule_version: 2,
    title: '成都两日慢游',
    summary: '在成都体验公园茶馆，第二天轻松返程。',
    guide: itineraryGuideFixture(),
    start_date: '2026-12-01',
    currency: 'CNY',
    transport_mode: 'driving',
    requirements: ['带老人，少走路'],
    assumptions: ['停车和开放时间待核实'],
    roadtrip_preferences: { roadtrip_day_minutes: 180, roadtrip_leg_minutes: 60 },
    days: [1, 2].map((day) => ({
      title: day === 1 ? '成都茶馆' : '返程',
      overnight_city: day === 1 ? '成都' : '',
      notes: '',
      guide: itineraryDayGuideFixture(),
      stay: null,
      stops: [
        {
          id: `day-${day}-visit`,
          kind: 'visit',
          time_kind: 'suggested',
          name: day === 1 ? '人民公园' : '浣花溪公园',
          city: '成都',
          description: '沿平坦步道慢走，体验茶馆。',
          arrival_time: '10:00',
          duration_minutes: 90,
          travel_from_previous: null,
          location: null,
        },
      ],
    })),
  };
  return {
    kind: 'detailed',
    summary: plan.summary,
    questions: [],
    agreements: plan.requirements,
    disagreements: [],
    outline: [],
    changes: ['新增两天详细安排'],
    plan,
  };
}
function discussion(): TripPlanningContent {
  return {
    kind: 'discussion',
    summary: '以轻松游览和茶馆为主。',
    questions: ['住宿预算是多少？'],
    agreements: ['带老人'],
    disagreements: ['是否增加爬山项目尚未决定'],
    outline: [{ day: 1, title: '成都慢游', description: '公园、茶馆与川菜，少走路。' }],
    changes: ['整理讨论方向'],
    plan: null,
  };
}

beforeAll(async () => {
  t = await createTestModule({
    db,
    imports: [TripPlanningModule],
    overrides: [
      { provide: TripPlanningAiService, useValue: ai },
      { provide: AiConnectionsService, useValue: { status: async () => ({ available: true, privacyAcked: true }) } },
    ],
  });
  service = t.get(TripPlanningService);
}, 60_000);
beforeEach(() => {
  resetTestDb(db);
  ai.generate.mockReset();
  t.realtime.reset();
});
afterAll(async () => {
  await t?.close();
  db.close();
});

async function fixture() {
  const orm = t.get(MikroORM);
  const ownerRow = (await makeUser(orm)).user;
  const memberRow = (await makeUser(orm)).user;
  const strangerRow = (await makeUser(orm)).user;
  const asUser = (row: typeof ownerRow): User => ({
    id: row.id,
    username: row.username,
    email: row.email,
    role: 'user',
  });
  const owner = asUser(ownerRow),
    member = asUser(memberRow),
    stranger = asUser(strangerRow);
  const { tripId } = await t.get(TripsService).create(owner.id, {
    title: '成都两日慢游',
    start_date: '2026-12-01',
    end_date: '2026-12-02',
    currency: 'CNY',
    day_count: 2,
  });
  await createRow(orm, TripMembers, { trip: tripId, user: member.id });
  return { orm, owner, member, stranger, tripId };
}
async function generate(f: Awaited<ReturnType<typeof fixture>>, content = detailed(), base = 0) {
  ai.generate.mockResolvedValueOnce(content);
  return service.generate(f.owner, f.tripId, { base_revision: base, mode: content.kind });
}

describe('shared trip planning', () => {
  it('shows current joined members without enabling planning on a GET; outsiders see 404', async () => {
    const f = await fixture();
    const state = await service.read(f.member, f.tripId);
    expect(state.members.map((member) => member.id).sort()).toEqual([f.owner.id, f.member.id].sort());
    expect(state.can_confirm).toBe(false);
    expect(state.can_discuss).toBe(true);
    expect(await findRows(f.orm, TripPlanningRevisions)).toHaveLength(0);
    await expect(service.read(f.stranger, f.tripId)).rejects.toMatchObject({ status: 404 });
    await expect(service.history(f.stranger, f.tripId)).rejects.toMatchObject({ status: 404 });
  });

  it('lets a member request discussion, shares the instruction and AI summary, and leaves formal activities empty', async () => {
    const f = await fixture();
    const privateThread = await createRow(f.orm, AssistantThreads, {
      user: f.owner.id,
      trip: f.tripId,
      title: 'PRIVATE_HISTORY',
    });
    await createRow(f.orm, AssistantMessages, {
      thread: privateThread.id,
      role: 'user',
      parts: '[{"type":"text","text":"PRIVATE_SECRET"}]',
    });
    ai.generate.mockResolvedValueOnce(discussion());
    const state = await service.generate(f.member, f.tripId, {
      base_revision: 0,
      instruction: '希望每天少走路',
      mode: 'discussion',
    });
    expect(state.revision).toBe(1);
    expect(state.latest?.questions).toHaveLength(1);
    expect(JSON.stringify(ai.generate.mock.calls[0])).not.toContain('PRIVATE_SECRET');
    expect(JSON.stringify(ai.generate.mock.calls[0])).toContain('希望每天少走路');
    expect(await findRows(f.orm, DayAssignments)).toHaveLength(0);
    expect((await findRows(f.orm, CollabMessages)).map((message) => message.text).join(' ')).toContain(
      'AI 已整理第 1 版',
    );
    await expect(service.confirm(f.member, f.tripId, 1)).rejects.toMatchObject({ status: 403 });
    await expect(service.confirm(f.owner, f.tripId, 1)).rejects.toMatchObject({ status: 400 });
  });

  it('confirms exactly once and then revises the same activities without losing notes or participants', async () => {
    const f = await fixture();
    await generate(f);
    const state = await service.confirm(f.owner, f.tripId, 1);
    expect(state.phase).toBe('confirmed');
    expect(state.baseline_changed).toBe(false);
    const first = await findRows(f.orm, DayAssignments);
    await service.confirm(f.owner, f.tripId, 1);
    expect((await findRows(f.orm, DayAssignments)).map((item) => item.id)).toEqual(first.map((item) => item.id));
    await updateRows(f.orm, DayAssignments, { id: first[0].id }, { notes: '自行补充的提醒' });
    await createRow(f.orm, AssignmentParticipants, { assignment: first[0].id, user: f.member.id });
    const day = (await findRows(f.orm, Days))[0];
    await createRow(f.orm, DayNotes, { day: day.id, trip: f.tripId, text: '手动添加的备忘' });
    const revised = detailed();
    if (!revised.plan) throw new Error('Expected a detailed plan');
    revised.plan.days[0].stops[0].arrival_time = '11:00';
    revised.changes = ['第一天晚一小时出发'];
    await generate(f, revised, 1);
    await service.confirm(f.owner, f.tripId, 2);
    expect((await findRows(f.orm, DayAssignments)).map((item) => item.id)).toEqual(first.map((item) => item.id));
    expect((await findRows(f.orm, DayAssignments))[0].notes).toBe('自行补充的提醒');
    expect(await findRows(f.orm, AssignmentParticipants)).toHaveLength(1);
    expect((await findRows(f.orm, DayNotes)).map((item) => item.text)).toContain('手动添加的备忘');
    expect(await findRows(f.orm, Trips)).toHaveLength(1);
    expect(t.realtime.broadcastMock).toHaveBeenCalledWith(f.tripId, 'planning:updated', { revision: 2 });
  });

  it('detects manual changes after confirmation and refuses a stale pending proposal', async () => {
    const f = await fixture();
    await generate(f);
    await service.confirm(f.owner, f.tripId, 1);
    const place = (await findRows(f.orm, Places))[0];
    await updateRows(f.orm, Places, { id: place.id }, { description: '已手工更新介绍' });
    expect((await service.read(f.owner, f.tripId)).baseline_changed).toBe(true);
    await generate(f, detailed(), 1);
    expect((await service.read(f.owner, f.tripId)).baseline_changed).toBe(false);
    await updateRows(f.orm, Places, { id: place.id }, { description: '生成后又改动' });
    await expect(service.confirm(f.owner, f.tripId, 2)).rejects.toMatchObject({ status: 409 });
    expect((await service.read(f.owner, f.tripId)).confirmed_revision).toBe(1);
  });

  it('keeps a completed proposal when new discussion arrives and clearly flags the unincorporated messages', async () => {
    const f = await fixture();
    ai.generate.mockImplementationOnce(async () => {
      await t
        .get(CollabService)
        .postMessage(
          f.tripId,
          { text: '刚想到：第二天必须上午返程' },
          t.get(CollabService).restWriter(f.tripId, f.member, undefined),
        );
      return detailed();
    });
    const state = await service.generate(f.owner, f.tripId, { base_revision: 0, mode: 'detailed' });
    expect(state.latest?.changes[0]).toContain('本版尚未包含');
    expect(state.latest?.changes).toContain('新增两天详细安排');
    expect(await findRows(f.orm, TripPlanningRevisions)).toHaveLength(1);
    expect((await findRows(f.orm, CollabMessages)).some((message) => message.text.includes('本版尚未包含'))).toBe(true);
    expect(await findRows(f.orm, DayAssignments)).toHaveLength(0);
  });

  it('leaves the instruction and previous formal itinerary intact when AI fails', async () => {
    const f = await fixture();
    ai.generate.mockRejectedValueOnce(new DomainError(502, 'AI failed'));
    await expect(
      service.generate(f.owner, f.tripId, { base_revision: 0, instruction: '第一天安排茶馆', mode: 'detailed' }),
    ).rejects.toMatchObject({ status: 502 });
    expect((await findRows(f.orm, CollabMessages)).map((message) => message.text)).toContain('第一天安排茶馆');
    expect(await findRows(f.orm, TripPlanningRevisions)).toHaveLength(0);
  });

  it('posts a short chat notification while retaining the complete proposal', async () => {
    const f = await fixture();
    const content = detailed();
    content.summary = '完整的旅行攻略介绍。'.repeat(80);
    content.questions = ['住宿预算是多少？'.repeat(40), '返程时间确认了吗？'.repeat(40)];
    content.disagreements = ['第二天是否增加爬山项目尚未决定'];
    const state = await generate(f, content);
    expect(state.latest?.summary).toBe(content.summary);
    expect(state.latest?.questions).toEqual(content.questions);
    const message = (await findRows(f.orm, CollabMessages))[0].text;
    expect(message.length).toBeLessThanOrEqual(600);
    expect(message).toContain(`/trips/${f.tripId}/planning`);
    expect(message).not.toContain(content.disagreements[0]);
  });

  it('requires owner authorization for collaborators and removes access immediately when a collaborator leaves', async () => {
    const f = await fixture();
    await expect(service.setCollaborators(f.member, f.tripId, [f.member.id])).rejects.toMatchObject({ status: 403 });
    await expect(service.setCollaborators(f.owner, f.tripId, [f.stranger.id])).rejects.toMatchObject({ status: 400 });
    await service.setCollaborators(f.owner, f.tripId, [f.member.id]);
    expect((await service.read(f.member, f.tripId)).can_confirm).toBe(true);
    await generate(f);
    await service.confirm(f.member, f.tripId, 1);
    await deleteRows(f.orm, TripMembers, { trip: f.tripId, user: f.member.id });
    await expect(service.read(f.member, f.tripId)).rejects.toMatchObject({ status: 404 });
  });

  it('keeps prior revisions readable and rejects stale revisions before making AI calls', async () => {
    const f = await fixture();
    await generate(f, discussion());
    await generate(f, detailed(), 1);
    expect((await service.history(f.member, f.tripId)).revisions.map((item) => item.revision)).toEqual([2, 1]);
    ai.generate.mockClear();
    await expect(service.generate(f.owner, f.tripId, { base_revision: 1, mode: 'detailed' })).rejects.toMatchObject({
      status: 409,
    });
    expect(ai.generate).not.toHaveBeenCalled();
  });

  it('shares a private draft once without publishing, survives deleting its private conversation, and later confirms in the same trip', async () => {
    const f = await fixture();
    const thread = await createRow(f.orm, AssistantThreads, { user: f.owner.id, title: 'PRIVATE_HISTORY' });
    const draft = await t.get(AssistantItineraryService).save(f.owner.id, thread.id, {
      base_revision: 0,
      plan:
        detailed().plan ??
        (() => {
          throw new Error('Expected a detailed plan');
        })(),
    });
    await expect(service.sharePrivateDraft(f.member, draft.id, 1)).rejects.toMatchObject({ status: 404 });
    const shared = await service.sharePrivateDraft(f.owner, draft.id, 1);
    expect(await service.sharePrivateDraft(f.owner, draft.id, 1)).toEqual(shared);
    expect(await findRows(f.orm, DayAssignments)).toHaveLength(0);
    expect((await t.get(AssistantItineraryService).apply(f.owner.id, draft.id, { revision: 1 })).trip.id).toBe(
      shared.trip_id,
    );
    await deleteRows(f.orm, AssistantThreads, { id: thread.id });
    expect((await service.read(f.owner, shared.trip_id)).latest?.plan?.title).toBe('成都两日慢游');
    await service.confirm(f.owner, shared.trip_id, 1);
    expect((await service.read(f.owner, shared.trip_id)).phase).toBe('confirmed');
    expect(await findRows(f.orm, DayAssignments)).toHaveLength(2);
  });
});
