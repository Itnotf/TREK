import { OPEN_TRIP_CHAT_TOOL, phaseOf } from '../../assistant-home';
import { OPEN_JOURNEY_CHAT_TOOL } from '../../assistant-home-journeys';
import { SAVE_ITINERARY_TOOL } from '../../assistant-planning-tools';
import type { AnswerInput, DomainCards } from '../card-types';
import { itineraryDraftResponseSchema, journalChatCardSchema, tripChatCardSchema, type TrekCard } from '@trek/shared';

/**
 * The home chat's own card: the way into a trip's chat its step offers,
 * built from what the step answered (a trip of the user's, read from their
 * own trips) and checked against the card's schema. Where the trip stands is
 * read again in the user's time zone; "next" stays only for a trip still to
 * come.
 */
export function tripChatAnswer(input: AnswerInput): TrekCard | null {
  const value = (input.value ?? {}) as { trip?: Record<string, unknown>; question?: unknown };
  const trip = value.trip;
  if (!trip) return null;
  const startDate = typeof trip.startDate === 'string' ? trip.startDate : null;
  const endDate = typeof trip.endDate === 'string' ? trip.endDate : null;
  const phase = phaseOf(startDate, endDate, input.today);
  const parsed = tripChatCardSchema.safeParse({
    kind: 'tripChat',
    trip: {
      id: trip.id,
      title: trip.title,
      startDate,
      endDate,
      phase: phase === 'upcoming' && trip.phase === 'next' ? 'next' : phase,
      placeCount: trip.placeCount ?? null,
    },
    question: typeof value.question === 'string' && value.question ? value.question : null,
  });
  return parsed.success ? parsed.data : null;
}

/**
 * The way onto a journal's page its step offers, built from what the step
 * answered (a journal of the user's, read from their own journals) and
 * checked against the card's schema.
 */
export function journalChatAnswer(input: AnswerInput): TrekCard | null {
  const value = (input.value ?? {}) as { journey?: unknown; question?: unknown };
  if (!value.journey) return null;
  const parsed = journalChatCardSchema.safeParse({
    kind: 'journalChat',
    journey: value.journey,
    question: typeof value.question === 'string' && value.question ? value.question : null,
  });
  return parsed.success ? parsed.data : null;
}

export const HOME_CARDS: DomainCards = {
  id: 'home',
  tools: {
    [OPEN_TRIP_CHAT_TOOL]: { answer: tripChatAnswer },
    [OPEN_JOURNEY_CHAT_TOOL]: { answer: journalChatAnswer },
    [SAVE_ITINERARY_TOOL]: { answer: tripPlanAnswer },
  },
};

function tripPlanAnswer(input: AnswerInput): TrekCard | null {
  const result = itineraryDraftResponseSchema.safeParse(input.value);
  if (!result.success) return null;
  const { id, revision, plan } = result.data.draft;
  return {
    kind: 'tripPlan',
    draftId: id,
    revision,
    title: plan.title,
    summary: plan.summary,
    dayCount: plan.days.length,
  };
}
