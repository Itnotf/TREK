import { tripGuideCurrentSchema, tripGuideResponseSchema } from './trip-guide.schema';

import { describe, expect, it } from 'vitest';

describe('trip guide read contract', () => {
  const current = {
    title: 'Current trip',
    start_date: null,
    end_date: null,
    currency: 'CNY',
    days: [],
    accommodations: [],
    reservations: [],
  };

  it('allows an ordinary trip with no original AI plan or days yet', () => {
    expect(tripGuideResponseSchema.parse({ plan: null, current, status: 'unverified' }).current).toEqual(current);
  });

  it('accepts long live trips and empty days without applying generation limits', () => {
    const days = Array.from({ length: 90 }, (_, index) => ({ id: index + 1, trip_id: 1, assignments: [] }));
    expect(tripGuideCurrentSchema.parse({ ...current, days }).days).toHaveLength(90);
  });

  it('does not accept missing current data or unrecognized verification status', () => {
    expect(tripGuideResponseSchema.safeParse({ plan: null }).success).toBe(false);
    expect(tripGuideResponseSchema.safeParse({ plan: null, current, status: 'probably-current' }).success).toBe(false);
  });
});
