import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardSectionTabGroup } from '#/components/dashboard/DashboardNavigation'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
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

const compactVisibleItemLimit = 5
const expandedVisibleItemLimit = 12

type ActivityTab = 'upcoming' | 'past'

type ActivityTabItem = {
  id: ActivityTab
  label: string
  title: string
  description: string
}

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
] satisfies Array<ActivityTabItem>

const activityTabDetails = {
  upcoming: activityTabs[0],
  past: activityTabs[1],
} satisfies Record<ActivityTab, ActivityTabItem>

export function HorseActivitySection({
  stableId,
  events,
}: HorseDetailSectionProps) {
  const [activeTab, setActiveTab] = useState<ActivityTab>('upcoming')
  const [pastEventsExpanded, setPastEventsExpanded] = useState(false)
  const activeTabDetails = activityTabDetails[activeTab]
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
    <DashboardSectionTabGroup
      activeId={activeTab}
      items={activityTabs}
      onSelect={setActiveTab}
    >
      <DashboardSection
        chrome="cards"
        title={activeTabDetails.title}
        description={activeTabDetails.description}
        actions={
          <ButtonLink
            to="/stables/$stableId/events/create"
            params={{ stableId }}
            variant="secondary"
          >
            Add event
          </ButtonLink>
        }
        titleStyle="display"
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
                    onClick={() =>
                      setPastEventsExpanded((expanded) => !expanded)
                    }
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
      </DashboardSection>
    </DashboardSectionTabGroup>
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
      className="gap-0"
      estimatedItemHeightRem={7}
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
