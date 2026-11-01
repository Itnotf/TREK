import type { ItineraryDraft, ItineraryPlan, TripGuideResponse } from '@trek/shared';
import { buildAssignment, buildDay, buildPlace } from './factories';

export function buildSavedGuide(plan: ItineraryPlan | null = buildGuideDraft().plan): TripGuideResponse {
  return {
    plan,
    status: plan ? 'unchanged' : 'unverified',
    current: {
      title: plan?.title ?? 'Manual trip',
      start_date: plan?.start_date ?? null,
      end_date: null,
      currency: 'CNY',
      accommodations: [],
      reservations: [],
      days: (plan?.days ?? [{ title: 'Free day', stops: [] }]).map((day, index) =>
        buildDay({
          id: index + 1,
          trip_id: 31,
          day_number: index + 1,
          title: day.title,
          notes_items: [],
          assignments: day.stops.map((stop, i) =>
            buildAssignment({
              id: i + 1,
              day_id: index + 1,
              order_index: i,
              place: buildPlace({
                name: stop.name,
                description: stop.description,
                place_time: stop.arrival_time,
                duration_minutes: stop.duration_minutes,
                end_time: '17:30',
              }),
            })
          ),
        })
      ),
    },
  };
}

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

export function buildGuideDraft(): ItineraryDraft {
  const draft = buildItineraryDraft();
  draft.plan.guide = {
    route: 'Chengdu → Kangding old town → Chengdu',
    rationale: 'Keep the first afternoon easy and stay close to the riverside.',
    highlights: ['Explore the old streets and their tea houses'],
    budget: {
      scope: 'Two people, one night; estimate only',
      estimate: 'CNY 800–1,100, excluding transport',
      breakdown: [
        { category: 'Accommodation', estimate: 'CNY 300–500', notes: 'A planning allowance, not a live hotel quote.' },
      ],
    },
    preparation: ['Check road conditions before leaving'],
  };
  draft.plan.days[0].guide = {
    overview: 'Spend the afternoon discovering the riverside streets at an unhurried pace.',
    dining: 'Try local noodles near the river; choose a quieter restaurant away from the main square.',
    accommodation: 'Stay near the river for an easy walk back; ask for a quiet room.',
    alternative: 'If it rains, spend the afternoon in a tea house instead.',
  };
  return draft;
}
