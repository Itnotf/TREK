import { AssistantItineraryDrafts } from '../../../../src/db/entities/AssistantItineraryDrafts.entity';
import { AssistantThreads } from '../../../../src/db/entities/AssistantThreads.entity';
import { DayAccommodations } from '../../../../src/db/entities/DayAccommodations.entity';
import { DayAssignments } from '../../../../src/db/entities/DayAssignments.entity';
import { DayNotes } from '../../../../src/db/entities/DayNotes.entity';
import { Days } from '../../../../src/db/entities/Days.entity';
import { Places } from '../../../../src/db/entities/Places.entity';
import { Reservations } from '../../../../src/db/entities/Reservations.entity';
import { RoadtripPreferences } from '../../../../src/db/entities/RoadtripPreferences.entity';
import { TripItineraryGuides } from '../../../../src/db/entities/TripItineraryGuides.entity';
import { TripMembers } from '../../../../src/db/entities/TripMembers.entity';
import { Trips } from '../../../../src/db/entities/Trips.entity';
import { AccommodationsService } from '../../../../src/nest/accommodations/accommodations.service';
import { AssignmentsService } from '../../../../src/nest/assignments/assignments.service';
import { AssistantItineraryModule } from '../../../../src/nest/assistant/assistant-itinerary.module';
import { AssistantItineraryService } from '../../../../src/nest/assistant/assistant-itinerary.service';
import { planningPort } from '../../../../src/nest/assistant/assistant-planning-tools';
import { DaysService } from '../../../../src/nest/days/days.service';
import { GooglePlacesClient } from '../../../../src/nest/maps/providers/google-places.provider';
import { PermissionsService } from '../../../../src/nest/permissions/permissions.service';
import { TripGuideService } from '../../../../src/nest/trips/trip-guide.service';
import { createSnapshotTestDb } from '../../../helpers/db-mock';
import { createRow, deleteRows, findRows, updateRows } from '../../../helpers/factories/rows';
import { makeUser } from '../../../helpers/factories/users';
import { itineraryDayGuideFixture, itineraryGuideFixture } from '../../../helpers/itinerary-guide';
import { resetTestDb } from '../../../helpers/test-db';
import { createTestModule, type TestModule } from '../../../helpers/test-module';
import { MikroORM } from '@mikro-orm/core';
import { dayNoteCreateRequestSchema, type ItineraryPlan } from '@trek/shared';

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const db = createSnapshotTestDb();
let t: TestModule;
let service: AssistantItineraryService;

function plan(): ItineraryPlan {
  return {
    title: '成都到乐山两日自驾',
    summary: '第一天慢游成都，第二天到乐山。',
    start_date: '2026-12-31',
    currency: 'CNY',
    transport_mode: 'driving',
    requirements: ['带老人，少爬山'],
    assumptions: ['门票和交通时间尚需出发前核实'],
    roadtrip_preferences: { roadtrip_day_minutes: 240, roadtrip_day_start: '09:00', roadtrip_vehicle: 'electric' },
    sources: [{ url: 'https://example.com/travel', title: '参考游记', extraction: 'article' }],
    days: [
      {
        title: '成都慢游',
        overnight_city: '成都',
        notes: '午后留出休息时间。',
        stops: [
          {
            name: '人民公园',
            city: '成都',
            description: '逛公园、体验茶馆。',
            arrival_time: '09:30',
            duration_minutes: 90,
            location: { lat: 30.657, lng: 104.055, place_id: 'amap:B001', address: '成都市青羊区人民公园' },
          },
          {
            name: '街巷散步',
            city: '成都',
            description: '根据体力选择步行距离。',
            arrival_time: null,
            duration_minutes: 30,
          },
        ],
      },
      {
        title: '成都到乐山',
        overnight_city: '乐山',
        notes: '上午出发。',
        stops: [
          {
            name: '乐山大佛',
            city: '乐山',
            description: '优先考虑轻松的观景方式。',
            arrival_time: '11:00',
            duration_minutes: 120,
          },
        ],
      },
    ],
  };
}

function dailyPlan(): ItineraryPlan {
  const itinerary = plan();
  itinerary.schedule_version = 2;
  for (const [dayIndex, day] of itinerary.days.entries()) {
    day.stay = null;
    day.stops = day.stops.slice(0, 1).map((stop) => ({
      ...stop,
      id: `day-${dayIndex}-visit`,
      kind: 'visit',
      time_kind: 'suggested',
      travel_from_previous: null,
    }));
  }
  itinerary.days[0].stops.push(
    {
      id: 'day-0-lunch',
      kind: 'meal',
      time_kind: 'suggested',
      name: '午餐与如厕',
      city: '成都',
      description: '餐厅待选，安排座位休息。',
      arrival_time: '12:00',
      duration_minutes: 50,
      travel_from_previous: { mode: 'driving', duration_minutes: 30, notes: '含停车缓冲，车程待核实。' },
    },
    {
      id: 'day-0-rest',
      kind: 'rest',
      time_kind: 'suggested',
      name: '坐休',
      city: '成都',
      description: '连续步行不超过 15 分钟。',
      arrival_time: '12:50',
      duration_minutes: 40,
      travel_from_previous: { mode: 'walking', duration_minutes: 0, notes: '原地休息。' },
    },
    {
      id: 'day-0-appointment',
      kind: 'visit',
      time_kind: 'fixed',
      name: '下午预约活动',
      city: '成都',
      description: '按预约时间抵达。',
      arrival_time: '13:30',
      duration_minutes: 75,
      travel_from_previous: { mode: 'walking', duration_minutes: 0, notes: '同一地点。' },
    },
  );
  itinerary.days[0].stay = {
    area: '成都城区',
    name: null,
    check_in: '15:30',
    check_out: '09:00',
    notes: '酒店待选，避免楼梯。',
  };
  return itinerary;
}

beforeAll(async () => {
  t = await createTestModule({ db, imports: [AssistantItineraryModule] });
  service = t.get(AssistantItineraryService);
}, 60000);

beforeEach(() => {
  resetTestDb(db);
  vi.restoreAllMocks();
  t.realtime.reset();
});

afterAll(async () => {
  await t?.close();
  db.close();
});

async function conversation() {
  const orm = t.get(MikroORM);
  const { user } = await makeUser(orm);
  const thread = await createRow(orm, AssistantThreads, { user: user.id, title: '我的旅行' });
  return { userId: user.id, threadId: thread.id };
}

async function draft() {
  const c = await conversation();
  return { ...c, draft: await service.save(c.userId, c.threadId, { base_revision: 0, plan: plan() }) };
}

describe('AssistantItineraryService', () => {
  it('saves meals and rests as editable timed activities, estimates as notes and area-only stays as unbooked suggestions', async () => {
    const c = await conversation();
    const itinerary = dailyPlan();
    const saved = await service.save(c.userId, c.threadId, { base_revision: 0, plan: itinerary });
    const { trip } = await service.apply(c.userId, saved.id, { revision: 1 });
    const orm = t.get(MikroORM);
    const places = await findRows(orm, Places, { trip_id: trip.id }, { id: 'asc' });
    expect(places).toHaveLength(5);
    expect(places.map((place) => place.source)).toEqual(Array(5).fill('assistant'));
    expect(places[1]).toMatchObject({
      name: '午餐与如厕',
      lat: null,
      lng: null,
      place_time: '12:00',
      end_time: '12:50',
      duration_minutes: 50,
    });
    expect(places[1].description).toContain('含停车缓冲，车程待核实。');
    expect(places[2]).toMatchObject({ name: '坐休', place_time: '12:50', end_time: '13:30', duration_minutes: 40 });
    const assignments = await findRows(orm, DayAssignments, {}, { id: 'asc' });
    expect(assignments[0]).toMatchObject({ leg_transport_mode: 'driving' });
    expect(assignments[1]).toMatchObject({
      assignment_time: null,
      incoming_leg_transport_mode: 'driving',
      leg_transport_mode: 'walking',
    });
    expect(assignments[3]).toMatchObject({ assignment_time: '13:30', assignment_end_time: '14:45' });
    const { days } = await t.get(DaysService).list(trip.id);
    expect(days[0].notes_items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ time: '11:30', text: expect.stringContaining('30 min'), icon: 'ArrowRight' }),
        expect.objectContaining({ text: expect.stringContaining('酒店待选'), time: '15:30', icon: 'BedDouble' }),
      ]),
    );
    expect(days[0].notes_items.filter((note) => note.icon === 'ArrowRight')).toHaveLength(1);
    expect(days[1].notes_items.some((note) => note.icon === 'BedDouble')).toBe(false);
    expect(await findRows(orm, Reservations, {})).toHaveLength(0);
    expect(await findRows(orm, DayAccommodations, {})).toHaveLength(0);
    expect(await service.apply(c.userId, saved.id, { revision: 1 })).toEqual({ trip });
    expect(await findRows(orm, DayAssignments, {})).toHaveLength(5);
  });

  it('creates a verified suggested hotel as one pending stay without a confirmation or duplicate visit', async () => {
    const c = await conversation();
    const itinerary = dailyPlan();
    const location = { lat: 30.67, lng: 104.07, place_id: 'amap:HOTEL', address: '酒店已定位地址' };
    itinerary.days[0].stops.push({
      id: 'day-0-hotel',
      kind: 'activity',
      time_kind: 'suggested',
      name: '建议酒店',
      city: '成都',
      description: '办理入住后休息。',
      arrival_time: '15:30',
      duration_minutes: 30,
      location,
      travel_from_previous: { mode: 'driving', duration_minutes: 30, notes: '预计车程。' },
    });
    itinerary.days[0].stay = {
      area: '成都城区',
      name: '建议酒店',
      location,
      check_in: '15:30',
      check_out: '09:00',
      notes: '待确认，未预订。',
    };
    const saved = await service.save(c.userId, c.threadId, { base_revision: 0, plan: itinerary });
    const { trip } = await service.apply(c.userId, saved.id, { revision: 1 });
    const orm = t.get(MikroORM);
    const days = await findRows(orm, Days, { trip_id: trip.id }, { day_number: 'asc' });
    const hotels = await findRows(orm, Places, { trip_id: trip.id, name: '建议酒店' });
    expect(hotels).toHaveLength(1);
    const stays = await findRows(orm, DayAccommodations, { trip_id: trip.id });
    expect(stays).toEqual([
      expect.objectContaining({
        place_id: hotels[0].id,
        start_day_id: days[0].id,
        end_day_id: days[1].id,
        check_in: '15:30',
        check_out: '09:00',
        confirmation: null,
      }),
    ]);
    expect(await findRows(orm, DayAssignments, { place_id: hotels[0].id })).toHaveLength(1);
    expect(await findRows(orm, Reservations, { trip_id: trip.id })).toEqual([
      expect.objectContaining({ type: 'hotel', status: 'pending', confirmation_number: null }),
    ]);
    const repeated = await service.apply(c.userId, saved.id, { revision: 1 });
    expect(repeated).toEqual({ trip });
    expect(await findRows(orm, Reservations, { trip_id: trip.id })).toHaveLength(1);
  });

  it('rolls back the whole itinerary when accommodation creation fails after the activities', async () => {
    const c = await conversation();
    const itinerary = dailyPlan();
    itinerary.days[0].stay = {
      area: '成都城区',
      name: '建议酒店',
      check_in: '15:30',
      check_out: '09:00',
      notes: '',
      location: { lat: 30.67, lng: 104.07, place_id: 'amap:HOTEL', address: '酒店已定位地址' },
    };
    const saved = await service.save(c.userId, c.threadId, { base_revision: 0, plan: itinerary });
    const accommodations = t.get(AccommodationsService);
    const create = accommodations.createAccommodation.bind(accommodations);
    vi.spyOn(accommodations, 'createAccommodation').mockImplementationOnce(async (...args) => {
      await create(...args);
      throw new Error('stay storage failure');
    });
    await expect(service.apply(c.userId, saved.id, { revision: 1 })).rejects.toThrow('stay storage failure');
    const orm = t.get(MikroORM);
    expect(await findRows(orm, Trips, {})).toHaveLength(0);
    expect(await findRows(orm, Places, {})).toHaveLength(0);
    expect(await findRows(orm, DayAssignments, {})).toHaveLength(0);
    expect(await findRows(orm, DayAccommodations, {})).toHaveLength(0);
    expect(await findRows(orm, Reservations, {})).toHaveLength(0);
    expect(await service.get(c.userId, saved.id)).toMatchObject({ created_trip_id: null });
    expect(t.realtime.broadcastToUserMock).not.toHaveBeenCalled();
    expect((await service.apply(c.userId, saved.id, { revision: 1 })).trip.id).toBeGreaterThan(0);
  });
  it('keeps immutable revisions without creating any trip while the user is still chatting', async () => {
    const c = await conversation();
    expect(await service.current(c.userId, c.threadId)).toBeNull();
    const first = await service.save(c.userId, c.threadId, { base_revision: 0, plan: plan() });
    const revised = { ...plan(), title: '更轻松的成都到乐山自驾' };
    const second = await service.save(c.userId, c.threadId, { base_revision: 1, plan: revised });
    expect(second).toMatchObject({ revision: 2, latest_revision: 2, created_trip_id: null, plan: revised });
    expect(await service.get(c.userId, first.id)).toMatchObject({ revision: 1, latest_revision: 2, plan: plan() });
    expect(await service.current(c.userId, c.threadId)).toEqual(second);
    expect(await findRows(t.get(MikroORM), Trips, {})).toHaveLength(0);
    expect(t.realtime.broadcastToUserMock).not.toHaveBeenCalled();
  });

  it('refuses stale saves and stale confirmation cards', async () => {
    const c = await draft();
    await service.save(c.userId, c.threadId, { base_revision: 1, plan: plan() });
    await expect(service.save(c.userId, c.threadId, { base_revision: 1, plan: plan() })).rejects.toMatchObject({
      status: 409,
    });
    await expect(service.apply(c.userId, c.draft.id, { revision: 1 })).rejects.toMatchObject({ status: 409 });
    expect(await findRows(t.get(MikroORM), Trips, {})).toHaveLength(0);
  });

  it('does not disclose or change another user’s draft or accept a trip-scoped conversation', async () => {
    const c = await draft();
    const other = await conversation();
    await expect(service.get(other.userId, c.draft.id)).rejects.toMatchObject({ status: 404 });
    await expect(service.current(other.userId, c.threadId)).rejects.toMatchObject({ status: 404 });
    await expect(service.save(other.userId, c.threadId, { base_revision: 1, plan: plan() })).rejects.toMatchObject({
      status: 404,
    });
    await expect(service.apply(other.userId, c.draft.id, { revision: 1 })).rejects.toMatchObject({ status: 404 });
    const trip = await createRow(t.get(MikroORM), Trips, { user: c.userId, title: 'Existing trip' });
    await updateRows(t.get(MikroORM), AssistantThreads, { id: c.threadId }, { trip: trip.id });
    await expect(service.get(c.userId, c.draft.id)).rejects.toMatchObject({ status: 404 });
    await expect(service.save(c.userId, c.threadId, { base_revision: 1, plan: plan() })).rejects.toMatchObject({
      status: 404,
    });
  });

  it('creates every day, stop, assignment and driving preference with context and verified coordinates preserved', async () => {
    const c = await draft();
    const { trip } = await service.apply(c.userId, c.draft.id, { revision: 1 });
    expect(trip).toMatchObject({
      user_id: c.userId,
      title: plan().title,
      start_date: '2026-12-31',
      end_date: '2027-01-01',
      currency: 'CNY',
    });
    expect(trip.description).toContain('带老人，少爬山');
    expect(trip.description).toContain('门票和交通时间尚需出发前核实');
    expect(trip.description).toContain('https://example.com/travel');
    const orm = t.get(MikroORM);
    const days = await findRows(orm, Days, { trip_id: trip.id }, { day_number: 'asc' });
    expect(days).toHaveLength(2);
    expect(days[0]).toMatchObject({ title: '成都慢游', date: '2026-12-31', default_transport_mode: 'driving' });
    const visibleDays = await t.get(DaysService).list(trip.id);
    expect(visibleDays.days[0].notes_items).toEqual([
      expect.objectContaining({ text: '成都慢游', time: '午后留出休息时间。', icon: 'FileText' }),
      expect.objectContaining({ text: '成都', time: null, icon: 'BedDouble' }),
    ]);
    expect(days[1]).toMatchObject({ title: '成都到乐山', date: '2027-01-01' });
    const places = await findRows(orm, Places, { trip_id: trip.id }, { id: 'asc' });
    expect(places).toHaveLength(3);
    expect(places[0]).toMatchObject({
      name: '人民公园',
      description: '逛公园、体验茶馆。',
      lat: 30.657,
      lng: 104.055,
      amap_poi_id: 'amap:B001',
      place_time: '09:30',
      duration_minutes: 90,
    });
    expect(places[1]).toMatchObject({ name: '街巷散步', lat: null, lng: null, address: '成都' });
    const assignments = await findRows(orm, DayAssignments, {}, { id: 'asc' });
    expect(assignments.map((row) => [row.day_id, row.place_id, row.order_index])).toEqual([
      [days[0].id, places[0].id, 0],
      [days[0].id, places[1].id, 1],
      [days[1].id, places[2].id, 0],
    ]);
    expect(await findRows(orm, RoadtripPreferences, { trip_id: trip.id })).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'roadtrip_day_minutes', value: '240' }),
        expect.objectContaining({ key: 'roadtrip_vehicle', value: '"electric"' }),
      ]),
    );
    expect(await service.get(c.userId, c.draft.id)).toMatchObject({ created_trip_id: trip.id });
    expect(t.realtime.broadcastToUserMock).toHaveBeenCalledExactlyOnceWith(c.userId, { type: 'trips:changed' });
  });

  it('keeps a Google address result whose provider ID does not start with ChI through search, preview and confirmation', async () => {
    const c = await conversation();
    const google = t.get(GooglePlacesClient);
    const placeId = 'EiQxMCBEb3duaW5nIFN0cmVldCwgTG9uZG9uLCBVSyIuKiwKFAoSCQ';
    vi.spyOn(google, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          places: [
            {
              id: placeId,
              displayName: { text: 'Downing Street' },
              formattedAddress: 'Downing Street, London, UK',
              location: { latitude: 51.503, longitude: -0.128 },
            },
          ],
        }),
        { status: 200 },
      ),
    );
    const places = await google
      .provider({ key: 'test', source: 'instance', userId: c.userId })
      .searchText('Downing Street');
    const tools = planningPort(
      {
        specs: () => [],
        kindOf: () => 'read',
        pinArgs: (_name, args) => ({ args }),
        call: async () => ({ ok: true, value: { places, source: 'google' } }),
      },
      {
        current: () => service.current(c.userId, c.threadId),
        save: (request) => service.save(c.userId, c.threadId, request),
        readSource: async () => {
          throw new Error('This test does not read a link');
        },
      },
      [],
    );
    await tools.call('search_place', { query: 'Downing Street' });
    const { sources: _sources, ...modelPlan } = plan();
    modelPlan.schedule_version = 2;
    modelPlan.guide = itineraryGuideFixture();
    modelPlan.days = [
      {
        title: 'London',
        guide: itineraryDayGuideFixture(),
        overnight_city: 'London',
        notes: '',
        stay: null,
        stops: [
          {
            id: 'london-visit',
            kind: 'visit',
            time_kind: 'suggested',
            travel_from_previous: null,
            name: 'Downing Street',
            city: 'London',
            description: '',
            arrival_time: null,
            duration_minutes: 30,
            place_ref: placeId,
          },
        ],
      },
    ];
    expect((await tools.call('save_itinerary_draft', { base_revision: 0, plan: modelPlan })).ok).toBe(true);
    const saved = await service.current(c.userId, c.threadId);
    expect(saved?.plan.days[0].stops[0].location).toMatchObject({ place_id: placeId, lat: 51.503, lng: -0.128 });
    if (!saved) throw new Error('Expected the search result to be saved as a draft');
    const { trip } = await service.apply(c.userId, saved.id, { revision: 1 });
    expect(await findRows(t.get(MikroORM), Places, { trip_id: trip.id })).toEqual([
      expect.objectContaining({
        google_place_id: placeId,
        address: 'Downing Street, London, UK',
        lat: 51.503,
        lng: -0.128,
      }),
    ]);
  });

  it('keeps the full 2000-character instructions in one editable body with a short title', async () => {
    const c = await conversation();
    const itinerary = plan();
    itinerary.days[0].notes = '09:30 出发\n\n**带好行李** 🧳\n午后休息。'.padEnd(2000, '休');
    itinerary.days[1].notes = ' \n ';
    itinerary.days[1].overnight_city = '';
    const saved = await service.save(c.userId, c.threadId, { base_revision: 0, plan: itinerary });
    const { trip } = await service.apply(c.userId, saved.id, { revision: 1 });
    const { days } = await t.get(DaysService).list(trip.id);
    const notes = days[0].notes_items;
    expect(notes).toHaveLength(2);
    expect(notes[0]).toMatchObject({ text: itinerary.days[0].title, time: itinerary.days[0].notes });
    expect(notes[0].time).toHaveLength(2000);
    expect(notes[1]).toMatchObject({ text: '成都', icon: 'BedDouble', time: null });
    expect(notes.map((note) => note.sort_order)).toEqual([0, 1]);
    expect(notes.every((note) => dayNoteCreateRequestSchema.safeParse(note).success)).toBe(true);
    expect(() => encodeURIComponent(notes[0].time ?? '')).not.toThrow();
    expect(days[1].notes_items).toEqual([]);
  });

  it('keeps the explicit driving mode when no vehicle preferences were supplied', async () => {
    const c = await conversation();
    const { roadtrip_preferences: _preferences, ...withoutPreferences } = plan();
    const saved = await service.save(c.userId, c.threadId, { base_revision: 0, plan: withoutPreferences });
    const { trip } = await service.apply(c.userId, saved.id, { revision: 1 });
    const orm = t.get(MikroORM);
    const days = await findRows(orm, Days, { trip_id: trip.id });
    const places = await findRows(orm, Places, { trip_id: trip.id });
    expect(days.map((day) => day.default_transport_mode)).toEqual(['driving', 'driving']);
    expect(places.map((place) => place.transport_mode)).toEqual(['driving', 'driving', 'driving']);
    expect(await findRows(orm, RoadtripPreferences, { trip_id: trip.id })).toHaveLength(0);
  });

  it('creates the requested undated day count and returns the same trip when confirmation is retried', async () => {
    const c = await conversation();
    const saved = await service.save(c.userId, c.threadId, { base_revision: 0, plan: { ...plan(), start_date: null } });
    await expect(service.apply(c.userId, saved.id, { revision: 2 })).rejects.toMatchObject({ status: 409 });
    const first = await service.apply(c.userId, saved.id, { revision: 1 });
    expect(first.trip).toMatchObject({ start_date: null, end_date: null, day_count: 2 });
    expect(await service.apply(c.userId, saved.id, { revision: 1 })).toEqual(first);
    expect(await findRows(t.get(MikroORM), Trips, {})).toHaveLength(1);
    expect(await findRows(t.get(MikroORM), DayNotes, {})).toHaveLength(4);
    expect(t.realtime.broadcastToUserMock).toHaveBeenCalledTimes(1);
    await expect(service.save(c.userId, c.threadId, { base_revision: 1, plan: plan() })).rejects.toMatchObject({
      status: 409,
    });
  });

  it('keeps the apply receipt after deletion and never recreates a deleted trip from a double click', async () => {
    const c = await draft();
    const { trip } = await service.apply(c.userId, c.draft.id, { revision: 1 });
    await deleteRows(t.get(MikroORM), Trips, { id: trip.id });
    expect(await findRows(t.get(MikroORM), TripItineraryGuides, {})).toHaveLength(0);
    const [row] = await findRows(t.get(MikroORM), AssistantItineraryDrafts, { id: c.draft.id });
    expect(row.applied_trip_id).toBeNull();
    expect(row.applied_at).toBeTruthy();
    await expect(service.apply(c.userId, c.draft.id, { revision: 1 })).rejects.toMatchObject({ status: 410 });
    expect(await findRows(t.get(MikroORM), Trips, {})).toHaveLength(0);
  });

  it('serializes simultaneous confirmations so both callers receive the same trip', async () => {
    const c = await draft();
    const [first, second] = await Promise.all([
      service.apply(c.userId, c.draft.id, { revision: 1 }),
      service.apply(c.userId, c.draft.id, { revision: 1 }),
    ]);
    expect(second).toEqual(first);
    expect(await findRows(t.get(MikroORM), Trips, {})).toHaveLength(1);
    expect(t.realtime.broadcastToUserMock).toHaveBeenCalledTimes(1);
  });

  it('lets only one simultaneous edit replace a given revision', async () => {
    const c = await draft();
    const results = await Promise.allSettled([
      service.save(c.userId, c.threadId, { base_revision: 1, plan: { ...plan(), title: 'Version A' } }),
      service.save(c.userId, c.threadId, { base_revision: 1, plan: { ...plan(), title: 'Version B' } }),
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.find((result) => result.status === 'rejected')).toMatchObject({ reason: { status: 409 } });
    expect(await findRows(t.get(MikroORM), AssistantItineraryDrafts, {})).toHaveLength(2);
  });

  it('rolls back all records and the confirmation receipt when a later assignment fails', async () => {
    const c = await draft();
    const assignments = t.get(AssignmentsService);
    const realCreate = assignments.createAssignment.bind(assignments);
    vi.spyOn(assignments, 'createAssignment')
      .mockImplementationOnce(realCreate)
      .mockRejectedValueOnce(new Error('storage failure'));
    await expect(service.apply(c.userId, c.draft.id, { revision: 1 })).rejects.toThrow('storage failure');
    const orm = t.get(MikroORM);
    expect(await findRows(orm, Trips, {})).toHaveLength(0);
    expect(await findRows(orm, Days, {})).toHaveLength(0);
    expect(await findRows(orm, DayNotes, {})).toHaveLength(0);
    expect(await findRows(orm, Places, {})).toHaveLength(0);
    expect(await findRows(orm, DayAssignments, {})).toHaveLength(0);
    expect(await findRows(orm, RoadtripPreferences, {})).toHaveLength(0);
    expect(await findRows(orm, TripItineraryGuides, {})).toHaveLength(0);
    expect((await findRows(orm, AssistantItineraryDrafts, { id: c.draft.id }))[0]).toMatchObject({
      applied_at: null,
      applied_trip_id: null,
    });
    expect(t.realtime.broadcastToUserMock).not.toHaveBeenCalled();
    expect((await service.apply(c.userId, c.draft.id, { revision: 1 })).trip.id).toBeGreaterThan(0);
  });

  it('checks creation permission before creating records', async () => {
    const c = await draft();
    vi.spyOn(t.get(PermissionsService), 'checkPermission').mockResolvedValueOnce(false);
    await expect(service.apply(c.userId, c.draft.id, { revision: 1 })).rejects.toMatchObject({ status: 403 });
    expect(await findRows(t.get(MikroORM), Trips, {})).toHaveLength(0);
    expect(t.realtime.broadcastToUserMock).not.toHaveBeenCalled();
  });

  it('keeps the complete confirmed guide after chat deletion and shares it only with current trip members', async () => {
    const c = await conversation();
    const itinerary = dailyPlan();
    itinerary.guide = itineraryGuideFixture();
    for (const day of itinerary.days) day.guide = itineraryDayGuideFixture();
    const saved = await service.save(c.userId, c.threadId, { base_revision: 0, plan: itinerary });
    const { trip } = await service.apply(c.userId, saved.id, { revision: 1 });
    const orm = t.get(MikroORM);
    const guides = t.get(TripGuideService);
    expect(await guides.get(c.userId, trip.id)).toEqual(saved.plan);
    await service.apply(c.userId, saved.id, { revision: 1 });
    expect(await findRows(orm, TripItineraryGuides, { trip_id: trip.id })).toHaveLength(1);
    await deleteRows(orm, AssistantThreads, { id: c.threadId });
    expect(await findRows(orm, AssistantItineraryDrafts, { id: saved.id })).toHaveLength(0);
    expect(await guides.get(c.userId, trip.id)).toEqual(saved.plan);

    const { user: other } = await makeUser(orm);
    await expect(guides.get(other.id, trip.id)).rejects.toMatchObject({ status: 404 });
    await createRow(orm, TripMembers, { trip: trip.id, user: other.id });
    expect(await guides.get(other.id, trip.id)).toEqual(saved.plan);
    await deleteRows(orm, TripMembers, { trip_id: trip.id, user_id: other.id });
    await expect(guides.get(other.id, trip.id)).rejects.toMatchObject({ status: 404 });
  });

  it('returns no guide for an existing manual trip and refuses corrupt saved content', async () => {
    const c = await conversation();
    const orm = t.get(MikroORM);
    const guides = t.get(TripGuideService);
    const trip = await createRow(orm, Trips, { user: c.userId, title: 'Manual trip' });
    expect(await guides.get(c.userId, trip.id)).toBeNull();
    await expect(guides.get(c.userId, 'invalid')).rejects.toMatchObject({ status: 404 });
    await createRow(orm, TripItineraryGuides, { trip: trip.id, plan: '{"broken":true}' });
    await expect(guides.get(c.userId, trip.id)).rejects.toMatchObject({ status: 500 });
  });

  it('rolls back the guide, trip and receipt together if confirmation fails after saving the guide', async () => {
    const c = await draft();
    const orm = t.get(MikroORM);
    vi.spyOn(orm.em.getRepository(AssistantItineraryDrafts), 'markApplied').mockRejectedValueOnce(
      new Error('receipt storage failed'),
    );
    await expect(service.apply(c.userId, c.draft.id, { revision: 1 })).rejects.toThrow('receipt storage failed');
    expect(await findRows(orm, Trips, {})).toHaveLength(0);
    expect(await findRows(orm, TripItineraryGuides, {})).toHaveLength(0);
    expect(await findRows(orm, DayAssignments, {})).toHaveLength(0);
    expect(await service.get(c.userId, c.draft.id)).toMatchObject({ created_trip_id: null });
    const { trip } = await service.apply(c.userId, c.draft.id, { revision: 1 });
    expect(await t.get(TripGuideService).get(c.userId, trip.id)).toEqual(c.draft.plan);
  });

  it('validates the stored plan again and fails closed if it is corrupted', async () => {
    const c = await draft();
    await updateRows(t.get(MikroORM), AssistantItineraryDrafts, { id: c.draft.id }, { plan: '{"title":"incomplete"}' });
    await expect(service.apply(c.userId, c.draft.id, { revision: 1 })).rejects.toMatchObject({ status: 500 });
    expect(await findRows(t.get(MikroORM), Trips, {})).toHaveLength(0);
  });

  it('refuses an invalid model draft without storing a revision', async () => {
    const c = await conversation();
    const invalid = plan();
    invalid.days[0].stops[0].duration_minutes = -5;
    await expect(service.save(c.userId, c.threadId, { base_revision: 0, plan: invalid })).rejects.toMatchObject({
      status: 400,
    });
    expect(await service.current(c.userId, c.threadId)).toBeNull();
  });
});
