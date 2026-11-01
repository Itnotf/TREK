import { expect, it } from 'vitest';
import type { Assignment } from '../../types';
import { asStop } from './roadtripVisits';

const visit = (source: string | null, time: string | null = null, end: string | null = null): Assignment => ({
  id: 1,
  day_id: 2,
  place_id: 3,
  order_index: 0,
  assignment_time: time,
  assignment_end_time: end,
  place: {
    id: 3,
    name: 'Lunch',
    lat: 30,
    lng: 104,
    source,
    place_time: '12:00',
    end_time: '13:00',
    duration_minutes: 60,
  },
});

it('keeps AI visit durations without pinning suggested start or end times', () => {
  expect(asStop(visit('assistant'), 2, 0, [])).toMatchObject({ time: null, leaveAt: null, dwellMinutes: 60 });
  expect(asStop(visit('assistant', '12:30', '13:30'), 2, 0, [])).toMatchObject({ time: '12:30', leaveAt: '13:30' });
});

it('preserves existing manual and imported time anchors', () => {
  for (const source of [null, 'manual', 'osm']) {
    expect(asStop(visit(source), 2, 0, [])).toMatchObject({ time: '12:00', leaveAt: '13:00' });
  }
});
