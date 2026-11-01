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
  const routeTab = tabs?.find((tab) => tab.id === 'tour-planner');
  const primaryTabs = tabs?.filter((tab) => tab.id === 'plan') ?? [{ id: 'plan', label: t('trip.tabs.plan') }];
  const otherTabs = tabs?.filter((tab) => tab.id !== 'plan') ?? [];
  const currentTool = otherTabs.find((tab) => tab.id === activeTab);
  const currentToolIndex = otherTabs.findIndex((tab) => tab.id === activeTab);
  const tools = usePopoverList(currentToolIndex, { estimatedHeight: 350 });
  const { triggerRef, toggle, open, listId } = tools;
  const change = (id: string) => {
    if (onChange) onChange(id);
    else void navigate(`/trips/${tripId}?tab=${encodeURIComponent(id)}`);
  };
  return (
    <nav aria-label={t('trip.navigation.label')} className="flex min-w-0 items-center gap-1">
      <SlidingTabs
        tabs={primaryTabs.map((tab) => ({
          id: tab.id,
          label: tabs ? <TabLabel label={tab.label} short={tab.shortLabel} /> : tab.label,
          ariaLabel: tab.label,
          icon: tab.icon,
        }))}
        activeTab={activeTab}
        onChange={change}
        indicatorColor={activeTab === 'plan' ? undefined : 'transparent'}
        className="min-w-0"
      />
      <Link
        to={`/trips/${tripId}/guide`}
        aria-label={t('trip.guide.title')}
        aria-current={activeTab === 'guide' ? 'page' : undefined}
        className={`inline-flex min-h-9 flex-none items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-caption font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${activeTab === 'guide' ? 'bg-accent text-accent-text' : 'text-content-muted hover:bg-surface-hover'}`}
      >
        <BookOpen size={15} aria-hidden="true" />
        <span className="hidden sm:inline">{t('trip.guide.title')}</span>
        <span className="sm:hidden">{t('trip.guide.shortTitle')}</span>
      </Link>
      <Link
        to={`/trips/${tripId}/planning`}
        aria-label={t('trip.planning.title')}
        aria-current={activeTab === 'planning' ? 'page' : undefined}
        className={`inline-flex min-h-9 flex-none items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-caption font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${activeTab === 'planning' ? 'bg-accent text-accent-text' : 'text-content-muted hover:bg-surface-hover'}`}
      >
        <MessagesSquare size={15} aria-hidden="true" />
        <span className="hidden sm:inline">{t('trip.planning.title')}</span>
        <span className="sm:hidden">{t('trip.planning.shortTitle')}</span>
      </Link>
      {otherTabs.length > 0 && (
        <>
          <button
            ref={triggerRef}
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls={listId}
            className={`inline-flex min-h-9 flex-none items-center gap-1 whitespace-nowrap rounded-full px-3 text-caption font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${currentTool ? 'bg-accent text-accent-text' : 'text-content-muted hover:bg-surface-hover'}`}
          >
            {currentTool?.label ?? t('mobileTrip.more')}
            <ChevronDown size={14} aria-hidden="true" />
          </button>
          <PopoverListPanel
            list={tools}
            label={t('mobileTrip.more')}
            className="max-h-[65dvh] w-72 max-w-[calc(100vw-16px)] overflow-y-auto"
          >
            {otherTabs.map((tab) => (
              <PopoverItem
                key={tab.id}
                icon={tab.icon ? <tab.icon size={16} /> : null}
                label={tab.label}
                active={activeTab === tab.id}
                onClick={() => {
                  tools.close();
                  change(tab.id);
                }}
              />
            ))}
            {routeTab && (
              <p className="px-3 py-2 text-caption leading-relaxed text-content-secondary">
                {t('tours.navigation.help')}
              </p>
            )}
          </PopoverListPanel>
        </>
      )}
    </nav>
  );
}
