import type { Doc } from 'convex/_generated/dataModel'
import { formatMediumDateKey } from '#/lib/dateDisplay'
import { formatCommaList } from '#/lib/textDisplay'
import { dayOfWeekLabels, eventTypeLabels } from 'shared/events/eventSchema'
import type { RecurrenceOrdinal } from 'shared/events/eventSchema'

const ordinalLabels = {
  1: '1st',
  2: '2nd',
  3: '3rd',
  4: '4th',
  last: 'last',
} satisfies Record<RecurrenceOrdinal, string>

export function formatEventDate(date: string) {
  return formatMediumDateKey(date)
}

export function formatEventDateRange(date: string, endDate?: string) {
  if (!endDate || endDate <= date) return formatEventDate(date)

  return `${formatEventDate(date)} – ${formatEventDate(endDate)}`
}

export function formatEventDateTime(
  date: string,
  time: string,
  endDate?: string,
) {
  return `${formatEventDateRange(date, endDate)} at ${time}`
}

export function formatEventType(type: Doc<'events'>['type']) {
  return eventTypeLabels[type]
}

export function formatRecurrence(recurrence: Doc<'events'>['recurrence']) {
  if (!recurrence) return null

  const interval =
    recurrence.interval === 1 ? 'Every' : `Every ${recurrence.interval}`

  if (recurrence.frequency === 'daily') {
    return formatRecurrenceEnd(`${interval} day`, recurrence.end)
  }

  if (recurrence.frequency === 'weekly') {
    const days = recurrence.daysOfWeek
      ?.map((day) => dayOfWeekLabels[day])
      .filter(Boolean)

    return formatRecurrenceEnd(
      days?.length
        ? `${interval} week on ${formatCommaList(days)}`
        : `${interval} week`,
      recurrence.end,
    )
  }

  if (recurrence.monthlyMode === 'weekdayPattern') {
    const ordinal = recurrence.ordinal
      ? ordinalLabels[recurrence.ordinal]
      : null
    const weekday =
      recurrence.weekday === undefined
        ? null
        : dayOfWeekLabels[recurrence.weekday]

    return formatRecurrenceEnd(
      ordinal && weekday
        ? `${interval} month on the ${ordinal} ${weekday}`
        : `${interval} month`,
      recurrence.end,
    )
  }

  return formatRecurrenceEnd(
    recurrence.dayOfMonth
      ? `${interval} month on day ${recurrence.dayOfMonth}`
      : `${interval} month`,
    recurrence.end,
  )
}

function formatRecurrenceEnd(
  summary: string,
  end: NonNullable<Doc<'events'>['recurrence']>['end'],
) {
  if (!end || end.type === 'never') return summary

  if (end.type === 'on_date' && end.date) {
    return `${summary}, until ${formatEventDate(end.date)}`
  }

  if (end.type === 'after_occurrences' && end.count) {
    return `${summary}, ${end.count} times`
  }

  return summary
}
