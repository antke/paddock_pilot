import { useT, useLocale } from '#/i18n/LocaleProvider'
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
  const t = useT()
  const { locale } = useLocale()

  const recurrenceSummary = formatRecurrence(event.recurrence, locale)
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
          event.type !== 'training' && eventStatus !== 'planned' ? (
            <EventStatusBadge status={eventStatus} />
          ) : undefined
        }
        actions={
          canManageEvent ? (
            <ButtonLink
              to={
                event.type === 'training'
                  ? '/stables/$stableId/training/$eventId/edit'
                  : '/stables/$stableId/events/$eventId/edit'
              }
              params={{ stableId, eventId: event._id }}
              action="edit"
              variant="outline"
            >
              {event.type === 'training'
                ? t('eventViews.editTraining')
                : t('eventViews.edit')}
            </ButtonLink>
          ) : undefined
        }
      />

      <DashboardSectionCard contentGap="compact">
        <DetailPanelGrid
          className={hasProviderDetails ? 'gap-3' : 'gap-3 lg:grid-cols-1'}
        >
          <DetailPanel
            as="h2"
            title={t('eventViews.overview')}
            variant="emphasis"
          >
            <DetailSummaryGrid>
              <DetailSummaryField
                label={t('eventViews.date')}
                value={formatEventDateRange(event.date, event.endDate, locale)}
              />
              <DetailSummaryField
                label={t('eventViews.time')}
                value={event.time}
              />
              <DetailSummaryField
                label={t('eventViews.type')}
                value={formatEventType(event.type, locale)}
              />
              <DetailSummaryField
                label={t('eventViews.status')}
                value={
                  event.type === 'training'
                    ? t('eventViews.individualStatus')
                    : t(`calendar.${eventStatus}`)
                }
              />
              {event.location && (
                <DetailSummaryField
                  label={t('eventViews.location')}
                  value={event.location}
                />
              )}
              {recurrenceSummary && (
                <DetailSummaryField
                  label={t('eventViews.recurrence')}
                  value={recurrenceSummary}
                />
              )}
              {event.description && (
                <DetailSummaryField
                  label={t('eventViews.description')}
                  value={event.description}
                  multiline
                  span="sm2"
                />
              )}
            </DetailSummaryGrid>
          </DetailPanel>

          {hasProviderDetails && (
            <DetailPanel
              as="h2"
              title={t('eventViews.providerCost')}
              variant="emphasis"
            >
              <DetailSummaryGrid className="lg:grid-cols-1">
                {event.providerName && (
                  <DetailSummaryField
                    label={t('eventViews.provider')}
                    value={event.providerName}
                  />
                )}
                {event.providerPhone && (
                  <DetailSummaryField
                    label={t('eventViews.providerPhone')}
                    value={event.providerPhone}
                  />
                )}
                {event.totalCost !== undefined && (
                  <DetailSummaryField
                    label={t('eventViews.totalCost')}
                    value={formatCurrencyAmount(event.totalCost, locale)}
                  />
                )}
                {event.costPerHorse !== undefined && (
                  <DetailSummaryField
                    label={t('eventViews.costPerHorse')}
                    value={formatCurrencyAmount(event.costPerHorse, locale)}
                  />
                )}
              </DetailSummaryGrid>
            </DetailPanel>
          )}

          {event.notesAfterCompletion && (
            <DetailPanel
              as="h2"
              title={t('eventViews.completion')}
              span={hasProviderDetails ? 'lg2' : undefined}
              variant="emphasis"
            >
              <DetailField
                indent={false}
                label={t('eventViews.completionNotes')}
                value={event.notesAfterCompletion}
                multiline
                variant="readable"
              />
            </DetailPanel>
          )}
        </DetailPanelGrid>
      </DashboardSectionCard>

      <DashboardSectionCard
        title={t('eventViews.horses')}
        size="panel"
        contentGap="comfortable"
      >
        {horses.length === 0 ? (
          <DashboardEmptyState chrome="soft" spacing="flush">
            {t('eventViews.noHorses')}
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
