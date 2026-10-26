import type { DashboardCareData } from './dashboardTypes'

export function getDashboardAttention(data: DashboardCareData) {
  const summary = data.stable
    ? (data.overview.stableSummaries.find(
        (item) => item.stableId === data.stable?._id,
      ) ?? data.overview.summary)
    : data.overview.summary
  const healthHorses = data.attentionHorses
    .filter(
      (horse) =>
        (!data.stable || horse.stableId === data.stable._id) &&
        horse.highIssueCount > 0,
    )
    .sort(
      (a, b) =>
        b.highIssueCount - a.highIssueCount ||
        a.horseName.localeCompare(b.horseName),
    )
  const reminders = data.dueReminders
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
