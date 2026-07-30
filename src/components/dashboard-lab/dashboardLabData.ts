import { formatDateKey, formatShortWeekdayDate } from '#/lib/dateDisplay'
import type {
  DashboardLabData,
  DashboardLabEvent,
  DashboardLabHorse,
  DashboardLabOverview,
  DashboardLabStable,
} from './dashboardLabTypes'

export function createDashboardLabData({
  stable,
  stables,
  events,
  horses,
  overview,
}: {
  stable: DashboardLabStable
  stables: Array<DashboardLabStable>
  events: Array<DashboardLabEvent>
  horses: Array<DashboardLabHorse>
  overview: DashboardLabOverview
}): DashboardLabData {
  const stableEvents = events
    .filter((event) => event.stableId === stable._id)
    .sort((a, b) => {
      const dateSort = a.date.localeCompare(b.date)
      if (dateSort !== 0) return dateSort
      return a.time.localeCompare(b.time)
    })
  const today = new Date()
  const todayKey = formatDateKey(today)
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
