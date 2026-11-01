import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StrictMode, useState } from 'react';
import { BrowserRouter, Link, useLocation, useSearchParams } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { initializeMobileBack, useBackLayer } from '../../../src/hooks/useBackLayer';

initializeMobileBack();

function Surface({ name, priority = 40 }: { name: string; priority?: number }) {
  const [open, setOpen] = useState(false);
  useBackLayer(open, () => setOpen(false), priority);
  return <>
    <button onClick={() => setOpen(true)}>Open {name}</button>
    {open && <section aria-label={name}><button onClick={() => setOpen(false)}>Close {name}</button><Link to="/destination" onClick={() => setOpen(false)}>Destination</Link></section>}
  </>;
}

function Location() {
  const { pathname, search } = useLocation();
  return <output data-testid="location">{pathname + search}</output>;
}

async function settle() {
  await new Promise(resolve => setTimeout(resolve, 30));
}

describe('mobile Back layers', () => {
  afterEach(async () => {
    cleanup();
    await settle();
  });

  it('closes only the highest surface, leaving its parent and route in place', async () => {
    window.history.replaceState({ idx: 0 }, '', '/trip');
    render(<BrowserRouter><Location /><Surface name="chat" priority={20} /><Surface name="history" priority={30} /></BrowserRouter>);
    fireEvent.click(screen.getByText('Open chat'));
    fireEvent.click(screen.getByText('Open history'));
    window.history.back();
    await waitFor(() => expect(screen.queryByRole('region', { name: 'history' })).not.toBeInTheDocument());
    expect(screen.getByRole('region', { name: 'chat' })).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/trip');
    window.history.back();
    await waitFor(() => expect(screen.queryByRole('region', { name: 'chat' })).not.toBeInTheDocument());
    expect(window.location.pathname).toBe('/trip');
  });

  it('consumes its temporary entry when a menu navigates, so Back reaches the real page once', async () => {
    window.history.replaceState({ idx: 0 }, '', '/trip');
    function Page() {
      return <><Location />{useLocation().pathname === '/trip' && <Surface name="menu" />}</>;
    }
    render(<BrowserRouter><Page /></BrowserRouter>);
    fireEvent.click(screen.getByText('Open menu'));
    fireEvent.click(screen.getByText('Destination'));
    expect(screen.getByTestId('location')).toHaveTextContent('/destination');
    await settle();
    window.history.back();
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/trip'));
    expect(window.history.state?.trekBackLayer).not.toBe(true);
    expect(screen.queryByRole('region', { name: 'menu' })).not.toBeInTheDocument();
  });

  it('cleans up an explicit close and survives StrictMode without extra Back steps', async () => {
    window.history.replaceState({ idx: 0 }, '', '/trip');
    render(<StrictMode><BrowserRouter><Location /><Surface name="menu" /></BrowserRouter></StrictMode>);
    fireEvent.click(screen.getByText('Open menu'));
    fireEvent.click(screen.getByText('Close menu'));
    await waitFor(() => expect(window.history.state?.trekBackLayer).not.toBe(true));
    fireEvent.click(screen.getByText('Open menu'));
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(window.history.state?.trekBackLayer).not.toBe(true));
    expect(screen.getByTestId('location')).toHaveTextContent('/trip');
  });

  it('preserves a guarded editor when the first Back asks a question', async () => {
    window.history.replaceState({ idx: 0 }, '', '/trip');
    function Editor() {
      const [open, setOpen] = useState(true);
      const [asking, setAsking] = useState(false);
      useBackLayer(open, () => setAsking(true));
      return <>{open && <input aria-label="draft" defaultValue="unsaved text" />}{asking && <button onClick={() => setOpen(false)}>Discard</button>}</>;
    }
    render(<BrowserRouter><Location /><Editor /></BrowserRouter>);
    window.history.back();
    await screen.findByText('Discard');
    expect(screen.getByLabelText('draft')).toHaveValue('unsaved text');
    expect(window.location.pathname).toBe('/trip');
    fireEvent.click(screen.getByText('Discard'));
    await waitFor(() => expect(window.history.state?.trekBackLayer).not.toBe(true));
  });

  it.each(['system', 'button'])('preserves replaced search parameters when closing via %s Back', async (method) => {
    window.history.replaceState({ idx: 0 }, '', '/trip?preview=1');
    function Preview() {
      const [, setSearchParams] = useSearchParams();
      return <><Location /><Surface name="preview" /><button onClick={() => setSearchParams({ preview: '2' }, { replace: true })}>Change preview</button></>;
    }
    render(<BrowserRouter><Preview /></BrowserRouter>);
    fireEvent.click(screen.getByText('Open preview'));
    fireEvent.click(screen.getByText('Change preview'));
    if (method === 'system') window.history.back();
    else fireEvent.click(screen.getByText('Close preview'));
    await waitFor(() => expect(screen.queryByRole('region', { name: 'preview' })).not.toBeInTheDocument());
    await waitFor(() => expect(window.history.state?.trekBackLayer).not.toBe(true));
    expect(window.location.search).toBe('?preview=2');
    expect(screen.getByTestId('location')).toHaveTextContent('/trip?preview=2');
  });

  it('returns to the updated query after navigating from a surface that replaced it', async () => {
    window.history.replaceState({ idx: 0 }, '', '/trip?preview=1');
    function Page() {
      const [, setSearchParams] = useSearchParams();
      return <><Location /><Surface name="menu" /><button onClick={() => setSearchParams({ preview: '2' }, { replace: true })}>Change preview</button></>;
    }
    render(<BrowserRouter><Page /></BrowserRouter>);
    fireEvent.click(screen.getByText('Open menu'));
    fireEvent.click(screen.getByText('Change preview'));
    fireEvent.click(screen.getByText('Destination'));
    await settle();
    window.history.back();
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/trip?preview=2'));
    expect(window.location.search).toBe('?preview=2');
    expect(screen.queryByRole('region', { name: 'menu' })).not.toBeInTheDocument();
  });
});
