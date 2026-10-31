import { RefreshCw, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';

import PageShell from '../components/Layout/PageShell';
import TripMembersModal from '../components/Trips/TripMembersModal';
import TripNavigation from '../components/Trips/TripNavigation';
import { useTranslation } from '../i18n';
import { TripPlanningMembers } from './tripPlanner/TripPlanningMembers';
import {
  TripPlanningChat,
  TripPlanningComposer,
  TripPlanningHistory,
  TripPlanningPlan,
} from './tripPlanner/TripPlanningPanels';
import { planningButton as button } from './tripPlanner/tripPlanningStyles';
import { useTripPlanningWorkspace } from './tripPlanner/useTripPlanningWorkspace';

export default function TripPlanningPage() {
  const { id } = useParams();
  const tripId = Number(id);
  return <TripPlanningWorkspace key={id} tripId={tripId} />;
}

function TripPlanningWorkspace({ tripId }: { tripId: number }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const workspace = useTripPlanningWorkspace(tripId);
  const {
    planning,
    user,
    data,
    mobileTab,
    setMobileTab,
    inviteOpen,
    setInviteOpen,
    busy,
    tripPath,
    saveCollaborators,
  } = workspace;

  return (
    <PageShell
      className="bg-surface text-content"
      navbar={{
        tripId,
        tripTitle: data?.title,
        showBack: true,
        onBack: () => {
          void navigate(tripPath);
        },
      }}
    >
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-5 sm:px-7 sm:pt-8">
        <div className="mb-5 overflow-x-auto pb-1">
          <TripNavigation tripId={tripId} activeTab="planning" />
        </div>
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-2xl">
            <h1 className="text-title font-semibold leading-snug [overflow-wrap:anywhere]">
              {t('tripPlanning.title')}
            </h1>
            <p className="mt-2 text-body leading-relaxed text-content-secondary">{t('tripPlanning.intro')}</p>
            {data && (
              <p className="mt-2 text-caption text-content-muted [overflow-wrap:anywhere]">
                {data.title} · {t('tripPlanning.memberCount', { count: data.members.length })}
              </p>
            )}
          </div>
          {data && (
            <button type="button" onClick={() => setInviteOpen(true)} className={button}>
              <Users size={17} aria-hidden="true" />
              {t('tripPlanning.members')}
            </button>
          )}
        </header>

        {planning.loading && (
          <p role="status" className="py-10 text-body text-content-secondary">
            {t('common.loading')}
          </p>
        )}
        {planning.error && (
          <div role="alert" className="mb-5 rounded-xl bg-surface-secondary p-4 text-body leading-relaxed">
            <p>{t(`tripPlanning.error.${planning.error}`)}</p>
            {planning.error !== 'unavailable' && (
              <button
                type="button"
                onClick={() => {
                  void planning.refresh();
                }}
                className={`${button} mt-3`}
              >
                <RefreshCw size={16} aria-hidden="true" />
                {t('assistant.errorAction.retry')}
              </button>
            )}
          </div>
        )}

        {data && user && (
          <>
            <div
              className="mb-4 flex gap-2 border-b border-edge-faint pb-3 lg:hidden"
              role="group"
              aria-label={t('tripPlanning.title')}
            >
              {(['chat', 'proposal'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  aria-pressed={mobileTab === tab}
                  onClick={() => setMobileTab(tab)}
                  className={`${button} flex-1 ${mobileTab === tab ? 'bg-surface-secondary font-semibold' : ''}`}
                >
                  {t(tab === 'chat' ? 'tripPlanning.chat' : 'tripPlanning.proposal')}
                </button>
              ))}
            </div>
            <div className="grid min-w-0 gap-7 lg:grid-cols-[minmax(20rem,0.8fr)_minmax(0,1.4fr)] lg:items-start">
              <TripPlanningChat workspace={workspace} tripId={tripId} />

              <section
                aria-labelledby="planning-proposal-heading"
                className={`${mobileTab === 'proposal' ? 'block' : 'hidden'} min-w-0 lg:block`}
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 id="planning-proposal-heading" className="text-subtitle font-semibold">
                    {t('tripPlanning.proposal')}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      void planning.refresh();
                    }}
                    aria-label={t('tripPlanning.refresh')}
                    title={t('tripPlanning.refresh')}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-content-muted hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    <RefreshCw size={17} aria-hidden="true" />
                  </button>
                </div>
                <div className="mb-5">
                  <TripPlanningMembers state={data} disabled={busy} save={saveCollaborators} />
                </div>
                <TripPlanningComposer workspace={workspace} />

                <TripPlanningPlan workspace={workspace} />

                <TripPlanningHistory workspace={workspace} />
              </section>
            </div>
            <TripMembersModal
              isOpen={inviteOpen}
              onClose={() => setInviteOpen(false)}
              tripId={tripId}
              tripTitle={data.title}
              onMembersChanged={() => {
                void planning.refresh();
              }}
            />
          </>
        )}
      </main>
    </PageShell>
  );
}
