import { useT, useLocale } from '#/i18n/LocaleProvider'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardBadgeList } from '#/components/dashboard/DashboardBadgeList'
import { DashboardCountBadge } from '#/components/dashboard/DashboardBadges'
import { DashboardInlineHeader } from '#/components/dashboard/DashboardInlineHeader'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import {
  DashboardItemList,
  DashboardItemOpenLink,
  DashboardItemOpenTitle,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardLayoutGrid } from '#/components/dashboard/DashboardLayoutGrid'
import { DashboardMetaList } from '#/components/dashboard/DashboardMetaList'
import { formatEventDate } from '#/components/events/eventDisplay'
import { EventRow } from '#/components/events/EventRow'
import { HealthIssueSeverityBadge } from '#/components/horses/HorseCareBadges'
import { CareReminderStatusBadge } from '#/components/reminders/CareReminderBadges'
import { formatCommaList, formatConjunctionList } from '#/lib/textDisplay'
import { useLocalDateContext } from '#/lib/useLocalDateContext'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import type { ComponentProps } from 'react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import type { FunctionReturnType } from 'convex/server'
import { getProfileFieldLabel } from '#/i18n/profileFieldLabels'

type StableDashboardAlerts = FunctionReturnType<
  typeof api.stableDashboardAlerts.getForStable
>

type StableDashboardAlertsProps = {
  stableId: string
}

type AlertTone = 'attention' | 'due' | 'planned' | 'stable'

const alertRowTone = {
  attention: 'danger',
  due: 'warning',
  planned: 'primary',
  stable: 'muted',
} satisfies Record<
  AlertTone,
  NonNullable<ComponentProps<typeof DashboardItemOpenLink>['tone']>
>

export function StableDashboardAlerts({
  stableId,
}: StableDashboardAlertsProps) {
  const t = useT()
  const { locale } = useLocale()

  const { today } = useLocalDateContext()
  const { data: alerts } = useSuspenseQuery(
    convexQuery(api.stableDashboardAlerts.getForStable, {
      stableId: stableId as Id<'stables'>,
      today,
    }),
  )
  return (
    <DashboardSection
      chrome="soft"
      gap="compact"
      title={t('stableAlerts.title')}
      description={t('stableAlerts.help')}
      size="panel"
      descriptionSize="sm"
      titleStyle="display"
    >
      <DashboardLayoutGrid variant="alertColumns">
        <AlertSection
          title={t('stableAlerts.attention')}
          count={alerts.summary.highSeverityIssueCount}
        >
          {alerts.highSeverityIssues.length === 0 ? (
            <EmptyAlert>{t('stableAlerts.noHealthIssues')}</EmptyAlert>
          ) : (
            alerts.highSeverityIssues.slice(0, 4).map((issue) => (
              <DashboardItemOpenLink
                key={issue.id}
                to="/stables/$stableId/horses/$horseId"
                params={{ stableId, horseId: issue.horseId }}
                tone={alertRowTone.attention}
                density="compact"
              >
                <DashboardBadgeList>
                  <DashboardItemOpenTitle>
                    {issue.horseName}
                  </DashboardItemOpenTitle>
                  <HealthIssueSeverityBadge severity="high" />
                </DashboardBadgeList>
                <DashboardMetaList>{issue.title}</DashboardMetaList>
              </DashboardItemOpenLink>
            ))
          )}
        </AlertSection>

        <AlertSection
          title={t('stableAlerts.dueReminders')}
          count={alerts.summary.dueReminderCount}
        >
          {alerts.dueReminders.length === 0 ? (
            <EmptyAlert>{t('stableAlerts.noReminders')}</EmptyAlert>
          ) : (
            alerts.dueReminders.slice(0, 4).map((reminder) => (
              <DashboardItemOpenLink
                key={reminder.id}
                to="/stables/$stableId/reminders"
                params={{ stableId }}
                tone={alertRowTone[reminder.overdue ? 'attention' : 'due']}
                density="compact"
              >
                <DashboardBadgeList>
                  <DashboardItemOpenTitle>
                    {reminder.title}
                  </DashboardItemOpenTitle>
                  {reminder.overdue && (
                    <CareReminderStatusBadge status="pending" overdue />
                  )}
                </DashboardBadgeList>
                <DashboardMetaList separator="dot">
                  <span>
                    {t('stableAlerts.due', {
                      date: formatEventDate(reminder.dueDate, locale),
                    })}
                  </span>
                  {reminder.horseName && <span>{reminder.horseName}</span>}
                  <span>{t(`careLabels.category.${reminder.category}`)}</span>
                </DashboardMetaList>
              </DashboardItemOpenLink>
            ))
          )}
        </AlertSection>

        <AlertSection
          title={t('stableAlerts.upcomingCare')}
          count={alerts.summary.upcomingEventCount}
        >
          {alerts.upcomingEvents.length === 0 ? (
            <EmptyAlert>{t('stableAlerts.noEvents')}</EmptyAlert>
          ) : (
            alerts.upcomingEvents.slice(0, 4).map((event) => (
              <EventRow
                key={event.id}
                event={{
                  _id: event.id,
                  stableId,
                  title: event.title,
                  date: event.date,
                  time: event.time,
                  type: event.type,
                  status: 'planned',
                }}
                accent="primary"
                chrome="soft"
                density="compact"
                horseCount={event.horseCount}
                variant="compact"
              />
            ))
          )}
        </AlertSection>

        <AlertSection
          title={t('stableAlerts.profileGaps')}
          count={alerts.summary.profileGapCount}
        >
          {alerts.profileGaps.length === 0 ? (
            <EmptyAlert>{t('stableAlerts.profileComplete')}</EmptyAlert>
          ) : (
            alerts.profileGaps.slice(0, 4).map((horse) => (
              <DashboardItemOpenLink
                key={horse.horseId}
                to="/stables/$stableId/horses/$horseId/edit"
                params={{ stableId, horseId: horse.horseId }}
                tone={alertRowTone.stable}
                density="compact"
              >
                <DashboardItemOpenTitle>
                  {horse.horseName}
                </DashboardItemOpenTitle>
                <DashboardMetaList>
                  {t('stableAlerts.missing', {
                    fields:
                      formatCommaList(
                        horse.missingFields
                          .slice(0, 3)
                          .map((field) => getProfileFieldLabel(field, locale)),
                      ) + (horse.missingFields.length > 3 ? '…' : ''),
                  })}
                </DashboardMetaList>
              </DashboardItemOpenLink>
            ))
          )}
        </AlertSection>

        <AlertSection
          title={t('stableAlerts.followUps')}
          count={alerts.summary.completionNoteGapCount}
        >
          {alerts.completionNoteGaps.length === 0 ? (
            <EmptyAlert>{t('stableAlerts.followUpsComplete')}</EmptyAlert>
          ) : (
            alerts.completionNoteGaps.slice(0, 4).map((event) => (
              <DashboardItemOpenLink
                key={event.id}
                to="/stables/$stableId/events/$eventId/edit"
                params={{ stableId, eventId: event.id }}
                tone={alertRowTone.stable}
                density="compact"
              >
                <DashboardItemOpenTitle>{event.title}</DashboardItemOpenTitle>
                <DashboardMetaList>
                  {t('stableAlerts.completedNoNotes', {
                    date: formatEventDate(event.date, locale),
                  })}
                </DashboardMetaList>
              </DashboardItemOpenLink>
            ))
          )}
        </AlertSection>

        <AlertSection
          title={t('stableAlerts.outcomes')}
          count={alerts.summary.serviceOutcomeGapCount}
        >
          {alerts.serviceOutcomeGaps.length === 0 ? (
            <EmptyAlert>{t('stableAlerts.outcomesComplete')}</EmptyAlert>
          ) : (
            alerts.serviceOutcomeGaps.slice(0, 4).map((row) => (
              <DashboardItemOpenLink
                key={row.id}
                to="/stables/$stableId/events/$eventId"
                params={{ stableId, eventId: row.eventId }}
                tone={alertRowTone.stable}
                density="compact"
              >
                <DashboardItemOpenTitle>
                  {row.eventTitle}
                </DashboardItemOpenTitle>
                <DashboardMetaList>
                  {t('stableAlerts.addOutcome', { horse: row.horseName })}
                </DashboardMetaList>
              </DashboardItemOpenLink>
            ))
          )}
        </AlertSection>

        <AlertSection
          title={t('stableAlerts.providers')}
          count={alerts.summary.providerGapCount}
        >
          {alerts.providerGaps.length === 0 ? (
            <EmptyAlert>{t('stableAlerts.providersComplete')}</EmptyAlert>
          ) : (
            alerts.providerGaps.slice(0, 4).map((event) => (
              <DashboardItemOpenLink
                key={event.id}
                to="/stables/$stableId/events/$eventId/edit"
                params={{ stableId, eventId: event.id }}
                tone={alertRowTone.stable}
                density="compact"
              >
                <DashboardItemOpenTitle>{event.title}</DashboardItemOpenTitle>
                <DashboardMetaList>
                  {t('stableAlerts.providerMissing', {
                    fields: formatConjunctionList(
                      [
                        event.missingProviderName
                          ? t('stableAlerts.providerName')
                          : null,
                        event.missingProviderPhone
                          ? t('stableAlerts.providerPhone')
                          : null,
                      ],
                      locale,
                    ),
                  })}
                </DashboardMetaList>
              </DashboardItemOpenLink>
            ))
          )}
        </AlertSection>

        <AlertSection
          title={t('stableAlerts.pending')}
          count={alerts.summary.pendingInvitationCount}
        >
          {alerts.summary.pendingInvitationCount === 0 ? (
            <EmptyAlert>{t('stableAlerts.pendingEmpty')}</EmptyAlert>
          ) : (
            <>
              {alerts.pendingStableInvitations.slice(0, 2).map((invitation) => (
                <DashboardItemOpenLink
                  key={invitation.id}
                  to="/stables/$stableId/settings"
                  params={{ stableId }}
                  search={{ tab: 'members' }}
                  tone={alertRowTone.stable}
                  density="compact"
                >
                  <DashboardItemOpenTitle>
                    {invitation.email}
                  </DashboardItemOpenTitle>
                  <DashboardMetaList>
                    {t('stableAlerts.stableInvitation', {
                      role: t('invitationFlow.member'),
                      status: t(`invitationFlow.status.${invitation.status}`),
                    })}
                  </DashboardMetaList>
                </DashboardItemOpenLink>
              ))}
              {alerts.pendingHorseInvitations.slice(0, 2).map((invitation) => (
                <DashboardItemOpenLink
                  key={invitation.id}
                  to="/stables/$stableId/events/$eventId"
                  params={{ stableId, eventId: invitation.eventId }}
                  tone={alertRowTone.stable}
                  density="compact"
                >
                  <DashboardItemOpenTitle>
                    {invitation.eventTitle}
                  </DashboardItemOpenTitle>
                  <DashboardMetaList>
                    {t('stableAlerts.waitingHorse', {
                      horse: invitation.horseName,
                    })}
                  </DashboardMetaList>
                </DashboardItemOpenLink>
              ))}
            </>
          )}
        </AlertSection>
      </DashboardLayoutGrid>
    </DashboardSection>
  )
}

function AlertSection({
  title,
  count,
  children,
}: {
  title: string
  count: number
  children: React.ReactNode
}) {
  return (
    <DashboardSection chrome="soft" gap="compact">
      <DashboardInlineHeader
        title={title}
        as="h3"
        aside={<DashboardCountBadge count={count} />}
      />
      <DashboardItemList>{children}</DashboardItemList>
    </DashboardSection>
  )
}

function EmptyAlert({ children }: { children: React.ReactNode }) {
  return (
    <DashboardEmptyState chrome="soft" spacing="flush">
      {children}
    </DashboardEmptyState>
  )
}
