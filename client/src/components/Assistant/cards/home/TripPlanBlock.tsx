import type { ItineraryPlan, TripPlanCard } from '@trek/shared';
import { Luggage } from 'lucide-react';
import { useRef } from 'react';

import { useTranslation } from '../../../../i18n';
import { useFoundPlacePhoto } from '../../useFoundPlacePhoto';
import type { CardEntry } from '../cardTypes';
import CardFrame from '../parts/CardFrame';
import CardHeader from '../parts/CardHeader';
import { useTripPlan } from './useTripPlan';

function PlanStop({ stop }: { stop: ItineraryPlan['days'][number]['stops'][number] }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLLIElement>(null);
  const photo = useFoundPlacePhoto({ name: stop.name, photoKey: stop.location?.place_id, ...stop.location }, ref);
  return (
    <li ref={ref} className="flex gap-3 py-2">
      {photo && <img src={photo} alt="" loading="lazy" className="h-16 w-16 flex-none rounded-lg object-cover" />}
      <div className="min-w-0">
        <div className="text-body font-semibold text-content">{stop.name}</div>
        <div className="text-caption text-content-muted">
          {[
            stop.city,
            stop.arrival_time,
            stop.duration_minutes > 0 ? t('dawarich.duration.minutes', { minutes: stop.duration_minutes }) : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </div>
        {!stop.location && <p className="mt-1 text-caption text-content-muted">{t('assistant.plan.unverified')}</p>}
        {stop.description && (
          <p className="mt-1 whitespace-pre-wrap text-body text-content-secondary">{stop.description}</p>
        )}
      </div>
    </li>
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
            {day.overnight_city && (
              <p className="mt-1 text-caption text-content-muted">
                {t('assistant.plan.overnight', { city: day.overnight_city })}
              </p>
            )}
            <ol className="mt-2 divide-y divide-edge-faint">
              {day.stops.map((stop, i) => (
                <PlanStop key={i} stop={stop} />
              ))}
            </ol>
            {day.notes && <p className="mt-2 whitespace-pre-wrap text-caption text-content-secondary">{day.notes}</p>}
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
          className="mt-3 min-h-11 w-full rounded-xl bg-accent px-4 py-2 text-body font-semibold text-accent-on disabled:opacity-50"
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
