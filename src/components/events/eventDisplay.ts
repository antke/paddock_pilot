import type { Doc } from 'convex/_generated/dataModel'
import type { Locale } from 'shared/i18n/locale'
import { formatMediumDateKey } from '#/lib/dateDisplay'
import { formatCommaList } from '#/lib/textDisplay'
import { localeInstances } from '#/i18n/resources'

export function formatEventDate(date: string, locale: Locale = 'en') {
  return formatMediumDateKey(date, locale)
}

export function formatEventDateRange(
  date: string,
  endDate?: string,
  locale: Locale = 'en',
) {
  if (!endDate || endDate <= date) return formatEventDate(date, locale)
  return `${formatEventDate(date, locale)} – ${formatEventDate(endDate, locale)}`
}

export function formatEventDateTime(
  date: string,
  time: string,
  endDate?: string,
  locale: Locale = 'en',
) {
  return localeInstances[locale].t('events.dateTime', {
    date: formatEventDateRange(date, endDate, locale),
    time,
  })
}

export function formatEventType(
  type: Doc<'events'>['type'],
  locale: Locale = 'en',
) {
  return localeInstances[locale].t(`events.types.${type}`)
}

export function formatRecurrence(
  recurrence: Doc<'events'>['recurrence'],
  locale: Locale = 'en',
) {
  if (!recurrence) return null
  const t = localeInstances[locale].t
  const frequency = t(`events.${recurrence.frequency}`, {
    count: recurrence.interval,
  })
  let summary: string = frequency
  if (recurrence.frequency === 'weekly') {
    const days = recurrence.daysOfWeek?.map((day) =>
      t(`events.weekdays.${day}`),
    )
    if (days?.length)
      summary = t('events.weeklyDays', {
        frequency,
        days: formatCommaList(days),
      })
  } else if (recurrence.frequency === 'monthly') {
    if (recurrence.monthlyMode === 'weekdayPattern') {
      if (recurrence.ordinal && recurrence.weekday !== undefined) {
        // Polish weekday nouns have different grammatical genders.
        const feminine = [0, 3, 6].includes(recurrence.weekday)
        const ordinal = t(
          `events.${feminine ? 'feminineOrdinals' : 'ordinals'}.${recurrence.ordinal}`,
        )
        summary = t('events.monthlyWeekday', {
          frequency,
          ordinal,
          weekday: t(`events.weekdays.${recurrence.weekday}`),
        })
      }
    } else if (recurrence.dayOfMonth)
      summary = t('events.monthlyDay', {
        frequency,
        day: recurrence.dayOfMonth,
      })
  }
  const end = recurrence.end
  if (end?.type === 'on_date' && end.date)
    return t('events.until', {
      summary,
      date: formatEventDate(end.date, locale),
    })
  if (end?.type === 'after_occurrences' && end.count)
    return t('events.times', { summary, count: end.count })
  return summary
}
