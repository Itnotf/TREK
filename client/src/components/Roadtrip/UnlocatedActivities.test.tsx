import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { TranslationProvider } from '../../i18n';
import { DEFAULT_SETTINGS, useSettingsStore } from '../../store/settingsStore';
import { UnlocatedActivities } from './UnlocatedActivities';

const activities = [
  {
    assignmentId: 1,
    dayId: 1,
    dayNumber: 1,
    name: 'Lunch near the old town',
    time: '12:00',
    leaveAt: '12:50',
    dwellMinutes: 50,
  },
];
afterEach(() => {
  cleanup();
  useSettingsStore.setState({ settings: { ...DEFAULT_SETTINGS } });
});

it('keeps unresolved meal duration visible with an incomplete-routing explanation', async () => {
  useSettingsStore.setState({ settings: { ...DEFAULT_SETTINGS, language: 'en' } });
  render(
    <TranslationProvider>
      <UnlocatedActivities activities={activities} minutes={50} />
    </TranslationProvider>
  );
  expect(await screen.findByText('Locations to choose')).toBeInTheDocument();
  expect(screen.getByText(/These activities reserve 50 min/)).toBeInTheDocument();
  expect(screen.getByText(/12:00–12:50/)).toBeInTheDocument();
});

it('explains the pending locations and preserved time in Chinese', async () => {
  useSettingsStore.setState({ settings: { ...DEFAULT_SETTINGS, language: 'zh' } });
  render(
    <TranslationProvider>
      <UnlocatedActivities activities={activities} minutes={50} />
    </TranslationProvider>
  );
  expect(await screen.findByText('待选地点的活动')).toBeInTheDocument();
  expect(screen.getByText(/这些活动需预留 50 min/)).toBeInTheDocument();
});
