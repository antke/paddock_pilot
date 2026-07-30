import type {
  DayOfWeek,
  RecurrenceFrequency,
  RecurrenceMissingDateStrategy,
  RecurrenceOrdinal,
} from './eventSchema'

type EventRecurrence = {
  frequency: RecurrenceFrequency
  interval?: number
  daysOfWeek?: Array<DayOfWeek>
  monthlyMode?: 'dayOfMonth' | 'weekdayPattern'
  dayOfMonth?: number
  ordinal?: RecurrenceOrdinal
  weekday?: DayOfWeek
  missingDateStrategy?: RecurrenceMissingDateStrategy
  end?: {
    type: 'never' | 'on_date' | 'after_occurrences'
    date?: string
    count?: number
  }
}

export type EventOccurrenceSource = {
  _id: string
  date: string
  endDate?: string
  recurrence?: EventRecurrence
}

export type EventOccurrence<TEvent extends EventOccurrenceSource> = {
  occurrenceKey: string
  eventId: TEvent['_id']
  event: TEvent
  startDate: string
  endDate: string
  durationDays: number
  isRecurring: boolean
  startsBeforeWindow: boolean
  endsAfterWindow: boolean
}

type CreateEventOccurrencesInput<TEvent extends EventOccurrenceSource> = {
  events: Array<TEvent>
  windowStart: string
  windowEnd: string
}

const oneDayInMs = 24 * 60 * 60 * 1000

export function createEventOccurrences<TEvent extends EventOccurrenceSource>({
  events,
  windowStart,
  windowEnd,
}: CreateEventOccurrencesInput<TEvent>): Array<EventOccurrence<TEvent>> {
  return events.flatMap((event) =>
    event.recurrence
      ? createRecurringOccurrences(event, windowStart, windowEnd)
      : createSingleOccurrence(event, event.date, windowStart, windowEnd),
  )
}

function createSingleOccurrence<TEvent extends EventOccurrenceSource>(
  event: TEvent,
  startDate: string,
  windowStart: string,
  windowEnd: string,
): Array<EventOccurrence<TEvent>> {
  const durationDays = getEventDurationDays(event)
  const endDate = addDaysKey(startDate, durationDays - 1)

  if (!dateRangesOverlap(startDate, endDate, windowStart, windowEnd)) return []

  return [
    {
      occurrenceKey:
        startDate === event.date ? String(event._id) : `${String(event._id)}:${startDate}`,
      eventId: event._id,
      event,
      startDate,
      endDate,
      durationDays,
      isRecurring: Boolean(event.recurrence),
      startsBeforeWindow: startDate < windowStart,
      endsAfterWindow: endDate > windowEnd,
    },
  ]
}

function createRecurringOccurrences<TEvent extends EventOccurrenceSource>(
  event: TEvent,
  windowStart: string,
  windowEnd: string,
) {
  const recurrence = event.recurrence
  if (!recurrence) return []

  if (recurrence.frequency === 'daily') {
    return createDailyOccurrences(event, recurrence, windowStart, windowEnd)
  }

  if (recurrence.frequency === 'weekly') {
    return createWeeklyOccurrences(event, recurrence, windowStart, windowEnd)
  }

  return createMonthlyOccurrences(event, recurrence, windowStart, windowEnd)
}

function createDailyOccurrences<TEvent extends EventOccurrenceSource>(
  event: TEvent,
  recurrence: EventRecurrence,
  windowStart: string,
  windowEnd: string,
) {
  const occurrences: Array<EventOccurrence<TEvent>> = []
  const interval = recurrence.interval ?? 1
  const maxOccurrences = getMaxOccurrenceCount(recurrence)
  const lastStartDate = getLastStartDate(recurrence, windowEnd)

  for (
    let startDate = event.date, count = 0;
    startDate <= lastStartDate && count < maxOccurrences;
    startDate = addDaysKey(startDate, interval), count += 1
  ) {
    occurrences.push(...createSingleOccurrence(event, startDate, windowStart, windowEnd))
  }

  return occurrences
}

function createWeeklyOccurrences<TEvent extends EventOccurrenceSource>(
  event: TEvent,
  recurrence: EventRecurrence,
  windowStart: string,
  windowEnd: string,
) {
  const occurrences: Array<EventOccurrence<TEvent>> = []
  const selectedDays = new Set(recurrence.daysOfWeek ?? [])
  const interval = recurrence.interval ?? 1
  const maxOccurrences = getMaxOccurrenceCount(recurrence)
  const lastStartDate = getLastStartDate(recurrence, windowEnd)
  const startWeekKey = getWeekStartKey(event.date)

  for (
    let startDate = event.date, count = 0;
    startDate <= lastStartDate && count < maxOccurrences;
    startDate = addDaysKey(startDate, 1)
  ) {
    const weeksSinceStart = Math.floor(
      daysBetween(startWeekKey, getWeekStartKey(startDate)) / 7,
    )

    if (
      selectedDays.has(getDayOfWeek(startDate)) &&
      weeksSinceStart % interval === 0
    ) {
      occurrences.push(...createSingleOccurrence(event, startDate, windowStart, windowEnd))
      count += 1
    }
  }

  return occurrences
}

function createMonthlyOccurrences<TEvent extends EventOccurrenceSource>(
  event: TEvent,
  recurrence: EventRecurrence,
  windowStart: string,
  windowEnd: string,
) {
  const occurrences: Array<EventOccurrence<TEvent>> = []
  const interval = recurrence.interval ?? 1
  const maxOccurrences = getMaxOccurrenceCount(recurrence)
  const lastStartDate = getLastStartDate(recurrence, windowEnd)
  const startParts = getDateParts(event.date)
  const lastParts = getDateParts(lastStartDate)
  const monthCount =
    (lastParts.year - startParts.year) * 12 +
    (lastParts.monthIndex - startParts.monthIndex)

  for (let monthOffset = 0, count = 0; monthOffset <= monthCount && count < maxOccurrences; monthOffset += 1) {
    if (monthOffset % interval !== 0) continue

    const monthIndex = startParts.monthIndex + monthOffset
    const year = startParts.year + Math.floor(monthIndex / 12)
    const normalizedMonthIndex = ((monthIndex % 12) + 12) % 12
    const startDate = getMonthlyCandidateDateKey(
      recurrence,
      year,
      normalizedMonthIndex,
    )

    if (!startDate || startDate < event.date || startDate > lastStartDate) continue

    occurrences.push(...createSingleOccurrence(event, startDate, windowStart, windowEnd))
    count += 1
  }

  return occurrences
}

function getMonthlyCandidateDateKey(
  recurrence: EventRecurrence,
  year: number,
  monthIndex: number,
) {
  if (recurrence.monthlyMode === 'dayOfMonth' && recurrence.dayOfMonth) {
    const daysInMonth = getDaysInMonth(year, monthIndex)

    if (recurrence.dayOfMonth <= daysInMonth) {
      return formatDateKey(year, monthIndex, recurrence.dayOfMonth)
    }

    if (recurrence.missingDateStrategy === 'lastDayOfMonth') {
      return formatDateKey(year, monthIndex, daysInMonth)
    }

    return null
  }

  if (
    recurrence.monthlyMode === 'weekdayPattern' &&
    recurrence.ordinal &&
    recurrence.weekday !== undefined
  ) {
    const daysInMonth = getDaysInMonth(year, monthIndex)

    if (recurrence.ordinal === 'last') {
      const lastDayKey = formatDateKey(year, monthIndex, daysInMonth)
      const offset = (getDayOfWeek(lastDayKey) - recurrence.weekday + 7) % 7

      return addDaysKey(lastDayKey, -offset)
    }

    const firstDayKey = formatDateKey(year, monthIndex, 1)
    const firstMatchOffset = (recurrence.weekday - getDayOfWeek(firstDayKey) + 7) % 7
    const dayOfMonth = firstMatchOffset + 1 + (recurrence.ordinal - 1) * 7

    if (dayOfMonth <= daysInMonth) {
      return formatDateKey(year, monthIndex, dayOfMonth)
    }
  }

  return null
}

function getMaxOccurrenceCount(recurrence: EventRecurrence) {
  if (recurrence.end?.type !== 'after_occurrences') return Number.POSITIVE_INFINITY

  return recurrence.end.count ?? 1
}

function getLastStartDate(recurrence: EventRecurrence, windowEnd: string) {
  if (recurrence.end?.type === 'on_date' && recurrence.end.date) {
    return minDateKey(recurrence.end.date, windowEnd)
  }

  return windowEnd
}

function getEventDurationDays(event: EventOccurrenceSource) {
  if (!event.endDate || event.endDate < event.date) return 1

  return daysBetween(event.date, event.endDate) + 1
}

function dateRangesOverlap(
  startDate: string,
  endDate: string,
  windowStart: string,
  windowEnd: string,
) {
  return startDate <= windowEnd && endDate >= windowStart
}

function getWeekStartKey(dateKey: string) {
  return addDaysKey(dateKey, -getDayOfWeek(dateKey))
}

function getDayOfWeek(dateKey: string) {
  return new Date(getDateKeyTime(dateKey)).getUTCDay() as DayOfWeek
}

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
}

function minDateKey(left: string, right: string) {
  return left < right ? left : right
}

function daysBetween(startDate: string, endDate: string) {
  return Math.round((getDateKeyTime(endDate) - getDateKeyTime(startDate)) / oneDayInMs)
}

function addDaysKey(dateKey: string, days: number) {
  const date = new Date(getDateKeyTime(dateKey))
  date.setUTCDate(date.getUTCDate() + days)

  return formatDateKey(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

function getDateKeyTime(dateKey: string) {
  const { year, monthIndex, dayOfMonth } = getDateParts(dateKey)

  return Date.UTC(year, monthIndex, dayOfMonth)
}

function getDateParts(dateKey: string) {
  const [year = '0', month = '1', day = '1'] = dateKey.split('-')

  return {
    year: Number(year),
    monthIndex: Number(month) - 1,
    dayOfMonth: Number(day),
  }
}

function formatDateKey(year: number, monthIndex: number, dayOfMonth: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(dayOfMonth).padStart(2, '0')}`
}
