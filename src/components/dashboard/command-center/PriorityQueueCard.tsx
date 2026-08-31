import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { formatShortDateKey } from '#/lib/dateDisplay'
import { careReminderCategoryLabels } from 'shared/reminders/careReminderSchema'
import type {
  DashboardCommandChrome,
  DashboardCommandData,
} from './dashboardTypes'
import {
  DashboardItemCardContent,
  DashboardItemList,
  DashboardItemLinkCard,
} from '#/components/dashboard/DashboardItemCard'
import { ButtonLink } from '#/components/ui/button'

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
  const reminders = data.dueReminders.slice(0, visibleItemLimit)

  return (
    <DashboardSection
      chrome={chrome}
      className={className}
      gap="compact"
      padding={chrome === 'cards' ? 'roomy' : 'default'}
      title="Needs attention"
      description="Due and overdue care tasks."
      descriptionSize="sm"
      size="panel"
      actions={
        <ButtonLink
          to="/stables/$stableId/reminders"
          params={{ stableId: data.stable._id }}
          variant="outline"
          size="sm"
          className="min-h-11"
        >
          View reminders
        </ButtonLink>
      }
    >
      {reminders.length === 0 ? (
        <DashboardEmptyState chrome={chrome}>
          No care tasks need attention.
        </DashboardEmptyState>
      ) : (
        <DashboardItemList gap="compact">
          {reminders.map((reminder) => (
            <DashboardItemLinkCard
              key={reminder.id}
              to="/stables/$stableId/reminders"
              params={{ stableId: reminder.stableId }}
              accent={reminder.overdue ? 'danger' : 'warning'}
              density="compact"
              chrome={recordChrome}
            >
              <DashboardItemCardContent
                title={reminder.title}
                meta={
                  <>
                    <span>
                      {reminder.overdue ? 'Overdue' : 'Due'}{' '}
                      {formatShortDateKey(reminder.dueDate)}
                    </span>
                    <span>{careReminderCategoryLabels[reminder.category]}</span>
                  </>
                }
                metaSeparator="dot"
                density="compact"
              />
            </DashboardItemLinkCard>
          ))}
        </DashboardItemList>
      )}
    </DashboardSection>
  )
}
