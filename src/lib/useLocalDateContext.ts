import { useEffect, useState } from 'react'
import { getTodayDateKey } from './dateDisplay'

const getLocalDateContext = () => ({
  today: getTodayDateKey(),
  timezoneOffsetMinutes: new Date().getTimezoneOffset(),
})

const millisecondsUntilNextLocalDay = () => {
  const now = new Date()
  const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  return nextDay.getTime() - now.getTime() + 1000
}

export function useLocalDateContext() {
  const [dateContext, setDateContext] = useState(getLocalDateContext)

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    const scheduleNextDay = () => {
      timeoutId = setTimeout(() => {
        setDateContext(getLocalDateContext())
        scheduleNextDay()
      }, millisecondsUntilNextLocalDay())
    }

    setDateContext(getLocalDateContext())
    scheduleNextDay()

    return () => clearTimeout(timeoutId)
  }, [])

  return dateContext
}
