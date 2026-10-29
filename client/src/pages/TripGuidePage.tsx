import { ArrowLeft, CalendarDays } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';

import PageShell from '../components/Layout/PageShell';
import { TripGuideContents } from '../components/Trips/TripGuideContents';
import { useTranslation } from '../i18n';
import { useTripGuide } from './tripPlanner/useTripGuide';

export default function TripGuidePage() {
  const { id } = useParams();
  const tripId = Number(id);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const state = useTripGuide(tripId);
  const plan = state.plan;
  const tripPath = Number.isSafeInteger(tripId) && tripId > 0 ? `/trips/${tripId}` : '/dashboard';
  return (
    <PageShell
      className="bg-surface"
      navbar={{
        tripTitle: plan?.title,
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
        <h1 className="text-2xl font-semibold leading-snug text-content [overflow-wrap:anywhere]">
          {plan?.title ?? t('trip.guide.title')}
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
        {!state.loading && !state.error && !plan && (
          <p className="py-8 text-body leading-relaxed text-content-secondary">{t('trip.guide.empty')}</p>
        )}
        {plan && (
          <>
            <p className="mt-3 whitespace-pre-wrap text-body leading-relaxed text-content-secondary [overflow-wrap:anywhere]">
              {plan.summary}
            </p>
            {plan.start_date && <p className="mt-3 text-caption text-content-muted">{plan.start_date}</p>}
            <p className="mt-4 border-b border-edge-faint pb-4 text-caption leading-relaxed text-content-muted">
              {t('trip.guide.snapshot')}
            </p>
            <TripGuideContents plan={plan} />
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
