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
import { getTodayDateKey } from '#/lib/dateDisplay'
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { HorseDetailSectionProps } from './HorseDetail'
import { createHorseActivityListFilterConfig } from './horseDetailListFilters'
import { HorseDetailSectionTabs } from './HorseDetailSectionTabs'

const compactVisibleItemLimit = 5
const expandedVisibleItemLimit = 12

type ActivityTab = 'upcoming' | 'past'

const activityTabs = [
  {
    id: 'upcoming',
    label: 'Upcoming',
    title: 'Upcoming activity',
    description:
      'Scheduled training, appointments, and other work for this horse.',
  },
  {
    id: 'past',
    label: 'Past events',
    title: 'Past events',
    description: 'Completed or earlier activity for this horse.',
  },
] as const

export function HorseActivitySection({
  stableId,
  events,
}: HorseDetailSectionProps) {
  const [activeTab, setActiveTab] = useState<ActivityTab>('upcoming')
  const [pastEventsExpanded, setPastEventsExpanded] = useState(false)
  const today = getTodayDateKey()
  const upcomingEvents = events
    .filter((event) => event.date >= today)
    .sort(compareEventsAscending)
  const pastEvents = events
    .filter((event) => event.date < today)
    .sort(compareEventsDescending)
  const pastEventsVisibleItemLimit = pastEventsExpanded
    ? expandedVisibleItemLimit
    : compactVisibleItemLimit
  const filterConfig = useMemo(createHorseActivityListFilterConfig, [])
  const activeEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents
  const filtering = useListFiltering({
    items: activeEvents,
    config: filterConfig,
  })

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
      {activeTab === 'upcoming' ? (
        <ListFilterLayout
          controls={
            <ListFilterControls
              config={filterConfig}
              filtering={filtering}
              hideWhenEmpty
            />
          }
        >
          <ActivityEventList
            stableId={stableId}
            events={filtering.items}
            emptyTitle={getListFilterEmptyMessage({
              filtering,
              emptyMessage: 'No upcoming activity for this horse.',
              filteredEmptyMessage:
                'No upcoming activity matches these filters.',
            })}
            emptyDescription={getListFilterEmptyMessage({
              filtering,
              emptyMessage:
                'Create an event and select this horse to show it here.',
              filteredEmptyMessage:
                'Adjust the search or filters to see more activity.',
            })}
            visibleItemLimit={compactVisibleItemLimit}
          />
        </ListFilterLayout>
      ) : (
        <ListFilterLayout
          controls={
            <ListFilterControls
              config={filterConfig}
              filtering={filtering}
              hideWhenEmpty
            />
          }
          actions={
            filtering.items.length > compactVisibleItemLimit ? (
              <DashboardActions>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPastEventsExpanded((expanded) => !expanded)}
                >
                  {pastEventsExpanded ? 'Compact list' : 'Expand list'}
                </Button>
              </DashboardActions>
            ) : undefined
          }
        >
          <ActivityEventList
            stableId={stableId}
            events={filtering.items}
            emptyTitle={getListFilterEmptyMessage({
              filtering,
              emptyMessage: 'No past events yet.',
              filteredEmptyMessage: 'No past activity matches these filters.',
            })}
            emptyDescription={getListFilterEmptyMessage({
              filtering,
              emptyMessage:
                'Past activity will appear here once event dates have passed.',
              filteredEmptyMessage:
                'Adjust the search or filters to see more activity.',
            })}
            visibleItemLimit={pastEventsVisibleItemLimit}
          />
        </ListFilterLayout>
      )}
    </HorseDetailSectionTabs>
  )
}

type ActivityEvent = HorseDetailSectionProps['events'][number]

function ActivityEventList({
  stableId,
  events,
  emptyTitle,
  emptyDescription,
  visibleItemLimit,
}: {
  stableId: string
  events: Array<ActivityEvent>
  emptyTitle: ReactNode
  emptyDescription: ReactNode
  visibleItemLimit: number
}) {
  if (events.length === 0) {
    return (
      <DashboardEmptyState chrome="soft" title={emptyTitle}>
        {emptyDescription}
      </DashboardEmptyState>
    )
  }

  return (
    <ScrollableList
      className="gap-3"
      estimatedItemHeightRem={7.5}
      itemCount={events.length}
      visibleItemLimit={visibleItemLimit}
    >
      {events.map((event) => (
        <ActivityEventCard key={event._id} stableId={stableId} event={event} />
      ))}
    </ScrollableList>
  )
}

type ActivityEventCardProps = {
  stableId: string
  event: ActivityEvent
}

function ActivityEventCard({ stableId, event }: ActivityEventCardProps) {
  return (
    <EventRow
      event={event}
      stableId={stableId}
      chrome="soft"
      variant="agenda"
    />
  )
}

function compareEventsAscending(a: ActivityEvent, b: ActivityEvent) {
  return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
}

function compareEventsDescending(a: ActivityEvent, b: ActivityEvent) {
  return compareEventsAscending(b, a)
}
