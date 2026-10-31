import { BookOpen, ChevronDown, MessagesSquare } from 'lucide-react';
import type { ComponentType } from 'react';
import { Link, useNavigate } from 'react-router';

import { useTranslation } from '../../i18n';
import { PopoverItem } from '../Packing/PackingPopover';
import SlidingTabs, { TabLabel } from '../shared/SlidingTabs';
import { PopoverListPanel } from '../shared/dialogParts';
import { usePopoverList } from '../shared/usePopoverList';

interface TripNavigationTab {
  id: string;
  label: string;
  shortLabel?: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
}

/** Keep the guide and daily itinerary together; detailed outdoor routing is an optional tool. */
export default function TripNavigation({
  tripId,
  tabs,
  activeTab = 'guide',
  onChange,
}: {
  tripId: number;
  tabs?: TripNavigationTab[];
  activeTab?: string;
  onChange?: (id: string) => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const tools = usePopoverList(0, { estimatedHeight: 150 });
  const routeTab = tabs?.find((tab) => tab.id === 'tour-planner');
  const primaryTabs: TripNavigationTab[] = (tabs ?? [{ id: 'plan', label: t('trip.tabs.plan') }]).filter(
    (tab) => tab.id !== 'tour-planner'
  );
  const change = (id: string) => {
    if (onChange) onChange(id);
    else void navigate(`/trips/${tripId}${id === 'plan' ? '' : `?tab=${encodeURIComponent(id)}`}`);
  };
  return (
    <nav aria-label={t('trip.navigation.label')} className="flex min-w-0 items-center gap-1">
      <Link
        to={`/trips/${tripId}/planning`}
        aria-current={activeTab === 'planning' ? 'page' : undefined}
        className={`inline-flex min-h-9 flex-none items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-caption font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${activeTab === 'planning' ? 'bg-accent text-accent-text' : 'text-content-muted hover:bg-surface-hover'}`}
      >
        <MessagesSquare size={15} aria-hidden="true" />
        {t('trip.planning.title')}
      </Link>
      <Link
        to={`/trips/${tripId}/guide`}
        aria-current={activeTab === 'guide' ? 'page' : undefined}
        className={`inline-flex min-h-9 flex-none items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-caption font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${activeTab === 'guide' ? 'bg-accent text-accent-text' : 'text-content-muted hover:bg-surface-hover'}`}
      >
        <BookOpen size={15} aria-hidden="true" />
        {t('trip.guide.title')}
      </Link>
      <SlidingTabs
        tabs={primaryTabs.map((tab) => ({
          id: tab.id,
          label: tabs ? <TabLabel label={tab.label} short={tab.shortLabel} /> : tab.label,
          ariaLabel: tab.label,
          icon: tab.icon,
        }))}
        activeTab={activeTab}
        onChange={change}
        indicatorColor={primaryTabs.some((tab) => tab.id === activeTab) ? undefined : 'transparent'}
        className="min-w-0"
      />
      {routeTab && (
        <>
          <button
            ref={tools.triggerRef}
            type="button"
            onClick={tools.toggle}
            aria-expanded={tools.open}
            aria-controls={tools.listId}
            className={`inline-flex min-h-9 flex-none items-center gap-1 whitespace-nowrap rounded-full px-3 text-caption font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${activeTab === routeTab.id ? 'bg-accent text-accent-text' : 'text-content-muted hover:bg-surface-hover'}`}
          >
            {activeTab === routeTab.id ? routeTab.label : t('mobileTrip.more')}
            <ChevronDown size={14} aria-hidden="true" />
          </button>
          <PopoverListPanel list={tools} label={t('mobileTrip.more')} className="w-72 max-w-[calc(100vw-16px)]">
            <p className="px-3 py-2 text-caption leading-relaxed text-content-secondary">
              {t('tours.navigation.help')}
            </p>
            <PopoverItem
              icon={routeTab.icon ? <routeTab.icon size={16} /> : null}
              label={routeTab.label}
              active={activeTab === routeTab.id}
              onClick={() => {
                tools.close();
                change(routeTab.id);
              }}
            />
          </PopoverListPanel>
        </>
      )}
    </nav>
  );
}
