import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { EventRow } from '#/components/events/EventRow'
import { CareReminderCategoryBadge } from '#/components/reminders/CareReminderBadges'
import { formatShortDateKey } from '#/lib/dateDisplay'
import { cn } from '#/lib/utils'
import type {
  DashboardCommandChrome,
  DashboardCommandData,
} from './dashboardTypes'
import {
  DashboardItemCardContent,
  DashboardItemLinkCard,
} from '#/components/dashboard/DashboardItemCard'
import { ScrollableList } from '#/components/ui/scrollable-list'

type PriorityQueueCardProps = {
  className?: string
  data: DashboardCommandData
  visibleItemLimit?: number
  chrome?: DashboardCommandChrome
}

export function PriorityQueueCard({
  className,
  data,
  visibleItemLimit = 5,
  chrome = 'cards',
}: PriorityQueueCardProps) {
  const recordChrome = 'soft' as const
  const rows = [
    ...data.dueReminders.map((reminder) => ({
      kind: 'reminder' as const,
      id: reminder.id,
      title: reminder.title,
      meta: `${reminder.overdue ? 'Overdue' : 'Due'} ${formatShortDateKey(reminder.dueDate)}`,
      badge: <CareReminderCategoryBadge category={reminder.category} />,
      tone: reminder.overdue ? 'urgent' : 'due',
      to: '/stables/$stableId/reminders' as const,
      params: { stableId: reminder.stableId },
    })),
    ...data.upcomingEvents.map((event) => ({
      kind: 'event' as const,
      id: event.id,
      event,
      tone: 'planned',
    })),
  ]

  return (
    <DashboardSection
      chrome={chrome}
      className={cn(
        'max-h-[80vh] min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden',
        className,
      )}
      gap="compact"
      padding={chrome === 'cards' ? 'roomy' : 'default'}
      title="Priority queue"
      size="panel"
    >
      {rows.length === 0 ? (
        <DashboardEmptyState chrome={chrome}>
          Nothing urgent for this stable.
        </DashboardEmptyState>
      ) : (
        <ScrollableList
          estimatedItemHeightRem={5.25}
          fillParent
          itemCount={rows.length}
          visibleItemLimit={visibleItemLimit}
        >
          {rows.map((row) => {
            if (row.kind === 'event') {
              return (
                <EventRow
                  key={`${row.tone}-${row.id}`}
                  event={{
                    _id: row.event.id,
                    stableId: row.event.stableId,
                    title: row.event.title,
                    date: row.event.date,
                    time: row.event.time,
                    type: row.event.type,
                    status: 'planned',
                  }}
                  accent="primary"
                  chrome={recordChrome}
                  horseCount={row.event.horseCount}
                  variant="compact"
                />
              )
            }

            return (
              <DashboardItemLinkCard
                key={`${row.tone}-${row.id}`}
                to={row.to}
                params={row.params}
                accent={row.tone === 'urgent' ? 'danger' : 'warning'}
                density="compact"
                chrome={recordChrome}
              >
                <DashboardItemCardContent
                  title={row.title}
                  meta={row.meta}
                  density="compact"
                  badges={row.badge}
                />
              </DashboardItemLinkCard>
            )
          })}
        </ScrollableList>
      )}
    </DashboardSection>
  )
}
