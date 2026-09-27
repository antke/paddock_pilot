import type { DashboardCommandData } from './dashboardTypes'

export function getDashboardAttention(data: DashboardCommandData) {
  const summary =
    data.overview.stableSummaries.find(
      (item) => item.stableId === data.stable._id,
    ) ?? data.overview.summary
  const healthHorses = data.attentionHorses
    .filter(
      (horse) => horse.stableId === data.stable._id && horse.highIssueCount > 0,
    )
    .sort(
      (a, b) =>
        b.highIssueCount - a.highIssueCount ||
        a.horseName.localeCompare(b.horseName),
    )
  const reminders = data.dueReminders.filter(
    (reminder) => reminder.stableId === data.stable._id,
  )
  const availableIssueCount = healthHorses.reduce(
    (count, horse) => count + horse.highIssueCount,
    0,
  )
  return {
    healthHorses,
    reminders,
    healthIssueCount: summary.highSeverityIssueCount,
    reminderCount: summary.dueReminderCount,
    missingHealthIssueCount: Math.max(
      0,
      summary.highSeverityIssueCount - availableIssueCount,
    ),
  }
}
