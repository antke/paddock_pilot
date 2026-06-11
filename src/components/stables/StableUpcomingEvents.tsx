import { Badge } from '#/components/ui/badge'
import { buttonVariants } from '#/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import {
  formatEventDate,
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
      <Alert>
        <AlertTitle>No upcoming events.</AlertTitle>
        <AlertDescription>
          Add an event to start building this stable schedule.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="overflow-hidden border-y border-border-subtle">
      {upcomingEvents.map((event) => {
        const recurrenceSummary = formatRecurrence(event.recurrence)
        const dateBadge = getDateBadgeParts(event.date)

        return (
          <div
            key={event._id}
            className="flex flex-wrap items-center gap-4 border-b border-border-subtle px-3 py-3 transition-colors last:border-b-0 hover:bg-muted/45"
          >
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
    <section className="grid content-start gap-4">
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
