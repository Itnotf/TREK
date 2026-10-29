import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildGuideDraft } from '../../tests/helpers/itinerary';
import { server } from '../../tests/helpers/msw/server';
import { fireEvent, render, screen } from '../../tests/helpers/render';
import { _resetNetworkMode, setForcedOffline } from '../sync/networkMode';
import TripGuidePage from './TripGuidePage';

vi.mock('../components/Layout/Navbar', () => ({ default: () => null }));

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
    server.use(http.get('/api/trips/31/guide', () => HttpResponse.json({ plan })));
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
    expect(
      screen.getByText('This is the guide you confirmed. For later schedule changes, check the daily itinerary.')
    ).toBeVisible();
    for (const link of screen.getAllByRole('link', { name: 'Open daily itinerary' }))
      expect(link).toHaveAttribute('href', '/trips/31');
    fireEvent.click(screen.getByText('Times and transport details'));
    expect(screen.getByText('16:00 – 17:30')).toBeVisible();
    expect(screen.getByText(/17:45.*10:00/)).toBeVisible();
    expect(screen.getByText('Ask for two quiet rooms.')).toBeInTheDocument();
  });

  it('keeps old trips usable without inventing a guide', async () => {
    server.use(http.get('/api/trips/31/guide', () => HttpResponse.json({ plan: null })));
    show();
    expect(await screen.findByText(/This trip has no saved guide yet/)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Open daily itinerary' })).toHaveAttribute('href', '/trips/31');
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
    server.use(http.get('/api/trips/31/guide', () => HttpResponse.json({ plan: buildGuideDraft().plan })));
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
