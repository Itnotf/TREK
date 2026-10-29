import type { RoadtripPreferences } from '@trek/shared';

export interface RoadtripSetup {
  enabled: boolean;
  origin: string;
  viaCities: string;
  roundTrip: boolean;
  destination: string;
  dailyHours: string;
  vehicle: 'combustion' | 'electric';
  rangeKm: string;
}

export const initialRoadtripSetup = (): RoadtripSetup => ({
  enabled: false,
  origin: '',
  viaCities: '',
  roundTrip: true,
  destination: '',
  dailyHours: '4',
  vehicle: 'combustion',
  rangeKm: '600',
});

type Translate = (key: string) => string;
const hours = (setup: RoadtripSetup) => Number(setup.dailyHours.replace(',', '.'));
const cities = (setup: RoadtripSetup) =>
  setup.viaCities
    .split(/[,，、\n]+/)
    .map((city) => city.trim())
    .filter(Boolean);

export function roadtripSetupError(setup: RoadtripSetup, t: Translate): string | null {
  if (!setup.enabled) return null;
  if (!setup.origin.trim()) return t('dashboard.roadtrip.originRequired');
  if (!setup.roundTrip && !setup.destination.trim()) return t('dashboard.roadtrip.destinationRequired');
  const dailyHours = hours(setup);
  if (!Number.isFinite(dailyHours) || dailyHours < 1 || dailyHours > 12) return t('dashboard.roadtrip.invalidHours');
  const rangeKm = Number(setup.rangeKm);
  if (!Number.isFinite(rangeKm) || rangeKm < 1 || rangeKm > 2000) return t('dashboard.roadtrip.invalidRange');
  return null;
}

/** Cities stay as requirements until the traveller confirms real places and road routes. */
export function roadtripSetupPayload(
  setup: RoadtripSetup,
  description: string,
  t: Translate
): {
  description: string | null;
  roadtrip_preferences?: RoadtripPreferences;
} {
  if (!setup.enabled) return { description: description.trim() || null };
  const viaCities = cities(setup);
  const lines = [
    t('dashboard.roadtrip.summaryTitle'),
    `${t('dashboard.roadtrip.origin')}: ${setup.origin.trim()}`,
    ...(viaCities.length ? [`${t('dashboard.roadtrip.viaCities')}: ${viaCities.join(' → ')}`] : []),
    `${t('dashboard.roadtrip.destination')}: ${setup.roundTrip ? setup.origin.trim() : setup.destination.trim()}`,
    ...(setup.roundTrip ? [t('dashboard.roadtrip.roundTrip')] : []),
    `${t('dashboard.roadtrip.dailyHours')}: ${hours(setup)}`,
    `${t('dashboard.roadtrip.vehicle')}: ${t(setup.vehicle === 'electric' ? 'dashboard.roadtrip.electric' : 'dashboard.roadtrip.combustion')}`,
    `${t('dashboard.roadtrip.rangeKm')}: ${Number(setup.rangeKm)}`,
    t('dashboard.roadtrip.planningInstruction'),
  ];
  return {
    description: [description.trim(), lines.join('\n')].filter(Boolean).join('\n\n'),
    roadtrip_preferences: {
      roadtrip_day_minutes: Math.round(hours(setup) * 60),
      roadtrip_vehicle: setup.vehicle,
      roadtrip_range_km: Number(setup.rangeKm),
      roadtrip_connect_days: true,
      roadtrip_hotel_bookends: true,
    },
  };
}
