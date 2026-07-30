import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardEntityHero } from '#/components/dashboard/DashboardEntityHero'
import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import { DashboardLayoutStack } from '#/components/dashboard/DashboardLayoutGrid'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import {
  DetailField,
  DetailPanel as EventPanel,
} from '#/components/dashboard/DetailBlocks'
import {
  EventRecurringBadge,
  EventStatusBadge,
  EventTypeBadge,
} from '#/components/events/EventBadges'
import { EventDateBadge } from '#/components/events/EventDateBadge'
import {
  formatEventDateRange,
  formatEventType,
  formatRecurrence,
} from '#/components/events/eventDisplay'
import { HorseCardLink } from '#/components/horses/HorseCard'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '#/components/ui/breadcrumb'
import { ButtonLink } from '#/components/ui/button'
import { Link } from '@tanstack/react-router'
import { eventStatusLabels } from 'shared/events/eventSchema'
import type { EventStatus } from 'shared/events/eventSchema'
import { formatCurrencyAmount } from '#/lib/numberDisplay'

type EventDetailPageLabProps = {
  data: DashboardLabData
}

type EventDetailLabEvent = DashboardLabData['events'][number]
type EventDetailLabHorse = DashboardLabData['horses'][number]

export function EventDetailPageLab({ data }: EventDetailPageLabProps) {
  const event = data.events[0]

  if (!event) {
    return (
      <DashboardEmptyState chrome="soft">
        No events added yet.
      </DashboardEmptyState>
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
    <DashboardLayoutStack>
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

      <DashboardEntityHero
        title={event.title}
        leading={
          <EventDateBadge date={event.date} time={event.time} variant="hero" />
        }
        badges={
          <>
            <EventTypeBadge type={event.type} />
            <EventStatusBadge status={eventStatus} />
            {recurrenceSummary && <EventRecurringBadge />}
          </>
        }
        actions={
          <ButtonLink
            to="/stables/$stableId/events/$eventId/edit"
            params={{ stableId: data.stable._id, eventId: event._id }}
            variant="outline"
          >
            Edit event
          </ButtonLink>
        }
      />

      <DashboardSectionCard contentGap="compact">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
          <EventPanel title="Overview" variant="emphasis">
            <div className="grid gap-2.5 sm:grid-cols-2">
              <DetailField
                framed
                label="Date"
                value={formatEventDateRange(event.date, event.endDate)}
                variant="emphasis"
              />
              <DetailField
                framed
                label="Time"
                value={event.time}
                variant="emphasis"
              />
              <DetailField
                framed
                label="Type"
                value={formatEventType(event.type)}
                variant="emphasis"
              />
              <DetailField
                framed
                label="Status"
                value={eventStatusLabels[eventStatus]}
                variant="emphasis"
              />
              {event.location && (
                <DetailField
                  framed
                  label="Location"
                  value={event.location}
                  variant="emphasis"
                />
              )}
              {recurrenceSummary && (
                <DetailField
                  framed
                  label="Recurrence"
                  value={recurrenceSummary}
                  variant="emphasis"
                />
              )}
              {event.description && (
                <DetailField
                  framed
                  label="Description"
                  value={event.description}
                  valueClassName="font-medium"
                  multiline
                  span="sm2"
                  variant="emphasis"
                />
              )}
            </div>
          </EventPanel>

          <EventPanel title="Provider and cost" variant="emphasis">
            <div className="grid gap-2.5">
              {event.providerName && (
                <DetailField
                  framed
                  label="Provider"
                  value={event.providerName}
                  variant="emphasis"
                />
              )}
              {event.providerPhone && (
                <DetailField
                  framed
                  label="Phone"
                  value={event.providerPhone}
                  variant="emphasis"
                />
              )}
              {event.totalCost !== undefined && (
                <DetailField
                  framed
                  label="Total cost"
                  value={formatCurrencyAmount(event.totalCost)}
                  variant="emphasis"
                />
              )}
              {event.costPerHorse !== undefined && (
                <DetailField
                  framed
                  label="Cost per horse"
                  value={formatCurrencyAmount(event.costPerHorse)}
                  variant="emphasis"
                />
              )}
            </div>
          </EventPanel>

          {event.notesAfterCompletion && (
            <EventPanel title="Completion" span="lg2" variant="emphasis">
              <DetailField
                framed
                label="Completion notes"
                value={event.notesAfterCompletion}
                valueClassName="font-medium"
                multiline
                variant="emphasis"
              />
            </EventPanel>
          )}
        </div>
      </DashboardSectionCard>

      <DashboardSectionCard
        title="Horses"
        size="panel"
        contentGap="comfortable"
      >
        {horses.length === 0 ? (
          <DashboardEmptyState chrome="soft">
            No horses are attached to this event.
          </DashboardEmptyState>
        ) : (
          <DashboardItemList gap="comfortable">
            {horses.map((horse) => (
              <HorseLinkCard
                key={horse._id}
                stableId={data.stable._id}
                horse={horse}
              />
            ))}
          </DashboardItemList>
        )}
      </DashboardSectionCard>
    </DashboardLayoutStack>
  )
}

function HorseLinkCard({
  stableId,
  horse,
}: {
  stableId: DashboardLabData['stable']['_id']
  horse: EventDetailLabHorse
}) {
  return <HorseCardLink horse={horse} stableId={stableId} horseId={horse._id} />
}
