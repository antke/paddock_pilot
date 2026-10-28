import { compareEventTimes } from 'shared/events/eventTime'
import { createEventOccurrences } from 'shared/events/eventOccurrences'
import type { EventOccurrenceSource } from 'shared/events/eventOccurrences'
import { dateKeyToDate, formatDateKey } from '#/lib/dateDisplay'

export type AppointmentView = 'list' | 'calendar'

export function parseAppointmentSearch(search: Record<string, unknown>): {
  view?: AppointmentView
} {
  return search.view === 'calendar' || search.view === 'list'
    ? { view: search.view }
    : {}
}

/** Expand only the next 90 days; the complete event list is never truncated. */
export function getUpcomingAppointmentOccurrences<
  T extends EventOccurrenceSource & {
    title: string
    time: string
    status?: string
    contextParticipationId?: string
  },
>(events: Array<T>, today: string) {
  const end = dateKeyToDate(today)
  end.setDate(end.getDate() + 89)
  return createEventOccurrences({
    events: events.filter(
      (event) => event.status !== 'cancelled' && event.status !== 'completed',
    ),
    windowStart: today,
    windowEnd: formatDateKey(end),
  })
    .sort(
      (a, b) =>
        a.startDate.localeCompare(b.startDate) ||
        compareEventTimes(a.event.time, b.event.time) ||
        a.event.title.localeCompare(b.event.title) ||
        a.occurrenceKey.localeCompare(b.occurrenceKey),
    )
    .slice(0, 12)
}
