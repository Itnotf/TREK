import { type TripPlanCard } from '@trek/shared';
import { Luggage } from 'lucide-react';

import { useTranslation } from '../../../../i18n';
import { TripGuideContents } from '../../../Trips/TripGuideContents';
import type { CardEntry } from '../cardTypes';
import CardFrame from '../parts/CardFrame';
import CardHeader from '../parts/CardHeader';
import { useTripPlan } from './useTripPlan';

function PlanDraft({ card }: { card: TripPlanCard }) {
  const { t } = useTranslation();
  const errorMessages = {
    load: t('assistant.plan.loadFailed'),
    unavailable: t('assistant.change.expired'),
    apply: t('assistant.plan.applyFailed'),
  };
  const state = useTripPlan(card);
  const plan = state.draft?.plan;
  const created = !!state.draft?.created_trip_id;
  return (
    <CardFrame label={t('assistant.plan.label')}>
      <CardHeader
        icon={Luggage}
        tone="info"
        title={plan?.title ?? card.title}
        meta={t('assistant.plan.version', { version: card.revision })}
      />
      <p className="whitespace-pre-wrap text-body text-content-secondary">{plan?.summary ?? card.summary}</p>
      {plan && (
        <ol className="mt-3 space-y-2 text-body text-content-secondary">
          {plan.days.map((day, index) => (
            <li key={index} className="flex items-baseline gap-2 [overflow-wrap:anywhere]">
              <span className="shrink-0 text-caption font-semibold text-content">
                {t('planner.dayN', { n: index + 1 })}
              </span>
              <span>{day.title.replace(/^(?:第[0-9一二三四五六七八九十]+天|day\s*\d+)\s*[·|｜:：\-–—]?\s*/i, '')}</span>
            </li>
          ))}
        </ol>
      )}
      {state.loading && (
        <p role="status" className="mt-3 text-caption text-content-muted">
          {t('common.loading')}
        </p>
      )}
      {state.error && (
        <div role="alert" className="mt-3 text-caption text-danger">
          <p>{errorMessages[state.error]}</p>
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
        <>
          <button
            type="button"
            disabled={!state.canApply}
            onClick={() => {
              void state.confirm();
            }}
            className="mt-3 min-h-11 w-full rounded-xl bg-accent px-4 py-2 text-body font-semibold text-accent-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
          >
            {t(state.applying ? 'common.saving' : created ? 'assistant.plan.openItinerary' : 'assistant.plan.confirm')}
          </button>
          <details className="mt-3 border-t border-edge-faint pt-1">
            <summary className="min-h-11 cursor-pointer content-center rounded text-caption text-content-secondary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
              {t('assistant.plan.shareOptions')}
            </summary>
            <p className="mt-1 text-caption leading-relaxed text-content-secondary">{t('assistant.plan.shareHint')}</p>
            <button
              type="button"
              disabled={!state.canApply}
              onClick={() => {
                void state.share();
              }}
              className="mt-3 min-h-11 w-full rounded-xl border border-edge px-4 py-2 text-body font-medium text-content hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
            >
              {t(state.applying ? 'common.saving' : 'assistant.plan.share')}
            </button>
          </details>
        </>
      )}
      {plan && (
        <details className="mt-3 border-t border-edge-faint pt-1">
          <summary className="min-h-11 cursor-pointer content-center rounded text-body font-medium text-content underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
            {t('assistant.plan.preview')}
          </summary>
          <TripGuideContents plan={plan} />
        </details>
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
