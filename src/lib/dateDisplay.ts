const dateDisplayLocale = 'en-GB'

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

export function formatShortDateKey(dateKey: string) {
  return shortDateKeyFormatter.format(dateKeyToDate(dateKey))
}

export function formatShortDate(date: Date) {
  return shortDateKeyFormatter.format(date)
}

export function formatShortWeekdayDate(date: Date) {
  return shortWeekdayFormatter.format(date)
}

export function formatMediumDateKey(dateKey: string) {
  return mediumDateFormatter.format(dateKeyToDate(dateKey))
}

export function formatLongDateKey(dateKey: string) {
  return longDateKeyFormatter.format(dateKeyToDate(dateKey))
}

export function formatMonthYearDate(date: Date) {
  return monthYearFormatter.format(date)
}

export function formatMonthYearDateKey(dateKey: string) {
  return formatMonthYearDate(dateKeyToDate(dateKey))
}

export function formatShortMonthYearDateKey(dateKey: string) {
  return shortMonthYearFormatter.format(dateKeyToDate(dateKey))
}

export function formatMediumTimestampDate(timestamp: number) {
  return mediumDateFormatter.format(new Date(timestamp))
}

export function formatMediumTimestampDateTime(timestamp: number) {
  return mediumDateTimeFormatter.format(new Date(timestamp))
}

export function formatTime(date: Date) {
  return timeFormatter.format(date)
}

export function getDateBadgeParts(dateKey: string) {
  const parsedDate = dateKeyToDate(dateKey)

  return {
    month: shortMonthFormatter.format(parsedDate),
    day: `${parsedDate.getDate()}`,
  }
}
