import type { Doc } from 'convex/_generated/dataModel'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardTabbedCard } from '#/components/dashboard/DashboardTabbedCard'
import { StableEventsCalendar } from '#/components/stables/StableEventsCalendar'
import { ButtonLink } from '#/components/ui/button'
import { EventTable } from './EventList'

export type EventsView = 'calendar' | 'log'
export function parseEventsSearch(search: Record<string, unknown>): {
  view?: 'log'
} {
  return search.view === 'log' ? { view: 'log' } : {}
}

const views = [
  { id: 'calendar', label: 'Calendar' },
  { id: 'log', label: 'Event log' },
] as const

export function StableEventsPage({
  stableId,
  events,
  view = 'calendar',
  onViewChange,
}: {
  stableId: string
  events: Array<Doc<'events'>>
  view?: EventsView
  onViewChange: (view: EventsView) => void
}) {
  return (
    <DashboardPage>
      <DashboardPageHeader title="Events" />
      <DashboardTabbedCard
        activeId={view}
        items={views}
        ariaLabel="Events views"
        onSelect={onViewChange}
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
        {view === 'calendar' ? (
          <StableEventsCalendar events={events} surface="flat" />
        ) : (
          <EventTable stableId={stableId} events={events} />
        )}
      </DashboardTabbedCard>
    </DashboardPage>
  )
}
