import { compareEventTimes } from '../events/eventTime'
import { getHorseDisplayName } from '../horses/horseDisplayName'
import type { Doc } from '../../convex/_generated/dataModel'
import { createEventOccurrences } from '../events/eventOccurrences'
import { defaultTrainingDetails, getTrainingStatus } from './trainingSchema'

export type TrainingHorse = Pick<
  Doc<'horses'>,
  '_id' | 'name' | 'nickname' | 'useNickname' | 'calendarColourId'
> & {
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
  events: Array<
    Doc<'events'> & {
      contextParticipationId?: string
      contextHorseId?: string
      participantOnlyDates?: Array<{ horseId: string; date: string }>
    }
  >
  records: Array<
    Doc<'trainingRecords'> & {
      canEdit?: boolean
      createdByName?: string | null
    }
  >
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
  const trainingEvents = events.filter((event) => event.type === 'training')
  const occurrences = createEventOccurrences({
    events: trainingEvents,
    windowStart: start,
    windowEnd: end,
  })
  // Recorded sessions remain visible even after the series schedule changes.
  // Use each horse's historical projection when one is present.
  for (const event of trainingEvents) {
    const dates = new Set(
      records
        .filter(
          (record) =>
            record.eventId === event._id &&
            record.date >= start &&
            record.date <= end &&
            (!event.contextHorseId || event.contextHorseId === record.horseId),
        )
        .map((record) => record.date),
    )
    for (const date of dates) {
      if (
        occurrences.some(
          (occurrence) =>
            occurrence.eventId === event._id &&
            occurrence.event.contextHorseId === event.contextHorseId &&
            occurrence.startDate === date,
        )
      )
        continue
      const extra = createEventOccurrences({
        events: [
          {
            ...event,
            date,
            endDate: undefined,
            recurrence: undefined,
            horseIds: [],
          },
        ],
        windowStart: start,
        windowEnd: end,
      })
      occurrences.push(...extra)
    }
  }
  return occurrences
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
      ]
        .filter(
          (horseId) =>
            (!occurrence.event.contextHorseId ||
              occurrence.event.contextHorseId === horseId) &&
            (byRecord.has(
              `${occurrence.eventId}:${horseId}:${occurrence.startDate}`,
            ) ||
              !records.some(
                (record) =>
                  record.eventId === occurrence.eventId &&
                  record.horseId === horseId &&
                  record.scheduledDate === occurrence.startDate &&
                  record.date !== record.scheduledDate,
              )),
        )
        .flatMap((horseId) => {
          const horse = byHorse.get(horseId)
          if (!horse) return []
          const key = `${occurrence.eventId}:${horseId}:${occurrence.startDate}`
          const record = byRecord.get(key)
          return [
            {
              key,
              horse: {
                ...horse,
                canRecord:
                  horse.canRecord &&
                  record?.canEdit !== false &&
                  !occurrence.event.participantOnlyDates?.some(
                    (participant) =>
                      participant.horseId === horseId &&
                      participant.date === occurrence.startDate,
                  ),
              },
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
        compareEventTimes(a.occurrence.event.time, b.occurrence.event.time) ||
        getHorseDisplayName(a.horse).localeCompare(
          getHorseDisplayName(b.horse),
        ),
    )
}
export type TrainingEntry = ReturnType<typeof getTrainingEntries>[number]
