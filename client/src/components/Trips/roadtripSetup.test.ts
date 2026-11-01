import en from '@trek/shared/i18n/en';
import zh from '@trek/shared/i18n/zh';
import { describe, expect, it } from 'vitest';
import { initialRoadtripSetup, roadtripSetupError, roadtripSetupPayload } from './roadtripSetup';

const t = (key: string) => en[key] ?? key;
const setup = () => ({
  ...initialRoadtripSetup(),
  enabled: true,
  origin: ' 成都 ',
  viaCities: '乐山，雅安\n康定, 理塘',
});

describe('roadtrip setup', () => {
  it('preserves notes, parses Chinese and English city separators, and returns to the origin', () => {
    const value = setup();
    expect(roadtripSetupError(value, t)).toBeNull();
    const payload = roadtripSetupPayload(value, ' Bring warm clothes. ', t);
    expect(payload.description).toContain('Bring warm clothes.\n\n');
    expect(payload.description).toContain('Departure city: 成都');
    expect(payload.description).toContain('乐山 → 雅安 → 康定 → 理塘');
    expect(payload.description).toContain('Arrival city: 成都');
    expect(payload.description).toContain(t('dashboard.roadtrip.planningInstruction'));
    expect(payload.roadtrip_preferences).toEqual({
      roadtrip_day_minutes: 240,
      roadtrip_vehicle: 'combustion',
      roadtrip_range_km: 600,
      roadtrip_connect_days: true,
      roadtrip_hotel_bookends: true,
    });
  });

  it('uses the chosen destination for a one-way electric trip and localizes its requirements', () => {
    const value = {
      ...setup(),
      roundTrip: false,
      destination: ' 拉萨 ',
      vehicle: 'electric' as const,
      dailyHours: '3,5',
      rangeKm: '350',
    };
    const payload = roadtripSetupPayload(value, '', (key) => zh[key] ?? key);
    expect(roadtripSetupError(value, t)).toBeNull();
    expect(payload.description).toContain('结束城市: 拉萨');
    expect(payload.description).toContain('车辆类型: 电动车');
    expect(payload.description).not.toContain('返回出发城市');
    expect(payload.roadtrip_preferences).toMatchObject({
      roadtrip_day_minutes: 210,
      roadtrip_vehicle: 'electric',
      roadtrip_range_km: 350,
    });
  });

  it('rejects missing destinations and empty, non-finite or out-of-range driving values', () => {
    expect(roadtripSetupError({ ...setup(), origin: ' ' }, t)).toBe(t('dashboard.roadtrip.originRequired'));
    expect(roadtripSetupError({ ...setup(), roundTrip: false }, t)).toBe(t('dashboard.roadtrip.destinationRequired'));
    for (const dailyHours of ['', 'NaN', 'Infinity', '0', '13']) {
      expect(roadtripSetupError({ ...setup(), dailyHours }, t)).toBe(t('dashboard.roadtrip.invalidHours'));
    }
    for (const rangeKm of ['', 'NaN', 'Infinity', '0', '2001']) {
      expect(roadtripSetupError({ ...setup(), rangeKm }, t)).toBe(t('dashboard.roadtrip.invalidRange'));
    }
  });

  it('leaves ordinary trip descriptions and preferences unchanged when the option is off', () => {
    const value = { ...setup(), enabled: false, dailyHours: '' };
    expect(roadtripSetupError(value, t)).toBeNull();
    expect(roadtripSetupPayload(value, ' Keep my notes ', t)).toEqual({ description: 'Keep my notes' });
    expect(roadtripSetupPayload(value, ' ', t)).toEqual({ description: null });
  });
});
