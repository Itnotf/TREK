import type { TripPlanningRevision } from '@trek/shared';

import { TripGuideContents } from '../../components/Trips/TripGuideContents';
import { useTranslation } from '../../i18n';

const prose = 'whitespace-pre-wrap text-body leading-relaxed text-content-secondary [overflow-wrap:anywhere]';

function Points({ title, points }: { title: string; points: string[] }) {
  if (!points.length) return null;
  return (
    <section className="min-w-0">
      <h3 className="mb-2 text-body font-semibold text-content">{title}</h3>
      <ul className="list-disc space-y-1.5 ps-5 text-body leading-relaxed text-content-secondary [overflow-wrap:anywhere]">
        {points.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>
    </section>
  );
}

export function TripPlanningProposal({ revision, confirmed }: { revision: TripPlanningRevision; confirmed: boolean }) {
  const { t } = useTranslation();
  const discussion = (
    <>
      <p className={prose}>{revision.summary}</p>
      {revision.questions.length > 0 && (
        <section className="rounded-xl bg-surface-secondary p-4">
          <Points title={t('tripPlanning.questions')} points={revision.questions} />
          <p className="mt-3 text-caption leading-relaxed text-content-muted">{t('tripPlanning.questionsHelp')}</p>
        </section>
      )}
      {(revision.agreements.length > 0 || revision.disagreements.length > 0) && (
        <div className="grid gap-5 border-y border-edge-faint py-5 sm:grid-cols-2">
          <Points title={t('tripPlanning.agreements')} points={revision.agreements} />
          <Points title={t('tripPlanning.disagreements')} points={revision.disagreements} />
        </div>
      )}
      <Points title={t('tripPlanning.changes')} points={revision.changes} />
    </>
  );
  return (
    <div className="min-w-0 space-y-6">
      {confirmed ? (
        <>
          <p role="status" className={prose}>
            {t('tripPlanning.confirmedHelp')}
          </p>
          <details className="rounded-xl border border-edge-faint px-4 py-3">
            <summary className="min-h-11 cursor-pointer content-center rounded text-body font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
              {t('tripPlanning.discussionRecord')}
            </summary>
            <div className="mt-3 space-y-6">{discussion}</div>
          </details>
        </>
      ) : (
        discussion
      )}
      {revision.plan ? (
        <TripGuideContents plan={revision.plan} />
      ) : revision.outline.length > 0 ? (
        <section>
          <h3 className="mb-3 text-subtitle font-semibold text-content">{t('tripPlanning.outline')}</h3>
          <ol className="divide-y divide-edge-faint">
            {revision.outline.map((day) => (
              <li key={day.day} className="grid gap-2 py-4 sm:grid-cols-[5rem_minmax(0,1fr)]">
                <span className="text-body font-semibold text-content-muted">
                  {t('tripPlanning.day', { day: day.day })}
                </span>
                <div className="min-w-0">
                  <h4 className="mb-1 text-body font-semibold text-content [overflow-wrap:anywhere]">{day.title}</h4>
                  <p className={prose}>{day.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
