import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
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
import { useSmallScreen } from '#/lib/useSmallScreen'
import type { HorseDetailSectionProps } from './HorseDetail'
import { createHorseActivityListFilterConfig } from './horseDetailListFilters'
import { HorseDetailSectionTabs } from './HorseDetailSectionTabs'
import { StableEventsCalendar } from '#/components/stables/StableEventsCalendar'
import { ChoiceButtonGroup } from '#/components/ui/choice-button-group'
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
  const small = useSmallScreen()

  const activityTabs = [
    {
      id: 'log',
      label: t('horseHistory.log'),
      title: t('horseHistory.log'),
    },
    {
      id: 'calendar',
      label: t('horseHistory.calendar'),
      title: t('horseHistory.calendar'),
    },
  ] as const
  const [mode, setMode] = useState<'log' | 'calendar'>('log')
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
  const allEvents = useMemo(
    () => [...groups.upcoming, ...groups.history],
    [groups],
  )
  const filtering = useListFiltering({
    items: mode === 'calendar' ? allEvents : groups[activeTab],
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
      activeId={mode}
      items={activityTabs}
      onSelect={setMode}
      actions={
        !small && (
          <ButtonLink
            to="/events/create"
            search={{ horseId: horse._id }}
            action="schedule"
          >
            {t('horseHistory.addEvent')}
          </ButtonLink>
        )
      }
    >
      {mode === 'log' && (
        <ChoiceButtonGroup
          aria-label={t('horseHistory.activityPeriod')}
          value={activeTab}
          options={[
            { value: 'upcoming', label: t('horseHistory.upcoming') },
            { value: 'history', label: t('horseHistory.history') },
          ]}
          onValueChange={setActiveTab}
        />
      )}
      <ListFilterLayout
        controls={
          <ListFilterControls
            config={filterConfig}
            filtering={filtering}
            hideWhenEmpty
          />
        }
        actions={
          mode === 'log' &&
          isHistory &&
          visibleEvents.length > compactVisibleItemLimit ? (
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
        {mode === 'calendar' ? (
          <>
            {filtering.isFiltering && visibleEvents.length === 0 && (
              <DashboardEmptyState
                chrome="flat"
                title={t('horseHistory.noMatches')}
              >
                {t('horseHistory.filterHelp')}
              </DashboardEmptyState>
            )}
            <StableEventsCalendar events={visibleEvents} surface="flat" />
          </>
        ) : visibleEvents.length === 0 ? (
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
              name: getHorseDisplayName(horse),
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
