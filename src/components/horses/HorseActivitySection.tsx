import { useT, useLocale } from '#/i18n/LocaleProvider'
import { useMemo, useState } from 'react'
import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { EventRow } from '#/components/events/EventRow'
import {
  getListFilterEmptyMessage,
  ListFilterControls,
} from '#/components/list-filtering/ListFilterControls'
import { ListFilterLayout } from '#/components/list-filtering/ListFilterLayout'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'
import { Button, ButtonLink } from '#/components/ui/button'
import { ScrollableList } from '#/components/ui/scrollable-list'
import { useLocalDateContext } from '#/lib/useLocalDateContext'
import type { HorseDetailSectionProps } from './HorseDetail'
import { createHorseActivityListFilterConfig } from './horseDetailListFilters'
import { HorseDetailSectionTabs } from './HorseDetailSectionTabs'
import {
  compareActivityDates,
  groupHorseActivityEvents,
} from './horseActivityEvents'

const compactVisibleItemLimit = 5
const expandedVisibleItemLimit = 12

type ActivityTab = 'upcoming' | 'history'

export function HorseActivitySection(props: HorseDetailSectionProps) {
  return (
    <HorseActivity key={`${props.stableId}:${props.horse._id}`} {...props} />
  )
}

function HorseActivity({ stableId, horse, events }: HorseDetailSectionProps) {
  const t = useT()
  const { locale } = useLocale()

  const activityTabs = [
    {
      id: 'upcoming',
      label: t('horseHistory.upcoming'),
      title: t('horseHistory.upcomingActivity'),
      description: t('horseHistory.upcomingHelp'),
    },
    {
      id: 'history',
      label: t('horseHistory.history'),
      title: t('horseHistory.activityHistory'),
      description: t('horseHistory.historyHelp'),
    },
  ] as const
  const [activeTab, setActiveTab] = useState<ActivityTab>('upcoming')
  const [historyExpanded, setHistoryExpanded] = useState(false)
  const { today } = useLocalDateContext()
  const groups = useMemo(
    () => groupHorseActivityEvents(events, today),
    [events, today],
  )
  const filterConfig = useMemo(
    () => createHorseActivityListFilterConfig(locale),
    [locale],
  )
  const filtering = useListFiltering({
    items: groups[activeTab],
    config: filterConfig,
  })
  // Keep the agenda chronological when search relevance would otherwise reorder it.
  const visibleEvents = [...filtering.items].sort((a, b) =>
    activeTab === 'upcoming'
      ? compareActivityDates(a, b)
      : compareActivityDates(b, a),
  )
  const isHistory = activeTab === 'history'
  const visibleItemLimit =
    isHistory && historyExpanded
      ? expandedVisibleItemLimit
      : compactVisibleItemLimit

  return (
    <HorseDetailSectionTabs
      activeId={activeTab}
      items={activityTabs}
      onSelect={setActiveTab}
      actions={
        <ButtonLink
          to="/stables/$stableId/events/create"
          params={{ stableId }}
          action="create"
        >
          {t('horseHistory.addEvent')}
        </ButtonLink>
      }
    >
      <ListFilterLayout
        controls={
          <ListFilterControls
            config={filterConfig}
            filtering={filtering}
            hideWhenEmpty
          />
        }
        actions={
          isHistory && visibleEvents.length > compactVisibleItemLimit ? (
            <DashboardActions>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setHistoryExpanded((expanded) => !expanded)}
              >
                {historyExpanded
                  ? t('horseHistory.compact')
                  : t('horseHistory.expand')}
              </Button>
            </DashboardActions>
          ) : undefined
        }
      >
        {visibleEvents.length === 0 ? (
          <DashboardEmptyState
            chrome="flat"
            title={getListFilterEmptyMessage({
              filtering,
              emptyMessage: isHistory
                ? t('horseHistory.historyEmpty')
                : t('horseHistory.upcomingEmpty'),
              filteredEmptyMessage: isHistory
                ? t('horseHistory.historyFilteredEmpty')
                : t('horseHistory.upcomingFilteredEmpty'),
            })}
          >
            {getListFilterEmptyMessage({
              filtering,
              emptyMessage: isHistory
                ? t('horseHistory.historyEmptyHelp')
                : t('horseHistory.upcomingEmptyHelp'),
              filteredEmptyMessage: t('horseHistory.filterHelp'),
            })}
          </DashboardEmptyState>
        ) : (
          <ScrollableList
            ariaLabel={t('horseHistory.activityRegion', {
              name: horse.name,
              view: t(
                isHistory
                  ? 'horseHistory.historyRegion'
                  : 'horseHistory.upcomingRegion',
              ),
            })}
            className="gap-0"
            estimatedItemHeightRem={7.5}
            itemCount={visibleEvents.length}
            visibleItemLimit={visibleItemLimit}
          >
            {visibleEvents.map((event) => (
              <EventRow
                key={event._id}
                event={event}
                stableId={stableId}
                chrome="flat"
                variant="agenda"
              />
            ))}
          </ScrollableList>
        )}
      </ListFilterLayout>
    </HorseDetailSectionTabs>
  )
}
