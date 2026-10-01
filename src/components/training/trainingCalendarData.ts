import type { Locale } from 'shared/i18n/locale'
import { localeInstances } from '#/i18n/resources'
import { dateKeyToDate, formatDateKey } from '#/lib/dateDisplay'

export { getTrainingEntries } from 'shared/training/trainingEntries'
export type {
  TrainingEntry,
  TrainingHorse,
} from 'shared/training/trainingEntries'

export function trainingWindow(anchor: string, view: 'week' | 'month') {
  const date = dateKeyToDate(anchor)
  const first =
    view === 'month'
      ? new Date(date.getFullYear(), date.getMonth(), 1)
      : new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() - ((date.getDay() + 6) % 7),
        )
  const count =
    view === 'month'
      ? new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
      : 7
  const days = Array.from({ length: count }, (_, i) =>
    formatDateKey(
      new Date(first.getFullYear(), first.getMonth(), first.getDate() + i),
    ),
  )
  return { days, start: days[0], end: days[days.length - 1] }
}
/** Yard-local wall-clock times; no timezone or daylight-saving conversion. */
export function formatTrainingTimeRange(
  start: string,
  durationMinutes?: number,
  locale: Locale = 'en',
) {
  const t = localeInstances[locale].t
  if (!durationMinutes) return t('training.endUnset', { start })
  const [hours, minutes] = start.split(':').map(Number)
  const endMinutes = hours * 60 + minutes + durationMinutes
  const end = `${String(Math.floor(endMinutes / 60) % 24).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`
  return t(
    endMinutes >= 24 * 60 ? 'training.nextDayRange' : 'training.timeRange',
    { start, end },
  )
}
