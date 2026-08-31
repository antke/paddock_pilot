import { dateKeyToTimestamp, getTodayDateKey } from '#/lib/dateDisplay'
import type { DashboardItemAccent } from '#/components/dashboard/DashboardItemCard'
import type { Doc } from 'convex/_generated/dataModel'

type CareReminderStateSource = Pick<Doc<'careReminders'>, 'dueDate' | 'status'>

export type CareReminderDueState =
  | 'inactive'
  | 'overdue'
  | 'today'
  | 'soon'
  | 'upcoming'

const millisecondsPerDay = 24 * 60 * 60 * 1000
const dueSoonWindowDays = 7

export function getCareReminderDaysUntilDue(
  reminder: CareReminderStateSource,
  today = getTodayDateKey(),
) {
  return Math.round(
    (dateKeyToTimestamp(reminder.dueDate) - dateKeyToTimestamp(today)) /
      millisecondsPerDay,
  )
}

export function getCareReminderDueState(
  reminder: CareReminderStateSource,
  today = getTodayDateKey(),
): CareReminderDueState {
  if (reminder.status !== 'pending') return 'inactive'

  const daysUntilDue = getCareReminderDaysUntilDue(reminder, today)

  if (daysUntilDue < 0) return 'overdue'
  if (daysUntilDue === 0) return 'today'
  if (daysUntilDue <= dueSoonWindowDays) return 'soon'

  return 'upcoming'
}

export function isCareReminderOverdue(
  reminder: CareReminderStateSource,
  today = getTodayDateKey(),
) {
  return getCareReminderDueState(reminder, today) === 'overdue'
}

export function getCareReminderRecordAccent(
  reminder: CareReminderStateSource,
  today = getTodayDateKey(),
): DashboardItemAccent {
  const dueState = getCareReminderDueState(reminder, today)

  if (dueState === 'overdue') return 'danger'
  if (reminder.status === 'dismissed') return 'muted'
  if (reminder.status === 'completed') return 'primary'
  if (dueState === 'today') return 'warning'

  return 'none'
}
