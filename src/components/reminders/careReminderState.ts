import { getTodayDateKey } from '#/lib/dateDisplay'
import type { DashboardItemAccent } from '#/components/dashboard/DashboardItemCard'
import type { Doc } from 'convex/_generated/dataModel'

export function isCareReminderOverdue(reminder: Doc<'careReminders'>) {
  return reminder.status === 'pending' && reminder.dueDate < getTodayDateKey()
}

export function getCareReminderRecordAccent(
  reminder: Doc<'careReminders'>,
): DashboardItemAccent {
  if (isCareReminderOverdue(reminder)) return 'danger'
  if (reminder.status === 'dismissed') return 'muted'
  if (reminder.status === 'completed') return 'primary'
  if (reminder.dueDate === getTodayDateKey()) return 'warning'
  return 'primary'
}
