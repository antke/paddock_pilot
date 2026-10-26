import { sharedEventsForStable } from './eventPermissions'
import { readableRecords, visibleHorse } from './recordCapabilities'
import type { Doc, Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'
import { horseEvent } from './horseEventHistory'

export async function horseCareData(
  ctx: QueryCtx,
  horses: Array<Doc<'horses'>>,
  stableId?: Id<'stables'>,
) {
  const data = await Promise.all(
    horses.map(async (horse) => {
      const [
        reminders,
        healthIssues,
        medicationRecords,
        nutritionLogs,
        weightRecords,
        trainingOutcomes,
        rows,
      ] = await Promise.all([
        ctx.db
          .query('careReminders')
          .withIndex('by_horse_id_due_date', (q) => q.eq('horseId', horse._id))
          .collect()
          .then((records) => readableRecords(ctx, horse, records, stableId)),
        ctx.db
          .query('horseHealthIssues')
          .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
          .collect()
          .then((records) => readableRecords(ctx, horse, records, stableId)),
        ctx.db
          .query('horseMedicationRecords')
          .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
          .collect()
          .then((records) => readableRecords(ctx, horse, records, stableId)),
        ctx.db
          .query('horseNutritionLogs')
          .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
          .collect()
          .then((records) => readableRecords(ctx, horse, records, stableId)),
        ctx.db
          .query('horseWeightRecords')
          .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
          .collect()
          .then((records) => readableRecords(ctx, horse, records, stableId)),
        ctx.db
          .query('trainingRecords')
          .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
          .collect()
          .then((records) => readableRecords(ctx, horse, records, stableId)),
        ctx.db
          .query('eventsHorses')
          .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
          .collect(),
      ])
      const events = (
        await Promise.all(
          rows
            .filter(
              (row) => row.status === undefined || row.status === 'confirmed',
            )
            .map((row) => horseEvent(ctx, row)),
        )
      ).filter((e): e is Doc<'events'> => e !== null)
      return {
        reminders,
        healthIssues,
        medicationRecords,
        nutritionLogs,
        weightRecords,
        trainingOutcomes,
        events,
      }
    }),
  )
  // Merge only identical schedules. A departed horse can have a different
  // recurrence cutoff from another participant in the same shared event.
  const events = new Map<string, Doc<'events'>>()
  for (const event of data.flatMap((d) => d.events)) {
    const key = JSON.stringify([
      event._id,
      event.date,
      event.endDate,
      event.recurrence,
    ])
    const existing = events.get(key)
    events.set(
      key,
      existing
        ? {
            ...existing,
            horseIds: [...new Set([...existing.horseIds, ...event.horseIds])],
          }
        : event,
    )
  }
  return {
    horses: await Promise.all(horses.map((horse) => visibleHorse(ctx, horse, Boolean(stableId)))),
    reminders: data.flatMap((d) => d.reminders),
    healthIssues: data.flatMap((d) => d.healthIssues),
    medicationRecords: data.flatMap((d) => d.medicationRecords),
    nutritionLogs: data.flatMap((d) => d.nutritionLogs),
    weightRecords: data.flatMap((d) => d.weightRecords),
    trainingOutcomes: data.flatMap((d) => d.trainingOutcomes),
    events: stableId ? await sharedEventsForStable(ctx, stableId) : [...events.values()],
  }
}
