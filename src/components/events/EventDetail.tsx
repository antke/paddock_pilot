import { AttendingPeople } from './AttendingPeople'
import { PageBack } from '#/components/layout/PageBack'
import { CreatorByline } from './CreatorByline'
import type { ReactNode } from 'react'
import { useT, useLocale } from '#/i18n/LocaleProvider'
import {
  DetailReference,
  DetailReferenceField,
  DetailReferenceGroup,
  DetailReferenceList,
} from '#/components/dashboard/DetailReference'
import { DashboardEntityHero } from '#/components/dashboard/DashboardEntityHero'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { EventEditAction } from './EventEditAction'
import { EventLifecycleActions } from './EventLifecycleActions'
import { ButtonLink } from '#/components/ui/button'
import { ContactLink } from '#/components/ui/contact-link'
import { useTaskOriginState } from '#/components/layout/mobileTaskNavigation'
import { HorseCardLink } from '#/components/horses/HorseCard'
import type { Doc } from 'convex/_generated/dataModel'
import type { EventStatus } from 'shared/events/eventSchema'
import { formatCurrencyAmount } from '#/lib/numberDisplay'
import { getTodayDateKey } from '#/lib/dateDisplay'
import {
  formatEventDateRange,
  formatEventTime,
  formatEventType,
  formatRecurrence,
} from './eventDisplay'
import { EventHorseServiceDetailsCard } from './EventHorseServiceDetailsCard'
import { EventDateBadge } from './EventDateBadge'
import { EventStatusBadge } from './EventBadges'
import {
  canQuickCompleteEvent,
  EventCompletionCheck,
} from './EventCompletionCheck'
import { useLocalDateContext } from '#/lib/useLocalDateContext'

type EventDetailProps = {
  stableId?: string
  createdByName?: string | null
  event: Doc<'events'>
  horses: Array<Doc<'horses'>>
  canManageEvent: boolean
  showServiceDetails?: boolean
  showHeader?: boolean
  showHorses?: boolean
  /** The completion check, at the top right of the Overview panel. */
  completion?: ReactNode
  /** One date of a recurring event, when opened from that date. */
  occurrenceDate?: string
  /** The session's current leader; without it the event's own value is used. */
  leader?: string | null
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
  completion,
  leader: leaderOverride,
  editSearch,
  occurrenceDate,
}: EventDetailProps) {
  const t = useT()
  const { locale } = useLocale()
  const taskState = useTaskOriginState()
  const { today } = useLocalDateContext()

  const recurrenceSummary = formatRecurrence(event.recurrence, locale)
  const eventStatus: EventStatus = event.status ?? 'planned'
  const hasProviderDetails = Boolean(
    event.providerName ||
    event.providerPhone ||
    event.totalCost !== undefined ||
    event.costPerHorse !== undefined,
  )

  const isTraining = event.type === 'training'
  // The hero badge omits the year and end date, so those still need the field.
  const showDateFacts =
    !showHeader ||
    Boolean(event.endDate && event.endDate !== event.date) ||
    event.date.slice(0, 4) !== getTodayDateKey().slice(0, 4)
  const leader =
    leaderOverride === undefined ? event.training?.rider : leaderOverride
  // With the header, a non-training event shows its status in the meta line
  // and Change status beside Edit event instead of an Overview fact.
  const statusInHeader = showHeader && !isTraining
  // The check replaces Change status: Cancel lives in the "…" menu.
  const quickComplete =
    statusInHeader && canManageEvent && canQuickCompleteEvent(event, today)
  const changeStatusLink = (
    <ButtonLink
      to="/events/$eventId/edit"
      params={{ eventId: event._id }}
      search={{ ...editSearch, focus: 'status' }}
      state={taskState}
      // Outlined like Edit event and the same height, so the pair reads as one row.
      variant="outline"
    >
      {t('eventViews.changeStatus')}
    </ButtonLink>
  )
  const statusField = (
    <DetailReferenceField
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
              variant="outline"
              size="xs"
              // A 28px box pulled out of the line keeps the row's height; the
              // pseudo-element keeps a 44px touch target.
              className="-my-1 after:absolute after:-inset-x-1 after:-inset-y-2 after:content-[''] max-md:min-h-7 max-md:min-w-0 pointer-coarse:min-h-7 pointer-coarse:min-w-0"
            >
              {t('eventViews.changeStatus')}
            </ButtonLink>
          </span>
        ) : (
          t(`calendar.${eventStatus}`)
        )
      }
    />
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
          description={
            statusInHeader ? (
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>
                  <span className="sr-only">{t('eventViews.status')}: </span>
                  <EventStatusBadge status={eventStatus} />
                </span>
                <CreatorByline name={createdByName} />
              </span>
            ) : (
              <CreatorByline name={createdByName} />
            )
          }
          actions={
            canManageEvent ? (
              <>
                {statusInHeader && !quickComplete && changeStatusLink}
                {canManageEvent && (
                  <EventEditAction
                    search={editSearch}
                    eventId={event._id}
                    training={event.type === 'training'}
                  />
                )}
                {canManageEvent && (
                  <EventLifecycleActions
                    eventId={event._id}
                    title={event.title}
                    cancelled={event.status === 'cancelled'}
                    training={event.type === 'training'}
                    stableId={stableId}
                    occurrenceDate={occurrenceDate}
                    occurrenceCancelled={event.occurrenceSkips?.some(
                      (skip) => skip.date === occurrenceDate && !skip.horseId,
                    )}
                  />
                )}
              </>
            ) : undefined
          }
        />
      )}

      <AttendingPeople eventId={event._id} title={event.title} />
      {/* Overview is the panel title, so it matches the Horses panel; later
          groups inside this panel take the nested heading. */}
      <DashboardSectionCard
        title={t('eventViews.overview')}
        size="panel"
        contentGap="compact"
        // Completion is a fact about this session, so it leads the facts, not the header.
        actions={
          completion ??
          (quickComplete ? <EventCompletionCheck event={event} /> : undefined)
        }
      >
        {/* Stacked groups at full width, so no column is left half empty. */}
        <DetailReference>
          <DetailReferenceList mobileColumns={2} wideColumns={3}>
            {!isTraining && !statusInHeader && statusField}
            {/* The hero date block already shows a single day and its time. */}
            {showDateFacts && (
              <DetailReferenceField
                label={t('eventViews.date')}
                value={formatEventDateRange(event.date, event.endDate, locale)}
              />
            )}
            {!showHeader && (
              <DetailReferenceField
                label={t('eventViews.time')}
                value={formatEventTime(event.time, locale)}
              />
            )}
            {/* Who is running a session matters more than its bookkeeping. */}
            {isTraining && leader && (
              <DetailReferenceField
                label={t('eventForm.rider')}
                value={leader}
              />
            )}
            {event.location && (
              <DetailReferenceField
                label={t('eventViews.location')}
                value={event.location}
              />
            )}
            <DetailReferenceField
              label={t('eventViews.type')}
              value={formatEventType(event.type, locale)}
            />
            {recurrenceSummary && (
              <DetailReferenceField
                label={t('eventViews.recurrence')}
                value={recurrenceSummary}
              />
            )}
            {isTraining && statusField}
            {event.description && (
              <DetailReferenceField
                label={t('eventViews.description')}
                value={event.description}
                multiline
                fullWidth
              />
            )}
          </DetailReferenceList>

          {hasProviderDetails && (
            <DetailReferenceGroup
              layout="stacked"
              as="h3"
              title={t('eventViews.providerCost')}
            >
              <DetailReferenceList mobileColumns={2} wideColumns={3}>
                {event.providerName && (
                  <DetailReferenceField
                    label={t('eventViews.provider')}
                    value={event.providerName}
                  />
                )}
                {event.providerPhone && (
                  <DetailReferenceField
                    label={t('eventViews.providerPhone')}
                    value={
                      <ContactLink kind="phone" value={event.providerPhone} />
                    }
                  />
                )}
                {event.totalCost !== undefined && (
                  <DetailReferenceField
                    label={t('eventViews.totalCost')}
                    value={formatCurrencyAmount(event.totalCost, locale)}
                  />
                )}
                {event.costPerHorse !== undefined && (
                  <DetailReferenceField
                    label={t('eventViews.costPerHorse')}
                    value={formatCurrencyAmount(event.costPerHorse, locale)}
                  />
                )}
              </DetailReferenceList>
            </DetailReferenceGroup>
          )}

          {event.notesAfterCompletion && (
            <DetailReferenceGroup
              layout="stacked"
              as="h3"
              title={t('eventViews.completion')}
            >
              {/* The group title already names the notes. */}
              <p className="max-w-prose whitespace-pre-wrap text-lg leading-snug wrap-anywhere">
                {event.notesAfterCompletion}
              </p>
            </DetailReferenceGroup>
          )}
        </DetailReference>
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
        <EventHorseServiceDetailsCard
          eventId={event._id}
          occurrenceDate={occurrenceDate}
        />
      )}
    </>
  )
}
