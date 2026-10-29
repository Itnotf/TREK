import { storedTrekCardSchema, trekCardSchema } from './cards';
import {
  itineraryApplyRequestSchema,
  itineraryApplyResponseSchema,
  itineraryDraftResponseSchema,
  itineraryLocationSchema,
  itineraryStopEndTime,
  itineraryModelPlanSchema,
  itineraryModelSaveSchema,
  itineraryPlanSchema,
  itinerarySaveRequestSchema,
  type ItineraryPlan,
} from './itinerary.schema';

import { describe, expect, it } from 'vitest';

function stop(): ItineraryPlan['days'][number]['stops'][number] {
  return {
    name: "Chengdu People's Park",
    city: 'Chengdu',
    description: 'Walk through the park and visit a teahouse.',
    arrival_time: '09:30',
    duration_minutes: 90,
  };
}

function day(stopCount = 1): ItineraryPlan['days'][number] {
  return {
    title: 'An easy day in Chengdu',
    overnight_city: 'Chengdu',
    notes: '',
    stops: Array.from({ length: stopCount }, stop),
  };
}

function plan(overrides: Partial<ItineraryPlan> = {}): ItineraryPlan {
  return {
    title: 'Western Sichuan road trip',
    summary: 'A relaxed drive with time to explore each stop.',
    start_date: null,
    currency: 'CNY',
    transport_mode: 'driving',
    requirements: ['Keep driving days short'],
    assumptions: ['Departure date is not decided'],
    days: [day()],
    ...overrides,
  };
}

const location = {
  lat: 30.657,
  lng: 104.055,
  place_id: 'provider:chengdu-peoples-park',
  address: 'Qingyang District, Chengdu',
};
const source = {
  url: 'https://travel.example/sichuan',
  title: 'A relaxed route through Sichuan',
  extraction: 'article' as const,
};

describe.each([
  { name: 'server', schema: itineraryPlanSchema },
  { name: 'model', schema: itineraryModelPlanSchema },
])('$name itinerary limits', ({ schema }) => {
  it('accepts an undecided departure date and real calendar dates, including leap day', () => {
    for (const start_date of [null, '2028-02-29', '2026-10-29']) {
      expect(schema.parse(plan({ start_date })).start_date).toBe(start_date);
    }
    for (const start_date of ['2026-02-29', '2026-04-31', '2026-13-01', '2026-1-02', '2026-10-29T00:00:00Z']) {
      expect(schema.safeParse(plan({ start_date })).success, start_date).toBe(false);
    }
  });

  it('accepts optional scheduling as null and refuses impossible or ambiguous clock times', () => {
    for (const arrival_time of [null, '00:00', '23:59']) {
      const candidate = plan({ days: [{ ...day(), stops: [{ ...stop(), arrival_time }] }] });
      expect(schema.parse(candidate)).toEqual(candidate);
    }
    for (const arrival_time of ['24:00', '12:60', '9:30', '09:30:00', 'tomorrow morning']) {
      expect(schema.safeParse(plan({ days: [{ ...day(), stops: [{ ...stop(), arrival_time }] }] })).success).toBe(
        false,
      );
    }
  });

  it('bounds visit durations to whole minutes within one day', () => {
    for (const duration_minutes of [0, 1440]) {
      expect(schema.safeParse(plan({ days: [{ ...day(), stops: [{ ...stop(), duration_minutes }] }] })).success).toBe(
        true,
      );
    }
    for (const duration_minutes of [-1, 1.5, 1441]) {
      expect(schema.safeParse(plan({ days: [{ ...day(), stops: [{ ...stop(), duration_minutes }] }] })).success).toBe(
        false,
      );
    }
  });

  it('allows a rest day and the day/stop boundaries without accepting an empty or overfull trip', () => {
    expect(schema.safeParse(plan({ days: [day(0)] })).success).toBe(true);
    expect(schema.safeParse(plan({ days: Array.from({ length: 30 }, () => day(0)) })).success).toBe(true);
    expect(schema.safeParse(plan({ days: [day(20)] })).success).toBe(true);
    expect(schema.safeParse(plan({ days: [] })).success).toBe(false);
    expect(schema.safeParse(plan({ days: Array.from({ length: 31 }, () => day(0)) })).success).toBe(false);
    expect(schema.safeParse(plan({ days: [day(21)] })).success).toBe(false);
  });

  it('caps the entire itinerary at 120 stops even when every day is within its own limit', () => {
    const days = Array.from({ length: 15 }, () => day(8));
    expect(schema.safeParse(plan({ days })).success).toBe(true);
    expect(schema.safeParse(plan({ days: [...days, day(1)] })).success).toBe(false);
  });

  it('caps the complete serialized plan, including text spread across individually valid days', () => {
    const firstDay = day(0);
    const candidate = plan({
      days: [firstDay, ...Array.from({ length: 19 }, () => ({ ...day(0), notes: 'x'.repeat(1500) }))],
    });
    firstDay.notes = 'x'.repeat(32000 - JSON.stringify(candidate).length);
    expect(firstDay.notes.length).toBeLessThanOrEqual(2000);
    expect(JSON.stringify(candidate)).toHaveLength(32000);
    expect(schema.safeParse(candidate).success).toBe(true);
    firstDay.notes += 'x';
    expect(schema.safeParse(candidate).success).toBe(false);
  });

  it('uses the trip creation rules for the driving day window', () => {
    expect(
      schema.safeParse(plan({ roadtrip_preferences: { roadtrip_day_start: '08:30', roadtrip_day_end: '17:00' } }))
        .success,
    ).toBe(true);
    expect(
      schema.safeParse(plan({ roadtrip_preferences: { roadtrip_day_start: '17:00', roadtrip_day_end: '08:30' } }))
        .success,
    ).toBe(false);
  });
});

describe('model input and server enrichment', () => {
  it('lets the model reference a place without supplying its own verified coordinates', () => {
    const candidate = plan({ days: [{ ...day(), stops: [{ ...stop(), place_ref: location.place_id }] }] });
    expect(itineraryModelPlanSchema.parse(candidate)).toEqual(candidate);
    for (const suppliedLocation of [location, null]) {
      const enriched = plan({ days: [{ ...day(), stops: [{ ...stop(), location: suppliedLocation }] }] });
      expect(itineraryPlanSchema.parse(enriched)).toEqual(enriched);
      expect(itineraryModelPlanSchema.safeParse(enriched).success).toBe(false);
      expect(itineraryModelSaveSchema.safeParse({ base_revision: 0, plan: enriched }).success).toBe(false);
    }
  });

  it('keeps source provenance server-owned, including empty or fabricated source lists', () => {
    for (const sources of [[], [source]]) {
      const enriched = plan({ sources });
      expect(itineraryPlanSchema.parse(enriched)).toEqual(enriched);
      expect(itineraryModelPlanSchema.safeParse(enriched).success).toBe(false);
    }
    expect(itineraryModelPlanSchema.safeParse({ ...plan(), source }).success).toBe(false);
  });

  it('refuses model image fields at the plan, day and stop boundaries', () => {
    const image_url = 'https://images.example/park.jpg';
    const candidates = [
      { ...plan(), image_url },
      { ...plan(), images: [image_url] },
      { ...plan(), days: [{ ...day(), image_url }] },
      { ...plan(), days: [{ ...day(), stops: [{ ...stop(), image_url }] }] },
      { ...plan(), days: [{ ...day(), stops: [{ ...stop(), images: [image_url] }] }] },
    ];
    for (const candidate of candidates) {
      expect(itineraryModelPlanSchema.safeParse(candidate).success).toBe(false);
    }
  });

  it('requires bounded coordinates and a provider identity on server-attached locations', () => {
    expect(itineraryLocationSchema.parse(location)).toEqual(location);
    for (const invalid of [
      { ...location, lat: 90.01 },
      { ...location, lat: -90.01 },
      { ...location, lng: 180.01 },
      { ...location, lng: -180.01 },
      { ...location, lat: Infinity },
      { ...location, lng: NaN },
      { ...location, place_id: ' ' },
      { ...location, verified: true },
    ]) {
      expect(itineraryLocationSchema.safeParse(invalid).success).toBe(false);
    }
  });

  it('preserves the actual extraction type and limits how many sources a draft can carry', () => {
    for (const extraction of ['article', 'metadata', 'text']) {
      const candidate = { ...plan(), sources: [{ ...source, extraction }] };
      expect(itineraryPlanSchema.parse(candidate)).toEqual(candidate);
    }
    expect(itineraryPlanSchema.safeParse(plan({ sources: Array.from({ length: 5 }, () => source) })).success).toBe(
      true,
    );
    expect(itineraryPlanSchema.safeParse(plan({ sources: Array.from({ length: 6 }, () => source) })).success).toBe(
      false,
    );
    expect(
      itineraryPlanSchema.safeParse({ ...plan(), sources: [{ ...source, extraction: 'video_transcript' }] }).success,
    ).toBe(false);
  });
});

describe('revision requests and response contracts', () => {
  it('allows revision zero only as the base of a new draft, with no coercion or extra request fields', () => {
    for (const schema of [itinerarySaveRequestSchema, itineraryModelSaveSchema]) {
      expect(schema.parse({ base_revision: 0, plan: plan() }).base_revision).toBe(0);
      expect(schema.parse({ base_revision: 2, plan: plan() }).base_revision).toBe(2);
      for (const base_revision of [-1, 0.5, '0', null, undefined]) {
        expect(schema.safeParse({ base_revision, plan: plan() }).success).toBe(false);
      }
      expect(schema.safeParse({ base_revision: 0, plan: plan(), thread_id: 9 }).success).toBe(false);
    }
    expect(itineraryApplyRequestSchema.parse({ revision: 1 })).toEqual({ revision: 1 });
    for (const revision of [0, -1, 1.5, '1', null, undefined]) {
      expect(itineraryApplyRequestSchema.safeParse({ revision }).success).toBe(false);
    }
    expect(itineraryApplyRequestSchema.safeParse({ revision: 1, trip_id: 7 }).success).toBe(false);
  });

  it('returns the requested revision alongside the latest revision and eventual trip identity', () => {
    const draft = {
      id: 3,
      thread_id: 4,
      revision: 1,
      latest_revision: 2,
      created_trip_id: null,
      plan: plan(),
    };
    expect(itineraryDraftResponseSchema.parse({ draft })).toEqual({ draft });
    expect(itineraryDraftResponseSchema.parse({ draft: { ...draft, created_trip_id: 12 } }).draft.created_trip_id).toBe(
      12,
    );
    for (const invalid of [
      { ...draft, revision: 0 },
      { ...draft, latest_revision: '2' },
      { ...draft, created_trip_id: 0 },
    ]) {
      expect(itineraryDraftResponseSchema.safeParse({ draft: invalid }).success).toBe(false);
    }
    const trip = { id: 12, user_id: 5, title: plan().title, currency: 'CNY', is_archived: 0, reminder_days: 1 };
    expect(itineraryApplyResponseSchema.parse({ trip })).toEqual({ trip });
    expect(itineraryApplyResponseSchema.safeParse({ trip: { ...trip, id: '12' } }).success).toBe(false);
  });

  it('reads itinerary cards through the shared union and hides malformed stored cards', () => {
    const card = {
      kind: 'tripPlan',
      draftId: 3,
      revision: 2,
      title: plan().title,
      dayCount: 5,
      summary: plan().summary,
    };
    expect(trekCardSchema.parse(card)).toEqual(card);
    expect(storedTrekCardSchema.parse(card)).toEqual(card);
    for (const invalid of [
      { ...card, draftId: 0 },
      { ...card, revision: 0 },
      { ...card, revision: '2' },
      { ...card, dayCount: 0 },
      { ...card, dayCount: 31 },
      { ...card, title: '' },
    ]) {
      expect(trekCardSchema.safeParse(invalid).success).toBe(false);
      expect(storedTrekCardSchema.parse(invalid)).toBeNull();
    }
  });
});

describe('complete daily schedules', () => {
  const schedule = (): ItineraryPlan =>
    plan({
      schedule_version: 2,
      roadtrip_preferences: { roadtrip_day_minutes: 180, roadtrip_leg_minutes: 120 },
      days: [
        {
          ...day(),
          overnight_city: '',
          stay: null,
          stops: [
            {
              ...stop(),
              id: 'lunch',
              kind: 'meal',
              time_kind: 'suggested',
              arrival_time: '12:00',
              duration_minutes: 50,
              travel_from_previous: null,
            },
            {
              ...stop(),
              id: 'rest',
              kind: 'rest',
              time_kind: 'suggested',
              arrival_time: '12:50',
              duration_minutes: 40,
              travel_from_previous: { mode: 'walking', duration_minutes: 0, notes: 'Rest at the restaurant' },
            },
            {
              ...stop(),
              id: 'visit',
              kind: 'visit',
              time_kind: 'fixed',
              arrival_time: '13:45',
              duration_minutes: 75,
              travel_from_previous: {
                mode: 'walking',
                duration_minutes: 15,
                notes: 'Allow time to reach the entrance',
              },
            },
          ],
        },
      ],
    });

  it('keeps meals, rest and transfer buffers in a feasible timeline', () => {
    for (const schema of [itineraryPlanSchema, itineraryModelPlanSchema]) {
      const candidate = schedule();
      expect(schema.parse(candidate)).toEqual(candidate);
      expect(itineraryStopEndTime(candidate.days[0]!.stops[0]!)).toBe('12:50');
      candidate.days[0]!.stops[2]!.arrival_time = '13:30';
      expect(schema.safeParse(candidate).success).toBe(false);
    }
  });

  it.each([
    'missing id',
    'duplicate id',
    'missing kind',
    'missing time kind',
    'zero meal',
    'zero rest',
    'missing transfer',
    'null transfer',
    'fixed without time',
    'overnight on final day',
    'long notes',
    'empty day',
  ])('rejects %s instead of saving a misleading plan', (problem) => {
    const candidate = schedule();
    const d = candidate.days[0]!;
    const first = d.stops[0]!;
    const second = d.stops[1]!;
    if (problem === 'missing id') delete first.id;
    if (problem === 'duplicate id') second.id = first.id;
    if (problem === 'missing kind') delete first.kind;
    if (problem === 'missing time kind') delete first.time_kind;
    if (problem === 'zero meal') first.duration_minutes = 0;
    if (problem === 'zero rest') second.duration_minutes = 0;
    if (problem === 'missing transfer') delete second.travel_from_previous;
    if (problem === 'null transfer') second.travel_from_previous = null;
    if (problem === 'fixed without time') d.stops[2]!.arrival_time = null;
    if (problem === 'overnight on final day')
      d.stay = { area: 'Chengdu', name: null, check_in: null, check_out: null, notes: '' };
    if (problem === 'long notes') d.notes = 'x'.repeat(601);
    if (problem === 'empty day') d.stops = [];
    expect(itineraryPlanSchema.safeParse(candidate).success).toBe(false);
  });

  it('allows unknown transfer times without treating them as verified zero-minute travel', () => {
    const candidate = schedule();
    candidate.days[0]!.stops[2]!.travel_from_previous!.duration_minutes = null;
    expect(itineraryPlanSchema.parse(candidate).days[0]!.stops[2]!.travel_from_previous!.duration_minutes).toBeNull();
  });

  it('checks both uninterrupted and total daily driving estimates', () => {
    const candidate = schedule();
    for (const s of candidate.days[0]!.stops) {
      s.time_kind = 'suggested';
      s.arrival_time = null;
      s.travel_from_previous = { mode: 'driving', duration_minutes: 70, notes: 'Estimate' };
    }
    expect(itineraryPlanSchema.safeParse(candidate).success).toBe(false);
    candidate.roadtrip_preferences = { roadtrip_day_minutes: 240, roadtrip_leg_minutes: 60 };
    expect(itineraryPlanSchema.safeParse(candidate).success).toBe(false);
    candidate.roadtrip_preferences.roadtrip_leg_minutes = 90;
    expect(itineraryPlanSchema.safeParse(candidate).success).toBe(true);
  });

  it('refuses activities that run past midnight, even without start times', () => {
    const candidate = schedule();
    candidate.days[0]!.stops[2]!.arrival_time = '23:50';
    expect(itineraryPlanSchema.safeParse(candidate).success).toBe(false);
    expect(itineraryStopEndTime(candidate.days[0]!.stops[2]!)).toBeNull();
    for (const s of candidate.days[0]!.stops) {
      s.time_kind = 'suggested';
      s.arrival_time = null;
      s.duration_minutes = 500;
    }
    expect(itineraryPlanSchema.safeParse(candidate).success).toBe(false);
    expect(itineraryStopEndTime(candidate.days[0]!.stops[0]!)).toBeNull();
  });

  it('does not let a model fabricate a hotel location', () => {
    const candidate = schedule();
    candidate.days.unshift({
      ...day(),
      stops: [{ ...candidate.days[0]!.stops[0]!, id: 'earlier-meal' }],
      stay: { area: 'Chengdu', name: 'Example hotel', check_in: '16:00', check_out: '09:00', notes: '', location },
    });
    expect(itineraryPlanSchema.safeParse(candidate).success).toBe(true);
    expect(itineraryModelPlanSchema.safeParse(candidate).success).toBe(false);
  });
});
