import {
  assertHorseWorkspace,
  recordCapabilities,
  visibleHorse,
} from './libs/recordCapabilities'
import {
  eventParticipantAccess,
  eventReadAccess,
  visibleEvent,
  sharedEventsForStable,
} from './libs/eventPermissions'
import { isRecordShared, hasSharedSchedule } from './libs/recordSharing'
import { creatorName } from './libs/creatorName'
import { getHorseDisplayName } from '../shared/horses/horseDisplayName'
import { horseEvent } from './libs/horseEventHistory'
import {
  assertCanReadHorse,
  assertCanAddHorseRecord,
  assertCanEditHorseRecord,
  getHorseAccess,
} from './libs/horsePermissions'
import { userFacingError } from './libs/userFacingError'
import { ConvexError, v } from 'convex/values'
import { query, mutation } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
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

async function projectTrainingRecords(
  ctx: QueryCtx,
  horse: Doc<'horses'>,
  records: Array<Doc<'trainingRecords'>>,
  stableId?: Id<'stables'>,
) {
  const result = []
  for (const record of records) {
    if (
      stableId &&
      !(await isRecordShared(
        ctx,
        record.eventId,
        horse,
        stableId,
        record.scheduledDate ?? record.date,
      ))
    )
      continue
    const capabilities = await recordCapabilities(ctx, horse, record)
    if (!capabilities.readSchedule) continue
    result.push({
      ...record,
      details: capabilities.readDetails
        ? record.details
        : defaultTrainingDetails,
      outcome: capabilities.readDetails ? record.outcome : undefined,
      createdByName: capabilities.readDetails
        ? await creatorName(ctx, record.recordedBy)
        : null,
      canEdit: capabilities.editContent,
    })
  }
  return result
}

export const listForStable = query({
  args: { stableId: v.id('stables') },
  handler: listStableTraining,
})

export async function listStableTraining(
  ctx: QueryCtx,
  { stableId }: { stableId: Id<'stables'> },
) {
  const access = await assertCanViewStable(ctx, stableId)
  const [allEvents, allHorses] = await Promise.all([
    sharedEventsForStable(ctx, stableId),
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
  const allRecords = (
    await Promise.all(
      horses.map(async (horse) => {
        const records = await ctx.db
          .query('trainingRecords')
          .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
          .collect()
        return projectTrainingRecords(ctx, horse, records, stableId)
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
    events,
    horses: await Promise.all(
      horses.map(async (horse, index) => ({
        ...(await visibleHorse(ctx, horse, true)),
        canRecord: permissions[index].canAddRecords,
      })),
    ),
    records: allRecords.filter((record) => eventIds.has(record.eventId)),
  }
}

export const saveRecord = mutation({
  args: {
    newDate: v.optional(v.string()),
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

/** One transaction: reject the entire session change if any horse is unauthorized. */
export const setSessionStatus = mutation({
  args: {
    eventId: v.id('events'),
    horseIds: v.array(v.id('horses')),
    date: v.string(),
    stableId: v.optional(v.id('stables')),
    status: v.union(v.literal('planned'), v.literal('completed')),
    errorFormat: v.optional(v.literal('structured')),
  },
  handler: async (ctx, { horseIds, stableId, ...args }) => {
    if (stableId) await assertCanViewStable(ctx, stableId)
    for (const horseId of new Set(horseIds)) {
      if (stableId) {
        const horse = await ctx.db.get(horseId)
        if (
          !horse ||
          !(await isRecordShared(ctx, args.eventId, horse, stableId, args.date))
        )
          throw userFacingError('trainingPermission', args.errorFormat)
      }
      await saveTrainingRecord(ctx, { ...args, horseId })
    }
  },
})

async function saveTrainingRecord(
  ctx: MutationCtx,
  args: {
    errorFormat?: 'structured'
    eventId: Id<'events'>
    horseId: Id<'horses'>
    date: string
    newDate?: string
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
  if (
    !(await recordCapabilities(ctx, horse, { _id: event._id, date: args.date }))
      .complete
  )
    throw userFacingError('trainingPermission', args.errorFormat)
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
  const nextDate = args.newDate ?? args.date
  if (!isDateKey(nextDate))
    throw userFacingError('trainingOccurrence', args.errorFormat)
  if (nextDate !== args.date) {
    if (!existing) throw userFacingError('trainingOccurrence', args.errorFormat)
    const conflict = await ctx.db
      .query('trainingRecords')
      .withIndex('by_event_horse_date', (q) =>
        q
          .eq('eventId', event._id)
          .eq('horseId', horse._id)
          .eq('date', nextDate),
      )
      .unique()
    if (conflict)
      throw userFacingError('trainingHorseConflict', args.errorFormat)
  }
  // Allow the current local day anywhere on earth without trusting a client clock.
  const latestToday = new Date(Date.now() + 14 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
  if (!existing && args.status === 'completed' && nextDate > latestToday)
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
    date: nextDate,
    scheduledDate:
      existing?.scheduledDate ??
      (nextDate !== args.date ? args.date : undefined),
    status,
    details,
    outcome,
    recordedBy: existing?.recordedBy ?? user._id,
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
    summary: `${getHorseDisplayName(horse)}: ${status} on ${nextDate}`,
    details: {
      kind: 'training_recorded',
      horseName: getHorseDisplayName(horse),
      status,
      date: nextDate,
    },
  })
}

export const listForHorse = query({
  args: { horseId: v.id('horses'), stableId: v.optional(v.id('stables')) },
  handler: listHorseTraining,
})

export async function listHorseTraining(
  ctx: QueryCtx,
  { horseId, stableId }: { horseId: Id<'horses'>; stableId?: Id<'stables'> },
) {
  const horse = await ctx.db.get(horseId)
  if (!horse) throw new ConvexError('Horse not found')
  const access = await assertCanReadHorse(ctx, horse)
  await assertHorseWorkspace(ctx, horse, stableId)
  const rows = await ctx.db
    .query('eventsHorses')
    .withIndex('by_horse_id', (q) => q.eq('horseId', horseId))
    .collect()
  const events = await Promise.all(
    rows.map((r) => horseEvent(ctx, r, stableId)),
  )
  const records = await ctx.db
    .query('trainingRecords')
    .withIndex('by_horse_id', (q) => q.eq('horseId', horseId))
    .collect()
  return {
    horses: [
      {
        ...(await visibleHorse(ctx, horse, Boolean(stableId))),
        canRecord: access.canAddRecords,
      },
    ],
    records: await projectTrainingRecords(ctx, horse, records, stableId),
    events: events.flatMap((event) =>
      event?.type === 'training'
        ? [{ ...event, notesAfterCompletion: undefined }]
        : [],
    ),
  }
}

export const listForEvent = query({
  args: {
    eventId: v.id('events'),
    stableId: v.optional(v.id('stables')),
    horseId: v.optional(v.id('horses')),
    participationId: v.optional(v.id('eventsHorses')),
  },
  handler: async (ctx, { eventId, horseId, participationId, stableId }) => {
    if (stableId) await assertCanViewStable(ctx, stableId)
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
    const horses: Array<
      Awaited<ReturnType<typeof visibleHorse>> & { canRecord: boolean }
    > = []
    const records = []
    for (const row of participants.values()) {
      const horse = await ctx.db.get(row.horseId)
      if (!horse || (horseId && horse._id !== horseId)) continue
      if (stableId && !(await hasSharedSchedule(ctx, eventId, horse, stableId)))
        continue
      const access = await getHorseAccess(ctx, horse)
      if (
        !(await eventParticipantAccess(ctx, event)).participants.some(
          (p) => p.horse._id === horse._id,
        )
      )
        continue
      horses.push({
        ...(await visibleHorse(ctx, horse)),
        canRecord:
          (row.status === undefined || row.status === 'confirmed') &&
          access.canAddRecords &&
          (!row.participationEndsAt || access.canEditPersonalRecords),
      })
      const horseRecords = await ctx.db
        .query('trainingRecords')
        .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
        .collect()
      records.push(
        ...(await projectTrainingRecords(
          ctx,
          horse,
          horseRecords.filter((record) => record.eventId === eventId),
          stableId,
        )),
      )
    }
    const projected =
      contextRow && horses.length
        ? await horseEvent(ctx, contextRow, stableId)
        : stableId
          ? (await sharedEventsForStable(ctx, stableId)).find(
              (item) => item._id === eventId,
            )
          : await visibleEvent(ctx, event)
    return {
      events: projected
        ? [
            {
              ...projected,
              horseIds: projected.horseIds.filter((id) =>
                horses.some((horse) => horse._id === id),
              ),
            },
          ]
        : [],
      horses,
      records,
    }
  },
})

export const scheduledForLogging = query({
  args: { horseIds: v.array(v.id('horses')), date: v.string() },
  handler: async (ctx, { horseIds, date }) => {
    const user = await getCurrentUser(ctx)
    if (!isDateKey(date)) return []
    const sessions = []
    for (const horseId of new Set(horseIds)) {
      const horse = await ctx.db.get(horseId)
      if (!horse) continue
      const rows = await ctx.db
        .query('eventsHorses')
        .withIndex('by_horse_id', (q) => q.eq('horseId', horseId))
        .collect()
      for (const row of rows) {
        if (
          row.participationEndsAt ||
          (row.status && row.status !== 'confirmed')
        )
          continue
        const event = await ctx.db.get(row.eventId)
        if (
          !event ||
          event.type !== 'training' ||
          !(
            await recordCapabilities(
              ctx,
              horse,
              { _id: event._id, date },
              user._id,
            )
          ).complete
        )
          continue
        if (
          !createEventOccurrences({
            events: [event],
            windowStart: date,
            windowEnd: date,
          }).length
        )
          continue
        const record = await ctx.db
          .query('trainingRecords')
          .withIndex('by_event_horse_date', (q) =>
            q.eq('eventId', event._id).eq('horseId', horseId).eq('date', date),
          )
          .unique()
        if (record && record.status !== 'planned') continue
        sessions.push({
          eventId: event._id,
          horseId,
          horseName: getHorseDisplayName(horse),
          title: (await visibleEvent(ctx, event)).title,
          date,
          time: event.time,
        })
      }
    }
    return sessions
  },
})
