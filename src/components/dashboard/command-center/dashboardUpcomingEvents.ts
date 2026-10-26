import { createEventOccurrences } from 'shared/events/eventOccurrences'
import { dateKeyToDate, formatDateKey } from '#/lib/dateDisplay'
import type {
  DashboardActivityData,
  DashboardCommandScheduleEvent,
} from './dashboardTypes'

/** Tomorrow through +7 days. Count occurrences, not occupied calendar cells. */
export function dashboardUpcomingEvents(data: DashboardActivityData) {
  const today = data.weekDays[0].key
  const start = dateKeyToDate(today)
  start.setDate(start.getDate() + 1)
  const end = dateKeyToDate(today)
  end.setDate(end.getDate() + 7)
  const startKey = formatDateKey(start)
  const endKey = formatDateKey(end)
  const events: Array<DashboardCommandScheduleEvent> = createEventOccurrences({
    events: data.events.filter(
      (event) =>
        event.type !== 'training' &&
        event.status !== 'cancelled' &&
        event.status !== 'completed',
    ),
    windowStart: startKey,
    windowEnd: endKey,
  })
    .filter((occurrence) => occurrence.startDate > today)
    .map((occurrence) => ({
      ...occurrence.event,
      occurrenceKey: occurrence.occurrenceKey,
      date: occurrence.startDate,
      endDate: occurrence.durationDays > 1 ? occurrence.endDate : undefined,
    }))
    .sort(
      (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time),
    )
  return { events, startKey, endKey }
}
