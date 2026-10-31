import userEvent from '@testing-library/user-event';
import { Mountain } from 'lucide-react';
import { useLocation } from 'react-router';

import { fireEvent, render, screen, waitFor } from '../../../tests/helpers/render';
import { resetAllStores } from '../../../tests/helpers/store';
import TripNavigation from './TripNavigation';

const tabs = [
  { id: 'plan', label: 'Daily itinerary' },
  { id: 'tour-planner', label: 'Walking & outdoor routes', icon: Mountain },
  { id: 'transports', label: 'Transports' },
];

beforeEach(() => resetAllStores());

describe('TripNavigation', () => {
  it('puts the guide and daily itinerary first and opens outdoor routing from More', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TripNavigation tripId={5} tabs={tabs} activeTab="plan" onChange={onChange} />);
    expect(screen.getByRole('link', { name: 'Plan together' })).toHaveAttribute('href', '/trips/5/planning');
    expect(screen.getByRole('link', { name: 'Travel guide' })).toHaveAttribute('href', '/trips/5/guide');
    expect(screen.getByRole('button', { name: 'Daily itinerary' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Walking & outdoor routes' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'More' }));
    expect(screen.getByText(/can be added as activities in the daily itinerary/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Walking & outdoor routes' }));
    expect(onChange).toHaveBeenCalledWith('tour-planner');
    expect(screen.getByRole('button', { name: 'More' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps the current outdoor tool named and the daily itinerary available', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TripNavigation tripId={5} tabs={tabs} activeTab="tour-planner" onChange={onChange} />);
    expect(screen.getByRole('button', { name: 'Walking & outdoor routes' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Daily itinerary' }));
    expect(onChange).toHaveBeenCalledWith('plan');
  });

  it('omits the outdoor tool when it is not enabled or has been replaced', () => {
    render(<TripNavigation tripId={5} tabs={tabs.filter((tab) => tab.id !== 'tour-planner')} activeTab="plan" />);
    expect(screen.queryByRole('button', { name: 'More' })).not.toBeInTheDocument();
  });

  it('closes the tools on Escape and restores keyboard focus', async () => {
    render(<TripNavigation tripId={5} tabs={tabs} activeTab="plan" />);
    const trigger = screen.getByRole('button', { name: 'More' });
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Walking & outdoor routes' })).toHaveFocus());
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('provides a working daily itinerary link from the guide even without planner tabs', async () => {
    function Location() {
      return <output>{useLocation().pathname}</output>;
    }
    const user = userEvent.setup();
    render(
      <>
        <TripNavigation tripId={5} />
        <Location />
      </>,
      { initialEntries: ['/trips/5/guide'] }
    );
    expect(screen.getByRole('link', { name: 'Travel guide' })).toHaveAttribute('aria-current', 'page');
    await user.click(screen.getByRole('button', { name: 'Daily itinerary' }));
    expect(screen.getByRole('status')).toHaveTextContent('/trips/5');
  });
});
