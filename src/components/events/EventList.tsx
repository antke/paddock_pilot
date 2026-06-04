import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { convexQuery } from '@convex-dev/react-query'
import { ArrowRightIcon } from '@phosphor-icons/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { isEmpty } from 'lodash'
import {
  formatEventDate,
  formatEventType,
  formatRecurrence,
} from './eventDisplay'

type EventListProps = {
  stableId: string
}

type EventTableProps = {
  stableId: string
  events: Array<Doc<'events'>>
  emptyTitle?: string
  emptyDescription?: string
}

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
}: EventTableProps) {
  if (isEmpty(events)) {
    return (
      <Alert>
        <AlertTitle>{emptyTitle}</AlertTitle>
        <AlertDescription>{emptyDescription}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Horses</TableHead>
              <TableHead className="w-10" aria-label="Actions" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {events.map((event) => {
              const recurrenceSummary = formatRecurrence(event.recurrence)

              return (
                <TableRow key={event._id}>
                  <TableCell>
                    <div className="grid gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{event.title}</span>
                        <Badge variant="outline">
                          {formatEventType(event.type)}
                        </Badge>
                        {recurrenceSummary && (
                          <Badge variant="secondary">Recurring</Badge>
                        )}
                      </div>

                      {event.location && (
                        <p className="text-muted-foreground">
                          {event.location}
                        </p>
                      )}

                      {recurrenceSummary && (
                        <p className="text-muted-foreground">
                          {recurrenceSummary}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="grid gap-1">
                      <span>{formatEventDate(event.date)}</span>
                      <span className="text-muted-foreground">
                        {event.time}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>{event.horseIds.length}</TableCell>

                  <TableCell>
                    <Link
                      to="/stables/$stableId/events/$eventId"
                      params={{ stableId, eventId: event._id }}
                    >
                      <Button variant="outline" size="icon-sm">
                        <ArrowRightIcon />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
