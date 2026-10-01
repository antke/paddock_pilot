import { displayLocales } from '../../shared/i18n/locale'
import type { Locale } from '../../shared/i18n/locale'

function createFormatters(locale: Locale) {
  const dateDisplayLocale = displayLocales[locale]

  const shortDateKeyFormatter = new Intl.DateTimeFormat(dateDisplayLocale, {
    month: 'short',
    day: 'numeric',
  })

  const mediumDateFormatter = new Intl.DateTimeFormat(dateDisplayLocale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const longDateKeyFormatter = new Intl.DateTimeFormat(dateDisplayLocale, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const monthYearFormatter = new Intl.DateTimeFormat(dateDisplayLocale, {
    month: 'long',
    year: 'numeric',
  })

  const shortMonthYearFormatter = new Intl.DateTimeFormat(dateDisplayLocale, {
    month: 'short',
    year: 'numeric',
  })

  const shortMonthFormatter = new Intl.DateTimeFormat(dateDisplayLocale, {
    month: 'short',
  })

  const shortWeekdayFormatter = new Intl.DateTimeFormat(dateDisplayLocale, {
    weekday: 'short',
  })

  const timeFormatter = new Intl.DateTimeFormat(dateDisplayLocale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const mediumDateTimeFormatter = new Intl.DateTimeFormat(dateDisplayLocale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return {
    shortDateKeyFormatter,
    mediumDateFormatter,
    longDateKeyFormatter,
    monthYearFormatter,
    shortMonthYearFormatter,
    shortMonthFormatter,
    shortWeekdayFormatter,
    timeFormatter,
    mediumDateTimeFormatter,
  }
}

const formatters = { en: createFormatters('en'), pl: createFormatters('pl') }

export function dateKeyToDate(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`)
}

export function dateKeyToTimestamp(dateKey: string) {
  return dateKeyToDate(dateKey).getTime()
}

export function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function formatMonthKey(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')

  return `${year}-${month}`
}

export function getTodayDateKey() {
  return formatDateKey(new Date())
}

export function formatShortDateKey(dateKey: string, locale: Locale = 'en') {
  return formatters[locale].shortDateKeyFormatter.format(dateKeyToDate(dateKey))
}

export function formatShortDate(date: Date, locale: Locale = 'en') {
  return formatters[locale].shortDateKeyFormatter.format(date)
}

export function formatShortWeekdayDate(date: Date, locale: Locale = 'en') {
  return formatters[locale].shortWeekdayFormatter.format(date)
}

export function formatMediumDateKey(dateKey: string, locale: Locale = 'en') {
  return formatters[locale].mediumDateFormatter.format(dateKeyToDate(dateKey))
}

export function formatLongDateKey(dateKey: string, locale: Locale = 'en') {
  return formatters[locale].longDateKeyFormatter.format(dateKeyToDate(dateKey))
}

export function formatMonthYearDate(date: Date, locale: Locale = 'en') {
  return formatters[locale].monthYearFormatter.format(date)
}

export function formatMonthYearDateKey(dateKey: string, locale: Locale = 'en') {
  return formatMonthYearDate(dateKeyToDate(dateKey), locale)
}

export function formatShortMonthYearDateKey(
  dateKey: string,
  locale: Locale = 'en',
) {
  return formatters[locale].shortMonthYearFormatter.format(
    dateKeyToDate(dateKey),
  )
}

export function formatMediumTimestampDate(
  timestamp: number,
  locale: Locale = 'en',
) {
  return formatters[locale].mediumDateFormatter.format(new Date(timestamp))
}

export function formatMediumTimestampDateTime(
  timestamp: number,
  locale: Locale = 'en',
) {
  return formatters[locale].mediumDateTimeFormatter.format(new Date(timestamp))
}

export function formatTime(date: Date, locale: Locale = 'en') {
  return formatters[locale].timeFormatter.format(date)
}

export function getDateBadgeParts(dateKey: string, locale: Locale = 'en') {
  const parsedDate = dateKeyToDate(dateKey)

  return {
    month: formatters[locale].shortMonthFormatter.format(parsedDate),
    day: `${parsedDate.getDate()}`,
  }
}

/** Preserve the precision of partial birth dates; do not invent a month or day. */
export function formatPartialDateKey(value: string, locale: Locale = 'en') {
  if (/^\d{4}$/.test(value)) return value
  const monthOnly = /^\d{4}-\d{2}$/.test(value)
  const dateKey = monthOnly ? `${value}-01` : value
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return value
  const date = dateKeyToDate(dateKey)
  // Preserve malformed legacy values instead of throwing or rolling into another month.
  if (!Number.isFinite(date.getTime()) || formatDateKey(date) !== dateKey)
    return value
  return monthOnly
    ? formatMonthYearDate(date, locale)
    : formatMediumDateKey(dateKey, locale)
}
