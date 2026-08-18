import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardBadgeList } from '#/components/dashboard/DashboardBadgeList'
import {
  DashboardCountBadge,
  DashboardValueBadge,
} from '#/components/dashboard/DashboardBadges'
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
import {
  CareReminderCategoryBadge,
  CareReminderStatusBadge,
} from '#/components/reminders/CareReminderBadges'
import { stableInvitationStatusLabels } from '#/components/stables/StableInvitationBadges'
import { formatCommaList, formatConjunctionList } from '#/lib/textDisplay'
import { useLocalDateContext } from '#/lib/useLocalDateContext'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import type { ComponentProps } from 'react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import type { FunctionReturnType } from 'convex/server'
import { stableInvitationRoleLabels } from 'shared/stableInvitations/invitationSchema'

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
  const { today } = useLocalDateContext()
  const { data: alerts } = useSuspenseQuery(
    convexQuery(api.stableDashboardAlerts.getForStable, {
      stableId: stableId as Id<'stables'>,
      today,
    }),
  )
  const hasAlerts = Object.values(alerts.summary).some((count) => count > 0)

  return (
    <DashboardSection
      chrome="cards"
      gap="compact"
      title="Care alerts"
      badges={
        hasAlerts && <DashboardValueBadge>Actionable</DashboardValueBadge>
      }
      description="Quick checks for urgent care, missing details, follow-ups, and upcoming service coordination."
      size="panel"
      descriptionSize="sm"
      titleStyle="display"
    >
      <DashboardLayoutGrid variant="alertColumns">
        <AlertSection
          title="Needs attention"
          count={alerts.summary.highSeverityIssueCount}
        >
          {alerts.highSeverityIssues.length === 0 ? (
            <EmptyAlert>No high-severity active health issues.</EmptyAlert>
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
          title="Due reminders"
          count={alerts.summary.dueReminderCount}
        >
          {alerts.dueReminders.length === 0 ? (
            <EmptyAlert>No reminders due in the next 7 days.</EmptyAlert>
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
                  <CareReminderStatusBadge
                    status="pending"
                    overdue={reminder.overdue}
                  />
                  <CareReminderCategoryBadge category={reminder.category} />
                </DashboardBadgeList>
                <DashboardMetaList separator="dot">
                  <span>Due {formatEventDate(reminder.dueDate)}</span>
                  {reminder.horseName && <span>{reminder.horseName}</span>}
                </DashboardMetaList>
              </DashboardItemOpenLink>
            ))
          )}
        </AlertSection>

        <AlertSection
          title="Upcoming care"
          count={alerts.summary.upcomingEventCount}
        >
          {alerts.upcomingEvents.length === 0 ? (
            <EmptyAlert>No planned events in the next 30 days.</EmptyAlert>
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
          title="Profile gaps"
          count={alerts.summary.profileGapCount}
        >
          {alerts.profileGaps.length === 0 ? (
            <EmptyAlert>
              Important horse profile details are filled in.
            </EmptyAlert>
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
                  Missing {formatCommaList(horse.missingFields.slice(0, 3))}
                  {horse.missingFields.length > 3 ? '…' : ''}
                </DashboardMetaList>
              </DashboardItemOpenLink>
            ))
          )}
        </AlertSection>

        <AlertSection
          title="Event follow-ups"
          count={alerts.summary.completionNoteGapCount}
        >
          {alerts.completionNoteGaps.length === 0 ? (
            <EmptyAlert>Completed events have aftercare notes.</EmptyAlert>
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
                  Completed {formatEventDate(event.date)} without notes.
                </DashboardMetaList>
              </DashboardItemOpenLink>
            ))
          )}
        </AlertSection>

        <AlertSection
          title="Horse outcomes"
          count={alerts.summary.serviceOutcomeGapCount}
        >
          {alerts.serviceOutcomeGaps.length === 0 ? (
            <EmptyAlert>
              Completed shared visits have per-horse outcomes.
            </EmptyAlert>
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
                  Add outcome notes for {row.horseName}.
                </DashboardMetaList>
              </DashboardItemOpenLink>
            ))
          )}
        </AlertSection>

        <AlertSection
          title="Provider details"
          count={alerts.summary.providerGapCount}
        >
          {alerts.providerGaps.length === 0 ? (
            <EmptyAlert>Event provider details are filled in.</EmptyAlert>
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
                  Missing{' '}
                  {formatConjunctionList([
                    event.missingProviderName ? 'provider name' : null,
                    event.missingProviderPhone ? 'provider phone' : null,
                  ])}
                  .
                </DashboardMetaList>
              </DashboardItemOpenLink>
            ))
          )}
        </AlertSection>

        <AlertSection
          title="Pending invites"
          count={alerts.summary.pendingInvitationCount}
        >
          {alerts.summary.pendingInvitationCount === 0 ? (
            <EmptyAlert>
              No pending stable or horse event invitations.
            </EmptyAlert>
          ) : (
            <>
              {alerts.pendingStableInvitations.slice(0, 2).map((invitation) => (
                <DashboardItemOpenLink
                  key={invitation.id}
                  to="/stables/$stableId/settings"
                  params={{ stableId }}
                  tone={alertRowTone.stable}
                  density="compact"
                >
                  <DashboardItemOpenTitle>
                    {invitation.email}
                  </DashboardItemOpenTitle>
                  <DashboardMetaList>
                    Stable {stableInvitationRoleLabels[invitation.role]}{' '}
                    invitation is{' '}
                    {stableInvitationStatusLabels[invitation.status]}.
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
                    Waiting for {invitation.horseName}.
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
