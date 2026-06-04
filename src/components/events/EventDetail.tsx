import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '#/components/ui/breadcrumb'
import { Badge } from '#/components/ui/badge'
import { buttonVariants } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Link } from '@tanstack/react-router'
import type { Doc } from 'convex/_generated/dataModel'
import {
  formatEventDate,
  formatEventType,
  formatRecurrence,
} from './eventDisplay'

type EventDetailProps = {
  stableId: string
  event: Doc<'events'>
  horses: Array<Doc<'horses'>>
}

export function EventDetail({ stableId, event, horses }: EventDetailProps) {
  const recurrenceSummary = formatRecurrence(event.recurrence)

  return (
    <div className="grid gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link to="/stables">Stables</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link to="/stables/$stableId" params={{ stableId }}>
              Stable
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link to="/stables/$stableId/events" params={{ stableId }}>
              Events
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{event.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{event.title}</h1>
            <Badge variant="outline">{formatEventType(event.type)}</Badge>
            {recurrenceSummary && <Badge variant="secondary">Recurring</Badge>}
          </div>

          <p className="text-sm text-muted-foreground">
            {formatEventDate(event.date)} at {event.time}
          </p>
        </div>

        <Link
          to="/stables/$stableId/events/$eventId/edit"
          params={{ stableId, eventId: event._id }}
          className={buttonVariants({ variant: 'outline' })}
        >
          Edit event
        </Link>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Date" value={formatEventDate(event.date)} />
            <DetailItem label="Time" value={event.time} />
            <DetailItem label="Type" value={formatEventType(event.type)} />
            {event.location && (
              <DetailItem label="Location" value={event.location} />
            )}
          </div>

          {recurrenceSummary && (
            <DetailItem label="Recurrence" value={recurrenceSummary} />
          )}

          {event.description && (
            <div className="grid gap-1">
              <span className="text-muted-foreground">Description</span>
              <p>{event.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horses</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-wrap gap-2">
          {horses.map((horse) => (
            <Link
              key={horse._id}
              to="/stables/$stableId/horses/$horseId"
              params={{ stableId, horseId: horse._id }}
            >
              <Badge variant="outline">{horse.name}</Badge>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}
