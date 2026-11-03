import { AttendingPeople } from './AttendingPeople'
import { PageBack } from '#/components/layout/PageBack'
import { CreatorByline } from './CreatorByline'
import type { ReactNode } from 'react'
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
import { useSmallScreen } from '#/lib/useSmallScreen'
import { EventEditAction } from './EventEditAction'
import { ButtonLink } from '#/components/ui/button'
import { useTaskOriginState } from '#/components/layout/mobileTaskNavigation'
import { HorseCardLink } from '#/components/horses/HorseCard'
import type { Doc } from 'convex/_generated/dataModel'
import type { EventStatus } from 'shared/events/eventSchema'
import { formatCurrencyAmount } from '#/lib/numberDisplay'
import { EventStatusBadge } from './EventBadges'
import {
  formatEventDateRange,
  formatEventTime,
  formatEventType,
  formatRecurrence,
} from './eventDisplay'
import { EventHorseServiceDetailsCard } from './EventHorseServiceDetailsCard'
import { EventDateBadge } from './EventDateBadge'

type EventDetailProps = {
  stableId?: string
  createdByName?: string | null
  event: Doc<'events'>
  horses: Array<Doc<'horses'>>
  canManageEvent: boolean
  showServiceDetails?: boolean
  showHeader?: boolean
  showHorses?: boolean
  headerActions?: ReactNode
  editSearch?: {
    date?: string
    horseId?: string
    participationId?: string
    stableId?: string
  }
}

export function EventDetail({
  stableId,
  event,
  createdByName,
  horses,
  canManageEvent,
  showServiceDetails = true,
  showHeader = true,
  showHorses = true,
  headerActions,
  editSearch,
}: EventDetailProps) {
  const t = useT()
  const { locale } = useLocale()
  const smallScreen = useSmallScreen()
  const taskState = useTaskOriginState()

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
      {showHeader && (
        <DashboardEntityHero
          title={event.title}
          backAction={
            // One personal route serves both kinds; training returns to Training.
            !stableId && event.type === 'training' ? (
              <PageBack target={{ to: '/training', preferHistory: true }} />
            ) : undefined
          }
          leading={
            <EventDateBadge
              date={event.date}
              time={event.time}
              variant="hero"
            />
          }
          badges={
            event.type !== 'training' && eventStatus !== 'planned' ? (
              <EventStatusBadge status={eventStatus} />
            ) : undefined
          }
          actions={
            canManageEvent && !smallScreen ? (
              <>
                {canManageEvent && !smallScreen ? (
                  <EventEditAction
                    search={editSearch}
                    eventId={event._id}
                    training={event.type === 'training'}
                  />
                ) : undefined}
              </>
            ) : undefined
          }
        >
          <div className="flex min-w-0 items-center justify-between gap-4">
            <div className="min-w-0">
              <CreatorByline name={createdByName} />
            </div>
            {headerActions && (
              <div className="ml-auto shrink-0">{headerActions}</div>
            )}
          </div>
        </DashboardEntityHero>
      )}

      {showHeader && canManageEvent && smallScreen && (
        <EventEditAction
          search={editSearch}
          eventId={event._id}
          training={event.type === 'training'}
          mobile
        />
      )}

      <AttendingPeople eventId={event._id} />
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
                value={formatEventTime(event.time, locale)}
              />
              <DetailSummaryField
                label={t('eventViews.type')}
                value={formatEventType(event.type, locale)}
              />
              <DetailSummaryField
                label={t('eventViews.status')}
                value={
                  event.type === 'training' ? (
                    t('eventViews.individualStatus')
                  ) : canManageEvent ? (
                    <span className="flex flex-wrap items-baseline gap-x-3">
                      {t(`calendar.${eventStatus}`)}
                      <ButtonLink
                        to="/events/$eventId/edit"
                        params={{ eventId: event._id }}
                        search={{ ...editSearch, focus: 'status' }}
                        state={taskState}
                        variant="link"
                        // Text height in the summary row; the pseudo-element
                        // keeps a 44px touch target without stretching it.
                        className="h-auto min-h-0 min-w-0 px-0 py-0 after:absolute after:-inset-x-1 after:-inset-y-3 after:content-[''] max-md:min-h-0 max-md:min-w-0 pointer-coarse:min-h-0 pointer-coarse:min-w-0"
                      >
                        {t('eventViews.changeStatus')}
                      </ButtonLink>
                    </span>
                  ) : (
                    t(`calendar.${eventStatus}`)
                  )
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

      {showHorses && (
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
      )}

      {showServiceDetails && (
        <EventHorseServiceDetailsCard eventId={event._id} />
      )}
    </>
  )
}
