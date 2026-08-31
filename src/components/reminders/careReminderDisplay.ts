import { formatMediumDateKey } from '#/lib/dateDisplay'
import { careReminderStatusLabels } from 'shared/reminders/careReminderSchema'
import type { CareReminderStatus } from 'shared/reminders/careReminderSchema'
import {
  getCareReminderDaysUntilDue,
  getCareReminderDueState,
} from './careReminderState'
import type { Doc } from 'convex/_generated/dataModel'

export const careReminderOverdueLabel = 'Overdue'

export function getCareReminderStateLabel({
  status,
  overdue,
}: {
  status: CareReminderStatus
  overdue: boolean
}) {
  return overdue ? careReminderOverdueLabel : careReminderStatusLabels[status]
}

export function getCareReminderDueLabel(
  reminder: Pick<Doc<'careReminders'>, 'dueDate' | 'status'>,
  today?: string,
) {
  const dueState = getCareReminderDueState(reminder, today)

  if (dueState === 'today') return 'Due today'

  if (dueState === 'soon') {
    const daysUntilDue = getCareReminderDaysUntilDue(reminder, today)
    const relativeLabel =
      daysUntilDue === 1 ? 'Due tomorrow' : `Due in ${daysUntilDue} days`

    return `${relativeLabel} · ${formatMediumDateKey(reminder.dueDate)}`
  }

  return `Due ${formatMediumDateKey(reminder.dueDate)}`
}
