import {
  ArrowRightIcon,
  BellRingingIcon,
  CalendarDotsIcon,
  HorseIcon,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

import { DashboardCountBadge } from '#/components/dashboard/DashboardBadges'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import {
  DashboardItemCardContent,
  DashboardItemLinkCard,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardInlineHeader } from '#/components/dashboard/DashboardInlineHeader'
import { DashboardInlinePanel } from '#/components/dashboard/DashboardInlinePanel'
import { DashboardLayoutGrid } from '#/components/dashboard/DashboardLayoutGrid'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { EventRow } from '#/components/events/EventRow'
import { HorseCardLink } from '#/components/horses/HorseCard'
import {
  HorseActiveIssueCountBadge,
  HorseActiveMedicationCountBadge,
  HorseHighIssueCountBadge,
  HorseOverdueReminderCountBadge,
} from '#/components/horses/HorseCareBadges'
import { CareReminderCategoryBadge } from '#/components/reminders/CareReminderBadges'
import { ButtonLink } from '#/components/ui/button'
import { ScrollableList } from '#/components/ui/scrollable-list'
import { formatShortDateKey } from '#/lib/dateDisplay'
import { formatCountLabel } from '#/lib/numberDisplay'

import type {
  DashboardCommandAttentionHorse,
  DashboardCommandChrome,
  DashboardCommandData,
  DashboardCommandReminder,
  DashboardCommandUpcomingEvent,
} from './dashboardTypes'

type CareKanbanCardProps = {
  data: DashboardCommandData
  visibleItemLimit?: number
  chrome?: DashboardCommandChrome
}

type CareBoardLaneProps = {
  children: ReactNode
  count: number
  description: string
  empty: boolean
  emptyMessage: string
  icon: Icon
  title: string
  viewAll: ReactNode
}

export function CareKanbanCard({
  data,
  visibleItemLimit = 5,
  chrome = 'cards',
}: CareKanbanCardProps) {
  const overdueReminders = data.dueReminders.filter(
    (reminder) => reminder.overdue,
  )

  return (
    <DashboardSection
      chrome={chrome}
      gap="compact"
      title="Care board"
      description="Three focused queues for overdue tasks, planned visits, and horses needing attention."
      size="panel"
      descriptionSize="sm"
    >
      <DashboardLayoutGrid variant="thirdsCompact" className="items-stretch">
        <CareBoardLane
          title="Overdue reminders"
          description="Care tasks already past their due date."
          count={overdueReminders.length}
          icon={BellRingingIcon}
          empty={overdueReminders.length === 0}
          emptyMessage="No overdue care tasks."
          viewAll={
            <ButtonLink
              to="/stables/$stableId/reminders"
              params={{ stableId: data.stable._id }}
              variant="subtle"
              size="sm"
              className="w-full justify-between"
            >
              View reminders
              <ArrowRightIcon data-icon="inline-end" weight="bold" />
            </ButtonLink>
          }
        >
          <ScrollableList
            itemCount={overdueReminders.length}
            visibleItemLimit={visibleItemLimit}
            estimatedItemHeightRem={6.5}
          >
            {overdueReminders.map((reminder) => (
              <ReminderCareBoardItem key={reminder.id} reminder={reminder} />
            ))}
          </ScrollableList>
        </CareBoardLane>

        <CareBoardLane
          title="Upcoming events"
          description="Planned visits and services in the next 14 days."
          count={data.upcomingEvents.length}
          icon={CalendarDotsIcon}
          empty={data.upcomingEvents.length === 0}
          emptyMessage="No planned events in the next 14 days."
          viewAll={
            <ButtonLink
              to="/stables/$stableId/events"
              params={{ stableId: data.stable._id }}
              variant="subtle"
              size="sm"
              className="w-full justify-between"
            >
              View events
              <ArrowRightIcon data-icon="inline-end" weight="bold" />
            </ButtonLink>
          }
        >
          <ScrollableList
            itemCount={data.upcomingEvents.length}
            visibleItemLimit={visibleItemLimit}
            estimatedItemHeightRem={6.5}
          >
            {data.upcomingEvents.map((event) => (
              <EventCareBoardItem key={event.id} event={event} />
            ))}
          </ScrollableList>
        </CareBoardLane>

        <CareBoardLane
          title="Horse watchlist"
          description="Health, medication, and overdue-care signals."
          count={data.attentionHorses.length}
          icon={HorseIcon}
          empty={data.attentionHorses.length === 0}
          emptyMessage="No horses need extra attention."
          viewAll={
            <ButtonLink
              to="/stables/$stableId/horses"
              params={{ stableId: data.stable._id }}
              variant="subtle"
              size="sm"
              className="w-full justify-between"
            >
              View horses
              <ArrowRightIcon data-icon="inline-end" weight="bold" />
            </ButtonLink>
          }
        >
          <ScrollableList
            itemCount={data.attentionHorses.length}
            visibleItemLimit={visibleItemLimit}
            estimatedItemHeightRem={6.5}
          >
            {data.attentionHorses.map((horse) => (
              <HorseCareBoardItem key={horse.horseId} horse={horse} />
            ))}
          </ScrollableList>
        </CareBoardLane>
      </DashboardLayoutGrid>
    </DashboardSection>
  )
}

function CareBoardLane({
  children,
  count,
  description,
  empty,
  emptyMessage,
  icon: LaneIcon,
  title,
  viewAll,
}: CareBoardLaneProps) {
  return (
    <DashboardInlinePanel
      chrome="cards"
      className="h-full min-w-0 bg-card lg:min-h-[30rem] lg:grid-rows-[auto_minmax(0,1fr)_auto]"
      stack="default"
    >
      <DashboardInlineHeader
        title={
          <span className="flex items-center gap-2">
            <span
              className="grid size-7 shrink-0 place-items-center rounded-control border border-border-subtle bg-card text-primary"
              aria-hidden={true}
            >
              <LaneIcon className="size-4" weight="bold" />
            </span>
            <span>{title}</span>
          </span>
        }
        description={description}
        descriptionSize="xs"
        descriptionClassName="max-w-56 leading-5 lg:min-h-10"
        as="h3"
        titleSize="sm"
        titleWeight="semibold"
        aside={<DashboardCountBadge count={count} active={count > 0} />}
      />

      <div className="min-h-0">
        {empty ? (
          <DashboardEmptyState
            chrome="cards"
            className="h-full content-center bg-card"
            spacing="compact"
          >
            {emptyMessage}
          </DashboardEmptyState>
        ) : (
          children
        )}
      </div>

      <div>{viewAll}</div>
    </DashboardInlinePanel>
  )
}

function ReminderCareBoardItem({
  reminder,
}: {
  reminder: DashboardCommandReminder
}) {
  return (
    <DashboardItemLinkCard
      to="/stables/$stableId/reminders"
      params={{ stableId: reminder.stableId }}
      accent="warning"
      chrome="cards"
      density="compact"
      className="min-h-26 bg-card"
    >
      <DashboardItemCardContent
        title={reminder.title}
        density="compact"
        meta={
          <>
            <span>Due {formatShortDateKey(reminder.dueDate)}</span>
            {reminder.horseName && <span>{reminder.horseName}</span>}
          </>
        }
        metaSeparator="dot"
        badges={<CareReminderCategoryBadge category={reminder.category} />}
      />
    </DashboardItemLinkCard>
  )
}

function EventCareBoardItem({
  event,
}: {
  event: DashboardCommandUpcomingEvent
}) {
  return (
    <EventRow
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
      chrome="cards"
      className="min-h-26 bg-card"
      density="compact"
      horseCount={event.horseCount}
      showStatus={false}
      variant="agenda"
    />
  )
}

function HorseCareBoardItem({
  horse,
}: {
  horse: DashboardCommandAttentionHorse
}) {
  return (
    <HorseCardLink
      horse={{
        name: horse.horseName,
        ownerName: horse.ownerName,
        breed: horse.breed,
        profileImageUrl: horse.profileImageUrl,
      }}
      stableId={horse.stableId}
      horseId={horse.horseId}
      accent={horse.highIssueCount > 0 ? 'danger' : 'warning'}
      className="min-h-26 bg-card"
      badges={getPrimaryHorseBadge(horse)}
      meta={getHorseMeta(horse)}
    />
  )
}

function getPrimaryHorseBadge(horse: DashboardCommandAttentionHorse) {
  if (horse.highIssueCount > 0) {
    return <HorseHighIssueCountBadge count={horse.highIssueCount} />
  }

  if (horse.overdueReminderCount > 0) {
    return <HorseOverdueReminderCountBadge count={horse.overdueReminderCount} />
  }

  if (horse.activeMedicationCount > 0) {
    return (
      <HorseActiveMedicationCountBadge count={horse.activeMedicationCount} />
    )
  }

  return <HorseActiveIssueCountBadge count={horse.activeIssueCount} />
}

function getHorseMeta(horse: DashboardCommandAttentionHorse) {
  const signals = [
    horse.activeIssueCount > 0
      ? formatCountLabel(horse.activeIssueCount, 'active issue')
      : null,
    horse.overdueReminderCount > 0
      ? formatCountLabel(horse.overdueReminderCount, 'overdue reminder')
      : null,
    horse.activeMedicationCount > 0
      ? formatCountLabel(horse.activeMedicationCount, 'medication')
      : null,
  ].filter((signal): signal is string => signal !== null)

  return signals.join(' · ') || undefined
}
