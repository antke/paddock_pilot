import { careReminderStatusLabels } from 'shared/reminders/careReminderSchema'
import type { CareReminderStatus } from 'shared/reminders/careReminderSchema'

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
