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
import { TextToggleGroup } from '#/components/ui/text-toggle-group'
import { useLocalDateContext } from '#/lib/useLocalDateContext'
import { useSmallScreen } from '#/lib/useSmallScreen'
import type { HorseDetailSectionProps } from './HorseDetail'
import { createHorseActivityListFilterConfig } from './horseDetailListFilters'
import { StableEventsCalendar } from '#/components/stables/StableEventsCalendar'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { CalendarViewControl } from '#/components/events/CalendarToolbar'
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

  // Log/Calendar is a view choice, so it is segmented and sits where Events puts its view control.
  const viewControl = (
    <CalendarViewControl
      value={mode}
      options={[
        { value: 'log', label: t('horseHistory.log') },
        { value: 'calendar', label: t('horseHistory.calendar') },
      ]}
      label={t('horseDetail.views')}
      onValueChange={setMode}
    />
  )
  const addEvent = !small && (
    <ButtonLink
      to="/events/create"
      search={{ horseId: horse._id }}
      action="schedule"
      variant="outline"
    >
      {t('horseHistory.addEvent')}
    </ButtonLink>
  )

  return (
    <DashboardSectionCard surface="canvas" contentGap="loose">
      {mode === 'log' && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* A time filter, not a view: quiet text toggle so it never twins the segmented Log/Calendar. */}
          <TextToggleGroup
            label={t('horseHistory.activityPeriod')}
            value={activeTab}
            onChange={setActiveTab}
            options={(['upcoming', 'history'] as const).map((value) => ({
              value,
              label: t(`horseHistory.${value}`),
            }))}
          />
          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            {viewControl}
            {addEvent}
          </div>
        </div>
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
            <StableEventsCalendar
              horses={[horse]}
              events={visibleEvents}
              surface="flat"
              viewControl={viewControl}
              actions={addEvent || undefined}
            />
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
    </DashboardSectionCard>
  )
}
