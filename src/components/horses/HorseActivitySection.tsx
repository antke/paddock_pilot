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
const activityTabs = [
  {
    id: 'upcoming',
    label: 'Upcoming',
    title: 'Upcoming activity',
    description: 'Planned events dated today or later for this horse.',
  },
  {
    id: 'history',
    label: 'History',
    title: 'Activity history',
    description:
      'Completed and cancelled events, plus events dated before today.',
  },
] as const

type ActivityTab = (typeof activityTabs)[number]['id']

export function HorseActivitySection(props: HorseDetailSectionProps) {
  return (
    <HorseActivity key={`${props.stableId}:${props.horse._id}`} {...props} />
  )
}

function HorseActivity({ stableId, horse, events }: HorseDetailSectionProps) {
  const [activeTab, setActiveTab] = useState<ActivityTab>('upcoming')
  const [historyExpanded, setHistoryExpanded] = useState(false)
  const { today } = useLocalDateContext()
  const groups = useMemo(
    () => groupHorseActivityEvents(events, today),
    [events, today],
  )
  const filterConfig = useMemo(createHorseActivityListFilterConfig, [])
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
          Add event
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
                {historyExpanded ? 'Compact list' : 'Expand list'}
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
                ? 'No activity history yet.'
                : 'No upcoming activity for this horse.',
              filteredEmptyMessage: isHistory
                ? 'No activity history matches these filters.'
                : 'No upcoming activity matches these filters.',
            })}
          >
            {getListFilterEmptyMessage({
              filtering,
              emptyMessage: isHistory
                ? 'Completed, cancelled and earlier-dated events will appear here.'
                : 'Create an event and select this horse to show it here.',
              filteredEmptyMessage:
                'Adjust the search or filters to see more activity.',
            })}
          </DashboardEmptyState>
        ) : (
          <ScrollableList
            ariaLabel={`${horse.name} — ${isHistory ? 'activity history' : 'upcoming activity'}`}
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
