import { userFacingError } from './libs/userFacingError'
import { ConvexError, v } from 'convex/values'
import { query, mutation } from './_generated/server'
import { assertCanViewStable, getCurrentUser } from './libs/stablePermissions'
import { isActiveHorse } from './libs/horseState'
import { canManageOwnedRecord } from '../shared/stables/stableAccess'
import { trainingDetails } from './schema'
import {
  trainingRecordSchema,
  isDateKey,
} from '../shared/training/trainingSchema'
import { createEventOccurrences } from '../shared/events/eventOccurrences'
import { recordStableAudit } from './libs/audit'

export const listForStable = query({
  args: { stableId: v.id('stables') },
  handler: async (ctx, { stableId }) => {
    const access = await assertCanViewStable(ctx, stableId)
    const [allEvents, allHorses, allRecords] = await Promise.all([
      ctx.db
        .query('events')
        .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
        .collect(),
      ctx.db
        .query('horses')
        .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
        .collect(),
      ctx.db
        .query('trainingRecords')
        .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
        .collect(),
    ])
    const horses = allHorses.filter(isActiveHorse).map((horse) => ({
      ...horse,
      canRecord: canManageOwnedRecord({
        role: access.role,
        userId: access.userId,
        ownerId: horse.ownerId,
      }),
    }))
    const active = new Set(horses.map((horse) => horse._id))
    const recordedEvents = new Set(
      allRecords
        .filter((record) => active.has(record.horseId))
        .map((record) => record.eventId),
    )
    const events = allEvents
      .filter((event) => event.type === 'training')
      .map((event) => ({
        ...event,
        horseIds: event.horseIds.filter((id) => active.has(id)),
      }))
      .filter(
        (event) => event.horseIds.length > 0 || recordedEvents.has(event._id),
      )
    const eventIds = new Set(events.map((event) => event._id))
    return {
      events,
      horses,
      records: allRecords.filter(
        (record) => active.has(record.horseId) && eventIds.has(record.eventId),
      ),
    }
  },
})

export const saveRecord = mutation({
  args: {
    errorFormat: v.optional(v.literal('structured')),
    eventId: v.id('events'),
    horseId: v.id('horses'),
    date: v.string(),
    status: v.union(
      v.literal('planned'),
      v.literal('completed'),
      v.literal('cancelled'),
      v.literal('skipped'),
    ),
    details: trainingDetails,
    outcome: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const event = await ctx.db.get(args.eventId)
    if (!event || event.type !== 'training')
      throw userFacingError('trainingNotFound', args.errorFormat)
    const access = await assertCanViewStable(ctx, event.stableId, user._id)
    const horse = await ctx.db.get(args.horseId)
    if (
      !isActiveHorse(horse) ||
      horse.stableId !== event.stableId ||
      !event.horseIds.includes(horse._id)
    ) {
      throw userFacingError('trainingHorseUnconfirmed', args.errorFormat)
    }
    if (
      !canManageOwnedRecord({
        role: access.role,
        userId: user._id,
        ownerId: horse.ownerId,
      })
    ) {
      throw userFacingError('trainingPermission', args.errorFormat)
    }
    if (
      !isDateKey(args.date) ||
      !createEventOccurrences({
        events: [event],
        windowStart: args.date,
        windowEnd: args.date,
      }).some((o) => o.startDate === args.date)
    ) {
      throw userFacingError('trainingOccurrence', args.errorFormat)
    }
    // Allow the current local day anywhere on earth without trusting a client clock.
    const latestToday = new Date(Date.now() + 14 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)
    if (args.status === 'completed' && args.date > latestToday)
      throw userFacingError('futureTraining', args.errorFormat)
    const parsed = trainingRecordSchema.safeParse({
      ...args.details,
      status: args.status,
      outcome: args.outcome,
    })
    if (!parsed.success)
      throw new ConvexError(
        parsed.error.issues[0]?.message ?? 'Invalid training record',
      )
    const { status, outcome, ...details } = parsed.data
    const existing = await ctx.db
      .query('trainingRecords')
      .withIndex('by_event_horse_date', (q) =>
        q
          .eq('eventId', event._id)
          .eq('horseId', horse._id)
          .eq('date', args.date),
      )
      .unique()
    const now = Date.now()
    const values = {
      stableId: event.stableId,
      eventId: event._id,
      horseId: horse._id,
      date: args.date,
      status,
      details,
      outcome,
      recordedBy: user._id,
      updatedAt: now,
    }
    if (existing) await ctx.db.patch(existing._id, values)
    else await ctx.db.insert('trainingRecords', { ...values, createdAt: now })
    await recordStableAudit(ctx, {
      stableId: event.stableId,
      actorUserId: user._id,
      action: 'training.recorded',
      entityType: 'event',
      entityId: event._id,
      summary: `${horse.name}: ${status} on ${args.date}`,
      details: {
        kind: 'training_recorded',
        horseName: horse.name,
        status,
        date: args.date,
      },
    })
  },
})
