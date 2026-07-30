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
import { HorseNameBadge } from '#/components/horses/HorseBadges'
import { HorseCardLink } from '#/components/horses/HorseCard'
import {
  HorseActiveMedicationCountBadge,
  HorseHighIssueCountBadge,
  HorseOverdueReminderCountBadge,
} from '#/components/horses/HorseCareBadges'
import {
  CareReminderCategoryBadge,
  CareReminderPriorityBadge,
  CareReminderStatusBadge,
} from '#/components/reminders/CareReminderBadges'
import { StableNameBadge } from '#/components/stables/StableBadges'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import type { ComponentProps } from 'react'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import type { FunctionReturnType } from 'convex/server'
import { formatShortDateKey } from '#/lib/dateDisplay'
import { formatCountLabel } from '#/lib/numberDisplay'

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
  const overviewArgs = stableId ? { stableId } : {}
  const { data: overview } = useSuspenseQuery(
    convexQuery(api.userCareOverview.getForCurrentUser, overviewArgs),
  )

  return (
    <DashboardSection
      chrome="cards"
      gap="compact"
      title="Care command centre"
      description="Reminders, attention items, and upcoming care for the selected stable."
      size="panel"
      descriptionSize="sm"
    >
      <DashboardMetricStrip>
        <OverviewMetric
          title="Due reminders"
          value={`${overview.summary.dueReminderCount}`}
        >
          {`${overview.summary.overdueReminderCount} overdue`}
        </OverviewMetric>
        <OverviewMetric
          title="Upcoming care"
          value={`${overview.summary.upcomingEventCount}`}
        >
          Planned in the next 14 days
        </OverviewMetric>
        <OverviewMetric
          title="High alerts"
          value={`${overview.summary.highSeverityIssueCount}`}
        >
          Active high-severity issues
        </OverviewMetric>
        <OverviewMetric
          title="Active medication"
          value={`${overview.summary.activeMedicationCount}`}
        >
          Current medication courses
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
  return (
    <DashboardSection
      as="h3"
      chrome="soft"
      className="min-w-0"
      contentAlign="start"
      gap="compact"
      padding="none"
      title="Due reminders"
      description="Pending reminders due soon for this stable."
      size="panel"
      descriptionSize="sm"
    >
      <DashboardItemList gap="compact">
        {reminders.length === 0 ? (
          <DashboardEmptyState chrome="cards">
            No reminders due in the next 14 days.
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
                {reminder.priority && (
                  <CareReminderPriorityBadge priority={reminder.priority} />
                )}
              </DashboardBadgeList>
              <DashboardMetaList size="xs">
                <span>Due {formatShortDateKey(reminder.dueDate)}</span>
              </DashboardMetaList>
              <DashboardBadgeList gap="compact">
                <CareReminderCategoryBadge category={reminder.category} />
                <StableNameBadge name={reminder.stableName} />
                {reminder.horseName && (
                  <HorseNameBadge name={reminder.horseName} />
                )}
              </DashboardBadgeList>
            </DashboardItemOpenLink>
          ))
        )}
      </DashboardItemList>
    </DashboardSection>
  )
}

function UpcomingEventCard({ events }: { events: EventItem[] }) {
  return (
    <DashboardSection
      as="h3"
      chrome="soft"
      className="min-w-0"
      contentAlign="start"
      gap="compact"
      padding="none"
      title="Upcoming care"
      description="Planned events for this stable."
      size="panel"
      descriptionSize="sm"
    >
      <DashboardItemList gap="compact">
        {events.length === 0 ? (
          <DashboardEmptyState chrome="cards">
            No planned events in the next 14 days.
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
  return (
    <DashboardSection
      as="h3"
      chrome="soft"
      className="min-w-0"
      contentAlign="start"
      gap="compact"
      padding="none"
      title="Horses needing attention"
      description="Health, medication, and overdue reminder signals."
      size="panel"
      descriptionSize="sm"
    >
      <DashboardItemList gap="compact">
        {horses.length === 0 ? (
          <DashboardEmptyState chrome="cards">
            No horse-level attention items right now.
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
                  {horse.activeMedicationCount > 0 && (
                    <HorseActiveMedicationCountBadge
                      count={horse.activeMedicationCount}
                    />
                  )}
                  <StableNameBadge name={horse.stableName} />
                </>
              }
              meta={
                <span>
                  {formatCountLabel(horse.activeIssueCount, 'active issue')}
                </span>
              }
            />
          ))
        )}
      </DashboardItemList>
    </DashboardSection>
  )
}
