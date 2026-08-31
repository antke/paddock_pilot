import {
  dateKeyToDate,
  formatDateKey,
  formatShortWeekdayDate,
} from '#/lib/dateDisplay'
import type {
  DashboardCommandData,
  DashboardCommandEvent,
  DashboardCommandHorse,
  DashboardCommandOverview,
  DashboardCommandStable,
} from './dashboardTypes'

export function createDashboardCommandData({
  stable,
  stables,
  events,
  horses,
  overview,
  todayKey,
}: {
  stable: DashboardCommandStable
  stables: Array<DashboardCommandStable>
  events: Array<DashboardCommandEvent>
  horses: Array<DashboardCommandHorse>
  overview: DashboardCommandOverview
  todayKey: string
}): DashboardCommandData {
  const stableEvents = events
    .filter((event) => event.stableId === stable._id)
    .sort((a, b) => {
      const dateSort = a.date.localeCompare(b.date)
      if (dateSort !== 0) return dateSort
      return a.time.localeCompare(b.time)
    })
  const today = dateKeyToDate(todayKey)
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() + index)
    const key = formatDateKey(date)
    const dayEvents = stableEvents.filter((event) => event.date === key)

    return {
      date,
      key,
      label: index === 0 ? 'Today' : formatShortWeekdayDate(date),
      day: `${date.getDate()}`,
      eventCount: dayEvents.length,
      events: dayEvents,
    }
  })

  return {
    stable,
    stables,
    events: stableEvents,
    horses,
    overview,
    upcomingEvents: overview.upcomingEvents,
    dueReminders: overview.dueReminders,
    attentionHorses: overview.attentionHorses,
    todayEvents: stableEvents.filter((event) => event.date === todayKey),
    weekDays,
    urgentCount:
      overview.summary.overdueReminderCount +
      overview.summary.highSeverityIssueCount,
  }
}
