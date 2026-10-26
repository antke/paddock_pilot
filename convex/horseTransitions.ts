import { getHorseDisplayName } from '../shared/horses/horseDisplayName'
import { ConvexError, v } from 'convex/values'
import { paginationOptsValidator } from 'convex/server'
import { internalMutation, mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import { internal } from './_generated/api'
import { assertHorseOwner, auditHorse } from './libs/horsePermissions'
import { schedulingEvent } from './libs/eventPermissions'
import {
  assertCanManageStable,
  assertIsStableParticipant,
} from './libs/stablePermissions'

export async function departurePreview(
  ctx: QueryCtx | MutationCtx,
  horse: Doc<'horses'>,
) {
  const reminders = (
    await ctx.db
      .query('careReminders')
      .withIndex('by_horse_id_due_date', (q) => q.eq('horseId', horse._id))
      .collect()
  ).filter(
    (row) =>
      row.status === 'pending' &&
      row.stableId !== undefined &&
      row.stableId === horse.stableId &&
      row.sourcePlacementId === horse.currentPlacementId,
  )
  const rows = await ctx.db
    .query('eventsHorses')
    .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
    .collect()
  const today = new Date().toISOString().slice(0, 10)
  const events = (
    await Promise.all(
      rows
        .filter(
          (row) =>
            !row.participationEndsAt &&
            row.status !== 'declined' &&
            row.status !== 'withdrawn' &&
            row.sourcePlacementId === horse.currentPlacementId,
        )
        .map((row) => ctx.db.get(row.eventId)),
    )
  ).filter((event): event is Doc<'events'> =>
    Boolean(
      event &&
      event.stableId === horse.stableId &&
      event.status !== 'completed' &&
      event.status !== 'cancelled' &&
      (event.recurrence || event.date >= today),
    ),
  )
  const visibleEvents = events.map((event) => ({
    ...schedulingEvent(event),
    horseIds: [horse._id],
  }))
  const revision = JSON.stringify([
    horse.ownerId,
    horse.currentPlacementId,
    horse.transitionId,
    reminders,
    visibleEvents,
  ])
  return { reminders, events: visibleEvents, revision }
}

export async function revokeHorseAccess(
  ctx: MutationCtx,
  horseId: Id<'horses'>,
  except?: Id<'horseInvitations'>,
) {
  const carers = await ctx.db
    .query('horseCarers')
    .withIndex('by_horse_id', (q) => q.eq('horseId', horseId))
    .collect()
  for (const carer of carers) await ctx.db.delete(carer._id)
  const invitations = await ctx.db
    .query('horseInvitations')
    .withIndex('by_horse_id', (q) => q.eq('horseId', horseId))
    .collect()
  for (const invitation of invitations)
    if (invitation.status === 'pending' && invitation._id !== except)
      await ctx.db.patch(invitation._id, { status: 'revoked' })
}

export async function connectHorse(
  ctx: MutationCtx,
  horseId: Id<'horses'>,
  stableId: Id<'stables'>,
  actorUserId: Id<'users'>,
) {
  const horse = await ctx.db.get(horseId)
  if (
    !horse ||
    horse.deletedAt !== undefined ||
    horse.currentPlacementId ||
    horse.stableId ||
    horse.transitionId
  )
    throw new ConvexError('Leave the current stable before connecting another')
  if (!horse.ownerId) throw new ConvexError('Claim this horse first')
  await assertIsStableParticipant(ctx, stableId, horse.ownerId)
  const placementId = await ctx.db.insert('horsePlacements', {
    horseId,
    stableId,
    createdBy: actorUserId,
    startedAt: Date.now(),
  })
  await ctx.db.patch(horseId, { stableId, currentPlacementId: placementId })
  await auditHorse(ctx, horseId, actorUserId, 'placement.connected')
  return placementId
}

export async function startDeparture(
  ctx: MutationCtx,
  horse: Doc<'horses'>,
  input: {
    actorUserId: Id<'users'>
    carryReminderIds: Array<Id<'careReminders'>>
    targetStableId?: Id<'stables'>
    targetOwnerId?: Id<'users'>
    invitationId?: Id<'horseInvitations'>
  },
) {
  if (horse.transitionId) return horse.transitionId
  if (!horse.stableId || !horse.currentPlacementId)
    throw new ConvexError('Horse has no active placement')
  const transitionId = await ctx.db.insert('horseTransitions', {
    horseId: horse._id,
    placementId: horse.currentPlacementId,
    ...input,
    phase: 0,
    startedAt: Date.now(),
    status: 'running',
  })
  await ctx.db.patch(horse._id, { transitionId })
  await ctx.scheduler.runAfter(0, internal.horseTransitions.advance, {
    id: transitionId,
  })
  return transitionId
}

export const preview = query({
  args: { horseId: v.id('horses') },
  handler: async (ctx, { horseId }) => {
    const horse = await ctx.db.get(horseId)
    if (!horse) throw new ConvexError('Horse not found')
    await assertHorseOwner(ctx, horse)
    return departurePreview(ctx, horse)
  },
})

export const connect = mutation({
  args: { horseId: v.id('horses'), stableId: v.id('stables') },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.horseId)
    if (!horse) throw new ConvexError('Horse not found')
    const access = await assertHorseOwner(ctx, horse)
    return connectHorse(ctx, horse._id, args.stableId, access.userId)
  },
})

export const depart = mutation({
  args: {
    horseId: v.id('horses'),
    revision: v.string(),
    carryReminderIds: v.array(v.id('careReminders')),
    targetStableId: v.optional(v.id('stables')),
  },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.horseId)
    if (!horse) throw new ConvexError('Horse not found')
    const access = await assertHorseOwner(ctx, horse)
    const preview = await departurePreview(ctx, horse)
    if (preview.revision !== args.revision)
      throw new ConvexError('Care plans changed. Review departure again.')
    if (
      args.carryReminderIds.some(
        (id) => !preview.reminders.some((r) => r._id === id),
      )
    )
      throw new ConvexError('Invalid reminder selection')
    if (args.targetStableId) {
      if (args.targetStableId === horse.stableId)
        throw new ConvexError('Choose a different stable')
      await assertIsStableParticipant(ctx, args.targetStableId, access.userId)
    }
    return startDeparture(ctx, horse, {
      actorUserId: access.userId,
      carryReminderIds: [...new Set(args.carryReminderIds)],
      targetStableId: args.targetStableId,
    })
  },
})

const recordTables = [
  'horseHealthIssues',
  'horseWeightRecords',
  'horseMedicationRecords',
  'horseNutritionLogs',
  'trainingRecords',
  'stableDocuments',
] as const

export const advance = internalMutation({
  args: { id: v.id('horseTransitions') },
  handler: async (ctx, { id }) => {
    const transition = await ctx.db.get(id)
    if (!transition || transition.status === 'complete') return
    const horse = await ctx.db.get(transition.horseId)
    const placement = await ctx.db.get(transition.placementId)
    if (!horse || !placement || horse.transitionId !== id)
      throw new ConvexError('Invalid horse transition')
    const snapshot = async (
      kind: string,
      sourceId: string,
      data: unknown,
      storageId?: Id<'_storage'>,
    ) => {
      await ctx.db.insert('horseSnapshots', {
        horseId: horse._id,
        horseName: getHorseDisplayName(horse),
        stableId: placement.stableId,
        placementId: placement._id,
        kind,
        sourceId,
        data,
        storageId,
        createdAt: transition.startedAt,
      })
    }
    if (transition.phase < recordTables.length) {
      const table = recordTables[transition.phase]
      const page = await ctx.db
        .query(table)
        .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
        .paginate({ numItems: 50, cursor: transition.cursor ?? null })
      for (const row of page.page)
        if (
          row.stableId === placement.stableId &&
          row.sourcePlacementId === placement._id
        ) {
          await snapshot(
            table,
            row._id,
            row,
            'storageId' in row ? row.storageId : undefined,
          )
        }
      await ctx.db.patch(id, {
        phase: page.isDone ? transition.phase + 1 : transition.phase,
        cursor: page.isDone ? undefined : page.continueCursor,
      })
    } else if (transition.phase === recordTables.length) {
      const page = await ctx.db
        .query('eventsHorses')
        .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
        .paginate({ numItems: 50, cursor: transition.cursor ?? null })
      const today = new Date(transition.startedAt).toISOString().slice(0, 10)
      for (const row of page.page) {
        const event = await ctx.db.get(row.eventId)
        if (
          !event ||
          event.stableId !== placement.stableId ||
          row.sourcePlacementId !== placement._id
        )
          continue
        const history = {
          title: event.title,
          type: event.type,
          date: event.date,
          time: event.time,
          endDate: event.endDate,
          recurrence: event.recurrence,
          training: event.training,
          status: event.status,
          providerName: event.providerName,
        }
        await snapshot('event', row._id, {
          history,
          requestedServiceNotes: row.requestedServiceNotes,
          completionNotes: row.completionNotes,
          costShare: row.costShare,
          status: row.status,
        })
        const future =
          event.status !== 'completed' &&
          (event.date >= today || Boolean(event.recurrence))
        await ctx.db.patch(row._id, {
          history,
          participationEndsAt: today,
          ...(future && !event.recurrence
            ? {
                status: 'withdrawn' as const,
                withdrawnAt: transition.startedAt,
                withdrawnBy: transition.actorUserId,
              }
            : {}),
        })
        if (future)
          await ctx.db.patch(event._id, {
            horseIds: event.horseIds.filter((h) => h !== horse._id),
          })
      }
      await ctx.db.patch(id, {
        phase: page.isDone ? transition.phase + 1 : transition.phase,
        cursor: page.isDone ? undefined : page.continueCursor,
      })
    } else if (transition.phase === recordTables.length + 1) {
      const page = await ctx.db
        .query('careReminders')
        .withIndex('by_horse_id_due_date', (q) => q.eq('horseId', horse._id))
        .paginate({ numItems: 50, cursor: transition.cursor ?? null })
      for (const reminder of page.page) {
        if (
          !reminder.stableId &&
          transition.targetOwnerId &&
          reminder.status === 'pending'
        )
          await ctx.db.patch(reminder._id, {
            assignedTo: transition.targetOwnerId,
          })
        if (
          reminder.stableId !== placement.stableId ||
          reminder.sourcePlacementId !== placement._id
        )
          continue
        await snapshot('reminder', reminder._id, reminder)
        if (reminder.status === 'pending') {
          if (transition.carryReminderIds.includes(reminder._id)) {
            // Carry the canonical task; placement metadata remains provenance.
            await ctx.db.patch(reminder._id, {
              assignedTo: transition.targetOwnerId ?? horse.ownerId,
              updatedAt: Date.now(),
            })
            continue
          }
          await ctx.db.patch(reminder._id, {
            status: 'dismissed',
            assignedTo: undefined,
            updatedAt: Date.now(),
          })
        }
      }
      await ctx.db.patch(id, {
        phase: page.isDone ? transition.phase + 1 : transition.phase,
        cursor: page.isDone ? undefined : page.continueCursor,
      })
    } else {
      const newOwner = transition.targetOwnerId
        ? await ctx.db.get(transition.targetOwnerId)
        : null
      const targetOwnerId =
        newOwner && newOwner.deletedAt === undefined ? newOwner._id : undefined
      if (transition.targetOwnerId && !targetOwnerId && transition.invitationId)
        await ctx.db.patch(transition.invitationId, { status: 'revoked' })
      if (transition.targetOwnerId && !targetOwnerId) {
        const reminders = await ctx.db
          .query('careReminders')
          .withIndex('by_horse_id_due_date', (q) => q.eq('horseId', horse._id))
          .collect()
        for (const reminder of reminders)
          if (
            !reminder.stableId &&
            reminder.status === 'pending' &&
            reminder.assignedTo === transition.targetOwnerId
          )
            await ctx.db.patch(reminder._id, { assignedTo: horse.ownerId })
      }
      await ctx.db.patch(placement._id, { endedAt: transition.startedAt })
      await ctx.db.patch(horse._id, {
        stableId: undefined,
        currentPlacementId: undefined,
        transitionId: undefined,
        vetProviderId: undefined,
        farrierProviderId: undefined,
        ...(targetOwnerId
          ? {
              ownerId: targetOwnerId,
              ownerName: newOwner?.preferredName ?? newOwner?.firstName ?? '',
              custodianStableId: undefined,
            }
          : {}),
      })
      if (targetOwnerId) {
        await revokeHorseAccess(ctx, horse._id, transition.invitationId)
        if (transition.invitationId)
          await ctx.db.patch(transition.invitationId, {
            status: 'accepted',
            acceptedBy: transition.targetOwnerId,
          })
      }
      if (transition.targetStableId && horse.deletedAt === undefined) {
        // Membership may have changed while snapshots were being retained. In that
        // case the horse safely finishes in personal care, never in an invalid yard.
        const stable = await ctx.db.get(transition.targetStableId)
        const ownerId = targetOwnerId ?? horse.ownerId
        const member = ownerId
          ? await ctx.db
              .query('stableMembers')
              .withIndex('by_stable_id_user_id', (q) =>
                q
                  .eq('stableId', transition.targetStableId!)
                  .eq('userId', ownerId),
              )
              .unique()
          : null
        if (
          stable &&
          stable.archivedAt === undefined &&
          ownerId &&
          (stable.ownerId === ownerId || member?.role === 'member')
        )
          await connectHorse(ctx, horse._id, stable._id, transition.actorUserId)
      }
      await auditHorse(
        ctx,
        horse._id,
        transition.actorUserId,
        targetOwnerId ? 'ownership.transferred' : 'placement.ended',
      )
      await ctx.db.patch(id, { status: 'complete', cursor: undefined })
      return
    }
    await ctx.scheduler.runAfter(0, internal.horseTransitions.advance, { id })
  },
})

export const stableHistory = query({
  args: { stableId: v.id('stables'), paginationOpts: paginationOptsValidator },
  handler: async (ctx, { stableId }) => {
    await assertCanManageStable(ctx, stableId)
    // Retained snapshots are a recovery source for the horse, never a former-yard audience.
    return {
      page: [] as Array<Doc<'horseSnapshots'>>,
      isDone: true,
      continueCursor: '',
    }
  },
})

/** Retries interrupted background jobs; each page commits atomically with its cursor. */
export const resume = internalMutation({
  args: {},
  handler: async (ctx) => {
    const running = await ctx.db
      .query('horseTransitions')
      .withIndex('by_status', (q) => q.eq('status', 'running'))
      .take(50)
    for (const transition of running)
      await ctx.scheduler.runAfter(0, internal.horseTransitions.advance, {
        id: transition._id,
      })
  },
})
