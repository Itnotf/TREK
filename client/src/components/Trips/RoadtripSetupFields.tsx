import { useId } from 'react';
import { useTranslation } from '../../i18n';
import CustomSelect from '../shared/CustomSelect';
import { NumericInput } from '../shared/NumericInput';
import type { RoadtripSetup } from './roadtripSetup';

interface Props {
  value: RoadtripSetup;
  onChange: (value: RoadtripSetup) => void;
  disabled?: boolean;
}

export default function RoadtripSetupFields({ value, onChange, disabled = false }: Props) {
  const { t } = useTranslation();
  const id = useId();
  const inputCls =
    'w-full min-w-0 rounded-xl border border-edge bg-surface-input px-3.5 py-2.5 text-body text-content placeholder:text-content-faint focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent';
  const labelCls = 'mb-2 block text-caption font-semibold text-content-secondary';
  const update = <K extends keyof RoadtripSetup>(key: K, next: RoadtripSetup[K]) => onChange({ ...value, [key]: next });

  return (
    <fieldset
      disabled={disabled}
      className="min-w-0 space-y-3.5 rounded-2xl border border-edge bg-surface-secondary p-4"
    >
      <label className="flex min-h-8 cursor-pointer items-center gap-3 text-body font-semibold text-content">
        <input
          type="checkbox"
          checked={value.enabled}
          onChange={(event) => update('enabled', event.target.checked)}
          aria-controls={`${id}-fields`}
          aria-expanded={value.enabled}
          className="h-4 w-4 accent-accent"
        />
        {t('dashboard.roadtrip.enable')}
      </label>
      {value.enabled && (
        <div id={`${id}-fields`} className="space-y-3.5">
          <p className="text-caption text-content-muted">{t('dashboard.roadtrip.hint')}</p>
          <div>
            <label htmlFor={`${id}-origin`} className={labelCls}>
              {t('dashboard.roadtrip.origin')}
            </label>
            <input
              id={`${id}-origin`}
              value={value.origin}
              onChange={(event) => update('origin', event.target.value)}
              maxLength={120}
              autoComplete="off"
              aria-required="true"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor={`${id}-via`} className={labelCls}>
              {t('dashboard.roadtrip.viaCities')}
            </label>
            <textarea
              id={`${id}-via`}
              value={value.viaCities}
              onChange={(event) => update('viaCities', event.target.value)}
              maxLength={1000}
              rows={2}
              aria-describedby={`${id}-via-hint`}
              className={`${inputCls} resize-y`}
            />
            <p id={`${id}-via-hint`} className="mt-1.5 text-caption text-content-faint">
              {t('dashboard.roadtrip.viaHint')}
            </p>
          </div>
          <label className="flex min-h-8 cursor-pointer items-center gap-3 text-body text-content">
            <input
              type="checkbox"
              checked={value.roundTrip}
              onChange={(event) => update('roundTrip', event.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            {t('dashboard.roadtrip.roundTrip')}
          </label>
          {!value.roundTrip && (
            <div>
              <label htmlFor={`${id}-destination`} className={labelCls}>
                {t('dashboard.roadtrip.destination')}
              </label>
              <input
                id={`${id}-destination`}
                value={value.destination}
                onChange={(event) => update('destination', event.target.value)}
                maxLength={120}
                autoComplete="off"
                aria-required="true"
                className={inputCls}
              />
            </div>
          )}
          <div>
            <label htmlFor={`${id}-hours`} className={labelCls}>
              {t('dashboard.roadtrip.dailyHours')}
            </label>
            <NumericInput
              id={`${id}-hours`}
              mode="decimal"
              value={value.dailyHours}
              onValueChange={(next) => update('dailyHours', next)}
              min={1}
              max={12}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor={`${id}-vehicle`} className={labelCls}>
              {t('dashboard.roadtrip.vehicle')}
            </label>
            <CustomSelect
              id={`${id}-vehicle`}
              ariaLabel={t('dashboard.roadtrip.vehicle')}
              value={value.vehicle}
              onChange={(next) => update('vehicle', next === 'electric' ? 'electric' : 'combustion')}
              disabled={disabled}
              options={[
                { value: 'combustion', label: t('dashboard.roadtrip.combustion') },
                { value: 'electric', label: t('dashboard.roadtrip.electric') },
              ]}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label htmlFor={`${id}-range`} className={labelCls}>
              {t('dashboard.roadtrip.rangeKm')}
            </label>
            <NumericInput
              id={`${id}-range`}
              value={value.rangeKm}
              onValueChange={(next) => update('rangeKm', next)}
              min={1}
              max={2000}
              className={inputCls}
            />
          </div>
          <p className="text-caption text-content-muted">{t('dashboard.roadtrip.planningInstruction')}</p>
        </div>
      )}
    </fieldset>
  );
}
