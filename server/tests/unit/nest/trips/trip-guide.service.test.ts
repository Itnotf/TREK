import { Days } from '../../../../src/db/entities/Days.entity';
import { Places } from '../../../../src/db/entities/Places.entity';
import { Reservations } from '../../../../src/db/entities/Reservations.entity';
import { TripItineraryGuides } from '../../../../src/db/entities/TripItineraryGuides.entity';
import { TripMembers } from '../../../../src/db/entities/TripMembers.entity';
import { Trips } from '../../../../src/db/entities/Trips.entity';
import { AccommodationsService } from '../../../../src/nest/accommodations/accommodations.service';
import { AssignmentsService } from '../../../../src/nest/assignments/assignments.service';
import { DaysService } from '../../../../src/nest/days/days.service';
import { TripGuideService } from '../../../../src/nest/trips/trip-guide.service';
import { TripsModule } from '../../../../src/nest/trips/trips.module';
import { createSnapshotTestDb } from '../../../helpers/db-mock';
import { createRow, deleteRows, findRow, updateRows } from '../../../helpers/factories/rows';
import { makeUser } from '../../../helpers/factories/users';
import { resetTestDb } from '../../../helpers/test-db';
import { createTestModule, type TestModule } from '../../../helpers/test-module';
import { MikroORM } from '@mikro-orm/core';
import { tripGuideResponseSchema, type ItineraryPlan } from '@trek/shared';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const db = createSnapshotTestDb();
let t: TestModule;
let service: TripGuideService;

beforeAll(async () => {
  t = await createTestModule({ db, imports: [TripsModule] });
  service = t.get(TripGuideService);
}, 60000);

beforeEach(() => resetTestDb(db));

afterAll(async () => {
  await t?.close();
  db.close();
});

async function fixture(confirm = true) {
  const orm = t.get(MikroORM);
  const { user } = await makeUser(orm);
  const trip = await createRow(orm, Trips, {
    user: user.id,
    title: '成都慢游',
    currency: 'CNY',
    start_date: '2026-12-01',
    end_date: '2026-12-02',
    feed_token: 'must-not-leave-the-server',
  });
  const first = await createRow(orm, Days, { trip: trip.id, day_number: 1, date: '2026-12-01', title: '公园' });
  const second = await createRow(orm, Days, { trip: trip.id, day_number: 2, date: '2026-12-02', title: '返程' });
  const place = await createRow(orm, Places, {
    trip: trip.id,
    name: '人民公园',
    description: '逛公园和茶馆。',
    place_time: '09:00',
    duration_minutes: 60,
  });
  const assignment = await t.get(AssignmentsService).createAssignment(first.id, place.id);
  const plan: ItineraryPlan = {
    title: trip.title,
    summary: '第一天逛公园，第二天返程。',
    start_date: '2026-12-01',
    currency: 'CNY',
    transport_mode: 'driving',
    requirements: [],
    assumptions: [],
    days: [
      {
        title: '公园',
        overnight_city: '成都',
        notes: '',
        stops: [
          {
            name: place.name,
            city: '成都',
            description: '逛公园和茶馆。',
            arrival_time: '09:00',
            duration_minutes: 60,
          },
        ],
      },
      { title: '返程', overnight_city: '', notes: '', stops: [] },
    ],
  };
  if (confirm) await service.saveConfirmed(trip.id, plan);
  return { orm, user, trip, first, second, place, assignment, plan };
}

describe('TripGuideService current itinerary', () => {
  it('reads the confirmed trip without exposing its feed token', async () => {
    const f = await fixture();
    const result = await service.read(f.user.id, f.trip.id);
    expect(tripGuideResponseSchema.parse(result)).toEqual(result);
    expect(result.status).toBe('unchanged');
    expect(result.plan).toEqual(f.plan);
    expect(result.current.title).toBe('成都慢游');
    expect(result.current.days.map((day) => day.id)).toEqual([f.first.id, f.second.id]);
    expect(result.current.days[0].assignments?.[0].place.name).toBe('人民公园');
    expect(JSON.stringify(result)).not.toContain('must-not-leave-the-server');
    expect((await findRow(f.orm, TripItineraryGuides, { trip_id: f.trip.id }))?.baseline_hash).toMatch(
      /^[a-f0-9]{64}$/,
    );
  });

  it('uses the same per-visit time overrides as the planner and detects reverting them', async () => {
    const f = await fixture();
    const assignments = t.get(AssignmentsService);
    await assignments.updateTime(f.assignment.id, '14:30', '16:00');
    const revised = await service.read(f.user.id, f.trip.id);
    expect(revised.status).toBe('changed');
    expect(revised.current.days[0].assignments?.[0]).toMatchObject({
      assignment_time: '14:30',
      assignment_end_time: '16:00',
    });
    expect(revised.plan).toEqual(f.plan);
    await assignments.updateTime(f.assignment.id, null, null);
    expect((await service.read(f.user.id, f.trip.id)).status).toBe('unchanged');
  });

  it('reflects moves, new activities, reordered stops and removals, including empty days', async () => {
    const f = await fixture();
    const assignments = t.get(AssignmentsService);
    await assignments.moveAssignment(f.assignment.id, f.second.id, 0);
    let result = await service.read(f.user.id, f.trip.id);
    expect(result.status).toBe('changed');
    expect(result.current.days[0].assignments).toEqual([]);
    expect(result.current.days[1].assignments?.map((item) => item.place.name)).toEqual(['人民公园']);
    const lunch = await createRow(f.orm, Places, { trip: f.trip.id, name: '午餐' });
    const added = await assignments.createAssignment(f.second.id, lunch.id);
    await assignments.reorderAssignments(f.second.id, [added.id, f.assignment.id]);
    result = await service.read(f.user.id, f.trip.id);
    expect(result.current.days[1].assignments?.map((item) => item.place.name)).toEqual(['午餐', '人民公园']);
    await assignments.deleteAssignment(f.assignment.id);
    result = await service.read(f.user.id, f.trip.id);
    expect(result.current.days[1].assignments?.map((item) => item.place.name)).toEqual(['午餐']);
  });

  it('reflects edited titles, dates, descriptions and day notes', async () => {
    const f = await fixture();
    await updateRows(
      f.orm,
      Trips,
      { id: f.trip.id },
      { title: '改为三日慢游', start_date: '2026-12-03', currency: 'USD' },
    );
    await updateRows(f.orm, Days, { id: f.first.id }, { date: '2026-12-03' });
    await t.get(DaysService).update(f.first.id, f.first, { title: '雨天休息', notes: '当天自由安排' });
    await updateRows(f.orm, Places, { id: f.place.id }, { name: '茶馆', description: '下午坐饮。' });
    const result = await service.read(f.user.id, f.trip.id);
    expect(result.status).toBe('changed');
    expect(result.current).toMatchObject({ title: '改为三日慢游', start_date: '2026-12-03', currency: 'USD' });
    expect(result.current.days[0]).toMatchObject({ title: '雨天休息', date: '2026-12-03', notes: '当天自由安排' });
    expect(result.current.days[0].assignments?.[0].place).toMatchObject({ name: '茶馆', description: '下午坐饮。' });
  });

  it('includes current stays and bookings once per stay and tracks later changes', async () => {
    const f = await fixture(false);
    const hotel = await createRow(f.orm, Places, { trip: f.trip.id, name: '安静酒店', address: '成都城区' });
    const { accommodation: stay } = await t.get(AccommodationsService).createAccommodation(f.trip.id, {
      place_id: hotel.id,
      start_day_id: f.first.id,
      end_day_id: f.second.id,
      check_in: '15:00',
      check_out: '10:00',
    });
    if (!stay) throw new Error('Expected the newly created stay');
    const booking = await createRow(f.orm, Reservations, {
      trip: f.trip.id,
      title: '酒店一间房',
      type: 'accommodation',
      status: 'pending',
      accommodation_id: String(stay.id),
    });
    await createRow(f.orm, Reservations, {
      trip: f.trip.id,
      title: '酒店另一间房',
      type: 'accommodation',
      status: 'confirmed',
      accommodation_id: String(stay.id),
    });
    await service.saveConfirmed(f.trip.id, f.plan);
    expect((await service.read(f.user.id, f.trip.id)).status).toBe('unchanged');
    const accommodations = t.get(AccommodationsService);
    const existing = await accommodations.get(stay.id, f.trip.id);
    if (!existing) throw new Error('Expected the saved stay');
    await accommodations.updateAccommodation(stay.id, existing, { check_in: '16:30', notes: '晚点入住' });
    await updateRows(f.orm, Reservations, { id: booking.id }, { status: 'confirmed', reservation_time: '16:30' });
    const result = await service.read(f.user.id, f.trip.id);
    expect(result.status).toBe('changed');
    expect(result.current.accommodations).toHaveLength(1);
    expect(result.current.accommodations[0]).toMatchObject({
      place_name: '安静酒店',
      check_in: '16:30',
      notes: '晚点入住',
    });
    expect(result.current.reservations).toHaveLength(3);
    expect(result.current.reservations.find((item) => item.id === booking.id)?.status).toBe('confirmed');
  });

  it('does not invalidate prose for timestamp-only changes', async () => {
    const f = await fixture(false);
    const booking = await createRow(f.orm, Reservations, { trip: f.trip.id, title: '返程车票', type: 'train' });
    await service.saveConfirmed(f.trip.id, f.plan);
    await updateRows(f.orm, Trips, { id: f.trip.id }, { updated_at: '2027-01-01 00:00:00' });
    await updateRows(
      f.orm,
      Reservations,
      { id: booking.id },
      { created_at: '2027-01-01 00:00:00', external_synced_at: '2027-01-01 00:00:00' },
    );
    expect((await service.read(f.user.id, f.trip.id)).status).toBe('unchanged');
  });

  it('treats older guides and manual trips as unverified without adopting a baseline on read', async () => {
    const f = await fixture(false);
    expect(await service.read(f.user.id, f.trip.id)).toMatchObject({ plan: null, status: 'unverified' });
    await createRow(f.orm, TripItineraryGuides, { trip: f.trip.id, plan: JSON.stringify(f.plan) });
    await t.get(AssignmentsService).moveAssignment(f.assignment.id, f.second.id, 0);
    const result = await service.read(f.user.id, f.trip.id);
    expect(result).toMatchObject({ plan: f.plan, status: 'unverified' });
    expect(result.current.days[0].assignments).toEqual([]);
    expect((await findRow(f.orm, TripItineraryGuides, { trip_id: f.trip.id }))?.baseline_hash).toBeNull();
  });

  it('reads a trip beyond the draft limits, with many activities, empty days and overlaps', async () => {
    const f = await fixture();
    for (let day_number = 3; day_number <= 32; day_number++) {
      await createRow(f.orm, Days, { trip: f.trip.id, day_number });
    }
    for (let index = 0; index < 22; index++) {
      const place = await createRow(f.orm, Places, {
        trip: f.trip.id,
        name: `活动${index}`,
        place_time: '09:00',
        duration_minutes: 100,
      });
      await t.get(AssignmentsService).createAssignment(f.first.id, place.id);
    }
    const result = tripGuideResponseSchema.parse(await service.read(f.user.id, f.trip.id));
    expect(result.status).toBe('changed');
    expect(result.current.days).toHaveLength(32);
    expect(result.current.days[0].assignments).toHaveLength(23);
    expect(result.current.days[31].assignments).toEqual([]);
  });

  it('checks current membership before returning live data as well as the original prose', async () => {
    const f = await fixture();
    const { user: other } = await makeUser(f.orm);
    await expect(service.read(other.id, f.trip.id)).rejects.toMatchObject({ status: 404 });
    await createRow(f.orm, TripMembers, { trip: f.trip.id, user: other.id });
    expect((await service.read(other.id, f.trip.id)).current.title).toBe('成都慢游');
    await deleteRows(f.orm, TripMembers, { trip_id: f.trip.id, user_id: other.id });
    await expect(service.read(other.id, f.trip.id)).rejects.toMatchObject({ status: 404 });
    await expect(service.read(f.user.id, 'invalid')).rejects.toMatchObject({ status: 404 });
  });
});
