import { formatDateKey } from '#/lib/dateDisplay'
import type { TimelineEntry } from './HorseTimelinePage'

/** Calendar dates must not inherit the server's timezone for date-only records. */
export function getTimelineEntryDate(entry: TimelineEntry) {
  if (entry.kind === 'event') return entry.date
  if (entry.kind === 'medicationRecord') return entry.startDate
  return formatDateKey(new Date(entry.occurredAt))
}

export function timelineEntryOccursOn(entry: TimelineEntry, date: string) {
  const start = getTimelineEntryDate(entry)
  const end = entry.kind === 'event' ? (entry.endDate ?? start) : start
  return date >= start && date <= end
}
