import type { Doc } from '../_generated/dataModel'
import { getTrainingEntries } from '../../shared/training/trainingEntries'
import {
  dateInTimeZone,
  recordOverlapsRange,
} from '../../shared/analysis/horseComparison'
import type {
  ComparisonRange,
  HorseComparisonRecord,
} from '../../shared/analysis/horseComparison'

export function createHorseComparisonRecords({
  horse,
  weights,
  nutrition,
  health,
  medications,
  events,
  training,
  range,
  today,
  timeZone,
}: {
  horse: Doc<'horses'>
  weights: Array<Doc<'horseWeightRecords'>>
  nutrition: Array<Doc<'horseNutritionLogs'>>
  health: Array<Doc<'horseHealthIssues'>>
  medications: Array<Doc<'horseMedicationRecords'>>
  events: Array<Doc<'events'>>
  training: Array<Doc<'trainingRecords'>>
  range: ComparisonRange
  today: string
  timeZone: string
}): Array<HorseComparisonRecord> {
  const date = (timestamp: number) => dateInTimeZone(timestamp, timeZone)
  const records: Array<HorseComparisonRecord> = []
  for (const row of [...weights].sort(
    (a, b) =>
      a.measuredAt - b.measuredAt ||
      a.createdAt - b.createdAt ||
      a._creationTime - b._creationTime,
  )) {
    records.push({
      id: `weight:${row._id}`,
      kind: 'weight',
      date: date(row.measuredAt),
      value: row.unit === 'lb' ? row.weight * 0.45359237 : row.weight,
      originalValue: row.weight,
      originalUnit: row.unit,
      notes: row.notes,
    })
    if (row.bodyConditionScore !== undefined)
      records.push({
        id: `condition:${row._id}`,
        kind: 'condition',
        date: date(row.measuredAt),
        value: row.bodyConditionScore,
        notes: row.notes,
      })
  }
  for (const row of nutrition)
    records.push({
      id: `nutrition:${row._id}`,
      kind: 'nutrition',
      date: date(row.changedAt),
      title: row.summary,
      notes: row.notes,
      details: fields({
        feedingRoutine: row.feedingRoutineSnapshot,
        recommended: row.recommendedSnapshot?.join(', '),
        avoid: row.avoidSnapshot?.join(', '),
      }),
    })
  for (const row of health)
    records.push({
      id: `health:${row._id}`,
      kind: 'health',
      date: date(row.notedAt),
      endDate: row.resolvedAt === undefined ? undefined : date(row.resolvedAt),
      endUnknown: row.resolvedAt === undefined,
      title: row.title,
      notes: row.description,
      status: row.status,
    })
  for (const row of medications)
    records.push({
      id: `medication:${row._id}`,
      kind: 'medication',
      date: row.startDate,
      endDate: row.endDate,
      endUnknown: !row.endDate,
      title: row.medicationName,
      notes: row.notes,
      details: fields({
        dosage: row.dosage,
        frequency: row.frequency,
        reason: row.reason,
      }),
      status: row.status,
    })
  for (const entry of getTrainingEntries({
    events,
    records: training,
    horses: [horse],
    start: range.start,
    end: range.end,
    today,
  })) {
    // Multi-day sessions belong to their recorded start day, not every overlap day.
    if (entry.occurrence.startDate < range.start) continue
    records.push({
      id: `training:${entry.key}`,
      kind: 'training',
      date: entry.occurrence.startDate,
      title: entry.occurrence.event.title,
      durationMinutes: entry.details.durationMinutes,
      eventId: entry.occurrence.eventId,
      status: entry.status,
      activities: entry.details.activities,
      details: fields({
        rider: entry.details.rider,
        focus: entry.details.focus,
        outcome: entry.record?.outcome,
        nextFocus: entry.details.nextFocus,
      }),
    })
  }
  // A recurring series status cannot establish completion for each visit.
  for (const event of events) {
    if (
      !['vet', 'dentist', 'hoof_trimming', 'massage', 'competition'].includes(
        event.type,
      ) ||
      event.recurrence ||
      !event.horseIds.includes(horse._id) ||
      event.status !== 'completed'
    )
      continue
    records.push({
      id: `event:${event._id}`,
      kind: event.type === 'competition' ? 'competition' : 'care',
      date: event.date,
      title: event.title,
      notes: event.notesAfterCompletion,
      eventId: event._id,
      status: event.status,
    })
  }
  return records
    .filter((record) => recordOverlapsRange(record, range))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function fields(
  values: Partial<
    Record<
      NonNullable<HorseComparisonRecord['details']>[number]['label'],
      string | undefined
    >
  >,
) {
  return Object.entries(values).flatMap(([label, value]) =>
    value
      ? [
          {
            label: label as NonNullable<
              HorseComparisonRecord['details']
            >[number]['label'],
            value,
          },
        ]
      : [],
  )
}
