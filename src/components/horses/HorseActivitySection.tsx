import {
  DashboardItemCardContent,
  dashboardItemCardClassName,
} from '#/components/dashboard/DashboardItemCard'
import {
  dashboardEmptyClassName,
  dashboardSectionClassName,
} from '#/components/dashboard/dashboardChrome'
import {
  formatEventDate,
  formatRecurrence,
} from '#/components/events/eventDisplay'
import { ListFilterBar } from '#/components/list-filtering/ListFilterBar'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'
import { Badge } from '#/components/ui/badge'
import { buttonVariants } from '#/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '#/components/ui/navigation-menu'
import { ScrollableList } from '#/components/ui/scrollable-list'
import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { eventStatusLabels, eventTypeLabels } from 'shared/events/eventSchema'
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
  const today = getLocalDateString(new Date())
  const upcomingEvents = events
    .filter((event) => event.date >= today)
    .toSorted(compareEventsAscending)
  const pastEvents = events
    .filter((event) => event.date < today)
    .toSorted(compareEventsDescending)
  const pastEventsVisibleItemLimit = pastEventsExpanded
    ? expandedVisibleItemLimit
    : compactVisibleItemLimit
  const filterConfig = useMemo(createHorseActivityListFilterConfig, [])
  const activeEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents
  const filtering = useListFiltering({
    items: activeEvents,
    config: filterConfig,
  })
  const activityListToolbar =
    activeEvents.length > 0 ? (
      <ListFilterBar
        config={filterConfig}
        query={filtering.query}
        onQueryChange={filtering.setQuery}
        selectedFacets={filtering.selectedFacets}
        onFacetChange={filtering.setFacetValue}
        onReset={filtering.resetFilters}
        isFiltering={filtering.isFiltering}
      />
    ) : undefined

  return (
    <div className="grid gap-3">
      <NavigationMenu className="justify-start px-1">
        <NavigationMenuList className="flex-wrap justify-start gap-1">
          {activityTabs.map((tab) => (
            <NavigationMenuItem key={tab.id}>
              <NavigationMenuLink
                render={
                  <button
                    type="button"
                    data-active={activeTab === tab.id || undefined}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                }
              />
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      <section className={dashboardSectionClassName('soft', 'grid gap-6')}>
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold leading-tight tracking-tight">
              {activeTabDetails.title}
            </h2>
            <p className="text-base leading-6 text-muted-foreground">
              {activeTabDetails.description}
            </p>
          </div>

          <Link
            to="/stables/$stableId/events/create"
            params={{ stableId }}
            className={buttonVariants({ variant: 'secondary' })}
          >
            Add event
          </Link>
        </header>

        {activeTab === 'upcoming' ? (
          <div className="grid gap-4">
            {activityListToolbar}
            <ActivityEventList
              stableId={stableId}
              events={filtering.items}
              emptyTitle={
                filtering.isFiltering
                  ? 'No upcoming activity matches these filters.'
                  : 'No upcoming activity for this horse.'
              }
              emptyDescription={
                filtering.isFiltering
                  ? 'Adjust the search or filters to see more activity.'
                  : 'Create an event and select this horse to show it here.'
              }
              visibleItemLimit={compactVisibleItemLimit}
            />
          </div>
        ) : (
          <div className="grid gap-4">
            {activityListToolbar}

            {filtering.items.length > compactVisibleItemLimit && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                  onClick={() => setPastEventsExpanded((expanded) => !expanded)}
                >
                  {pastEventsExpanded ? 'Compact list' : 'Expand list'}
                </button>
              </div>
            )}

            <ActivityEventList
              stableId={stableId}
              events={filtering.items}
              emptyTitle={
                filtering.isFiltering
                  ? 'No past activity matches these filters.'
                  : 'No past events yet.'
              }
              emptyDescription={
                filtering.isFiltering
                  ? 'Adjust the search or filters to see more activity.'
                  : 'Past activity will appear here once event dates have passed.'
              }
              visibleItemLimit={pastEventsVisibleItemLimit}
            />
          </div>
        )}
      </section>
    </div>
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
  emptyTitle: string
  emptyDescription: string
  visibleItemLimit: number
}) {
  if (events.length === 0) {
    return (
      <div className={dashboardEmptyClassName('soft')}>
        <p className="font-medium text-foreground">{emptyTitle}</p>
        <p>{emptyDescription}</p>
      </div>
    )
  }

  return (
    <ScrollableList
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
  const recurrenceSummary = formatRecurrence(event.recurrence)
  const scheduleMeta = [
    formatEventDate(event.date),
    event.location,
    recurrenceSummary,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <Link
      to="/stables/$stableId/events/$eventId"
      params={{ stableId, eventId: event._id }}
      className={dashboardItemCardClassName({
        interactive: true,
        chrome: 'soft',
      })}
    >
      <DashboardItemCardContent
        title={event.title}
        leading={
          <span className="grid min-w-16 place-items-center rounded-md bg-primary/8 px-2 py-3 text-sm font-semibold text-primary">
            {event.time}
          </span>
        }
        meta={scheduleMeta}
        badges={
          <>
            <Badge variant="secondary">{eventTypeLabels[event.type]}</Badge>
            <Badge variant="outline">{eventStatusLabels[event.status]}</Badge>
          </>
        }
      />
    </Link>
  )
}

function compareEventsAscending(a: ActivityEvent, b: ActivityEvent) {
  return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
}

function compareEventsDescending(a: ActivityEvent, b: ActivityEvent) {
  return compareEventsAscending(b, a)
}

function getLocalDateString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
