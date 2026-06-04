import type { Doc } from 'convex/_generated/dataModel'

export type StableDashboardEvent = Doc<'events'>

export const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const monthFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  year: 'numeric',
})

const shortMonthFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
})

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

export function formatMonthLabel(date: Date) {
  return monthFormatter.format(date)
}

export function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  return `${year}-${month}-${day}`
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

export function getDateBadgeParts(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`)

  return {
    month: shortMonthFormatter.format(parsedDate),
    day: `${parsedDate.getDate()}`,
  }
}

export function groupEventsByDate(events: Array<StableDashboardEvent>) {
  return events.reduce((eventMap, event) => {
    const dateEvents = eventMap.get(event.date) ?? []
    dateEvents.push(event)
    eventMap.set(event.date, dateEvents)

    return eventMap
  }, new Map<string, Array<StableDashboardEvent>>())
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
  const now = new Date()
  const monthPrefix = `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}`

  return events.filter((event) => event.date.startsWith(monthPrefix)).length
}
