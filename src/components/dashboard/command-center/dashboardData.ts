import { createEventOccurrences } from 'shared/events/eventOccurrences'
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
  DashboardCommandScheduleEvent,
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
  const end = new Date(today)
  end.setDate(today.getDate() + 6)
  const occurrences = createEventOccurrences({
    events: stableEvents,
    windowStart: todayKey,
    windowEnd: formatDateKey(end),
  })
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() + index)
    const key = formatDateKey(date)
    const dayEvents: Array<DashboardCommandScheduleEvent> = occurrences
      .filter(
        (occurrence) =>
          occurrence.startDate <= key && occurrence.endDate >= key,
      )
      .map((occurrence) => ({
        ...occurrence.event,
        occurrenceKey: occurrence.occurrenceKey,
        date: occurrence.startDate,
        endDate: occurrence.durationDays > 1 ? occurrence.endDate : undefined,
        status: occurrence.event.status ?? 'planned',
      }))
      .sort(
        (a, b) =>
          a.date.localeCompare(b.date) ||
          a.time.localeCompare(b.time) ||
          (a.occurrenceKey ?? '').localeCompare(b.occurrenceKey ?? ''),
      )

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
    todayEvents: weekDays[0].events,
    weekDays,
    urgentCount:
      overview.summary.overdueReminderCount +
      overview.summary.highSeverityIssueCount,
  }
}
