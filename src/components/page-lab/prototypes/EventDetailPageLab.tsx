import {
  dashboardEmptyClassName,
  dashboardSectionClassName,
} from '#/components/dashboard/dashboardChrome'
import {
  formatEventDateRange,
  formatEventType,
  formatRecurrence,
} from '#/components/events/eventDisplay'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { Badge } from '#/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '#/components/ui/breadcrumb'
import { buttonVariants } from '#/components/ui/button'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { eventStatusLabels } from 'shared/events/eventSchema'
import type { EventStatus } from 'shared/events/eventSchema'

type EventDetailPageLabProps = {
  data: DashboardLabData
}

type EventDetailLabEvent = DashboardLabData['events'][number]
type EventDetailLabHorse = DashboardLabData['horses'][number]

export function EventDetailPageLab({ data }: EventDetailPageLabProps) {
  const event = data.events[0]

  if (!event) {
    return (
      <div className={dashboardEmptyClassName('soft')}>
        <p>No events added yet.</p>
      </div>
    )
  }

  return <EventDetailPreview data={data} event={event} />
}

function EventDetailPreview({
  data,
  event,
}: {
  data: DashboardLabData
  event: EventDetailLabEvent
}) {
  const horses = data.horses.filter((horse) =>
    event.horseIds.includes(horse._id),
  )
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
            <Link
              to="/stables/$stableId"
              params={{ stableId: data.stable._id }}
            >
              Stable
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link
              to="/stables/$stableId/events"
              params={{ stableId: data.stable._id }}
            >
              Events
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{event.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <section className={dashboardSectionClassName('soft', 'grid gap-6')}>
        <header className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 items-start gap-4">
            <EventDateTile event={event} />

            <div className="grid min-w-0 gap-3">
              <div className="grid gap-2">
                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  {event.title}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{formatEventType(event.type)}</Badge>
                <Badge variant="secondary">
                  {eventStatusLabels[eventStatus]}
                </Badge>
                {recurrenceSummary && (
                  <Badge variant="secondary">Recurring</Badge>
                )}
              </div>
            </div>
          </div>

          <Link
            to="/stables/$stableId/events/$eventId/edit"
            params={{ stableId: data.stable._id, eventId: event._id }}
            className={buttonVariants({ variant: 'secondary' })}
          >
            Edit event
          </Link>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <EventMetric
            label="Date"
            value={formatEventDateRange(event.date, event.endDate)}
          />
          <EventMetric label="Time" value={event.time} />
          <EventMetric label="Horses" value={`${horses.length}`} />
          <EventMetric label="Cost" value={formatEventCostSummary(event)} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
          <EventPanel title="Overview">
            <div className="grid gap-3 sm:grid-cols-2">
              <EventField label="Type" value={formatEventType(event.type)} />
              <EventField
                label="Status"
                value={eventStatusLabels[eventStatus]}
              />
              {event.location && (
                <EventField label="Location" value={event.location} />
              )}
              {recurrenceSummary && (
                <EventField label="Recurrence" value={recurrenceSummary} />
              )}
            </div>

            {event.description && (
              <NoteBlock label="Description">{event.description}</NoteBlock>
            )}
          </EventPanel>

          <EventPanel title="Provider">
            <div className="grid gap-3">
              {event.providerName && (
                <EventField label="Provider" value={event.providerName} />
              )}
              {event.providerPhone && (
                <EventField label="Phone" value={event.providerPhone} />
              )}
              {event.totalCost !== undefined && (
                <EventField
                  label="Total cost"
                  value={formatCost(event.totalCost)}
                />
              )}
              {event.costPerHorse !== undefined && (
                <EventField
                  label="Cost per horse"
                  value={formatCost(event.costPerHorse)}
                />
              )}
            </div>
          </EventPanel>

          {event.notesAfterCompletion && (
            <EventPanel title="Notes" className="lg:col-span-2">
              <p className="whitespace-pre-wrap rounded-row bg-background/55 p-5 text-sm leading-6">
                {event.notesAfterCompletion}
              </p>
            </EventPanel>
          )}
        </div>
      </section>

      <section className={dashboardSectionClassName('soft', 'grid gap-5')}>
        <div className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">Horses</h2>
        </div>

        {horses.length === 0 ? (
          <p className={dashboardEmptyClassName('soft')}>
            No horses are attached to this event.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {horses.map((horse) => (
              <HorseLinkCard
                key={horse._id}
                stableId={data.stable._id}
                horse={horse}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function EventDateTile({ event }: { event: EventDetailLabEvent }) {
  const date = new Date(`${event.date}T00:00:00`)
  const month = new Intl.DateTimeFormat(undefined, { month: 'short' }).format(
    date,
  )
  const day = new Intl.DateTimeFormat(undefined, { day: 'numeric' }).format(
    date,
  )

  return (
    <div className="flex size-[4.5rem] shrink-0 flex-col items-center justify-center rounded-row bg-background/65 p-2 text-center">
      <span className="whitespace-nowrap text-[0.65rem] font-semibold uppercase leading-none tracking-[0.14em] text-muted-foreground">
        {month}
      </span>
      <span className="mt-1 text-2xl font-semibold leading-none tracking-tight">
        {day}
      </span>
      <span className="mt-1.5 whitespace-nowrap text-[0.65rem] font-medium leading-none text-muted-foreground">
        {event.time}
      </span>
    </div>
  )
}

function EventMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-row bg-background/60 p-5">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-3 text-xl font-semibold tracking-tight">{value}</div>
    </div>
  )
}

function EventPanel({
  title,
  className,
  children,
}: {
  title: string
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={[
        'grid content-start gap-4 rounded-row bg-background/60 p-5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  )
}

function EventField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-row bg-background/45 p-5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium leading-6">{value}</span>
    </div>
  )
}

function NoteBlock({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-2">
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <p className="whitespace-pre-wrap rounded-row bg-background/55 p-5 text-sm leading-6">
        {children}
      </p>
    </div>
  )
}

function HorseLinkCard({
  stableId,
  horse,
}: {
  stableId: DashboardLabData['stable']['_id']
  horse: EventDetailLabHorse
}) {
  return (
    <Link
      to="/stables/$stableId/horses/$horseId"
      params={{ stableId, horseId: horse._id }}
      className="group/horse grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-row bg-background/60 p-5 transition-colors hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:outline-none"
    >
      <div className="size-12 overflow-hidden rounded-row bg-muted/45">
        {horse.profileImageUrl ? (
          <img
            src={horse.profileImageUrl}
            alt={`${horse.name} profile`}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-lg font-semibold text-muted-foreground">
            {horse.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <h3 className="line-clamp-1 font-semibold underline-offset-4 group-hover/horse:underline">
          {horse.name}
        </h3>
        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
          {horse.ownerName}
          {horse.breed ? ` · ${horse.breed}` : ''}
        </p>
      </div>
    </Link>
  )
}

function formatEventCostSummary(event: EventDetailLabEvent) {
  if (event.totalCost !== undefined) return formatCost(event.totalCost)
  if (event.costPerHorse !== undefined)
    return `${formatCost(event.costPerHorse)} each`
  return 'Not set'
}

function formatCost(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'GBP',
  }).format(value)
}
