import { horseEvent } from './libs/horseEventHistory'
import {
  assertCanReadHorse,
  assertCanAddHorseRecord,
  assertCanEditHorseRecord,
  canEditHorseRecord,
  getHorseAccess,
  horseRosterSummary,
} from './libs/horsePermissions'
import { eventReadAccess, visibleEvent } from './libs/eventPermissions'
import { userFacingError } from './libs/userFacingError'
import { ConvexError, v } from 'convex/values'
import { query, mutation } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import { assertCanViewStable, getCurrentUser } from './libs/stablePermissions'
import { isActiveHorse } from './libs/horseState'
import { canManageOwnedRecord } from '../shared/stables/stableAccess'
import { trainingDetails } from './schema'
import {
  trainingRecordSchema,
  defaultTrainingDetails,
  isDateKey,
} from '../shared/training/trainingSchema'
import { createEventOccurrences } from '../shared/events/eventOccurrences'
import { recordStableAudit } from './libs/audit'

export const listForStable = query({
  args: { stableId: v.id('stables') },
  handler: async (ctx, { stableId }) => {
    const access = await assertCanViewStable(ctx, stableId)
    const [allEvents, allHorses] = await Promise.all([
      ctx.db
        .query('events')
        .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
        .collect(),
      ctx.db
        .query('horses')
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
    const permissions = await Promise.all(
      horses.map((horse) => getHorseAccess(ctx, horse, access.userId)),
    )
    const readable = new Set(
      horses
        .filter((_, index) => permissions[index].canRead)
        .map((horse) => horse._id),
    )
    const allRecords = (
      await Promise.all(
        horses.map(async (horse, index) => {
          if (!readable.has(horse._id)) return []
          const records = await ctx.db
            .query('trainingRecords')
            .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
            .collect()
          return records.map((record) => ({
            ...record,
            canEdit: canEditHorseRecord(permissions[index], horse, record),
          }))
        }),
      )
    ).flat()
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
      events: await Promise.all(
        events.map((event) => visibleEvent(ctx, event)),
      ),
      horses: horses.map((horse, index) => ({
        ...(permissions[index].canRead ? horse : horseRosterSummary(horse)),
        canRecord: permissions[index].canAddRecords,
      })),
      records: allRecords.filter(
        (record) =>
          readable.has(record.horseId) && eventIds.has(record.eventId),
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
  handler: saveTrainingRecord,
})

/** Change only the result; read the latest details and notes in this transaction. */
export const setStatus = mutation({
  args: {
    errorFormat: v.optional(v.literal('structured')),
    eventId: v.id('events'),
    horseId: v.id('horses'),
    date: v.string(),
    status: v.union(v.literal('planned'), v.literal('completed')),
  },
  handler: saveTrainingRecord,
})

async function saveTrainingRecord(
  ctx: MutationCtx,
  args: {
    errorFormat?: 'structured'
    eventId: Id<'events'>
    horseId: Id<'horses'>
    date: string
    status: Doc<'trainingRecords'>['status']
    details?: Doc<'trainingRecords'>['details']
    outcome?: string
  },
) {
  const user = await getCurrentUser(ctx)
  const event = await ctx.db.get(args.eventId)
  if (!event || event.type !== 'training')
    throw userFacingError('trainingNotFound', args.errorFormat)
  const horse = await ctx.db.get(args.horseId)
  const existing = await ctx.db
    .query('trainingRecords')
    .withIndex('by_event_horse_date', (q) =>
      q
        .eq('eventId', event._id)
        .eq('horseId', args.horseId)
        .eq('date', args.date),
    )
    .unique()
  if (
    !isActiveHorse(horse) ||
    (!existing &&
      ((event.stableId !== undefined && horse.stableId !== event.stableId) ||
        !event.horseIds.includes(horse._id)))
  ) {
    throw userFacingError('trainingHorseUnconfirmed', args.errorFormat)
  }
  if (existing) await assertCanEditHorseRecord(ctx, horse, existing)
  else if (!(await getHorseAccess(ctx, horse, user._id)).canAddRecords)
    throw userFacingError('trainingPermission', args.errorFormat)
  const recordOrigin = existing
    ? {
        stableId: existing.stableId,
        sourcePlacementId: existing.sourcePlacementId,
      }
    : (await assertCanAddHorseRecord(ctx, horse, user._id)).recordOrigin
  if (
    !isDateKey(args.date) ||
    (!existing &&
      !createEventOccurrences({
        events: [event],
        windowStart: args.date,
        windowEnd: args.date,
      }).some((o) => o.startDate === args.date))
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
    ...(args.details ??
      existing?.details ??
      event.training ??
      defaultTrainingDetails),
    status: args.status,
    outcome: args.details ? args.outcome : existing?.outcome,
  })
  if (!parsed.success)
    throw new ConvexError(
      parsed.error.issues[0]?.message ?? 'Invalid training record',
    )
  const { status, outcome, ...details } = parsed.data
  const now = Date.now()
  const values = {
    ...recordOrigin,
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
    stableId:
      recordOrigin.sourcePlacementId === horse.currentPlacementId
        ? recordOrigin.stableId
        : undefined,
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
}

export const listForHorse = query({
  args: { horseId: v.id('horses') },
  handler: async (ctx, { horseId }) => {
    const horse = await ctx.db.get(horseId)
    if (!horse) throw new ConvexError('Horse not found')
    const access = await assertCanReadHorse(ctx, horse)
    const rows = await ctx.db
      .query('eventsHorses')
      .withIndex('by_horse_id', (q) => q.eq('horseId', horseId))
      .collect()
    const events = await Promise.all(rows.map((r) => horseEvent(ctx, r)))
    const records = await ctx.db
      .query('trainingRecords')
      .withIndex('by_horse_id', (q) => q.eq('horseId', horseId))
      .collect()
    return {
      horses: [{ ...horse, canRecord: access.canAddRecords }],
      records: records.map((record) => ({
        ...record,
        canEdit: canEditHorseRecord(access, horse, record),
      })),
      events: events.flatMap((event) =>
        event?.type === 'training'
          ? [{ ...event, notesAfterCompletion: undefined }]
          : [],
      ),
    }
  },
})

export const listForEvent = query({
  args: {
    eventId: v.id('events'),
    horseId: v.optional(v.id('horses')),
    participationId: v.optional(v.id('eventsHorses')),
  },
  handler: async (ctx, { eventId, horseId, participationId }) => {
    const event = await ctx.db.get(eventId)
    if (!event) throw new ConvexError('Event not found')
    await eventReadAccess(ctx, event)
    const rows = await ctx.db
      .query('eventsHorses')
      .withIndex('by_event_id', (q) => q.eq('eventId', eventId))
      .collect()
    const contextRow = horseId
      ? participationId
        ? rows.find(
            (row) => row._id === participationId && row.horseId === horseId,
          )
        : (rows.find(
            (row) => row.horseId === horseId && !row.participationEndsAt,
          ) ?? rows.find((row) => row.horseId === horseId))
      : undefined
    if (participationId && !contextRow)
      throw new ConvexError('Horse did not participate in this event')
    // Rejoining creates a new participation alongside the frozen history.
    // Load each horse's records once, preferring current participation unless
    // the caller explicitly opened a historical participation.
    const participants = new Map<Id<'horses'>, Doc<'eventsHorses'>>()
    for (const row of contextRow ? [contextRow] : rows) {
      const previous = participants.get(row.horseId)
      if (
        !previous ||
        (previous.participationEndsAt && !row.participationEndsAt)
      )
        participants.set(row.horseId, row)
    }
    const horses = []
    const records = []
    for (const row of participants.values()) {
      const horse = await ctx.db.get(row.horseId)
      if (!horse || (horseId && horse._id !== horseId)) continue
      const access = await getHorseAccess(ctx, horse)
      if (!access.canRead) continue
      horses.push({
        ...horse,
        canRecord:
          access.canAddRecords &&
          (!row.participationEndsAt || access.canEditPersonalRecords),
      })
      records.push(
        ...(
          await ctx.db
            .query('trainingRecords')
            .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
            .collect()
        )
          .filter((r) => r.eventId === eventId)
          .map((record) => ({
            ...record,
            canEdit: canEditHorseRecord(access, horse, record),
          })),
      )
    }
    const projected =
      contextRow && horses.length
        ? await horseEvent(ctx, contextRow)
        : await visibleEvent(ctx, event)
    return { events: projected ? [projected] : [], horses, records }
  },
})
