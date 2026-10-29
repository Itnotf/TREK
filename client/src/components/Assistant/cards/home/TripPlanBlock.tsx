import { itineraryStopEndTime, type ItineraryPlan, type TripPlanCard } from '@trek/shared';
import { BedDouble, Bike, Car, Footprints, Luggage, TrainFront } from 'lucide-react';
import { useRef } from 'react';

import { useTranslation } from '../../../../i18n';
import { useFoundPlacePhoto } from '../../useFoundPlacePhoto';
import type { CardEntry } from '../cardTypes';
import CardFrame from '../parts/CardFrame';
import CardHeader from '../parts/CardHeader';
import { useTripPlan } from './useTripPlan';

type PlanDay = ItineraryPlan['days'][number];
type Stop = PlanDay['stops'][number];

const TRAVEL_MODES = {
  driving: { icon: Car, label: 'journey.recording.mode.driving' },
  walking: { icon: Footprints, label: 'journey.recording.mode.walking' },
  transit: { icon: TrainFront, label: 'transit.title' },
  cycling: { icon: Bike, label: 'journey.recording.mode.cycling' },
};
const DETAILS_SUMMARY =
  'min-h-11 cursor-pointer content-center rounded text-caption font-medium text-content-secondary underline-offset-4 hover:text-content hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

function PlanTravel({ travel }: { travel: NonNullable<Stop['travel_from_previous']> }) {
  const { t } = useTranslation();
  const { icon: Icon, label } = TRAVEL_MODES[travel.mode];
  return (
    <div className="mb-3 border-s border-dashed border-edge ps-3 text-caption text-content-muted">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Icon size={14} aria-hidden="true" className="flex-none" />
        <span>{t(label)}</span>
        <span>
          {travel.duration_minutes === null
            ? t('assistant.plan.travelPending')
            : t('assistant.plan.travelEstimated', {
                duration: t('dawarich.duration.minutes', { minutes: travel.duration_minutes }),
              })}
        </span>
      </div>
      {travel.notes && <p className="mt-1 whitespace-pre-wrap [overflow-wrap:anywhere]">{travel.notes}</p>}
    </div>
  );
}

function PlanStop({ stop }: { stop: Stop }) {
  const { t } = useTranslation();
  const kindLabels = {
    visit: t('assistant.plan.kind.visit'),
    meal: t('assistant.plan.kind.meal'),
    rest: t('assistant.plan.kind.rest'),
    departure: t('reservations.span.departure'),
    arrival: t('reservations.span.arrival'),
    activity: t('assistant.plan.kind.activity'),
  };
  const ref = useRef<HTMLLIElement>(null);
  const photo = useFoundPlacePhoto({ name: stop.name, photoKey: stop.location?.place_id, ...stop.location }, ref);
  const endTime = itineraryStopEndTime(stop);
  return (
    <li ref={ref} className="py-3">
      {stop.travel_from_previous && <PlanTravel travel={stop.travel_from_previous} />}
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-caption">
            <span className="font-semibold tabular-nums text-content">
              {stop.arrival_time
                ? `${stop.arrival_time}${endTime && endTime !== stop.arrival_time ? ` – ${endTime}` : ''}`
                : t('assistant.plan.timePending')}
            </span>
            {stop.arrival_time && (
              <span className="text-content-muted">
                {t(stop.time_kind === 'fixed' ? 'assistant.plan.timeFixed' : 'assistant.plan.timeSuggested')}
              </span>
            )}
          </div>
          <h5 className="mt-1 text-body font-semibold text-content [overflow-wrap:anywhere]">{stop.name}</h5>
          <p className="mt-1 text-caption text-content-muted [overflow-wrap:anywhere]">
            {[
              stop.city,
              kindLabels[stop.kind ?? 'visit'],
              !stop.arrival_time && stop.duration_minutes > 0
                ? t('dawarich.duration.minutes', { minutes: stop.duration_minutes })
                : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {!stop.location && <p className="mt-1 text-caption text-content-muted">{t('assistant.plan.unverified')}</p>}
        </div>
        {photo && <img src={photo} alt="" loading="lazy" className="h-16 w-16 flex-none rounded-xl object-cover" />}
      </div>
      {(stop.description || stop.location?.address) && (
        <details className="mt-1">
          <summary className={DETAILS_SUMMARY} aria-label={`${t('tours.planner.details')}: ${stop.name}`}>
            {t('tours.planner.details')}
          </summary>
          {stop.location?.address && (
            <p className="mb-2 text-caption text-content-muted [overflow-wrap:anywhere]">{stop.location.address}</p>
          )}
          {stop.description && (
            <p className="whitespace-pre-wrap text-body text-content-secondary [overflow-wrap:anywhere]">
              {stop.description}
            </p>
          )}
        </details>
      )}
    </li>
  );
}

function PlanStay({ day }: { day: PlanDay }) {
  const { t } = useTranslation();
  if (day.stay === null || (!day.stay && !day.overnight_city)) return null;
  return (
    <div className="mt-3 flex items-start gap-2 border-t border-edge-faint pt-3">
      <BedDouble size={18} aria-hidden="true" className="mt-0.5 flex-none text-content-muted" />
      <div className="min-w-0 flex-1">
        <h5 className="text-body font-semibold text-content [overflow-wrap:anywhere]">
          {day.stay?.name || t('assistant.plan.hotelPending')}
        </h5>
        <p className="mt-1 text-caption text-content-secondary [overflow-wrap:anywhere]">
          {t('assistant.plan.overnight', { city: day.stay?.area || day.overnight_city })}
        </p>
        <p className="mt-1 text-caption text-content-muted">{t('assistant.plan.stayPending')}</p>
        {(day.stay?.check_in || day.stay?.check_out) && (
          <p className="mt-1 text-caption tabular-nums text-content-muted">
            {[
              day.stay.check_in && `${t('reservations.meta.checkIn')} ${day.stay.check_in}`,
              day.stay.check_out && `${t('reservations.meta.checkOut')} ${day.stay.check_out}`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}
        {day.stay?.notes && (
          <details className="mt-1">
            <summary className={DETAILS_SUMMARY}>{t('tours.planner.details')}</summary>
            <p className="whitespace-pre-wrap text-caption text-content-secondary [overflow-wrap:anywhere]">
              {day.stay.notes}
            </p>
          </details>
        )}
      </div>
    </div>
  );
}

function PlanContents({ plan }: { plan: ItineraryPlan }) {
  const { t } = useTranslation();
  return (
    <>
      {!!plan.sources?.length && (
        <div className="mt-3 text-caption text-content-secondary">
          <p className="font-semibold">{t('tours.provenance.source')}</p>
          <ul className="mt-1 space-y-1">
            {plan.sources
              .filter((source) => /^https?:\/\//i.test(source.url))
              .map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="break-words underline">
                    {source.title || source.url}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      )}
      {plan.start_date && <p className="mt-2 text-caption text-content-muted">{plan.start_date}</p>}
      {plan.requirements.length > 0 && (
        <details className="mt-3 text-caption text-content-secondary">
          <summary className="cursor-pointer font-semibold">{t('assistant.plan.requirements')}</summary>
          <ul className="mt-1 list-disc space-y-1 ps-4">
            {plan.requirements.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </details>
      )}
      {plan.assumptions.length > 0 && (
        <div className="mt-3 rounded-lg bg-surface-secondary p-3 text-caption text-content-secondary">
          <p className="font-semibold">{t('assistant.plan.assumptions')}</p>
          <ul className="mt-1 list-disc space-y-1 ps-4">
            {plan.assumptions.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      <ol className="mt-4 space-y-4">
        {plan.days.map((day, index) => (
          <li key={index} className="border-t border-edge-faint pt-3">
            <h4 className="text-body font-bold text-content">
              {t('assistant.week.day')} {index + 1} · {day.title}
            </h4>
            <ol className="mt-2 divide-y divide-edge-faint">
              {day.stops.map((stop, i) => (
                <PlanStop key={stop.id ?? i} stop={stop} />
              ))}
            </ol>
            <PlanStay day={day} />
            {day.notes && (
              <details className="mt-2">
                <summary className={DETAILS_SUMMARY}>{t('dayplan.noteSubtitle')}</summary>
                <p className="whitespace-pre-wrap text-caption text-content-secondary [overflow-wrap:anywhere]">
                  {day.notes}
                </p>
              </details>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}

function PlanDraft({ card }: { card: TripPlanCard }) {
  const { t } = useTranslation();
  const state = useTripPlan(card);
  const plan = state.draft?.plan;
  const created = !!state.draft?.created_trip_id;
  return (
    <CardFrame label={t('assistant.plan.label')}>
      <CardHeader
        icon={Luggage}
        tone="info"
        title={plan?.title ?? card.title}
        eyebrow={t('assistant.plan.label')}
        meta={t('assistant.plan.version', { version: card.revision })}
      />
      <p className="whitespace-pre-wrap text-body text-content-secondary">{plan?.summary ?? card.summary}</p>
      {plan && <PlanContents plan={plan} />}
      {state.loading && (
        <p role="status" className="mt-3 text-caption text-content-muted">
          {t('common.loading')}
        </p>
      )}
      {state.error && (
        <div role="alert" className="mt-3 text-caption text-danger">
          <p>
            {t(
              state.error === 'load'
                ? 'assistant.plan.loadFailed'
                : state.error === 'unavailable'
                  ? 'assistant.change.expired'
                  : 'assistant.plan.applyFailed'
            )}
          </p>
          {state.error === 'load' && (
            <button type="button" className="mt-2 underline" onClick={state.retry}>
              {t('assistant.errorAction.retry')}
            </button>
          )}
        </div>
      )}
      {state.offline && <p className="mt-3 text-caption text-content-muted">{t('common.needsConnection')}</p>}
      <p className="mt-4 text-caption text-content-muted">
        {t(state.stale ? 'assistant.plan.stale' : created ? 'assistant.plan.created' : 'assistant.plan.editHint')}
      </p>
      {plan && !state.stale && (
        <button
          type="button"
          disabled={!state.canApply}
          onClick={() => {
            void state.confirm();
          }}
          className="mt-3 min-h-11 w-full rounded-xl bg-accent px-4 py-2 text-body font-semibold text-accent-text disabled:opacity-50"
        >
          {t(state.applying ? 'common.saving' : created ? 'assistant.card.common.open' : 'assistant.plan.confirm')}
        </button>
      )}
    </CardFrame>
  );
}

export function TripPlanBlock({ cards }: { cards: readonly CardEntry[] }) {
  return (
    <div className="space-y-3">
      {cards.flatMap(({ card }) => (card.kind === 'tripPlan' ? [<PlanDraft key={card.draftId} card={card} />] : []))}
    </div>
  );
}
