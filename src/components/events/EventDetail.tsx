import {
  DetailField,
  DetailGrid,
  DetailPanel,
  DetailPanelGrid,
  DetailStack,
} from '#/components/dashboard/DetailBlocks'
import { DashboardEntityHero } from '#/components/dashboard/DashboardEntityHero'
import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { ButtonLink } from '#/components/ui/button'
import { HorseCardLink } from '#/components/horses/HorseCard'
import type { Doc } from 'convex/_generated/dataModel'
import { eventStatusLabels } from 'shared/events/eventSchema'
import type { EventStatus } from 'shared/events/eventSchema'
import { formatCurrencyAmount } from '#/lib/numberDisplay'
import {
  EventRecurringBadge,
  EventStatusBadge,
  EventTypeBadge,
} from './EventBadges'
import {
  formatEventDateRange,
  formatEventType,
  formatRecurrence,
} from './eventDisplay'
import { EventHorseServiceDetailsCard } from './EventHorseServiceDetailsCard'
import { EventDateBadge } from './EventDateBadge'

type EventDetailProps = {
  stableId: string
  event: Doc<'events'>
  horses: Array<Doc<'horses'>>
}

export function EventDetail({ stableId, event, horses }: EventDetailProps) {
  const recurrenceSummary = formatRecurrence(event.recurrence)
  const eventStatus: EventStatus = event.status ?? 'planned'
  const hasProviderDetails = Boolean(
    event.providerName ||
    event.providerPhone ||
    event.totalCost !== undefined ||
    event.costPerHorse !== undefined,
  )

  return (
    <DashboardPage>
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
            params={{ stableId, eventId: event._id }}
            variant="outline"
          >
            Edit event
          </ButtonLink>
        }
      />

      <DashboardSectionCard contentGap="compact">
        <DetailPanelGrid
          className={hasProviderDetails ? 'gap-3' : 'gap-3 lg:grid-cols-1'}
        >
          <DetailPanel title="Overview" variant="emphasis">
            <DetailGrid className="gap-2.5">
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
            </DetailGrid>
          </DetailPanel>

          {hasProviderDetails && (
            <DetailPanel title="Provider and cost" variant="emphasis">
              <DetailStack className="gap-2.5">
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
                    label="Provider phone"
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
              </DetailStack>
            </DetailPanel>
          )}

          {event.notesAfterCompletion && (
            <DetailPanel
              title="Completion"
              span={hasProviderDetails ? 'lg2' : undefined}
              variant="emphasis"
            >
              <DetailField
                framed
                label="Completion notes"
                value={event.notesAfterCompletion}
                valueClassName="font-medium"
                multiline
                variant="emphasis"
              />
            </DetailPanel>
          )}
        </DetailPanelGrid>
      </DashboardSectionCard>

      <DashboardSectionCard
        title="Horses"
        size="panel"
        contentGap="comfortable"
      >
        <DashboardItemList gap="comfortable">
          {horses.map((horse) => (
            <HorseCardLink
              key={horse._id}
              horse={horse}
              stableId={stableId}
              horseId={horse._id}
            />
          ))}
        </DashboardItemList>
      </DashboardSectionCard>

      <EventHorseServiceDetailsCard eventId={event._id} />
    </DashboardPage>
  )
}
