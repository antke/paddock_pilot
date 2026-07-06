import {
  dashboardEmptyClassName,
  dashboardSectionClassName,
} from '#/components/dashboard/dashboardChrome'
import { Badge } from '#/components/ui/badge'
import { buttonVariants } from '#/components/ui/button'
import {
  formatEventType,
  formatRecurrence,
} from '#/components/events/eventDisplay'
import { Link } from '@tanstack/react-router'
import { getUpcomingEvents, getDateBadgeParts } from './stableDashboardDates'
import type { StableDashboardEvent } from './stableDashboardDates'

type StableUpcomingEventsProps = {
  stableId: string
  events: Array<StableDashboardEvent>
  limit?: number
}

export function StableUpcomingEvents({
  stableId,
  events,
  limit = 5,
}: StableUpcomingEventsProps) {
  const upcomingEvents = getUpcomingEvents(events, new Date()).slice(0, limit)

  if (upcomingEvents.length === 0) {
    return (
      <div className={dashboardEmptyClassName('cards')}>
        <p className="font-medium text-foreground">No upcoming events.</p>
        <p>Add an event to start building this stable schedule.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {upcomingEvents.map((event) => {
        const recurrenceSummary = formatRecurrence(event.recurrence)
        const dateBadge = getDateBadgeParts(event.date)

        return (
          <article
            key={event._id}
            className="rounded-row bg-background/55 p-5 transition-colors hover:bg-primary/5"
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="grid min-w-20 justify-items-center border-r border-border-subtle pr-4 text-center">
                <span className="text-xs font-medium text-muted-foreground">
                  {dateBadge.month}
                </span>
                <span className="text-lg font-semibold">{dateBadge.day}</span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{event.title}</h3>
                  <Badge variant="outline">{formatEventType(event.type)}</Badge>
                  {recurrenceSummary && (
                    <Badge variant="secondary">Recurring</Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  {event.time}
                  {event.location ? ` · ${event.location}` : ''}
                </p>

                {recurrenceSummary && (
                  <p className="text-xs text-muted-foreground">
                    {recurrenceSummary}
                  </p>
                )}
              </div>

              <Link
                to="/stables/$stableId/events/$eventId"
                params={{ stableId, eventId: event._id }}
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
              >
                View
              </Link>
            </div>
          </article>
        )
      })}
    </div>
  )
}

export function StableUpcomingEventsCard({
  stableId,
  events,
  limit,
}: StableUpcomingEventsProps) {
  return (
    <section className={dashboardSectionClassName('cards', 'content-start')}>
      <div>
        <h3 className="text-lg font-semibold tracking-tight">
          Next upcoming events
        </h3>
        <p className="text-sm text-muted-foreground">
          The next 5 scheduled items.
        </p>
      </div>
      <StableUpcomingEvents stableId={stableId} events={events} limit={limit} />
    </section>
  )
}
