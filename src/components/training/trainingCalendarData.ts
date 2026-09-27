import type { Doc } from 'convex/_generated/dataModel'
import { createEventOccurrences } from 'shared/events/eventOccurrences'
import {
  defaultTrainingDetails,
  getTrainingStatus,
} from 'shared/training/trainingSchema'
import { dateKeyToDate, formatDateKey } from '#/lib/dateDisplay'

export type TrainingHorse = Pick<Doc<'horses'>, '_id' | 'name'> & {
  canRecord?: boolean
}
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
export function getTrainingEntries({
  events,
  records,
  horses,
  start,
  end,
  today,
}: {
  events: Array<Doc<'events'>>
  records: Array<Doc<'trainingRecords'>>
  horses: Array<TrainingHorse>
  start: string
  end: string
  today: string
}) {
  const byHorse = new Map(horses.map((horse) => [horse._id, horse]))
  const byRecord = new Map(
    records.map((record) => [
      `${record.eventId}:${record.horseId}:${record.date}`,
      record,
    ]),
  )
  return createEventOccurrences({
    events: events.filter((event) => event.type === 'training'),
    windowStart: start,
    windowEnd: end,
  })
    .flatMap((occurrence) =>
      [
        ...new Set([
          ...occurrence.event.horseIds,
          ...records
            .filter(
              (record) =>
                record.eventId === occurrence.eventId &&
                record.date === occurrence.startDate,
            )
            .map((record) => record.horseId),
        ]),
      ].flatMap((horseId) => {
        const horse = byHorse.get(horseId)
        if (!horse) return []
        const key = `${occurrence.eventId}:${horseId}:${occurrence.startDate}`
        const record = byRecord.get(key)
        return [
          {
            key,
            horse,
            occurrence,
            record,
            details:
              record?.details ??
              occurrence.event.training ??
              defaultTrainingDetails,
            status: getTrainingStatus(
              occurrence.event,
              occurrence.startDate,
              today,
              record,
            ),
          },
        ]
      }),
    )
    .sort(
      (a, b) =>
        a.occurrence.startDate.localeCompare(b.occurrence.startDate) ||
        a.occurrence.event.time.localeCompare(b.occurrence.event.time) ||
        a.horse.name.localeCompare(b.horse.name),
    )
}
export type TrainingEntry = ReturnType<typeof getTrainingEntries>[number]

/** Yard-local wall-clock times; no timezone or daylight-saving conversion. */
export function formatTrainingTimeRange(
  start: string,
  durationMinutes?: number,
) {
  if (!durationMinutes) return `${start} · End not set`
  const [hours, minutes] = start.split(':').map(Number)
  const endMinutes = hours * 60 + minutes + durationMinutes
  const end = `${String(Math.floor(endMinutes / 60) % 24).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`
  return `${start}–${end}${endMinutes >= 24 * 60 ? ' (+1 day)' : ''}`
}
