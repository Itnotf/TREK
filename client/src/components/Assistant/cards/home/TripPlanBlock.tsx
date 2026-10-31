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
      {plan && <TripGuideContents plan={plan} />}
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
        <>
          {!created && (
            <>
              <button
                type="button"
                disabled={!state.canApply}
                onClick={() => {
                  void state.share();
                }}
                className="mt-3 min-h-11 w-full rounded-xl bg-accent px-4 py-2 text-body font-semibold text-accent-text disabled:opacity-50"
              >
                {t(state.applying ? 'common.saving' : 'assistant.plan.share')}
              </button>
              <p className="mt-2 text-caption leading-relaxed text-content-muted">{t('assistant.plan.shareHint')}</p>
            </>
          )}
          <button
            type="button"
            disabled={!state.canApply}
            onClick={() => {
              void state.confirm();
            }}
            className={`mt-3 min-h-11 w-full rounded-xl px-4 py-2 text-body font-semibold disabled:opacity-50 ${created ? 'bg-accent text-accent-text' : 'border border-edge text-content hover:bg-surface-secondary'}`}
          >
            {t(state.applying ? 'common.saving' : created ? 'assistant.card.common.open' : 'assistant.plan.confirm')}
          </button>
        </>
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
