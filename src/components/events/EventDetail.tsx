import {
  DetailField,
  DetailPanel,
  DetailPanelGrid,
  DetailSummaryField,
  DetailSummaryGrid,
} from '#/components/dashboard/DetailBlocks'
import { DashboardEntityHero } from '#/components/dashboard/DashboardEntityHero'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { ButtonLink } from '#/components/ui/button'
import { HorseCardLink } from '#/components/horses/HorseCard'
import type { Doc } from 'convex/_generated/dataModel'
import { eventStatusLabels } from 'shared/events/eventSchema'
import type { EventStatus } from 'shared/events/eventSchema'
import { formatCurrencyAmount } from '#/lib/numberDisplay'
import { EventStatusBadge } from './EventBadges'
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
  canManageEvent: boolean
  showServiceDetails?: boolean
}

export function EventDetail({
  stableId,
  event,
  horses,
  canManageEvent,
  showServiceDetails = true,
}: EventDetailProps) {
  const recurrenceSummary = formatRecurrence(event.recurrence)
  const eventStatus: EventStatus = event.status ?? 'planned'
  const hasProviderDetails = Boolean(
    event.providerName ||
    event.providerPhone ||
    event.totalCost !== undefined ||
    event.costPerHorse !== undefined,
  )

  return (
    <>
      <DashboardEntityHero
        title={event.title}
        leading={
          <EventDateBadge date={event.date} time={event.time} variant="hero" />
        }
        badges={
          eventStatus !== 'planned' ? (
            <EventStatusBadge status={eventStatus} />
          ) : undefined
        }
        actions={
          canManageEvent ? (
            <ButtonLink
              to="/stables/$stableId/events/$eventId/edit"
              params={{ stableId, eventId: event._id }}
              action="edit"
              variant="outline"
            >
              Edit event
            </ButtonLink>
          ) : undefined
        }
      />

      <DashboardSectionCard contentGap="compact">
        <DetailPanelGrid
          className={hasProviderDetails ? 'gap-3' : 'gap-3 lg:grid-cols-1'}
        >
          <DetailPanel as="h2" title="Overview" variant="emphasis">
            <DetailSummaryGrid>
              <DetailSummaryField
                label="Date"
                value={formatEventDateRange(event.date, event.endDate)}
              />
              <DetailSummaryField label="Time" value={event.time} />
              <DetailSummaryField
                label="Type"
                value={formatEventType(event.type)}
              />
              <DetailSummaryField
                label="Status"
                value={eventStatusLabels[eventStatus]}
              />
              {event.location && (
                <DetailSummaryField label="Location" value={event.location} />
              )}
              {recurrenceSummary && (
                <DetailSummaryField
                  label="Recurrence"
                  value={recurrenceSummary}
                />
              )}
              {event.description && (
                <DetailSummaryField
                  label="Description"
                  value={event.description}
                  multiline
                  span="sm2"
                />
              )}
            </DetailSummaryGrid>
          </DetailPanel>

          {hasProviderDetails && (
            <DetailPanel as="h2" title="Provider and cost" variant="emphasis">
              <DetailSummaryGrid className="lg:grid-cols-1">
                {event.providerName && (
                  <DetailSummaryField
                    label="Provider"
                    value={event.providerName}
                  />
                )}
                {event.providerPhone && (
                  <DetailSummaryField
                    label="Provider phone"
                    value={event.providerPhone}
                  />
                )}
                {event.totalCost !== undefined && (
                  <DetailSummaryField
                    label="Total cost"
                    value={formatCurrencyAmount(event.totalCost)}
                  />
                )}
                {event.costPerHorse !== undefined && (
                  <DetailSummaryField
                    label="Cost per horse"
                    value={formatCurrencyAmount(event.costPerHorse)}
                  />
                )}
              </DetailSummaryGrid>
            </DetailPanel>
          )}

          {event.notesAfterCompletion && (
            <DetailPanel
              as="h2"
              title="Completion"
              span={hasProviderDetails ? 'lg2' : undefined}
              variant="emphasis"
            >
              <DetailField
                indent={false}
                label="Completion notes"
                value={event.notesAfterCompletion}
                multiline
                variant="readable"
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
        {horses.length === 0 ? (
          <DashboardEmptyState chrome="soft" spacing="flush">
            No horses are attached to this event.
          </DashboardEmptyState>
        ) : (
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
        )}
      </DashboardSectionCard>

      {showServiceDetails && (
        <EventHorseServiceDetailsCard eventId={event._id} />
      )}
    </>
  )
}
