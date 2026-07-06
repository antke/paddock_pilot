import {
  dashboardHeroClassName,
  dashboardSectionClassName,
} from '#/components/dashboard/dashboardChrome'
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
import { eventStatusLabels } from 'shared/events/eventSchema'
import type { EventStatus } from 'shared/events/eventSchema'
import {
  formatEventDateRange,
  formatEventType,
  formatRecurrence,
} from './eventDisplay'
import { EventHorseServiceDetailsCard } from './EventHorseServiceDetailsCard'

type EventDetailProps = {
  stableId: string
  event: Doc<'events'>
  horses: Array<Doc<'horses'>>
}

export function EventDetail({ stableId, event, horses }: EventDetailProps) {
  const recurrenceSummary = formatRecurrence(event.recurrence)
  const eventStatus: EventStatus = event.status ?? 'planned'

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

      <header className={dashboardHeroClassName('cards')}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold">{event.title}</h1>
              <Badge variant="outline">{formatEventType(event.type)}</Badge>
              <Badge
                variant={eventStatus === 'planned' ? 'secondary' : 'outline'}
              >
                {eventStatusLabels[eventStatus]}
              </Badge>
              {recurrenceSummary && (
                <Badge variant="secondary">Recurring</Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              {formatEventDateRange(event.date, event.endDate)} at {event.time}
            </p>
          </div>

          <Link
            to="/stables/$stableId/events/$eventId/edit"
            params={{ stableId, eventId: event._id }}
            className={buttonVariants({ variant: 'outline' })}
          >
            Edit event
          </Link>
        </div>
      </header>

      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem
              label="Date"
              value={formatEventDateRange(event.date, event.endDate)}
            />
            <DetailItem label="Time" value={event.time} />
            <DetailItem label="Type" value={formatEventType(event.type)} />
            <DetailItem label="Status" value={eventStatusLabels[eventStatus]} />
            {event.location && (
              <DetailItem label="Location" value={event.location} />
            )}
            {event.providerName && (
              <DetailItem label="Provider" value={event.providerName} />
            )}
            {event.providerPhone && (
              <DetailItem label="Provider phone" value={event.providerPhone} />
            )}
            {event.totalCost !== undefined && (
              <DetailItem
                label="Total cost"
                value={formatCost(event.totalCost)}
              />
            )}
            {event.costPerHorse !== undefined && (
              <DetailItem
                label="Cost per horse"
                value={formatCost(event.costPerHorse)}
              />
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

          {event.notesAfterCompletion && (
            <div className="grid gap-1">
              <span className="text-muted-foreground">Completion notes</span>
              <p className="whitespace-pre-line">
                {event.notesAfterCompletion}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <section className={dashboardSectionClassName('cards')}>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Horses</h2>
          <p className="text-sm text-muted-foreground">
            Horses linked to this event.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {horses.map((horse) => (
            <Link
              key={horse._id}
              to="/stables/$stableId/horses/$horseId"
              params={{ stableId, horseId: horse._id }}
            >
              <Badge variant="outline">{horse.name}</Badge>
            </Link>
          ))}
        </div>
      </section>

      <EventHorseServiceDetailsCard stableId={stableId} eventId={event._id} />
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

function formatCost(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'GBP',
  }).format(value)
}
