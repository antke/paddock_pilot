const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/

export const utcTodayDateKey = () => new Date().toISOString().slice(0, 10)

export const resolveTodayDateKey = (clientDateKey?: string) => {
  return clientDateKey && dateKeyPattern.test(clientDateKey)
    ? clientDateKey
    : utcTodayDateKey()
}

export const addDaysToDateKey = (dateKey: string, days: number) => {
  const date = new Date(`${dateKey}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export const timestampToDateKey = (
  timestamp: number,
  timezoneOffsetMinutes = 0,
) => {
  const localTimestamp = timestamp - timezoneOffsetMinutes * 60 * 1000
  return new Date(localTimestamp).toISOString().slice(0, 10)
}
