import type { Doc } from 'convex/_generated/dataModel'

const getTodayKey = () => new Date().toISOString().slice(0, 10)

export function isCareReminderOverdue(reminder: Doc<'careReminders'>) {
  return reminder.status === 'pending' && reminder.dueDate < getTodayKey()
}
