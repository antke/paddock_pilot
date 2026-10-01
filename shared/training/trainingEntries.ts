import type { Doc } from '../../convex/_generated/dataModel'
import { createEventOccurrences } from '../events/eventOccurrences'
import { defaultTrainingDetails, getTrainingStatus } from './trainingSchema'

export type TrainingHorse = Pick<Doc<'horses'>, '_id' | 'name'> & {
  canRecord?: boolean
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
