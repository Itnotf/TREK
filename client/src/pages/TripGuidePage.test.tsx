import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildAssignment, buildDay, buildPlace, buildReservation } from '../../tests/helpers/factories';
import { buildGuideDraft, buildSavedGuide } from '../../tests/helpers/itinerary';
import { server } from '../../tests/helpers/msw/server';
import { fireEvent, render, screen } from '../../tests/helpers/render';
import { addListener, subscribeTripRefetch } from '../api/websocket';
import { _resetNetworkMode, setForcedOffline } from '../sync/networkMode';
import TripGuidePage from './TripGuidePage';

vi.mock('../components/Layout/Navbar', () => ({ default: () => null }));
vi.mock('../api/websocket', () => ({
  joinTrip: vi.fn(),
  leaveTrip: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  subscribeTripRefetch: vi.fn(() => vi.fn()),
  getSocketId: () => null,
}));

function show(id = '31') {
  return render(
    <Routes>
      <Route path="/trips/:id/guide" element={<TripGuidePage />} />
    </Routes>,
    {
      initialEntries: [`/trips/${id}/guide`],
    }
  );
}

beforeEach(() => _resetNetworkMode());
afterEach(() => {
  _resetNetworkMode();
  vi.restoreAllMocks();
});

describe('saved trip guide', () => {
  it('shows current moved activities, actual time and bookings while keeping outdated prose folded', async () => {
    const response = buildSavedGuide();
    response.status = 'changed';
    response.current.title = 'Updated trip';
    response.current.days = [
      buildDay({ id: 1, trip_id: 31, title: 'Free morning', assignments: [] }),
      buildDay({
        id: 2,
        trip_id: 31,
        day_number: 2,
        title: 'Afternoon visit',
        assignments: [
          buildAssignment({
            id: 9,
            day_id: 2,
            assignment_time: '13:30',
            assignment_end_time: '14:30',
            place: buildPlace({
              name: 'New museum',
              description: 'See the local history collection.',
              place_time: '09:00',
            }),
          }),
        ],
      }),
    ];
    response.current.reservations = [
      buildReservation({
        id: 10,
        trip_id: 31,
        day_id: 2,
        title: 'Return train',
        type: 'train',
        status: 'confirmed',
        reservation_time: '18:00',
      }),
    ];
    server.use(http.get('/api/trips/31/guide', () => HttpResponse.json(response)));
    show();
    expect(await screen.findByRole('heading', { level: 1, name: 'Updated trip' })).toBeVisible();
    expect(screen.getAllByText(/13:30 – 14:30/)[0]).toBeVisible();
    expect(screen.getAllByText('See the local history collection.')[0]).toBeVisible();
    expect(screen.getAllByRole('heading', { name: 'Return train' }).slice(-1)[0]).toBeVisible();
    const original = screen.getByText('Initial guide · reference').closest('details');
    expect(original).not.toHaveAttribute('open');
    const route = response.plan?.guide?.route;
    if (!route) throw new Error('Guide fixture missing');
    expect(screen.getByText(route)).not.toBeVisible();
    fireEvent.click(screen.getByText('Initial guide · reference'));
    expect(screen.getByText(route)).toBeVisible();
  });

  it('reloads current data when returning to the page and clears it after access is revoked', async () => {
    let response = buildSavedGuide();
    let denied = false;
    server.use(
      http.get('/api/trips/31/guide', () =>
        denied ? new HttpResponse(null, { status: 403 }) : HttpResponse.json(response)
      )
    );
    show();
    await screen.findByRole('heading', { level: 1, name: 'Western Sichuan' });
    response = {
      ...response,
      status: 'changed',
      current: { ...response.current, title: 'After another traveller edited' },
    };
    const listener = vi.mocked(addListener).mock.calls.slice(-1)[0]?.[0];
    if (!listener) throw new Error('Missing trip subscription');
    listener({ type: 'assignment:moved', tripId: 31 });
    expect(await screen.findByRole('heading', { level: 1, name: 'After another traveller edited' })).toBeVisible();
    response = { ...response, current: { ...response.current, title: 'After returning to the page' } };
    fireEvent(window, new Event('focus'));
    expect(await screen.findByRole('heading', { level: 1, name: 'After returning to the page' })).toBeVisible();
    response = { ...response, current: { ...response.current, title: 'After reconnecting' } };
    const refetch = vi.mocked(subscribeTripRefetch).mock.calls.slice(-1)[0]?.[0];
    if (!refetch) throw new Error('Missing reconnect subscription');
    refetch('31');
    expect(await screen.findByRole('heading', { level: 1, name: 'After reconnecting' })).toBeVisible();
    denied = true;
    listener({ type: 'member:removed', tripId: 31 });
    expect(await screen.findByRole('alert')).toHaveTextContent('This trip is unavailable');
    expect(screen.queryByText('After reconnecting')).not.toBeInTheDocument();
  });

  it('loads the saved guide on a direct visit and exposes experiences before detailed times', async () => {
    const plan = buildGuideDraft().plan;
    plan.days[0].stay = {
      area: 'Kangding riverside',
      name: null,
      check_in: '17:45',
      check_out: '10:00',
      notes: 'Ask for two quiet rooms.',
    };
    const guide = plan.guide;
    const dayGuide = plan.days[0].guide;
    if (!guide || !dayGuide) throw new Error('Guide fixture missing');
    server.use(http.get('/api/trips/31/guide', () => HttpResponse.json(buildSavedGuide(plan))));
    show();
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
    expect(await screen.findByRole('heading', { level: 1, name: plan.title })).toBeInTheDocument();
    expect(screen.getByText(guide.route)).toBeVisible();
    expect(screen.getByText(dayGuide.dining)).toBeVisible();
    expect(screen.getByText(dayGuide.accommodation)).toBeVisible();
    expect(screen.getByText(dayGuide.alternative)).toBeVisible();
    expect(screen.getByText(guide.budget.breakdown[0].notes)).toBeVisible();
    expect(screen.getByText(guide.preparation[0])).toBeVisible();
    expect(screen.getAllByText(plan.days[0].stops[0].description)[0]).toBeVisible();
    expect(screen.getByText('Times and transport details').closest('details')).not.toHaveAttribute('open');
    expect(screen.getByText('Your preferences, assumptions and sources').closest('details')).not.toHaveAttribute(
      'open'
    );
    expect(screen.getByText('Places, times and stays follow your daily itinerary.')).toBeVisible();
    for (const link of screen.getAllByRole('link', { name: 'Open daily itinerary' }))
      expect(link).toHaveAttribute('href', '/trips/31');
    fireEvent.click(screen.getByText('Times and transport details'));
    expect(screen.getByText('16:00 – 17:30')).toBeVisible();
    expect(screen.getByText(/17:45.*10:00/)).toBeVisible();
    expect(screen.getByText('Ask for two quiet rooms.')).toBeInTheDocument();
  });

  it('keeps old trips usable without inventing a guide', async () => {
    server.use(http.get('/api/trips/31/guide', () => HttpResponse.json(buildSavedGuide(null))));
    show();
    expect(await screen.findByRole('heading', { level: 1, name: 'Manual trip' })).toBeVisible();
    expect(screen.getByText('No places for this day yet')).toBeVisible();
    expect(screen.getAllByRole('link', { name: 'Open daily itinerary' })[0]).toHaveAttribute('href', '/trips/31');
    expect(screen.queryByText('Estimated budget')).not.toBeInTheDocument();
  });

  it('does not show guide contents when access is refused', async () => {
    server.use(http.get('/api/trips/31/guide', () => new HttpResponse(null, { status: 403 })));
    show();
    expect(await screen.findByRole('alert')).toHaveTextContent('This trip is unavailable or you do not have access');
    expect(screen.queryByText('The route')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
  });

  it('recovers from an offline visit without showing a fabricated empty guide', async () => {
    setForcedOffline(true);
    server.use(http.get('/api/trips/31/guide', () => HttpResponse.json(buildSavedGuide())));
    show();
    expect(await screen.findByRole('alert')).toHaveTextContent('Check your connection');
    setForcedOffline(false);
    fireEvent.click(screen.getByRole('button'));
    expect(await screen.findByRole('heading', { level: 1, name: 'Western Sichuan' })).toBeInTheDocument();
  });

  it('rejects malformed saved guides at the read boundary and allows a retry', async () => {
    server.use(http.get('/api/trips/31/guide', () => HttpResponse.json({ plan: { title: 'Malformed' } })));
    show();
    expect(await screen.findByRole('alert')).toHaveTextContent('The guide could not be loaded');
    expect(screen.queryByText('Malformed')).not.toBeInTheDocument();
  });

  it('rejects an invalid trip identifier without a request', async () => {
    const handler = vi.fn();
    server.use(http.get('/api/trips/:id/guide', handler));
    show('invalid');
    expect(screen.getByRole('alert')).toHaveTextContent('This trip is unavailable');
    expect(handler).not.toHaveBeenCalled();
  });
});
