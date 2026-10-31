import { itineraryPlanSchema, type TripPlanningRevision, type TripPlanningState } from '@trek/shared';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildUser } from '../../tests/helpers/factories';
import { buildGuideDraft } from '../../tests/helpers/itinerary';
import { server } from '../../tests/helpers/msw/server';
import { act, fireEvent, render, screen, waitFor } from '../../tests/helpers/render';
import { addListener } from '../api/websocket';
import { useAuthStore } from '../store/authStore';
import TripPlanningPage from './TripPlanningPage';

vi.mock('../components/Layout/Navbar', () => ({ default: () => null }));
vi.mock('../api/websocket', () => ({
  joinTrip: vi.fn(),
  leaveTrip: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  subscribeTripRefetch: vi.fn(() => vi.fn()),
  getSocketId: () => null,
  connect: vi.fn(),
  disconnect: vi.fn(),
  setRefetchCallback: vi.fn(),
  setPreReconnectHook: vi.fn(),
}));
vi.mock('../components/Collab/CollabChat', () => ({
  default: ({ tripId, canEdit }: { tripId: number; canEdit: boolean }) => (
    <div aria-label="Shared trip chat" data-trip-id={tripId} data-can-send={String(canEdit)} />
  ),
}));
vi.mock('../components/Trips/TripMembersModal', () => ({ default: () => null }));

function revision(number = 1, kind: 'discussion' | 'detailed' = 'detailed'): TripPlanningRevision {
  const draft = buildGuideDraft();
  draft.plan.schedule_version = 2;
  draft.plan.days[0].stay = null;
  draft.plan.days[0].stops[0] = {
    ...draft.plan.days[0].stops[0],
    id: 'old-town',
    kind: 'visit',
    time_kind: 'suggested',
    travel_from_previous: null,
  };
  return {
    id: number,
    revision: number,
    kind,
    created_at: '2026-10-31T10:00:00Z',
    created_by: 1,
    summary: `A shared plan, version ${number}`,
    questions: [],
    agreements: ['Easy walks for our parents'],
    disagreements: ['Choose a hotel area'],
    changes: number > 1 ? ['Made day three easier'] : [],
    outline: [{ day: 1, title: 'Discover the riverside', description: 'An easy day with local food.' }],
    plan: kind === 'detailed' ? itineraryPlanSchema.parse(draft.plan) : null,
  };
}

function state(overrides: Partial<TripPlanningState> = {}): TripPlanningState {
  return {
    trip_id: 31,
    title: 'Family road trip',
    revision: 0,
    phase: 'discussion',
    can_confirm: true,
    can_discuss: true,
    is_owner: true,
    collaborators: [],
    members: [
      { id: 1, username: 'Organiser' },
      { id: 2, username: 'Parent' },
    ],
    latest: null,
    confirmed_revision: null,
    baseline_changed: false,
    ai_available: true,
    ai_privacy_required: false,
    ...overrides,
  };
}

function show(id = '31') {
  return render(
    <Routes>
      <Route path="/trips/:id/planning" element={<TripPlanningPage />} />
    </Routes>,
    {
      initialEntries: [`/trips/${id}/planning`],
    }
  );
}

beforeEach(() => {
  useAuthStore.setState({ user: buildUser({ id: 1, username: 'Organiser' }), isAuthenticated: true });
});

describe('shared trip planning', () => {
  it('lets a solo organiser generate without a member vote and confirms only after a separate action', async () => {
    let current = state();
    const generated: unknown[] = [];
    const confirmed: unknown[] = [];
    server.use(
      http.get('/api/trips/31/planning', () => HttpResponse.json(current)),
      http.post('/api/trips/31/planning/generate', async ({ request }) => {
        generated.push(await request.json());
        current = state({ revision: 1, phase: 'detailed', latest: revision() });
        return HttpResponse.json(current);
      }),
      http.post('/api/trips/31/planning/confirm', async ({ request }) => {
        confirmed.push(await request.json());
        current = { ...current, phase: 'confirmed', confirmed_revision: 1 };
        return HttpResponse.json(current);
      })
    );
    show();
    await screen.findByText('What would make this a good trip?');
    expect(screen.getByLabelText('Shared trip chat')).toHaveAttribute('data-trip-id', '31');
    expect(screen.getByLabelText('Shared trip chat')).toHaveAttribute('data-can-send', 'true');
    fireEvent.change(screen.getByLabelText('Anything to add or change? (optional)'), {
      target: { value: 'Keep walks short' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create detailed plan' }));
    await screen.findByText('A shared plan, version 1');
    expect(generated).toEqual([{ mode: 'detailed', base_revision: 0, instruction: 'Keep walks short' }]);
    expect(confirmed).toHaveLength(0);
    expect(screen.getByLabelText('Anything to add or change? (optional)')).toHaveValue('');
    fireEvent.click(screen.getByRole('button', { name: 'Confirm and update itinerary' }));
    await screen.findByText('Confirmed itinerary');
    expect(confirmed).toEqual([{ revision: 1 }]);
    expect(screen.getByRole('button', { name: 'Revise detailed plan' })).toBeEnabled();
  });

  it('shows the same plan to ordinary members without confirmation or collaborator controls', async () => {
    server.use(
      http.get('/api/trips/31/planning', () =>
        HttpResponse.json(
          state({
            can_confirm: false,
            is_owner: false,
            revision: 1,
            phase: 'detailed',
            latest: revision(),
          })
        )
      )
    );
    show();
    await screen.findByText('A shared plan, version 1');
    expect(screen.queryByRole('button', { name: 'Confirm and update itinerary' })).not.toBeInTheDocument();
    expect(screen.queryByText('Who can confirm the itinerary')).not.toBeInTheDocument();
    expect(screen.getByText(/The organiser or a collaborator confirms/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Revise detailed plan' })).toBeEnabled();
  });

  it('shows the confirmed state and keeps draft-only claims inside a folded discussion record', async () => {
    const proposal = revision();
    proposal.summary = 'This draft has not changed the formal itinerary.';
    proposal.disagreements = ['Choose a hotel area before confirming'];
    server.use(
      http.get('/api/trips/31/planning', () =>
        HttpResponse.json(state({ revision: 1, phase: 'confirmed', confirmed_revision: 1, latest: proposal }))
      )
    );
    show();
    expect(await screen.findByText('Confirmed itinerary')).toBeVisible();
    expect(screen.getByText(/This version has been applied/)).toBeVisible();
    const draftClaim = screen.getByText(proposal.summary);
    const record = draftClaim.closest('details');
    expect(record).not.toHaveAttribute('open');
    expect(draftClaim).not.toBeVisible();
    expect(screen.getByText('Choose a hotel area before confirming')).not.toBeVisible();
    expect(screen.getByRole('heading', { name: 'The route' })).toBeVisible();
    const disclosure = record?.querySelector('summary');
    if (!disclosure) throw new Error('Missing discussion record disclosure');
    fireEvent.click(disclosure);
    expect(draftClaim).toBeVisible();
  });

  it('keeps formal itinerary changes visible and refuses a stale confirmation with a useful recovery', async () => {
    let current = state({ revision: 1, phase: 'detailed', latest: revision() });
    server.use(
      http.get('/api/trips/31/planning', () => HttpResponse.json(current)),
      http.post('/api/trips/31/planning/confirm', () => {
        current = { ...current, baseline_changed: true };
        return HttpResponse.json({ error: 'changed', code: 'baseline_changed' }, { status: 409 });
      })
    );
    show();
    fireEvent.click(await screen.findByRole('button', { name: 'Confirm and update itinerary' }));
    await screen.findByText(/The itinerary changed after this proposal was prepared/);
    expect(screen.getByRole('button', { name: 'Confirm and update itinerary' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Revise detailed plan' })).toBeEnabled();
  });

  it('reloads shared revisions on another member’s update and clears all content after access is revoked', async () => {
    let current = state({ revision: 1, phase: 'detailed', latest: revision() });
    let denied = false;
    server.use(
      http.get('/api/trips/31/planning', () =>
        denied ? HttpResponse.json({ error: 'Trip not found' }, { status: 404 }) : HttpResponse.json(current)
      )
    );
    show();
    await screen.findByText('A shared plan, version 1');
    const listener = vi.mocked(addListener).mock.calls.slice(-1)[0]?.[0];
    if (!listener) throw new Error('Missing trip listener');
    current = state({ revision: 2, phase: 'detailed', latest: revision(2) });
    act(() => listener({ type: 'planning:updated', tripId: 31 }));
    await screen.findByText('A shared plan, version 2');
    denied = true;
    act(() => listener({ type: 'member:removed', tripId: 31 }));
    await screen.findByText('This trip is unavailable or you no longer have access.');
    expect(screen.queryByText('A shared plan, version 2')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Shared trip chat')).not.toBeInTheDocument();
  });

  it('keeps historical versions read only and requires returning to the latest proposal before confirming', async () => {
    const first = revision(1, 'discussion');
    const second = revision(2);
    server.use(
      http.get('/api/trips/31/planning', () =>
        HttpResponse.json(state({ revision: 2, phase: 'detailed', latest: second }))
      ),
      http.get('/api/trips/31/planning/history', () => HttpResponse.json({ revisions: [second, first] }))
    );
    show();
    fireEvent.click(await screen.findByRole('button', { name: 'View version history' }));
    fireEvent.click(await screen.findByRole('button', { name: /Version 1/ }));
    await screen.findByText('A shared plan, version 1');
    expect(screen.queryByRole('button', { name: 'Confirm and update itinerary' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Revise detailed plan' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Return to current plan' }));
    expect(screen.getByText('A shared plan, version 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm and update itinerary' })).toBeEnabled();
  });

  it('lets the organiser explicitly choose joined collaborators', async () => {
    let current = state();
    const requests: unknown[] = [];
    server.use(
      http.get('/api/trips/31/planning', () => HttpResponse.json(current)),
      http.put('/api/trips/31/planning/collaborators', async ({ request }) => {
        requests.push(await request.json());
        current = { ...current, collaborators: [2] };
        return HttpResponse.json(current);
      })
    );
    show();
    fireEvent.click(await screen.findByText('Who can confirm the itinerary', { selector: 'summary' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Parent' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save collaborators' }));
    await waitFor(() => expect(requests).toEqual([{ user_ids: [2] }]));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save collaborators' })).toBeDisabled());
  });

  it('explains unavailable AI while keeping discussion available and never calls AI automatically', async () => {
    const generate = vi.fn();
    server.use(
      http.get('/api/trips/31/planning', () => HttpResponse.json(state({ ai_available: false }))),
      http.post('/api/trips/31/planning/generate', generate)
    );
    show();
    await screen.findByText('AI is unavailable for this account. You can keep discussing and viewing the plan.');
    expect(screen.getByRole('button', { name: 'Create detailed plan' })).toBeDisabled();
    expect(screen.getByLabelText('Shared trip chat')).toHaveAttribute('data-can-send', 'true');
    expect(generate).not.toHaveBeenCalled();
  });

  it('does not fetch an invalid trip identifier', () => {
    const get = vi.fn();
    server.use(http.get('/api/trips/:id/planning', get));
    show('invalid');
    expect(screen.getByRole('alert')).toHaveTextContent('This trip is unavailable');
    expect(get).not.toHaveBeenCalled();
  });

  it('requires the existing AI acknowledgement before enabling generation', async () => {
    let current = state({ ai_privacy_required: true });
    const acknowledgements: unknown[] = [];
    server.use(
      http.get('/api/trips/31/planning', () => HttpResponse.json(current)),
      http.get('/api/ai/status', () => HttpResponse.json({ effective: { kind: 'custom', host: 'models.example' } })),
      http.post('/api/ai/privacy-ack', async ({ request }) => {
        acknowledgements.push(await request.json());
        current = { ...current, ai_privacy_required: false };
        return HttpResponse.json({ success: true });
      })
    );
    show();
    await screen.findByText('Before using AI');
    expect(screen.getByRole('button', { name: 'Create detailed plan' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Allow AI for my requests' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Create detailed plan' })).toBeEnabled());
    expect(acknowledgements).toEqual([{ kind: 'custom', host: 'models.example' }]);
  });
});
