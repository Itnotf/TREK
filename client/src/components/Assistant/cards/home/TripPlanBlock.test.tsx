import type { AssistantMessage, TripPlanCard, TripPlanningState } from '@trek/shared';
import assistantHome from '@trek/shared/i18n/en';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildTrip } from '../../../../../tests/helpers/factories';
import { buildGuideDraft, buildItineraryDraft } from '../../../../../tests/helpers/itinerary';
import { act, fireEvent, render, screen, waitFor } from '../../../../../tests/helpers/render';
import { seedStore } from '../../../../../tests/helpers/store';
import { tripPlanRepo } from '../../../../repo/tripPlanRepo';
import { tripPlanningRepo } from '../../../../repo/tripPlanningRepo';
import { useAssistantStore } from '../../../../store/assistantStore';
import { _resetNetworkMode, setForcedOffline } from '../../../../sync/networkMode';
import { AssistantViewContext } from '../../assistantViewContext';
import { TripPlanBlock } from './TripPlanBlock';

const CARD: TripPlanCard = {
  kind: 'tripPlan',
  draftId: 7,
  revision: 1,
  title: 'Western Sichuan',
  summary: 'A relaxed drive from Chengdu.',
  dayCount: 1,
};
const initial = useAssistantStore.getState();
const copy = (key: string) => assistantHome[`assistant.plan.${key}`] ?? `assistant.plan.${key}`;

function planningState(overrides: Partial<TripPlanningState> = {}): TripPlanningState {
  return {
    trip_id: 31,
    title: CARD.title,
    revision: 1,
    phase: 'discussion',
    can_confirm: true,
    can_discuss: true,
    is_owner: true,
    collaborators: [],
    members: [{ id: 1, username: 'Organiser' }],
    latest: {
      id: 1,
      revision: 1,
      kind: 'discussion',
      created_at: '2026-10-31T10:00:00Z',
      created_by: 1,
      summary: CARD.summary,
      questions: [],
      agreements: [],
      disagreements: [],
      outline: [],
      changes: [],
      plan: null,
    },
    confirmed_revision: null,
    baseline_changed: false,
    ai_available: true,
    ai_privacy_required: false,
    ...overrides,
  };
}

async function openPreview() {
  fireEvent.click(await screen.findByText(copy('preview'), { selector: 'summary' }));
}

function show() {
  const onOpen = vi.fn();
  render(
    <AssistantViewContext.Provider value={{ tripId: 0, variant: 'window', onOpen }}>
      <TripPlanBlock cards={[{ toolCallId: 'draft1', card: CARD }]} />
    </AssistantViewContext.Provider>
  );
  return onOpen;
}

beforeEach(() => {
  _resetNetworkMode();
  useAssistantStore.setState({ byTrip: {} });
});
afterEach(() => {
  useAssistantStore.setState(initial, true);
  _resetNetworkMode();
  vi.restoreAllMocks();
});

describe('TripPlanBlock', () => {
  it('shares only the displayed itinerary before formal confirmation and opens the same trip space', async () => {
    vi.spyOn(tripPlanRepo, 'get').mockResolvedValue(buildItineraryDraft());
    const apply = vi.spyOn(tripPlanRepo, 'apply');
    const share = vi.spyOn(tripPlanRepo, 'share').mockResolvedValue(31);
    vi.spyOn(tripPlanningRepo, 'get').mockResolvedValue(planningState());
    const onOpen = show();
    expect(await screen.findByRole('button', { name: copy('confirm') })).toBeVisible();
    expect(screen.getByRole('button', { name: copy('share') })).not.toBeVisible();
    fireEvent.click(screen.getByText(copy('shareOptions'), { selector: 'summary' }));
    fireEvent.click(screen.getByRole('button', { name: copy('share') }));
    await waitFor(() => expect(onOpen).toHaveBeenCalledWith({ kind: 'page', path: '/trips/31/planning' }));
    expect(share).toHaveBeenCalledExactlyOnceWith(7, 1);
    expect(apply).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: copy('openItinerary') }));
    await waitFor(() => expect(onOpen).toHaveBeenCalledTimes(2));
    expect(tripPlanningRepo.get).toHaveBeenCalledWith(31);
    expect(share).toHaveBeenCalledOnce();
    expect(onOpen).toHaveBeenLastCalledWith({ kind: 'page', path: '/trips/31/planning' });
  });

  it.each([
    {
      name: 'an unconfirmed shared plan',
      confirmed_revision: null,
      baseline_changed: false,
      path: '/trips/31/planning',
    },
    { name: 'a confirmed shared plan', confirmed_revision: 1, baseline_changed: false, path: '/trips/31?tab=plan' },
    { name: 'a changed confirmed plan', confirmed_revision: 1, baseline_changed: true, path: '/trips/31/planning' },
  ])(
    'opens $name in the correct place without creating it again',
    async ({ confirmed_revision, baseline_changed, path }) => {
      vi.spyOn(tripPlanRepo, 'get').mockResolvedValue(buildItineraryDraft({ created_trip_id: 31 }));
      vi.spyOn(tripPlanningRepo, 'get').mockResolvedValue(planningState({ confirmed_revision, baseline_changed }));
      const apply = vi.spyOn(tripPlanRepo, 'apply');
      const share = vi.spyOn(tripPlanRepo, 'share');
      const onOpen = show();
      fireEvent.click(await screen.findByRole('button', { name: copy('openItinerary') }));
      await waitFor(() => expect(onOpen).toHaveBeenCalledExactlyOnceWith({ kind: 'page', path }));
      expect(apply).not.toHaveBeenCalled();
      expect(share).not.toHaveBeenCalled();
    }
  );

  it('keeps an existing trip readable when its planning state cannot be checked', async () => {
    vi.spyOn(tripPlanRepo, 'get').mockResolvedValue(buildItineraryDraft({ created_trip_id: 31 }));
    vi.spyOn(tripPlanningRepo, 'get').mockRejectedValue(new Error('Offline'));
    const apply = vi.spyOn(tripPlanRepo, 'apply');
    const onOpen = show();
    fireEvent.click(await screen.findByRole('button', { name: copy('openItinerary') }));
    expect(await screen.findByRole('alert')).toHaveTextContent(copy('applyFailed'));
    expect(screen.getByText(CARD.summary)).toBeVisible();
    expect(screen.getByRole('button', { name: copy('openItinerary') })).toBeEnabled();
    expect(apply).not.toHaveBeenCalled();
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('refreshes a share conflict and reuses the trip created by another request', async () => {
    vi.spyOn(tripPlanRepo, 'get')
      .mockResolvedValueOnce(buildItineraryDraft())
      .mockResolvedValue(buildItineraryDraft({ created_trip_id: 31 }));
    const share = vi.spyOn(tripPlanRepo, 'share').mockRejectedValue(new Error('Conflict'));
    const apply = vi.spyOn(tripPlanRepo, 'apply');
    const onOpen = show();
    await screen.findByRole('button', { name: copy('confirm') });
    fireEvent.click(screen.getByText(copy('shareOptions'), { selector: 'summary' }));
    fireEvent.click(screen.getByRole('button', { name: copy('share') }));
    expect(await screen.findByRole('alert')).toHaveTextContent(copy('applyFailed'));
    await screen.findByRole('button', { name: copy('openItinerary') });
    fireEvent.click(screen.getByRole('button', { name: copy('share') }));
    await waitFor(() => expect(onOpen).toHaveBeenCalledExactlyOnceWith({ kind: 'page', path: '/trips/31/planning' }));
    expect(share).toHaveBeenCalledOnce();
    expect(apply).not.toHaveBeenCalled();
  });

  it('keeps a compact overview visible and reveals the full guide before adopting the itinerary', async () => {
    const draft = buildGuideDraft();
    if (!draft.plan.guide) throw new Error('Guide fixture missing');
    vi.spyOn(tripPlanRepo, 'get').mockResolvedValue(draft);
    vi.spyOn(tripPlanRepo, 'apply').mockResolvedValue(buildTrip({ id: 31 }));
    const onOpen = show();
    expect(await screen.findByText(draft.plan.summary)).toBeVisible();
    expect(screen.getByText(draft.plan.days[0].title)).toBeVisible();
    const preview = screen.getByText(copy('preview'), { selector: 'summary' }).closest('details');
    expect(preview).not.toHaveAttribute('open');
    expect(screen.getByText(draft.plan.guide.rationale)).not.toBeVisible();
    expect(screen.getByRole('button', { name: copy('confirm') })).toBeVisible();
    await openPreview();
    expect(screen.getByText(draft.plan.guide.rationale)).toBeVisible();
    expect(screen.getAllByText(draft.plan.days[0].stops[0].description)[0]).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: copy('confirm') }));
    await waitFor(() => expect(onOpen).toHaveBeenCalledWith({ kind: 'page', path: '/trips/31?tab=plan' }));
  });

  it('shows a full draft, its assumptions, source and unverified locations before any creation', async () => {
    const draft = buildItineraryDraft();
    draft.plan.sources = [{ title: 'Travel guide', url: 'https://example.com/guide', extraction: 'article' }];
    vi.spyOn(tripPlanRepo, 'get').mockResolvedValue(draft);
    const apply = vi.spyOn(tripPlanRepo, 'apply');
    show();
    await openPreview();
    expect(screen.getByText('Day 1 · Arrive in Kangding')).toBeVisible();
    expect(screen.getByText('Overnight in Kangding')).toBeInTheDocument();
    expect(screen.getByText('Walk along the river and explore the old streets.')).toBeInTheDocument();
    expect(screen.getByText('Travel dates are flexible')).toBeInTheDocument();
    expect(screen.getByText('Location not verified yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Travel guide' })).toHaveAttribute('href', 'https://example.com/guide');
    expect(screen.getByText('Version 1')).toBeInTheDocument();
    expect(apply).not.toHaveBeenCalled();
  });

  it('separates suggested and fixed activities, estimated travel and an unbooked stay', async () => {
    const draft = buildItineraryDraft();
    draft.plan.schedule_version = 2;
    draft.plan.days[0].stops = [
      {
        id: 'lunch',
        kind: 'meal',
        time_kind: 'suggested',
        name: 'Lunch by the river',
        city: 'Kangding',
        description: 'Choose a quiet restaurant and try the local noodles.',
        arrival_time: '12:00',
        duration_minutes: 60,
        travel_from_previous: { mode: 'driving', duration_minutes: 45, notes: 'Allow extra time for traffic.' },
      },
      {
        id: 'walk',
        kind: 'visit',
        time_kind: 'fixed',
        name: 'Guided old town walk',
        city: 'Kangding',
        description: 'Meet the guide at the bridge.',
        arrival_time: '14:00',
        duration_minutes: 90,
        travel_from_previous: { mode: 'walking', duration_minutes: null, notes: '' },
        location: { place_id: 'coords:30:102', lat: 30, lng: 102, address: 'Old town bridge' },
      },
    ];
    draft.plan.days[0].stay = {
      area: 'Kangding riverside',
      name: 'Riverside hotel',
      check_in: '17:00',
      check_out: '09:00',
      notes: 'Ask for a quiet room.',
    };
    vi.spyOn(tripPlanRepo, 'get').mockResolvedValue(draft);
    show();
    await openPreview();
    expect(screen.getByText('12:00 – 13:00')).toBeVisible();
    expect(screen.getByText('Suggested time')).toBeInTheDocument();
    expect(screen.getByText('14:00 – 15:30')).toBeInTheDocument();
    expect(screen.getByText('Fixed time')).toBeInTheDocument();
    expect(screen.getByText('Kangding · Meal')).toBeInTheDocument();
    expect(screen.getByText('Estimated 45 min')).toBeInTheDocument();
    expect(screen.getByText('Travel time to confirm')).toBeInTheDocument();
    expect(screen.getByText('Riverside hotel')).toBeInTheDocument();
    expect(screen.getByText('Stay to confirm · not booked')).toBeInTheDocument();
    expect(screen.getByText('Check-in 17:00 · Check-out 09:00')).toBeInTheDocument();
    const description = screen.getByText('Choose a quiet restaurant and try the local noodles.');
    expect(description.closest('details')).not.toHaveAttribute('open');
    fireEvent.click(screen.getByLabelText('Details: Lunch by the river'));
    expect(description.closest('details')).toHaveAttribute('open');
  });

  it('keeps an older draft usable without inventing a time or hotel', async () => {
    const draft = buildItineraryDraft();
    draft.plan.days[0].stops[0].arrival_time = null;
    vi.spyOn(tripPlanRepo, 'get').mockResolvedValue(draft);
    show();
    await openPreview();
    expect(screen.getByText('Time to arrange')).toBeVisible();
    expect(screen.getByText('Kangding · Sightseeing · 90 min')).toBeInTheDocument();
    expect(screen.queryByText('Fixed time')).not.toBeInTheDocument();
    expect(screen.queryByText('Suggested time')).not.toBeInTheDocument();
    expect(screen.getByText('Hotel to choose')).toBeInTheDocument();
    expect(screen.getByText('Stay to confirm · not booked')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: copy('confirm') })).toBeEnabled();
  });

  it('does not turn a return city into an overnight stay when the new draft says no stay', async () => {
    const draft = buildItineraryDraft();
    draft.plan.days[0].stay = null;
    vi.spyOn(tripPlanRepo, 'get').mockResolvedValue(draft);
    show();
    await openPreview();
    await screen.findByText('Day 1 · Arrive in Kangding');
    expect(screen.queryByText('Overnight in Kangding')).not.toBeInTheDocument();
  });

  it('confirms the displayed revision once and opens the actual trip', async () => {
    vi.spyOn(tripPlanRepo, 'get').mockResolvedValue(buildItineraryDraft());
    const trip = buildTrip({ id: 31 });
    vi.spyOn(tripPlanningRepo, 'get').mockResolvedValue(planningState({ latest: null }));
    let finish: (value: typeof trip) => void = () => {};
    const apply = vi.spyOn(tripPlanRepo, 'apply').mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        })
    );
    const onOpen = show();
    const button = await screen.findByRole('button', { name: copy('confirm') });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(apply).toHaveBeenCalledExactlyOnceWith(7, 1);
    expect(button).toBeDisabled();
    await act(async () => {
      finish(trip);
    });
    expect(onOpen).toHaveBeenCalledWith({ kind: 'page', path: '/trips/31?tab=plan' });
    fireEvent.click(screen.getByRole('button', { name: copy('openItinerary') }));
    await waitFor(() => expect(tripPlanningRepo.get).toHaveBeenCalledWith(31));
    expect(apply).toHaveBeenCalledOnce();
    expect(onOpen).toHaveBeenLastCalledWith({ kind: 'page', path: '/trips/31?tab=plan' });
  });

  it('keeps an older revision readable but prevents confirmation when a newer draft arrives', async () => {
    const get = vi.spyOn(tripPlanRepo, 'get').mockResolvedValue(buildItineraryDraft());
    const apply = vi.spyOn(tripPlanRepo, 'apply');
    show();
    await screen.findByRole('button', { name: copy('confirm') });
    const message: AssistantMessage = {
      id: 'a2',
      role: 'assistant',
      status: 'complete',
      createdAt: '2026-10-29T00:00:00.000Z',
      parts: [
        { type: 'data-trek-card', data: { toolCallId: 'empty', card: null } },
        { type: 'data-trek-card', data: { toolCallId: 'draft2', card: { ...CARD, draftId: 8, revision: 2 } } },
      ],
    };
    act(() => {
      seedStore(useAssistantStore, { byTrip: { 0: { messages: [message] } } });
    });
    expect(await screen.findByText(copy('stale'))).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: copy('confirm') })).not.toBeInTheDocument();
    expect(screen.getByText('Old town')).toBeInTheDocument();
    await waitFor(() => expect(get).toHaveBeenCalledTimes(2));
    expect(apply).not.toHaveBeenCalled();
  });

  it('disables confirmation while AI is revising and while offline', async () => {
    vi.spyOn(tripPlanRepo, 'get').mockResolvedValue(buildItineraryDraft());
    show();
    const button = await screen.findByRole('button', { name: copy('confirm') });
    act(() => {
      seedStore(useAssistantStore, { byTrip: { 0: { isRunning: true } } });
    });
    expect(button).toBeDisabled();
    act(() => {
      seedStore(useAssistantStore, { byTrip: { 0: { isRunning: false } } });
      setForcedOffline(true);
    });
    expect(button).toBeDisabled();
    act(() => {
      setForcedOffline(false);
    });
    expect(button).toBeEnabled();
  });

  it('does not offer another creation after the saved trip has been deleted', async () => {
    vi.spyOn(tripPlanRepo, 'get').mockResolvedValue(buildItineraryDraft());
    const apply = vi.spyOn(tripPlanRepo, 'apply').mockRejectedValue({ isAxiosError: true, response: { status: 410 } });
    show();
    fireEvent.click(await screen.findByRole('button', { name: copy('confirm') }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No longer available');
    expect(screen.getByRole('button', { name: copy('confirm') })).toBeDisabled();
    expect(apply).toHaveBeenCalledOnce();
  });

  it('allows retry after a load failure and preserves the draft after a failed confirmation', async () => {
    vi.spyOn(tripPlanRepo, 'get')
      .mockRejectedValueOnce(new Error('unavailable'))
      .mockResolvedValue(buildItineraryDraft());
    const apply = vi.spyOn(tripPlanRepo, 'apply').mockRejectedValue(new Error('conflict'));
    const onOpen = show();
    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }));
    fireEvent.click(await screen.findByRole('button', { name: copy('confirm') }));
    expect(await screen.findByRole('alert')).toHaveTextContent(copy('applyFailed'));
    expect(screen.getByText('Old town')).toBeInTheDocument();
    expect(apply).toHaveBeenCalledOnce();
    expect(onOpen).not.toHaveBeenCalled();
  });
});
