import { DayAssignments } from '../../../../src/db/entities/DayAssignments.entity';
import { Days } from '../../../../src/db/entities/Days.entity';
import { Places } from '../../../../src/db/entities/Places.entity';
import { TripMembers } from '../../../../src/db/entities/TripMembers.entity';
import { Trips } from '../../../../src/db/entities/Trips.entity';
import { TripsModule } from '../../../../src/nest/trips/trips.module';
import { TripsService } from '../../../../src/nest/trips/trips.service';
import { createSnapshotTestDb } from '../../../helpers/db-mock';
import { createRow, deleteRows, findRow } from '../../../helpers/factories/rows';
import { makeUser } from '../../../helpers/factories/users';
import { resetTestDb } from '../../../helpers/test-db';
import { createTestModule, type TestModule } from '../../../helpers/test-module';
import { MikroORM, type EntityData } from '@mikro-orm/core';
import { tripSchema } from '@trek/shared';

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const db = createSnapshotTestDb();
let t: TestModule;
let trips: TripsService;
let orm: MikroORM;

beforeAll(async () => {
  t = await createTestModule({ db, imports: [TripsModule] });
  trips = t.get(TripsService);
  orm = t.get(MikroORM);
}, 60000);
beforeEach(() => resetTestDb(db));
afterAll(async () => {
  await t?.close();
  db.close();
});

async function fixture() {
  const { user } = await makeUser(orm);
  const trip = await createRow(orm, Trips, { user: user.id, title: '成都古镇慢游', currency: 'CNY' });
  const first = await createRow(orm, Days, { trip: trip.id, day_number: 1 });
  const second = await createRow(orm, Days, { trip: trip.id, day_number: 2 });
  const visit = async (key: string, dayId: number, order: number, patch: EntityData<Places> = {}) => {
    const place = await createRow(
      orm,
      Places,
      {
        trip: trip.id,
        name: key,
        lat: 30.7,
        lng: 103.6,
        osm_id: key,
      },
      patch,
    );
    const assignment = await createRow(orm, DayAssignments, {
      day: dayId,
      place: place.id,
      order_index: order,
    });
    return { place, assignment };
  };
  return { user, trip, first, second, visit };
}

describe('trip automatic cover candidates', () => {
  it('returns three unique actual visits in day order, without persisting a generated cover', async () => {
    const f = await fixture();
    await f.visit('node:9', f.second.id, 0);
    await f.visit('relation:2110264', f.first.id, 0, { name: '成都出发', duration_minutes: 0 });
    await f.visit('node:1', f.first.id, 1, { stop_type: 'restaurant' });
    await f.visit('relation:20062385', f.first.id, 2);
    await f.visit('relation:20062385', f.first.id, 3);
    await f.visit('node:5815555248', f.first.id, 4);
    await f.visit('node:10', f.second.id, 1);
    await createRow(orm, Places, {
      trip: f.trip.id,
      name: 'Unassigned old destination',
      lat: 30,
      lng: 103,
      osm_id: 'node:2',
    });
    const before = await findRow(orm, Trips, { id: f.trip.id });
    const [list] = await trips.list(f.user.id, 0);
    const get = await trips.get(f.trip.id, f.user.id);
    const expected = ['relation:20062385', 'node:5815555248', 'node:9'];
    expect(tripSchema.parse(list).auto_cover_places?.map((p) => p.photoKey)).toEqual(expected);
    expect(tripSchema.parse(get).auto_cover_places).toEqual(tripSchema.parse(list).auto_cover_places);
    expect(get?.cover_image).toBeNull();
    expect(await findRow(orm, Trips, { id: f.trip.id })).toEqual(before);
  });

  it('keeps a manually chosen cover without a candidate read, and restores automatic photos when cleared', async () => {
    const f = await fixture();
    await f.visit('relation:20062385', f.first.id, 0);
    await trips.updateCoverImage(f.trip.id, '/uploads/covers/custom.jpg');
    const lookup = vi.spyOn(orm.em.getRepository(Places), 'listCoverPlacesForTrips');
    try {
      const [trip] = await trips.list(f.user.id, 0);
      expect(trip.cover_image).toBe('/uploads/covers/custom.jpg');
      expect(tripSchema.parse(trip).auto_cover_places).toBeUndefined();
      expect(lookup).not.toHaveBeenCalled();
      const { updatedTrip } = await trips.updateTrip(f.trip.id, f.user.id, { cover_image: null }, 'user');
      expect(tripSchema.parse(updatedTrip).auto_cover_places?.map((p) => p.photoKey)).toEqual(['relation:20062385']);
      expect(lookup).toHaveBeenCalledTimes(1);
    } finally {
      lookup.mockRestore();
    }
  });

  it('uses only currently assigned places and rejects unusable coordinates and identities', async () => {
    const f = await fixture();
    const old = await f.visit('node:1', f.first.id, 0);
    await f.visit('node:2', f.first.id, 1, { lat: 91 });
    await f.visit('coords:30,103', f.first.id, 2);
    await f.visit('node:3', f.first.id, 3, { stop_type: 'hotel' });
    await f.visit('node:4', f.second.id, 0, { duration_minutes: null });
    await deleteRows(orm, DayAssignments, { id: old.assignment.id });
    const [trip] = await trips.list(f.user.id, 0);
    expect(tripSchema.parse(trip).auto_cover_places?.map((p) => p.photoKey)).toEqual(['node:4']);
    expect(await findRow(orm, Places, { id: old.place.id })).not.toBeNull();
  });

  it('preserves membership scope and reads all visible trips in one photo-candidate query', async () => {
    const f = await fixture();
    await f.visit('node:1', f.first.id, 0);
    const { user: member } = await makeUser(orm);
    const { user: stranger } = await makeUser(orm);
    await createRow(orm, TripMembers, { trip: f.trip.id, user: member.id });
    const other = await createRow(orm, Trips, { user: member.id, title: 'Another trip' });
    const lookup = vi.spyOn(orm.em.getRepository(Places), 'listCoverPlacesForTrips');
    try {
      const list = await trips.list(member.id, 0);
      expect(list.map((trip) => trip.id).sort()).toEqual([f.trip.id, other.id].sort());
      expect(lookup).toHaveBeenCalledTimes(1);
      expect(new Set(lookup.mock.calls[0][0])).toEqual(new Set([f.trip.id, other.id]));
      expect(await trips.list(stranger.id, 0)).toEqual([]);
      expect(await trips.get(f.trip.id, stranger.id)).toBeUndefined();
    } finally {
      lookup.mockRestore();
    }
  });
});
