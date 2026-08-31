import {
  dateKeyToDate,
  formatDateKey,
  formatMonthKey,
  formatMonthYearDate,
  formatShortWeekdayDate,
} from '#/lib/dateDisplay'
import type { Doc } from 'convex/_generated/dataModel'
import { createEventOccurrences } from 'shared/events/eventOccurrences'
import type { EventOccurrence } from 'shared/events/eventOccurrences'

export type StableDashboardEvent = Doc<'events'>

export type StableCalendarOccurrence = EventOccurrence<StableDashboardEvent>

export type StableCalendarDayOccurrence = {
  dateKey: string
  occurrence: StableCalendarOccurrence
  position: 'single' | 'start' | 'middle' | 'end'
}

export const weekdayLabels = Array.from({ length: 7 }, (_, index) =>
  formatShortWeekdayDate(new Date(2024, 0, index + 1)),
)

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

export function formatMonthLabel(date: Date) {
  return formatMonthYearDate(date)
}

export function getMonthDays(monthDate: Date) {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  return Array.from({ length: daysInMonth }, (_, index) => {
    const date = new Date(year, month, index + 1)

    return {
      date,
      key: formatDateKey(date),
    }
  })
}

export function getMonthLeadingDayCount(monthDate: Date) {
  return (startOfMonth(monthDate).getDay() + 6) % 7
}

export function getCalendarMonthWindow(monthDate: Date) {
  const monthDays = getMonthDays(monthDate)

  return {
    startKey: monthDays[0].key,
    endKey: monthDays.at(-1)?.key ?? monthDays[0].key,
  }
}

export function getCalendarMonthOccurrences(
  events: Array<StableDashboardEvent>,
  monthDate: Date,
) {
  const { startKey, endKey } = getCalendarMonthWindow(monthDate)

  return createEventOccurrences({
    events,
    windowStart: startKey,
    windowEnd: endKey,
  }).sort(compareCalendarOccurrences)
}

export function groupCalendarOccurrencesByDate(
  occurrences: Array<StableCalendarOccurrence>,
  monthDate: Date,
) {
  const { startKey, endKey } = getCalendarMonthWindow(monthDate)
  const occurrenceMap = new Map<string, Array<StableCalendarDayOccurrence>>()

  occurrences.forEach((occurrence) => {
    const firstVisibleDate =
      occurrence.startDate < startKey ? startKey : occurrence.startDate
    const lastVisibleDate =
      occurrence.endDate > endKey ? endKey : occurrence.endDate

    for (
      let dateKey = firstVisibleDate;
      dateKey <= lastVisibleDate;
      dateKey = addDateKeyDays(dateKey, 1)
    ) {
      const dayOccurrences = occurrenceMap.get(dateKey) ?? []

      dayOccurrences.push({
        dateKey,
        occurrence,
        position: getOccurrencePosition(occurrence, dateKey),
      })
      occurrenceMap.set(dateKey, dayOccurrences)
    }
  })

  occurrenceMap.forEach((dayOccurrences) => {
    dayOccurrences.sort((left, right) =>
      compareCalendarOccurrences(left.occurrence, right.occurrence),
    )
  })

  return occurrenceMap
}

export function getUpcomingEvents(
  events: Array<StableDashboardEvent>,
  today: Date,
) {
  const todayKey = formatDateKey(today)

  return [...events]
    .filter((event) => event.date >= todayKey)
    .sort((a, b) => {
      const dateSort = a.date.localeCompare(b.date)

      if (dateSort !== 0) return dateSort

      return a.time.localeCompare(b.time)
    })
}

export function getCurrentMonthEventCount(events: Array<StableDashboardEvent>) {
  const monthPrefix = formatMonthKey(new Date())

  return events.filter((event) => event.date.startsWith(monthPrefix)).length
}

function compareCalendarOccurrences(
  left: StableCalendarOccurrence,
  right: StableCalendarOccurrence,
) {
  return (
    left.startDate.localeCompare(right.startDate) ||
    left.event.time.localeCompare(right.event.time) ||
    left.event.title.localeCompare(right.event.title) ||
    left.occurrenceKey.localeCompare(right.occurrenceKey)
  )
}

function getOccurrencePosition(
  occurrence: StableCalendarOccurrence,
  dateKey: string,
): StableCalendarDayOccurrence['position'] {
  if (occurrence.startDate === occurrence.endDate) return 'single'
  if (dateKey === occurrence.startDate) return 'start'
  if (dateKey === occurrence.endDate) return 'end'
  return 'middle'
}

function addDateKeyDays(dateKey: string, days: number) {
  const date = dateKeyToDate(dateKey)
  date.setDate(date.getDate() + days)
  return formatDateKey(date)
}
