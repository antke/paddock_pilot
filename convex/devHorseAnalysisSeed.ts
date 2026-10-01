import { ConvexError, v } from 'convex/values'
import { internalMutation } from './_generated/server'
import {
  analysisDemoLabel,
  buildHorseAnalysisDemo,
} from './libs/horseAnalysisDemo'
import { isDateKey } from '../shared/training/trainingSchema'

/** Additive and repeatable: never invokes the destructive whole-yard seed. */
export const seedYear = internalMutation({
  args: {
    horseId: v.id('horses'),
    end: v.string(),
    confirm: v.literal('seed-horse-analysis-year'),
  },
  handler: async (ctx, args) => {
    if (process.env.DEV_SEED_ENABLED !== 'true')
      throw new ConvexError('Demo seed is disabled')
    const horse = await ctx.db.get(args.horseId)
    if (!horse || horse.deletedAt !== undefined)
      throw new ConvexError('Active demo horse required')
    const stable = await ctx.db.get(horse.stableId)
    if (
      stable?.name !== 'Paddock Pilot Demo Yard' ||
      stable.archivedAt !== undefined
    )
      throw new ConvexError(
        'Only the active demo yard can receive synthetic data',
      )
    if (
      !isDateKey(args.end) ||
      args.end > new Date(Date.now()).toISOString().slice(0, 10)
    )
      throw new ConvexError('Choose a valid past or current end date')
    const base = {
      horseId: horse._id,
      stableId: stable._id,
      createdBy: stable.ownerId,
    }
    const now = Date.now()
    const added = {
      weights: 0,
      nutrition: 0,
      health: 0,
      medications: 0,
      events: 0,
      training: 0,
    }
    const [weights, nutrition, health, medications, events, training, links] =
      await Promise.all([
        ctx.db
          .query('horseWeightRecords')
          .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
          .collect(),
        ctx.db
          .query('horseNutritionLogs')
          .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
          .collect(),
        ctx.db
          .query('horseHealthIssues')
          .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
          .collect(),
        ctx.db
          .query('horseMedicationRecords')
          .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
          .collect(),
        ctx.db
          .query('events')
          .withIndex('by_stable_id', (q) => q.eq('stableId', stable._id))
          .collect(),
        ctx.db
          .query('trainingRecords')
          .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
          .collect(),
        ctx.db
          .query('eventsHorses')
          .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
          .collect(),
      ])
    const reference = weights
      .filter((row) => !row.notes?.startsWith(analysisDemoLabel))
      .sort((a, b) => b.measuredAt - a.measuredAt)[0]
    const plan = buildHorseAnalysisDemo(
      args.end,
      reference
        ? {
            date: new Date(reference.measuredAt).toISOString().slice(0, 10),
            kg:
              reference.unit === 'lb'
                ? reference.weight * 0.45359237
                : reference.weight,
            bodyConditionScore: reference.bodyConditionScore,
          }
        : undefined,
    )
    const key = (text?: string) => text?.split('\n')[0]
    for (const row of plan.weights)
      if (!weights.some((r) => key(r.notes) === key(row.notes))) {
        await ctx.db.insert('horseWeightRecords', {
          ...base,
          ...row,
          createdAt: now,
        })
        added.weights++
      }
    for (const row of plan.nutrition)
      if (!nutrition.some((r) => key(r.notes) === key(row.notes))) {
        await ctx.db.insert('horseNutritionLogs', {
          ...base,
          ...row,
          createdAt: now,
        })
        added.nutrition++
      }
    for (const row of plan.health)
      if (!health.some((r) => key(r.description) === key(row.description))) {
        await ctx.db.insert('horseHealthIssues', {
          ...base,
          ...row,
          createdAt: now,
          updatedAt: now,
        })
        added.health++
      }
    for (const row of plan.medications)
      if (!medications.some((r) => key(r.notes) === key(row.notes))) {
        await ctx.db.insert('horseMedicationRecords', {
          ...base,
          ...row,
          createdAt: now,
          updatedAt: now,
        })
        added.medications++
      }
    for (const row of plan.events) {
      let eventId = events.find(
        (e) => e.horseIds.includes(horse._id) && key(e.description) === row.key,
      )?._id
      if (!eventId) {
        eventId = await ctx.db.insert('events', {
          ...row.event,
          stableId: stable._id,
          horseIds: [horse._id],
          createdBy: stable.ownerId,
        })
        added.events++
      }
      if (!links.some((link) => link.eventId === eventId))
        await ctx.db.insert('eventsHorses', {
          eventId,
          horseId: horse._id,
          status: 'confirmed',
          approvedBy: stable.ownerId,
          createdAt: now,
          updatedAt: now,
          completionNotes: row.event.notesAfterCompletion,
        })
      if (
        row.training &&
        !training.some(
          (r) => r.eventId === eventId && r.date === row.event.date,
        )
      ) {
        await ctx.db.insert('trainingRecords', {
          ...row.training,
          eventId,
          horseId: horse._id,
          stableId: stable._id,
          date: row.event.date,
          recordedBy: stable.ownerId,
          createdAt: now,
          updatedAt: now,
        })
        added.training++
      }
    }
    return { horse: horse.name, start: plan.start, end: plan.end, added }
  },
})
