import type { AssistantMessage, TripPlanCard } from '@trek/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildTrip } from '../../../../../tests/helpers/factories';
import { buildItineraryDraft } from '../../../../../tests/helpers/itinerary';
import { act, fireEvent, render, screen, waitFor } from '../../../../../tests/helpers/render';
import { seedStore } from '../../../../../tests/helpers/store';
import { tripPlanRepo } from '../../../../repo/tripPlanRepo';
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
  it('shows a full draft, its assumptions, source and unverified locations before any creation', async () => {
    const draft = buildItineraryDraft();
    draft.plan.sources = [{ title: 'Travel guide', url: 'https://example.com/guide', extraction: 'article' }];
    vi.spyOn(tripPlanRepo, 'get').mockResolvedValue(draft);
    const apply = vi.spyOn(tripPlanRepo, 'apply');
    show();
    expect(await screen.findByText('Day 1 · Arrive in Kangding')).toBeInTheDocument();
    expect(screen.getByText('Overnight in Kangding')).toBeInTheDocument();
    expect(screen.getByText('Walk along the river and explore the old streets.')).toBeInTheDocument();
    expect(screen.getByText('Travel dates are flexible')).toBeInTheDocument();
    expect(screen.getByText('Location not verified yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Travel guide' })).toHaveAttribute('href', 'https://example.com/guide');
    expect(screen.getByText('Version 1')).toBeInTheDocument();
    expect(apply).not.toHaveBeenCalled();
  });

  it('confirms the displayed revision once and opens the actual trip', async () => {
    vi.spyOn(tripPlanRepo, 'get').mockResolvedValue(buildItineraryDraft());
    const trip = buildTrip({ id: 31 });
    let finish: (value: typeof trip) => void = () => {};
    const apply = vi.spyOn(tripPlanRepo, 'apply').mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        })
    );
    const onOpen = show();
    const button = await screen.findByRole('button', { name: 'Confirm and create trip' });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(apply).toHaveBeenCalledExactlyOnceWith(7, 1);
    expect(button).toBeDisabled();
    await act(async () => {
      finish(trip);
    });
    expect(onOpen).toHaveBeenCalledWith({ kind: 'page', path: '/trips/31' });
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(apply).toHaveBeenCalledOnce();
  });

  it('keeps an older revision readable but prevents confirmation when a newer draft arrives', async () => {
    const get = vi.spyOn(tripPlanRepo, 'get').mockResolvedValue(buildItineraryDraft());
    const apply = vi.spyOn(tripPlanRepo, 'apply');
    show();
    await screen.findByRole('button', { name: 'Confirm and create trip' });
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
    expect(
      await screen.findByText('A newer version is available below. Confirm the latest version to create your trip.')
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Confirm and create trip' })).not.toBeInTheDocument();
    expect(screen.getByText('Old town')).toBeInTheDocument();
    await waitFor(() => expect(get).toHaveBeenCalledTimes(2));
    expect(apply).not.toHaveBeenCalled();
  });

  it('disables confirmation while AI is revising and while offline', async () => {
    vi.spyOn(tripPlanRepo, 'get').mockResolvedValue(buildItineraryDraft());
    show();
    const button = await screen.findByRole('button', { name: 'Confirm and create trip' });
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
    fireEvent.click(await screen.findByRole('button', { name: 'Confirm and create trip' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No longer available');
    expect(screen.getByRole('button', { name: 'Confirm and create trip' })).toBeDisabled();
    expect(apply).toHaveBeenCalledOnce();
  });

  it('allows retry after a load failure and preserves the draft after a failed confirmation', async () => {
    vi.spyOn(tripPlanRepo, 'get')
      .mockRejectedValueOnce(new Error('unavailable'))
      .mockResolvedValue(buildItineraryDraft());
    const apply = vi.spyOn(tripPlanRepo, 'apply').mockRejectedValue(new Error('conflict'));
    const onOpen = show();
    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Confirm and create trip' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not create the trip.');
    expect(screen.getByText('Old town')).toBeInTheDocument();
    expect(apply).toHaveBeenCalledOnce();
    expect(onOpen).not.toHaveBeenCalled();
  });
});
