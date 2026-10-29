import type { ItineraryPlan } from '@trek/shared';
import { useId, useRef } from 'react';

import { useTranslation } from '../../i18n';
import { PlanContents, PlanStay, PlanStop } from '../Assistant/cards/home/TripPlanContents';
import { useFoundPlacePhoto } from '../Assistant/useFoundPlacePhoto';

const prose = 'whitespace-pre-wrap text-body leading-relaxed text-content-secondary [overflow-wrap:anywhere]';
const disclosure =
  'min-h-11 cursor-pointer content-center rounded text-body font-medium text-content underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

function GuidePlace({ stop }: { stop: ItineraryPlan['days'][number]['stops'][number] }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLLIElement>(null);
  const photo = useFoundPlacePhoto({ name: stop.name, photoKey: stop.location?.place_id, ...stop.location }, ref);
  return (
    <li ref={ref} className="py-4">
      {photo && (
        <img src={photo} alt={stop.name} loading="lazy" className="mb-3 max-h-64 w-full rounded-xl object-cover" />
      )}
      <h4 className="text-body font-semibold text-content [overflow-wrap:anywhere]">{stop.name}</h4>
      <p className="mb-2 mt-1 text-caption text-content-muted">
        {[
          stop.city,
          stop.duration_minutes > 0 ? t('dawarich.duration.minutes', { minutes: stop.duration_minutes }) : null,
        ]
          .filter(Boolean)
          .join(' · ')}
      </p>
      <p className={prose}>{stop.description}</p>
    </li>
  );
}

/** One confirmed plan supplies both the reading view and its executable daily schedule. */
export function TripGuideContents({ plan }: { plan: ItineraryPlan }) {
  const { t } = useTranslation();
  const prefix = useId();
  const guide = plan.guide;
  if (!guide) return <PlanContents plan={plan} />;
  return (
    <div className="min-w-0 text-content">
      <section className="py-5" aria-label={t('trip.guide.route')}>
        <h2 className="text-lg font-semibold">{t('trip.guide.route')}</h2>
        <p className="mt-2 text-body font-medium leading-relaxed [overflow-wrap:anywhere]">{guide.route}</p>
        <p className={`mt-3 ${prose}`}>{guide.rationale}</p>
        <h3 className="mt-5 text-body font-semibold">{t('trip.guide.highlights')}</h3>
        <ul className="mt-2 list-disc space-y-2 ps-5 text-body leading-relaxed text-content-secondary">
          {guide.highlights.map((item, i) => (
            <li key={i} className="[overflow-wrap:anywhere]">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <nav aria-label={t('trip.guide.days')} className="flex flex-wrap gap-2 border-y border-edge-faint py-3">
        {plan.days.map((day, index) => (
          <a
            key={index}
            href={`#${prefix}-day-${index}`}
            title={day.title}
            className="inline-flex min-h-11 items-center rounded-lg bg-surface-secondary px-3 text-body font-medium hover:bg-surface-tertiary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {t('planner.dayN', { n: index + 1 })}
          </a>
        ))}
      </nav>

      {plan.days.map((day, index) => (
        <section key={index} id={`${prefix}-day-${index}`} className="scroll-mt-24 border-b border-edge-faint py-6">
          <h2 className="text-lg font-semibold leading-snug [overflow-wrap:anywhere]">
            {t('planner.dayN', { n: index + 1 })} · {day.title}
          </h2>
          {day.guide && <p className={`mt-3 ${prose}`}>{day.guide.overview}</p>}
          <ul className="mt-2 divide-y divide-edge-faint">
            {day.stops
              .filter((stop) => !stop.kind || stop.kind === 'visit' || stop.kind === 'activity')
              .map((stop, i) => (
                <GuidePlace key={stop.id ?? i} stop={stop} />
              ))}
          </ul>
          {day.guide && (
            <div className="space-y-4 py-3">
              <div>
                <h3 className="mb-2 text-body font-semibold">{t('trip.guide.dining')}</h3>
                <p className={prose}>{day.guide.dining}</p>
              </div>
              {(day.guide.accommodation || day.stay) && (
                <div>
                  <h3 className="mb-2 text-body font-semibold">{t('trip.guide.stay')}</h3>
                  {day.stay && (
                    <p className="mb-2 text-body font-medium [overflow-wrap:anywhere]">
                      {[day.stay.area, day.stay.name].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <p className={prose}>{day.guide.accommodation}</p>
                  {day.stay && (
                    <p className="mt-2 text-caption text-content-muted">{t('assistant.plan.stayPending')}</p>
                  )}
                </div>
              )}
              <div>
                <h3 className="mb-2 text-body font-semibold">{t('trip.guide.alternative')}</h3>
                <p className={prose}>{day.guide.alternative}</p>
              </div>
            </div>
          )}
          <details className="mt-3 border-t border-edge-faint pt-1">
            <summary className={disclosure}>{t('trip.guide.schedule')}</summary>
            <ol className="divide-y divide-edge-faint">
              {day.stops.map((stop, i) => (
                <PlanStop key={stop.id ?? i} stop={stop} />
              ))}
            </ol>
            <PlanStay day={day} />
            {day.notes && <p className={`py-3 ${prose}`}>{day.notes}</p>}
          </details>
        </section>
      ))}

      <section className="border-b border-edge-faint py-6" aria-label={t('trip.guide.budget')}>
        <h2 className="text-lg font-semibold">{t('trip.guide.budget')}</h2>
        <p className="mt-2 text-caption text-content-muted">
          {guide.budget.scope} · {plan.currency}
        </p>
        <p className="mt-2 text-body font-medium [overflow-wrap:anywhere]">{guide.budget.estimate}</p>
        <dl className="mt-3 divide-y divide-edge-faint">
          {guide.budget.breakdown.map((item, i) => (
            <div key={i} className="py-3">
              <dt className="text-body font-semibold">{item.category}</dt>
              <dd className="mt-1 text-body [overflow-wrap:anywhere]">{item.estimate}</dd>
              {item.notes && <dd className={`mt-1 ${prose}`}>{item.notes}</dd>}
            </div>
          ))}
        </dl>
      </section>
      <section className="py-6" aria-label={t('trip.guide.preparation')}>
        <h2 className="text-lg font-semibold">{t('trip.guide.preparation')}</h2>
        <ul className="mt-3 list-disc space-y-2 ps-5 text-body leading-relaxed text-content-secondary">
          {guide.preparation.map((item, i) => (
            <li key={i} className="[overflow-wrap:anywhere]">
              {item}
            </li>
          ))}
        </ul>
      </section>
      {(plan.requirements.length > 0 || plan.assumptions.length > 0 || !!plan.sources?.length) && (
        <details className="border-t border-edge-faint py-2">
          <summary className={disclosure}>{t('trip.guide.notes')}</summary>
          {[
            { title: t('assistant.plan.requirements'), items: plan.requirements },
            { title: t('assistant.plan.assumptions'), items: plan.assumptions },
          ]
            .filter((group) => group.items.length)
            .map((group) => (
              <div key={group.title} className="py-2">
                <h3 className="text-body font-semibold">{group.title}</h3>
                <ul className="mt-2 list-disc space-y-1 ps-5 text-body leading-relaxed text-content-secondary">
                  {group.items.map((item, i) => (
                    <li key={i} className="[overflow-wrap:anywhere]">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          {!!plan.sources?.length && (
            <div className="py-2">
              <h3 className="text-body font-semibold">{t('tours.provenance.source')}</h3>
              <ul className="mt-2 space-y-2">
                {plan.sources
                  .filter((source) => /^https?:\/\//i.test(source.url))
                  .map((source) => (
                    <li key={source.url}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-words text-body text-content-secondary underline"
                      >
                        {source.title || source.url}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </details>
      )}
    </div>
  );
}
