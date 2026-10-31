import { Check, History, Loader2, MessageCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router';

import CollabChat from '../../components/Collab/CollabChat';
import { useTranslation } from '../../i18n';
import { TripPlanningProposal } from './TripPlanningProposal';
import { planningButton as button, planningPrimary as primary } from './tripPlanningStyles';
import type { TripPlanningWorkspaceState } from './useTripPlanningWorkspace';

type Props = { workspace: TripPlanningWorkspaceState };

export function TripPlanningChat({ workspace, tripId }: Props & { tripId: number }) {
  const { t } = useTranslation();
  const { mobileTab, setMobileTab, data, user } = workspace;
  if (!data || !user) return null;
  return (
    <section
      aria-labelledby="planning-chat-heading"
      className={`${mobileTab === 'chat' ? 'flex' : 'hidden'} min-w-0 flex-col overflow-hidden rounded-xl border border-edge-faint lg:sticky lg:top-[calc(var(--nav-h)+1rem)] lg:flex`}
    >
      <div className="border-b border-edge-faint p-4">
        <h2 id="planning-chat-heading" className="flex items-center gap-2 text-subtitle font-semibold">
          <MessageCircle size={18} aria-hidden="true" />
          {t('tripPlanning.chat')}
        </h2>
        <p className="mt-2 text-caption leading-relaxed text-content-secondary">{t('tripPlanning.chatHelp')}</p>
        {!data.can_discuss && (
          <p className="mt-2 text-caption text-content-secondary">{t('tripPlanning.chatReadOnly')}</p>
        )}
      </div>
      <div className="flex h-[min(65dvh,38rem)] min-h-80 flex-col lg:h-[calc(100dvh-var(--nav-h)-13rem)]">
        <CollabChat tripId={tripId} currentUser={user} canEdit={data.can_discuss} />
      </div>
      <button
        type="button"
        onClick={() => setMobileTab('proposal')}
        className="min-h-11 border-t border-edge-faint px-4 py-3 text-body font-medium text-content-secondary hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent lg:hidden"
      >
        {t('tripPlanning.chatNext')}
      </button>
    </section>
  );
}

export function TripPlanningComposer({ workspace }: Props) {
  const { t } = useTranslation();
  const {
    data,
    instruction,
    setInstruction,
    busy,
    viewingHistory,
    acknowledgeAI,
    generate,
    latest,
    working,
    planning,
  } = workspace;
  if (!data) return null;
  const cannotGenerate = busy || viewingHistory || !data.can_discuss || !data.ai_available || data.ai_privacy_required;
  return (
    <div className="mb-6 border-b border-edge-faint pb-6">
      <label htmlFor="planning-instruction" className="mb-2 block text-body font-medium">
        {t('tripPlanning.instruction')}
      </label>
      <textarea
        id="planning-instruction"
        value={instruction}
        onChange={(event) => setInstruction(event.target.value)}
        rows={3}
        maxLength={4000}
        disabled={busy || viewingHistory || !data.can_discuss}
        placeholder={t('tripPlanning.instructionPlaceholder')}
        aria-describedby="planning-instruction-help"
        className="w-full resize-y rounded-lg border border-edge bg-surface px-3 py-2.5 text-body leading-relaxed text-content placeholder:text-content-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
      />
      <p id="planning-instruction-help" className="mt-2 text-caption leading-relaxed text-content-muted">
        {t('tripPlanning.instructionHelp')}
      </p>
      {data.ai_privacy_required ? (
        <section className="mt-4 rounded-xl bg-surface-secondary p-4">
          <h3 className="text-body font-semibold">{t('tripPlanning.privacyTitle')}</h3>
          <p className="mt-2 text-body leading-relaxed text-content-secondary">{t('tripPlanning.privacyHelp')}</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              void acknowledgeAI();
            }}
            className={`${button} mt-3`}
          >
            {t('tripPlanning.privacyAccept')}
          </button>
        </section>
      ) : (
        !data.ai_available && <p className="mt-3 text-body text-content-secondary">{t('tripPlanning.aiUnavailable')}</p>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={cannotGenerate}
          onClick={() => {
            void generate('discussion');
          }}
          className={button}
        >
          <MessageCircle size={17} aria-hidden="true" />
          {t('tripPlanning.discuss')}
        </button>
        <button
          type="button"
          disabled={cannotGenerate}
          onClick={() => {
            void generate('detailed');
          }}
          className={primary}
        >
          <Sparkles size={17} aria-hidden="true" />
          {t(latest?.plan ? 'tripPlanning.revise' : 'tripPlanning.generate')}
        </button>
      </div>
      {(working === 'discussion' || working === 'detailed' || working === 'confirm') && (
        <p role="status" className="mt-3 flex items-start gap-2 text-body leading-relaxed text-content-secondary">
          <Loader2 size={17} aria-hidden="true" className="mt-1 shrink-0 animate-spin motion-reduce:animate-none" />
          {t(working === 'confirm' ? 'tripPlanning.confirming' : 'tripPlanning.generating')}
        </p>
      )}
      {planning.actionError && (
        <p role="alert" className="mt-3 text-body leading-relaxed text-content-secondary">
          {t(`tripPlanning.error.${planning.actionError}`)}
        </p>
      )}
    </div>
  );
}

export function TripPlanningPlan({ workspace }: Props) {
  const { t } = useTranslation();
  const { data, shown, confirmed, viewingHistory, setSelectedVersion, busy, confirm, tripPath } = workspace;
  if (!data) return null;
  return (
    <>
      {shown ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-caption font-medium text-content-secondary">
            <span>{t('tripPlanning.revision', { revision: shown.revision })}</span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-secondary px-2.5 py-1.5">
              {confirmed && <Check size={14} aria-hidden="true" />}
              {t(
                confirmed
                  ? 'tripPlanning.confirmedStatus'
                  : shown.kind === 'discussion'
                    ? 'tripPlanning.discussionStatus'
                    : 'tripPlanning.detailedStatus'
              )}
            </span>
            {!viewingHistory &&
              (confirmed ? (
                <Link to={tripPath} className={button}>
                  {t('trip.guide.openPlan')}
                </Link>
              ) : (
                shown.plan &&
                data.can_confirm && (
                  <a
                    href="#planning-confirmation"
                    className="inline-flex min-h-11 items-center text-body underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    {t('tripPlanning.confirm')}
                  </a>
                )
              ))}
          </div>
          {viewingHistory && (
            <div className="mb-5 rounded-xl bg-surface-secondary p-4">
              <p className="text-body leading-relaxed">{t('tripPlanning.historyReadOnly')}</p>
              <button type="button" onClick={() => setSelectedVersion(null)} className={`${button} mt-3`}>
                {t('tripPlanning.currentVersion')}
              </button>
            </div>
          )}
          <TripPlanningProposal revision={shown} confirmed={confirmed} />
          {!viewingHistory && !confirmed && (
            <div id="planning-confirmation" className="mt-6 scroll-mt-24 border-t border-edge-faint pt-5">
              {data.baseline_changed ? (
                <p role="status" className="mb-4 text-body leading-relaxed text-content-secondary">
                  {t('tripPlanning.baselineChanged')}
                </p>
              ) : (
                data.confirmed_revision && (
                  <p className="mb-4 text-body leading-relaxed text-content-secondary">
                    {t('tripPlanning.previousConfirmed', { revision: data.confirmed_revision })}
                  </p>
                )
              )}
              {shown.plan && (
                <>
                  <p className="mb-3 text-body leading-relaxed text-content-secondary">
                    {t(data.can_confirm ? 'tripPlanning.confirmHelp' : 'tripPlanning.memberConfirmHelp')}
                  </p>
                  {data.can_confirm && (
                    <button
                      type="button"
                      disabled={busy || data.baseline_changed}
                      onClick={() => {
                        void confirm();
                      }}
                      className={primary}
                    >
                      <Check size={17} aria-hidden="true" />
                      {t('tripPlanning.confirm')}
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="py-4">
          <h3 className="text-subtitle font-semibold">{t('tripPlanning.emptyTitle')}</h3>
          <p className="mt-3 text-body leading-relaxed text-content-secondary">{t('tripPlanning.emptyHelp')}</p>
          <p className="mt-4 rounded-xl bg-surface-secondary p-4 text-body leading-relaxed text-content-secondary">
            {t('tripPlanning.emptyExample')}
          </p>
          <p className="mt-4 text-caption leading-relaxed text-content-muted">{t('tripPlanning.memberHelp')}</p>
        </div>
      )}
    </>
  );
}

export function TripPlanningHistory({ workspace }: Props) {
  const { t } = useTranslation();
  const { latest, historyOpen, openHistory, historyLoading, historyFailed, history, setSelectedVersion } = workspace;
  return (
    <>
      {latest && (
        <div className="mt-6 border-t border-edge-faint pt-3">
          <button
            type="button"
            aria-expanded={historyOpen}
            aria-controls="planning-history"
            onClick={() => {
              void openHistory();
            }}
            className={button}
          >
            <History size={16} aria-hidden="true" />
            {t('tripPlanning.history')}
          </button>
          {historyOpen && (
            <div id="planning-history" className="mt-3">
              {historyLoading ? (
                <p role="status" className="py-3 text-body text-content-secondary">
                  {t('common.loading')}
                </p>
              ) : historyFailed ? (
                <p role="alert" className="py-3 text-body text-content-secondary">
                  {t('tripPlanning.historyFailed')}
                </p>
              ) : (
                <ul className="divide-y divide-edge-faint">
                  {history
                    .filter((revision) => revision.revision !== latest.revision)
                    .map((revision) => (
                      <li key={revision.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedVersion(revision.revision)}
                          className="flex min-h-11 w-full flex-wrap items-center justify-between gap-2 rounded-lg px-2 py-3 text-start text-body hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                        >
                          <span>{t('tripPlanning.revision', { revision: revision.revision })}</span>
                          <span className="text-caption text-content-muted">
                            {revision.created_at.replace('T', ' ').slice(0, 16)}
                          </span>
                        </button>
                      </li>
                    ))}
                </ul>
              )}
              {!historyLoading &&
                !historyFailed &&
                history.filter((revision) => revision.revision !== latest.revision).length === 0 && (
                  <p className="py-3 text-body text-content-muted">{t('tripPlanning.historyEmpty')}</p>
                )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
