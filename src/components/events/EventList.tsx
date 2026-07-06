import { dashboardEmptyClassName } from '#/components/dashboard/dashboardChrome'
import type { DashboardChrome } from '#/components/dashboard/dashboardChrome'
import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { isEmpty } from 'lodash'
import { formatEventType, formatRecurrence } from './eventDisplay'

type EventListProps = {
  stableId: string
}

type EventTableProps = {
  stableId: string
  events: Array<Doc<'events'>>
  emptyTitle?: string
  emptyDescription?: string
  chrome?: DashboardChrome
}

const agendaDateFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
})

export function EventList({ stableId }: EventListProps) {
  const { data: events } = useSuspenseQuery(
    convexQuery(api.events.listForStable, {
      stableId: stableId as Id<'stables'>,
    }),
  )

  return <EventTable stableId={stableId} events={events} />
}

export function EventTable({
  stableId,
  events,
  emptyTitle = 'No events added yet.',
  emptyDescription = 'Create an event to start building this stable schedule.',
  chrome = 'cards',
}: EventTableProps) {
  if (isEmpty(events)) {
    return (
      <div className={dashboardEmptyClassName(chrome)}>
        <p className="font-medium text-foreground">{emptyTitle}</p>
        <p>{emptyDescription}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-2">
      {events.map((event) => (
        <EventAgendaRow key={event._id} stableId={stableId} event={event} />
      ))}
    </div>
  )
}

function EventAgendaRow({
  stableId,
  event,
}: {
  stableId: string
  event: Doc<'events'>
}) {
  const recurrenceSummary = formatRecurrence(event.recurrence)
  const metaItems = [
    `${event.horseIds.length} ${event.horseIds.length === 1 ? 'horse' : 'horses'}`,
    event.location,
    recurrenceSummary,
  ].filter((item): item is string => Boolean(item))

  return (
    <Link
      to="/stables/$stableId/events/$eventId"
      params={{ stableId, eventId: event._id }}
      className={cn(
        'group/open flex items-center gap-4 rounded-row bg-background/55 p-5 transition-colors',
        'hover:bg-primary/5',
        'focus-visible:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:outline-none',
      )}
    >
      <EventDateBlock event={event} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold underline-offset-4 transition-colors group-hover/open:text-primary group-hover/open:underline">
            {event.title}
          </h3>
          <Badge variant="outline" className="whitespace-nowrap">
            {formatEventType(event.type)}
          </Badge>
          {recurrenceSummary && (
            <Badge variant="secondary" className="whitespace-nowrap">
              Recurring
            </Badge>
          )}
        </div>

        <p className="mt-1 flex flex-wrap gap-x-1.5 gap-y-1 text-sm text-muted-foreground">
          {metaItems.map((item) => (
            <span key={item} className="whitespace-nowrap">
              {item}
            </span>
          ))}
        </p>
      </div>
    </Link>
  )
}

function EventDateBlock({ event }: { event: Doc<'events'> }) {
  const parts = agendaDateFormatter.formatToParts(
    new Date(`${event.date}T00:00:00`),
  )
  const day = parts.find((part) => part.type === 'day')?.value
  const month = parts.find((part) => part.type === 'month')?.value

  return (
    <div className="grid min-w-14 justify-items-center rounded-md bg-card px-2 py-1 text-center">
      <span className="text-xs font-medium text-muted-foreground">{month}</span>
      <span className="text-lg font-semibold leading-none">{day}</span>
      <span className="mt-1 text-xs text-muted-foreground">{event.time}</span>
    </div>
  )
}
