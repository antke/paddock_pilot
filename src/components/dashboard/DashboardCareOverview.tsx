import { useT, useLocale } from '#/i18n/LocaleProvider'
import { DashboardBadgeList } from '#/components/dashboard/DashboardBadgeList'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardLayoutGrid } from '#/components/dashboard/DashboardLayoutGrid'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import {
  DashboardMetric,
  DashboardMetricStrip,
} from '#/components/dashboard/DashboardMetric'
import {
  DashboardItemOpenLink,
  DashboardItemList,
  DashboardItemOpenTitle,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardMetaList } from '#/components/dashboard/DashboardMetaList'
import { EventRow } from '#/components/events/EventRow'
import { HorseCardLink } from '#/components/horses/HorseCard'
import {
  HorseHighIssueCountBadge,
  HorseOverdueReminderCountBadge,
} from '#/components/horses/HorseCareBadges'
import {
  CareReminderPriorityBadge,
  CareReminderStatusBadge,
} from '#/components/reminders/CareReminderBadges'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import type { ComponentProps } from 'react'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import type { FunctionReturnType } from 'convex/server'
import { formatShortDateKey } from '#/lib/dateDisplay'
import { useLocalDateContext } from '#/lib/useLocalDateContext'

type UserCareOverview = FunctionReturnType<
  typeof api.userCareOverview.getForCurrentUser
>
type ReminderItem = UserCareOverview['dueReminders'][number]
type EventItem = UserCareOverview['upcomingEvents'][number]
type AttentionHorseItem = UserCareOverview['attentionHorses'][number]
type CareTone = 'due' | 'planned' | 'attention' | 'stable'

const careRowTone = {
  due: 'warning',
  planned: 'primary',
  attention: 'danger',
  stable: 'muted',
} satisfies Record<
  CareTone,
  NonNullable<ComponentProps<typeof DashboardItemOpenLink>['tone']>
>

type DashboardCareOverviewProps = {
  stableId: Doc<'stables'>['_id'] | undefined
}

export function DashboardCareOverview({
  stableId,
}: DashboardCareOverviewProps) {
  const t = useT()

  const { today } = useLocalDateContext()
  const overviewArgs = stableId ? { stableId, today } : { today }
  const { data: overview } = useSuspenseQuery(
    convexQuery(api.userCareOverview.getForCurrentUser, overviewArgs),
  )

  return (
    <DashboardSection
      chrome="soft"
      gap="compact"
      title={t('uiRemainder.careCentre')}
      description={t('uiRemainder.careHelp')}
      size="panel"
      descriptionSize="sm"
    >
      <DashboardMetricStrip>
        <OverviewMetric
          title={t('uiRemainder.dueReminders')}
          value={`${overview.summary.dueReminderCount}`}
        >
          {t('uiRemainder.overdue', {
            count: overview.summary.overdueReminderCount,
          })}
        </OverviewMetric>
        <OverviewMetric
          title={t('uiRemainder.upcomingCare')}
          value={`${overview.summary.upcomingEventCount}`}
        >
          {t('uiRemainder.plannedFortnight')}
        </OverviewMetric>
        <OverviewMetric
          title={t('uiRemainder.highAlerts')}
          value={`${overview.summary.highSeverityIssueCount}`}
        >
          {t('uiRemainder.highIssues')}
        </OverviewMetric>
        <OverviewMetric
          title={t('uiRemainder.activeMedication')}
          value={`${overview.summary.activeMedicationCount}`}
        >
          {t('uiRemainder.medicationCourses')}
        </OverviewMetric>
      </DashboardMetricStrip>

      <DashboardLayoutGrid variant="equal">
        <DueReminderCard reminders={overview.dueReminders} />
        <UpcomingEventCard events={overview.upcomingEvents} />
        <AttentionHorseCard horses={overview.attentionHorses} />
      </DashboardLayoutGrid>
    </DashboardSection>
  )
}

function OverviewMetric({
  title,
  value,
  children,
}: {
  title: string
  value: string
  children: string
}) {
  return (
    <DashboardMetric
      title={title}
      value={value}
      stripItem={{ inset: 'compact' }}
    >
      {children}
    </DashboardMetric>
  )
}

function DueReminderCard({ reminders }: { reminders: ReminderItem[] }) {
  const t = useT()
  const { locale } = useLocale()

  return (
    <DashboardSection
      as="h3"
      chrome="soft"
      className="min-w-0"
      contentAlign="start"
      gap="compact"
      padding="none"
      title={t('uiRemainder.dueReminders')}
      description={t('uiRemainder.remindersHelp')}
      size="panel"
      descriptionSize="sm"
    >
      <DashboardItemList gap="compact">
        {reminders.length === 0 ? (
          <DashboardEmptyState chrome="soft">
            {t('uiRemainder.noReminders')}
          </DashboardEmptyState>
        ) : (
          reminders.map((reminder) => (
            <DashboardItemOpenLink
              key={reminder.id}
              to="/stables/$stableId/reminders"
              params={{ stableId: reminder.stableId }}
              tone={careRowTone[reminder.overdue ? 'attention' : 'due']}
              density="compact"
            >
              <DashboardBadgeList>
                <DashboardItemOpenTitle>
                  {reminder.title}
                </DashboardItemOpenTitle>
                {reminder.overdue && (
                  <CareReminderStatusBadge
                    status="pending"
                    overdue={reminder.overdue}
                  />
                )}
                {reminder.priority === 'high' && (
                  <CareReminderPriorityBadge priority={reminder.priority} />
                )}
              </DashboardBadgeList>
              <DashboardMetaList size="xs" separator="dot">
                <span>
                  {t('careLabels.dueDate', {
                    date: formatShortDateKey(reminder.dueDate, locale),
                  })}
                </span>
                <span>{t(`careLabels.category.${reminder.category}`)}</span>
                <span>{reminder.stableName}</span>
                {reminder.horseName && <span>{reminder.horseName}</span>}
              </DashboardMetaList>
            </DashboardItemOpenLink>
          ))
        )}
      </DashboardItemList>
    </DashboardSection>
  )
}

function UpcomingEventCard({ events }: { events: EventItem[] }) {
  const t = useT()

  return (
    <DashboardSection
      as="h3"
      chrome="soft"
      className="min-w-0"
      contentAlign="start"
      gap="compact"
      padding="none"
      title={t('uiRemainder.upcomingCare')}
      description={t('uiRemainder.eventsHelp')}
      size="panel"
      descriptionSize="sm"
    >
      <DashboardItemList gap="compact">
        {events.length === 0 ? (
          <DashboardEmptyState chrome="soft">
            {t('uiRemainder.noEvents')}
          </DashboardEmptyState>
        ) : (
          events.map((event) => (
            <EventRow
              key={event.id}
              event={{
                _id: event.id,
                stableId: event.stableId,
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
              supplementalMeta={[event.stableName]}
              variant="agenda"
            />
          ))
        )}
      </DashboardItemList>
    </DashboardSection>
  )
}

function AttentionHorseCard({ horses }: { horses: AttentionHorseItem[] }) {
  const t = useT()

  return (
    <DashboardSection
      as="h3"
      chrome="soft"
      className="min-w-0"
      contentAlign="start"
      gap="compact"
      padding="none"
      title={t('uiRemainder.attentionHorses')}
      description={t('uiRemainder.attentionHelp')}
      size="panel"
      descriptionSize="sm"
    >
      <DashboardItemList gap="compact">
        {horses.length === 0 ? (
          <DashboardEmptyState chrome="soft">
            {t('uiRemainder.noAttention')}
          </DashboardEmptyState>
        ) : (
          horses.map((horse) => (
            <HorseCardLink
              key={horse.horseId}
              horse={{
                name: horse.horseName,
                ownerName: horse.ownerName,
                breed: horse.breed,
                profileImageUrl: horse.profileImageUrl,
              }}
              stableId={horse.stableId}
              horseId={horse.horseId}
              badges={
                <>
                  {horse.highIssueCount > 0 && (
                    <HorseHighIssueCountBadge count={horse.highIssueCount} />
                  )}
                  {horse.overdueReminderCount > 0 && (
                    <HorseOverdueReminderCountBadge
                      count={horse.overdueReminderCount}
                    />
                  )}
                </>
              }
              meta={
                <>
                  <span>{horse.stableName}</span>
                  <span>
                    {t('analysisViews.activeIssueCount', {
                      count: horse.activeIssueCount,
                    })}
                  </span>
                  {horse.activeMedicationCount > 0 && (
                    <span>
                      {t('uiRemainder.medications', {
                        count: horse.activeMedicationCount,
                      })}
                    </span>
                  )}
                </>
              }
            />
          ))
        )}
      </DashboardItemList>
    </DashboardSection>
  )
}
