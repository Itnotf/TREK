import { MemoryRouter, useLocation, useNavigate } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { useBackNavigation } from './useBackNavigation';

function Navigation() {
  const back = useBackNavigation('/dashboard');
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
      <output>{location.pathname}</output>
      <button onClick={back}>Back</button>
      <button onClick={() => { void navigate(-1); }}>Browser Back</button>
    </>
  );
}

afterEach(() => window.history.replaceState(null, '', '/'));

describe('useBackNavigation', () => {
  it('returns to the actual previous app page', () => {
    window.history.replaceState({ idx: 1 }, '', '/');
    render(
      <MemoryRouter initialEntries={['/trips/7/guide', '/trips/7']}>
        <Navigation />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('status')).toHaveTextContent('/trips/7/guide');
  });

  it.each([null, { idx: 0 }])('replaces a direct visit with the fallback (%j)', (state) => {
    window.history.replaceState(state, '', '/');
    render(
      <MemoryRouter initialEntries={['/trips/7']}>
        <Navigation />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('status')).toHaveTextContent('/dashboard');
    fireEvent.click(screen.getByRole('button', { name: 'Browser Back' }));
    expect(screen.getByRole('status')).toHaveTextContent('/dashboard');
  });
});
