// FE-MOB-SET-NAV-001 onwards
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Route, Routes } from 'react-router';
import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen, waitFor } from '../../../helpers/render';
import { resetAllStores, seedStore } from '../../../helpers/store';
import { buildSettings } from '../../../helpers/factories';
import { useSettingsStore } from '../../../../src/store/settingsStore';
import { usePluginStore } from '../../../../src/store/pluginStore';
import MSettings from '../../../../src/mobile/screens/settings/MSettings';

describe('MSettings', () => {
  beforeEach(() => {
    window.history.replaceState({ idx: 0 }, '', '/settings');
    resetAllStores();
    seedStore(useSettingsStore, { settings: buildSettings({ language: 'en' }) });
    usePluginStore.setState({ plugins: [], loaded: true });
  });

  afterEach(async () => {
    await new Promise(resolve => setTimeout(resolve, 30));
  });

  it('FE-MOB-SET-NAV-001: opens on General with the section switcher pill', () => {
    render(<MSettings />, { initialEntries: ['/settings'] });

    expect(screen.getByRole('button', { name: /General/ })).toBeInTheDocument();
    expect(screen.getByText('Language & region')).toBeInTheDocument();
  });

  it('FE-MOB-SET-NAV-002: the dropdown lists the sections and switches on tap', async () => {
    const user = userEvent.setup();
    render(<MSettings />, { initialEntries: ['/settings'] });

    await user.click(screen.getByRole('button', { name: /General/ }));
    expect(screen.getByRole('button', { name: 'Appearance' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Account' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Notifications' }));
    // Pill now shows the active section; the General card is gone.
    expect(screen.getByRole('button', { name: /Notifications/ })).toBeInTheDocument();
    expect(screen.queryByText('Language & region')).not.toBeInTheDocument();
  });

  it('returns to the page that opened settings', async () => {
    window.history.replaceState({ idx: 1 }, '', '/settings');
    render(
      <Routes>
        <Route path="/settings" element={<MSettings />} />
        <Route path="/trips/8" element={<div>source trip</div>} />
        <Route path="/dashboard" element={<div>dashboard page</div>} />
      </Routes>,
      { initialEntries: ['/trips/8', '/settings'] },
    );

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    await screen.findByText('source trip');
  });

  it('system Back closes the section list before leaving settings', async () => {
    render(<MSettings />, { initialEntries: ['/settings'] });
    fireEvent.click(screen.getByRole('button', { name: /General/ }));
    expect(screen.getByRole('button', { name: 'Appearance' })).toBeInTheDocument();

    window.history.back();

    await waitFor(() => expect(screen.queryByRole('button', { name: 'Appearance' })).not.toBeInTheDocument());
    expect(screen.getByText('Language & region')).toBeInTheDocument();
  });
});
