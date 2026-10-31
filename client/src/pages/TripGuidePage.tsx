import { ArrowLeft, CalendarDays, RefreshCw } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';

import PageShell from '../components/Layout/PageShell';
import CurrentTripGuide from '../components/Trips/CurrentTripGuide';
import { TripGuideContents } from '../components/Trips/TripGuideContents';
import TripNavigation from '../components/Trips/TripNavigation';
import { useTranslation } from '../i18n';
import { useTripGuide } from './tripPlanner/useTripGuide';

export default function TripGuidePage() {
  const { id } = useParams();
  const tripId = Number(id);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const state = useTripGuide(tripId);
  const { plan, current, status } = state.data ?? {};
  const tripPath = Number.isSafeInteger(tripId) && tripId > 0 ? `/trips/${tripId}` : '/dashboard';
  return (
    <PageShell
      className="bg-surface"
      navbar={{
        tripTitle: current?.title ?? plan?.title,
        tripId,
        showBack: true,
        onBack: () => {
          void navigate(tripPath);
        },
      }}
    >
      <main className="mx-auto max-w-3xl px-5 pb-28 pt-6 sm:px-8 sm:pt-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/dashboard"
            className="inline-flex min-h-11 items-center gap-2 text-body text-content-secondary hover:underline"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {t('common.back')}
          </Link>
          <Link
            to={tripPath}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-edge px-3 text-body font-medium text-content hover:bg-surface-secondary"
          >
            <CalendarDays size={16} aria-hidden="true" />
            {t('trip.guide.openPlan')}
          </Link>
        </div>
        {current && <TripNavigation tripId={tripId} />}
        <h1 className="text-title font-semibold leading-snug text-content [overflow-wrap:anywhere]">
          {current?.title ?? t('trip.guide.title')}
        </h1>
        {state.loading && (
          <p role="status" className="py-8 text-body text-content-secondary">
            {t('common.loading')}
          </p>
        )}
        {state.error && (
          <div role="alert" className="py-8 text-body text-content-secondary">
            <p>{t(state.error === 'unavailable' ? 'trip.guide.unavailable' : 'trip.guide.loadFailed')}</p>
            {state.error === 'load' && (
              <button type="button" onClick={state.retry} className="mt-3 min-h-11 underline">
                {t('assistant.errorAction.retry')}
              </button>
            )}
          </div>
        )}
        {current && (
          <>
            {status === 'unchanged' && plan && (
              <p className="mt-3 whitespace-pre-wrap text-body leading-relaxed text-content-secondary [overflow-wrap:anywhere]">
                {plan.summary}
              </p>
            )}
            {current.start_date && (
              <p className="mt-3 text-caption text-content-muted">
                {current.start_date}
                {current.end_date && ` – ${current.end_date}`}
              </p>
            )}
            <div className="my-4 flex flex-wrap items-center justify-between gap-3 border-b border-edge-faint pb-4">
              <p className="max-w-prose text-caption leading-relaxed text-content-muted">
                {t('trip.guide.currentHelp')}
              </p>
              <button
                type="button"
                onClick={state.retry}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-body hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2"
              >
                <RefreshCw size={16} aria-hidden="true" />
                {t('trip.guide.refresh')}
              </button>
            </div>
            {status === 'unchanged' && plan ? (
              <TripGuideContents plan={plan} />
            ) : (
              <>
                <h2 className="mb-3 text-subtitle font-semibold">{t('trip.guide.current')}</h2>
                <CurrentTripGuide current={current} original={plan ?? null} />
                {plan && (
                  <details className="mt-8 border-t border-edge-faint py-3">
                    <summary className="min-h-11 cursor-pointer content-center text-body font-semibold focus-visible:outline focus-visible:outline-2">
                      {t('trip.guide.original')}
                    </summary>
                    <p className="my-3 text-body leading-relaxed text-content-secondary">
                      {t('trip.guide.originalHelp')}
                    </p>
                    <p className="my-3 whitespace-pre-wrap text-body leading-relaxed text-content-secondary">
                      {plan.summary}
                    </p>
                    <TripGuideContents plan={plan} />
                  </details>
                )}
              </>
            )}
            <Link
              to={tripPath}
              className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 py-2 text-body font-semibold text-accent-text"
            >
              <CalendarDays size={18} aria-hidden="true" />
              {t('trip.guide.openPlan')}
            </Link>
          </>
        )}
      </main>
    </PageShell>
  );
}
