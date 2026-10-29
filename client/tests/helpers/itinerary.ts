import type { ItineraryDraft } from '@trek/shared';

export function buildItineraryDraft(overrides: Partial<ItineraryDraft> = {}): ItineraryDraft {
  return {
    id: 7,
    thread_id: 21,
    revision: 1,
    latest_revision: 1,
    created_trip_id: null,
    plan: {
      title: 'Western Sichuan',
      summary: 'A relaxed drive from Chengdu.',
      start_date: null,
      currency: 'CNY',
      transport_mode: 'driving',
      requirements: ['Keep driving under four hours a day'],
      assumptions: ['Travel dates are flexible'],
      days: [
        {
          title: 'Arrive in Kangding',
          overnight_city: 'Kangding',
          notes: 'Take time to rest after the drive.',
          stops: [
            {
              name: 'Old town',
              city: 'Kangding',
              description: 'Walk along the river and explore the old streets.',
              arrival_time: '16:00',
              duration_minutes: 90,
            },
          ],
        },
      ],
    },
    ...overrides,
  };
}
