import type { UnlocatedActivity } from '@trek/shared/roadtrip';
import { formatDurationShort } from '@trek/shared/roadtrip';
import { useTranslation } from '../../i18n/TranslationContext';

export function UnlocatedActivities({
  activities = [],
  minutes = 0,
}: {
  activities?: UnlocatedActivity[];
  minutes?: number;
}): React.ReactElement | null {
  const { t } = useTranslation();
  if (!activities.length) return null;
  return (
    <section className="mx-3.5 rounded-xl bg-warning-soft p-3 text-caption text-content">
      <h3 className="m-0 text-body font-semibold">{t('roadtrip.unlocated.title')}</h3>
      <p className="mb-2 mt-1">{t('roadtrip.unlocated.hint', { time: formatDurationShort(minutes * 60) })}</p>
      <ul className="m-0 list-none space-y-2 p-0">
        {activities.map((activity) => (
          <li key={activity.assignmentId} className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-content-muted">{t('roadtrip.day', { number: activity.dayNumber })}</span>
            <span className="break-words font-medium">{activity.name}</span>
            <span className="tabular-nums text-content-muted">
              {activity.time}
              {activity.leaveAt ? `–${activity.leaveAt}` : ''}
              {activity.dwellMinutes != null ? ` · ${formatDurationShort(activity.dwellMinutes * 60)}` : ''}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
