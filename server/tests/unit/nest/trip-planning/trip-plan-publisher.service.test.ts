import { AssignmentParticipants } from '../../../../src/db/entities/AssignmentParticipants.entity';
import { DayAccommodations } from '../../../../src/db/entities/DayAccommodations.entity';
import { DayAssignments } from '../../../../src/db/entities/DayAssignments.entity';
import { DayNotes } from '../../../../src/db/entities/DayNotes.entity';
import { Days } from '../../../../src/db/entities/Days.entity';
import { Places } from '../../../../src/db/entities/Places.entity';
import { Reservations } from '../../../../src/db/entities/Reservations.entity';
import { TripMembers } from '../../../../src/db/entities/TripMembers.entity';
import { TripPlanPublications } from '../../../../src/db/entities/TripPlanPublications.entity';
import { TripPlanningCollaborators } from '../../../../src/db/entities/TripPlanningCollaborators.entity';
import { TripPlanningRevisions } from '../../../../src/db/entities/TripPlanningRevisions.entity';
import { Trips } from '../../../../src/db/entities/Trips.entity';
import { PluginGuards } from '../../../../src/nest-rpc/plugin-guards.service';
import { UnitOfWork } from '../../../../src/nest/database/unit-of-work';
import { McpToolGuardsService } from '../../../../src/nest/mcp-shared/mcp-tool-guards.service';
import { PermissionsService } from '../../../../src/nest/permissions/permissions.service';
import { PlanningAccessService } from '../../../../src/nest/permissions/planning-access.service';
import { TripGuideService } from '../../../../src/nest/trips/trip-guide.service';
import { TripPlanPublisherModule } from '../../../../src/nest/trips/trip-plan-publisher.module';
import { TripPlanPublisher } from '../../../../src/nest/trips/trip-plan-publisher.service';
import { createSnapshotTestDb } from '../../../helpers/db-mock';
import { createRow, deleteRows, findRow, findRows, updateRows } from '../../../helpers/factories/rows';
import { makeUser } from '../../../helpers/factories/users';
import { resetTestDb } from '../../../helpers/test-db';
import { createTestModule, type TestModule } from '../../../helpers/test-module';
import { MikroORM } from '@mikro-orm/core';
import type { ItineraryPlan } from '@trek/shared';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const db = createSnapshotTestDb();
function required<T>(value: T | null | undefined): T {
  if (value == null) throw new Error('Expected fixture value to exist');
  return value;
}
let t: TestModule;
let publisher: TripPlanPublisher;
beforeAll(async () => {
  t = await createTestModule({ db, imports: [TripPlanPublisherModule] });
  publisher = t.get(TripPlanPublisher);
}, 60000);
beforeEach(() => resetTestDb(db));
afterAll(async () => {
  await t?.close();
  db.close();
});

async function fixture() {
  const orm = t.get(MikroORM);
  const { user: owner } = await makeUser(orm);
  const { user: member } = await makeUser(orm);
  const trip = await createRow(orm, Trips, {
    user: owner.id,
    title: '成都慢游',
    currency: 'CNY',
    start_date: '2026-12-01',
    end_date: '2026-12-02',
  });
  await createRow(orm, TripMembers, { trip: trip.id, user: member.id });
  const first = await createRow(orm, Days, { trip: trip.id, day_number: 1, date: '2026-12-01' });
  const second = await createRow(orm, Days, { trip: trip.id, day_number: 2, date: '2026-12-02' });
  const stop = (id: string, name: string) => ({
    id,
    kind: 'visit' as const,
    time_kind: 'suggested' as const,
    name,
    city: '成都',
    description: '慢慢逛，累了休息。',
    arrival_time: '10:00',
    duration_minutes: 60,
    travel_from_previous: null,
  });
  const plan: ItineraryPlan = {
    schedule_version: 2,
    title: trip.title,
    summary: '两天成都慢游',
    start_date: '2026-12-01',
    currency: 'CNY',
    transport_mode: 'driving',
    requirements: ['少走路'],
    assumptions: [],
    days: [
      {
        title: '公园喝茶',
        overnight_city: '成都',
        notes: '',
        stay: { area: '人民公园附近', name: null, check_in: null, check_out: null, notes: '选择电梯房' },
        stops: [stop('park', '人民公园')],
      },
      { title: '古镇返程', overnight_city: '', notes: '', stay: null, stops: [stop('town', '元通古镇')] },
    ],
  };
  return { orm, owner, member, trip, first, second, plan };
}
async function publish(f: Awaited<ReturnType<typeof fixture>>, plan = f.plan, baseline?: string) {
  const snapshot = await publisher.snapshot(f.owner.id, f.trip.id);
  await t
    .get(UnitOfWork)
    .transactional(() => publisher.publish(f.owner.id, f.trip.id, plan, baseline ?? snapshot.baseline));
}

describe('shared itinerary publication', () => {
  it('updates one trip in place, retaining day, assignment, place, notes and participant IDs', async () => {
    const f = await fixture();
    await publish(f);
    const before = (await publisher.snapshot(f.owner.id, f.trip.id)).current;
    const activity = required(before.days[0].assignments)[0];
    await updateRows(f.orm, DayAssignments, { id: activity.id }, { notes: '妈妈要在茶馆等我们' });
    await createRow(f.orm, AssignmentParticipants, { assignment: activity.id, user: f.member.id });
    const changed = structuredClone(f.plan);
    changed.days[0].stops[0].arrival_time = '11:00';
    changed.days[0].guide = {
      overview: '十一点再出发',
      dining: '附近吃饭',
      accommodation: '附近住宿',
      alternative: '下雨去博物馆',
    };
    await publish(f, changed);
    const after = await publisher.snapshot(f.owner.id, f.trip.id);
    expect(after.current.days.map((day) => day.id)).toEqual([f.first.id, f.second.id]);
    expect(required(after.current.days[0].assignments)[0]).toMatchObject({
      id: activity.id,
      notes: '妈妈要在茶馆等我们',
      assignment_time: '11:00',
      place: { id: activity.place.id },
    });
    expect(await findRows(f.orm, AssignmentParticipants, { assignment: activity.id })).toHaveLength(1);
    expect(await findRows(f.orm, Places, { trip: f.trip.id })).toHaveLength(2);
    expect(await findRows(f.orm, DayNotes, { trip: f.trip.id })).toHaveLength(1);
    expect((await t.get(TripGuideService).read(f.owner.id, f.trip.id)).status).toBe('unchanged');
    expect(after.plan?.days[0].guide?.overview).toBe('十一点再出发');
  });

  it('refuses stale formal data and rolls back all partial edits', async () => {
    const f = await fixture();
    await publish(f);
    const stale = await publisher.snapshot(f.owner.id, f.trip.id);
    await updateRows(f.orm, Days, { id: f.first.id }, { title: '手动改过' });
    await expect(publish(f, f.plan, stale.baseline)).rejects.toMatchObject({ status: 409 });
    expect((await findRow(f.orm, Days, { id: f.first.id }))?.title).toBe('手动改过');
    expect(await findRows(f.orm, Places, { trip: f.trip.id })).toHaveLength(2);
  });

  it('can move an activity across days without replacing its notes or ID', async () => {
    const f = await fixture();
    await publish(f);
    const old = required((await publisher.snapshot(f.owner.id, f.trip.id)).current.days[0].assignments)[0];
    const plan = structuredClone(f.plan);
    const moved = required(plan.days[0].stops.shift());
    moved.arrival_time = '12:00';
    moved.travel_from_previous = { mode: 'driving', duration_minutes: 30, notes: '估算' };
    plan.days[1].stops.push(moved);
    plan.days[0].stops.push({
      ...moved,
      id: 'rest',
      name: '酒店休息',
      kind: 'rest',
      arrival_time: '10:00',
      travel_from_previous: null,
    });
    await publish(f, plan);
    const after = (await publisher.snapshot(f.owner.id, f.trip.id)).current;
    expect(after.days[1].assignments?.find((item) => item.id === old.id)?.place.id).toBe(old.place.id);
  });

  it('seeds IDs from a legacy confirmed guide rather than duplicating every stop', async () => {
    const f = await fixture();
    await publish(f);
    const old = await publisher.snapshot(f.owner.id, f.trip.id);
    await deleteRows(f.orm, TripPlanPublications, { trip: f.trip.id });
    await publish(f);
    const current = await publisher.snapshot(f.owner.id, f.trip.id);
    expect(current.current.days.flatMap((day) => required(day.assignments).map((item) => item.id))).toEqual(
      old.current.days.flatMap((day) => required(day.assignments).map((item) => item.id)),
    );
  });

  it('refuses to remove an activity with a member note and keeps the guide unchanged', async () => {
    const f = await fixture();
    await publish(f);
    const old = required((await publisher.snapshot(f.owner.id, f.trip.id)).current.days[0].assignments)[0];
    await updateRows(f.orm, DayAssignments, { id: old.id }, { notes: '集合点' });
    const plan = structuredClone(f.plan);
    plan.days[0].stops[0].id = 'replacement';
    await expect(publish(f, plan)).rejects.toMatchObject({ status: 409 });
    expect((await findRow(f.orm, DayAssignments, { id: old.id }))?.notes).toBe('集合点');
    expect(await t.get(TripGuideService).get(f.owner.id, f.trip.id)).toEqual(f.plan);
  });

  it('exposes stable IDs for a manual legacy trip and refuses silently replacing it', async () => {
    const f = await fixture();
    const place = await createRow(f.orm, Places, { trip: f.trip.id, name: '手动安排的茶馆', duration_minutes: 60 });
    const activity = await createRow(f.orm, DayAssignments, { day: f.first.id, place: place.id, order_index: 0 });
    const snapshot = await publisher.snapshot(f.owner.id, f.trip.id);
    expect(snapshot.plan).toBeNull();
    expect(snapshot.activity_ids[String(activity.id)]).toBe(`formal-${activity.id}`);
    await expect(publish(f)).rejects.toMatchObject({ status: 409 });
    expect(await findRows(f.orm, DayAssignments, { day: f.first.id })).toHaveLength(1);
    const adopted = structuredClone(f.plan);
    adopted.days[0].stops[0].id = `formal-${activity.id}`;
    adopted.days[0].stops[0].name = place.name;
    await publish(f, adopted);
    expect(required((await publisher.snapshot(f.owner.id, f.trip.id)).current.days[0].assignments)[0].id).toBe(
      activity.id,
    );
  });

  it('revises a hotel recommendation without manufacturing or replacing a booking', async () => {
    const f = await fixture();
    required(f.plan.days[0].stay).name = '公园旁酒店';
    await publish(f);
    const first = await findRows(f.orm, DayNotes, { trip: f.trip.id });
    const changed = structuredClone(f.plan);
    required(changed.days[0].stay).name = '古镇客栈';
    required(changed.days[0].stay).area = '元通古镇';
    await publish(f, changed);
    const notes = await findRows(f.orm, DayNotes, { trip: f.trip.id });
    expect(notes).toHaveLength(1);
    expect(notes[0]).toMatchObject({ id: first[0].id, text: '住宿建议 · 元通古镇 · 古镇客栈' });
    expect(await findRows(f.orm, DayAccommodations, { trip: f.trip.id })).toHaveLength(0);
    expect(await findRows(f.orm, Reservations, { trip: f.trip.id })).toHaveLength(0);
    await updateRows(f.orm, DayNotes, { id: notes[0].id }, { text: '妈妈希望安静一点，这是我的备注' });
    required(changed.days[0].stay).name = '安静酒店';
    await publish(f, changed);
    expect((await findRows(f.orm, DayNotes, { trip: f.trip.id })).map((note) => note.text)).toEqual(
      expect.arrayContaining(['妈妈希望安静一点，这是我的备注', '住宿建议 · 元通古镇 · 安静酒店']),
    );
  });

  it('protects actual stays and booked dates rather than substituting AI hotel advice', async () => {
    const f = await fixture();
    const hotel = await createRow(f.orm, Places, { trip: f.trip.id, name: '已订酒店' });
    const stay = await createRow(f.orm, DayAccommodations, {
      trip: f.trip.id,
      place: hotel.id,
      startDay: f.first.id,
      endDay: f.second.id,
      check_in: '15:00',
      confirmation: 'TEST-123',
    });
    await createRow(f.orm, Reservations, {
      trip: f.trip.id,
      day: f.first.id,
      title: hotel.name,
      accommodation_id: String(stay.id),
      status: 'confirmed',
      reservation_time: '2026-12-01',
    });
    await expect(publish(f)).rejects.toMatchObject({ status: 409 });
    const compatible = structuredClone(f.plan);
    required(compatible.days[0].stay).name = hotel.name;
    required(compatible.days[0].stay).check_in = '15:00';
    await publish(f, compatible);
    const moved = structuredClone(compatible);
    moved.start_date = '2026-12-02';
    await expect(publish(f, moved)).rejects.toMatchObject({ status: 409 });
    expect((await findRow(f.orm, DayAccommodations, { id: stay.id }))?.confirmation).toBe('TEST-123');
    expect(await findRows(f.orm, Reservations, { trip: f.trip.id })).toHaveLength(1);
    expect((await findRow(f.orm, Trips, { id: f.trip.id }))?.start_date).toBe('2026-12-01');
  });

  it('extends days preserving existing IDs and refuses destructive shortening', async () => {
    const f = await fixture();
    await publish(f);
    const extended = structuredClone(f.plan);
    extended.days.push({
      ...structuredClone(extended.days[1]),
      title: '轻松返程',
      stops: [{ ...extended.days[1].stops[0], id: 'third', name: '返程休息' }],
    });
    await publish(f, extended);
    const after = await publisher.snapshot(f.owner.id, f.trip.id);
    expect(after.current.days).toHaveLength(3);
    expect(after.current.days.slice(0, 2).map((day) => day.id)).toEqual([f.first.id, f.second.id]);
    const shortened = structuredClone(extended);
    shortened.days = shortened.days.slice(0, 1);
    shortened.days[0].stay = null;
    await expect(publish(f, shortened)).rejects.toMatchObject({ status: 409 });
    expect((await publisher.snapshot(f.owner.id, f.trip.id)).current.days).toHaveLength(3);
  });

  it('does not rename a place linked to an existing booking through a reused activity ID', async () => {
    const f = await fixture();
    await publish(f);
    const activity = required((await publisher.snapshot(f.owner.id, f.trip.id)).current.days[0].assignments)[0];
    await createRow(f.orm, Reservations, {
      trip: f.trip.id,
      day: f.first.id,
      assignment: activity.id,
      title: activity.place.name,
      status: 'confirmed',
    });
    const changed = structuredClone(f.plan);
    changed.days[0].stops[0].name = '另一个已更换的景点';
    await expect(publish(f, changed)).rejects.toMatchObject({ status: 409 });
    expect((await findRow(f.orm, Places, { id: activity.place.id }))?.name).toBe(activity.place.name);
    expect(await findRows(f.orm, Reservations, { assignment: activity.id })).toHaveLength(1);
  });

  it('enforces shared roles through the common permission gate while leaving legacy trips editable', async () => {
    const f = await fixture();
    const permissions = t.get(PermissionsService);
    const access = t.get(PlanningAccessService);
    expect(await permissions.checkPermission('day_edit', 'user', f.owner.id, f.member.id, true, f.trip.id)).toBe(true);
    await createRow(f.orm, TripPlanningRevisions, {
      trip: f.trip.id,
      revision: 1,
      created_by: f.owner.id,
      content: '{}',
      baseline_hash: 'x',
    });
    /* eslint-disable no-await-in-loop -- Check each surface sequentially against the same fixture transaction. */
    for (const action of ['day_edit', 'place_edit', 'reservation_edit', 'trip_edit']) {
      expect(await permissions.checkPermission(action, 'user', f.owner.id, f.member.id, true, f.trip.id)).toBe(false);
      expect(await t.get(McpToolGuardsService).hasTripPermission(action, f.trip.id, f.member.id)).toBe(false);
      expect(await t.get(PluginGuards).canEditAs(action, f.trip.id, f.member.id)).toBe(false);
    }
    /* eslint-enable no-await-in-loop */
    expect(await permissions.checkPermission('day_edit', 'admin', f.owner.id, f.member.id, true, f.trip.id)).toBe(
      false,
    );
    expect(await permissions.checkPermission('collab_edit', 'user', f.owner.id, f.member.id, true, f.trip.id)).toBe(
      true,
    );
    await createRow(f.orm, TripPlanningCollaborators, { trip: f.trip.id, user: f.member.id });
    expect((await access.get(f.member.id, f.trip.id)).canConfirm).toBe(true);
    expect(await permissions.checkPermission('day_edit', 'user', f.owner.id, f.member.id, true, f.trip.id)).toBe(true);
    await deleteRows(f.orm, TripMembers, { trip: f.trip.id, user: f.member.id });
    await expect(access.requireConfirm(f.member.id, f.trip.id)).rejects.toMatchObject({ status: 404 });
  });
});
