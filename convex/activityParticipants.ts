import { compareEventTimes } from '../shared/events/eventTime'
import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import { getCurrentUser } from './libs/stablePermissions'
import { getInvitationEmails } from './libs/auth'
import { getHorseAccess } from './libs/horsePermissions'
import { getHorseDisplayName } from '../shared/horses/horseDisplayName'
import { accountDisplayName } from '../shared/users/displayName'
import { createEventOccurrences } from '../shared/events/eventOccurrences'
import {
  isDateKey,
  trainingRecordSchema,
} from '../shared/training/trainingSchema'
import { trainingDetails } from './schema'

type Ctx = QueryCtx | MutationCtx

async function canInvite(ctx: Ctx, horseId: Id<'horses'>) {
  const horse = await ctx.db.get(horseId)
  if (!horse || horse.deletedAt !== undefined || horse.transitionId)
    return false
  const access = await getHorseAccess(ctx, horse)
  return access.canEditPersonalRecords || access.isCustodian
}

async function currentSession(ctx: Ctx, row: Doc<'activityParticipants'>) {
  const [event, horse, participation] = await Promise.all([
    ctx.db.get(row.eventId),
    ctx.db.get(row.horseId),
    ctx.db.get(row.eventHorseId),
  ])
  if (
    !event ||
    event.type !== row.type ||
    !horse ||
    horse.deletedAt !== undefined ||
    horse.transitionId ||
    !participation ||
    participation.participationEndsAt ||
    (participation.status !== undefined &&
      participation.status !== 'confirmed') ||
    !event.horseIds.includes(horse._id)
  )
    return null
  if (
    !createEventOccurrences({
      events: [event],
      windowStart: row.date,
      windowEnd: row.date,
    }).some((occurrence) => occurrence.startDate === row.date)
  )
    return null
  return { event, horse }
}

/** A moved report still belongs to its original scheduled occurrence. */
async function sessionReport(ctx: Ctx, row: Doc<'activityParticipants'>) {
  return ctx.db
    .query('trainingRecords')
    .withIndex('by_event_horse_date', (q) =>
      q.eq('eventId', row.eventId).eq('horseId', row.horseId),
    )
    .filter((q) =>
      q.or(
        q.eq(q.field('scheduledDate'), row.date),
        q.and(
          q.eq(q.field('scheduledDate'), undefined),
          q.eq(q.field('date'), row.date),
        ),
      ),
    )
    .unique()
}

export const invite = mutation({
  args: {
    eventId: v.id('events'),
    horseId: v.id('horses'),
    date: v.string(),
    email: v.string(),
    role: v.union(v.literal('rider'), v.literal('instructor')),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!(await canInvite(ctx, args.horseId)))
      throw new ConvexError('You cannot invite participants for this horse')
    const email = args.email.trim().toLowerCase()
    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !isDateKey(args.date)
    )
      throw new ConvexError('Enter a valid email and session date')
    if ((await getInvitationEmails(ctx, user)).includes(email))
      throw new ConvexError('Choose another participant')
    const event = await ctx.db.get(args.eventId)
    const horse = await ctx.db.get(args.horseId)
    const links = await ctx.db
      .query('eventsHorses')
      .withIndex('by_horse_id_event_id', (q) =>
        q.eq('horseId', args.horseId).eq('eventId', args.eventId),
      )
      .collect()
    const link = links.find(
      (row) =>
        !row.participationEndsAt &&
        (row.status === undefined || row.status === 'confirmed'),
    )
    if (
      !event ||
      !horse ||
      !link ||
      !event.horseIds.includes(horse._id) ||
      !createEventOccurrences({
        events: [event],
        windowStart: args.date,
        windowEnd: args.date,
      }).some((o) => o.startDate === args.date)
    )
      throw new ConvexError('Choose a confirmed horse and an existing session')
    const rows = await ctx.db
      .query('activityParticipants')
      .withIndex('by_event', (q) => q.eq('eventId', args.eventId))
      .collect()
    const existing = rows.find(
      (row) =>
        row.horseId === args.horseId &&
        row.date === args.date &&
        row.email === email &&
        row.eventHorseId === link._id &&
        (row.status === 'invited' || row.status === 'accepted'),
    )
    if (existing) return existing._id
    if (rows.filter((row) => row.createdAt > Date.now() - 3600000).length >= 30)
      throw new ConvexError('Too many invitations. Try again later')
    const values = {
      ...args,
      email,
      eventHorseId: link._id,
      invitedBy: user._id,
      status: 'invited' as const,
      title: event.title,
      horseName: getHorseDisplayName(horse),
      time: event.time,
      location: event.location,
      type: event.type,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    // Never silently reactivate a revoked grant or transfer an accepted identity.
    return ctx.db.insert('activityParticipants', values)
  },
})

export const respond = mutation({
  args: { id: v.id('activityParticipants'), accept: v.boolean() },
  handler: async (ctx, { id, accept }) => {
    const user = await getCurrentUser(ctx)
    const row = await ctx.db.get(id)
    if (
      !row ||
      row.status !== 'invited' ||
      !(await getInvitationEmails(ctx, user)).includes(row.email)
    )
      throw new ConvexError('Invitation is unavailable')
    if (
      accept &&
      (!(await currentSession(ctx, row)) ||
        !(await canInviterStillInvite(ctx, row)))
    )
      throw new ConvexError(
        'This invitation is no longer valid. Ask the horse owner for a new invitation',
      )
    await ctx.db.patch(id, {
      status: accept ? 'accepted' : 'declined',
      userId: user._id,
      updatedAt: Date.now(),
    })
  },
})

async function canInviterStillInvite(
  ctx: Ctx,
  row: Doc<'activityParticipants'>,
) {
  const horse = await ctx.db.get(row.horseId)
  const inviter = await ctx.db.get(row.invitedBy)
  if (!horse || !inviter || inviter.deletedAt !== undefined) return false
  const access = await getHorseAccess(ctx, horse, row.invitedBy)
  return access.canEditPersonalRecords || access.isCustodian
}

export const revoke = mutation({
  args: { id: v.id('activityParticipants') },
  handler: async (ctx, { id }) => {
    const user = await getCurrentUser(ctx)
    const row = await ctx.db.get(id)
    if (
      !row ||
      (!(await canInvite(ctx, row.horseId)) && row.userId !== user._id)
    )
      throw new ConvexError('You cannot remove this participant')
    await ctx.db.patch(id, { status: 'revoked', updatedAt: Date.now() })
  },
})

export const forEvent = query({
  args: { eventId: v.id('events'), date: v.string() },
  handler: async (ctx, { eventId, date }) => {
    await getCurrentUser(ctx)
    const event = await ctx.db.get(eventId)
    if (!event) return { horses: [], participants: [] }
    const horses: Array<{ id: Id<'horses'>; name: string }> = []
    for (const id of event.horseIds) {
      if (await canInvite(ctx, id)) {
        const horse = (await ctx.db.get(id))!
        horses.push({ id, name: getHorseDisplayName(horse) })
      }
    }
    const rows = await ctx.db
      .query('activityParticipants')
      .withIndex('by_event', (q) => q.eq('eventId', eventId))
      .collect()
    return {
      horses,
      participants: rows
        .filter(
          (row) =>
            row.date === date &&
            horses.some((horse) => horse.id === row.horseId),
        )
        .map((row) => ({
          id: row._id,
          horseName: row.horseName,
          email: row.email,
          role: row.role,
          status: row.status,
        })),
    }
  },
})

export const mine = query({
  args: {},
  handler: listMyParticipations,
})

export async function listMyParticipations(ctx: QueryCtx) {
  const user = await getCurrentUser(ctx)
  const emails = await getInvitationEmails(ctx, user)
  const rows = [
    ...new Map(
      (
        await Promise.all([
          ctx.db
            .query('activityParticipants')
            .withIndex('by_user', (q) => q.eq('userId', user._id))
            .collect(),
          ...emails.map((email) =>
            ctx.db
              .query('activityParticipants')
              .withIndex('by_email', (q) => q.eq('email', email))
              .collect(),
          ),
        ])
      )
        .flat()
        .map((row) => [row._id, row]),
    ).values(),
  ]
  const result = []
  for (const row of rows) {
    if (
      row.status === 'accepted'
        ? row.userId !== user._id
        : row.status !== 'invited' || !emails.includes(row.email)
    )
      continue
    if (
      row.status === 'invited' &&
      (!(await currentSession(ctx, row)) ||
        !(await canInviterStillInvite(ctx, row)))
    )
      continue
    const report =
      row.status === 'accepted' ? await sessionReport(ctx, row) : null
    const current = await currentSession(ctx, row)
    result.push({
      id: row._id,
      eventId: row.eventId,
      horseId: row.horseId,
      title: current?.event.title ?? row.title,
      horseName: row.horseName,
      date: row.date,
      time: current?.event.time ?? row.time,
      location: current?.event.location ?? row.location,
      type: row.type,
      role: row.role,
      status: row.status,
      // Only the participant's own report is exposed; private owner notes are not implied by participation.
      report:
        report?.recordedBy === user._id
          ? {
              id: report._id,
              details: report.details,
              outcome: report.outcome,
              status: report.status,
            }
          : null,
      canReport:
        row.status === 'accepted' &&
        row.role === 'rider' &&
        row.type === 'training' &&
        Boolean(current) &&
        (!report || report.recordedBy === user._id),
      reported: Boolean(report),
      resultStatus: report?.status,
      plannedTraining: current?.event.training
        ? {
            activities: current.event.training.activities,
            format: current.event.training.format,
            durationMinutes: current.event.training.durationMinutes,
          }
        : null,
    })
  }
  return result.sort(
    (a, b) => b.date.localeCompare(a.date) || compareEventTimes(a.time, b.time),
  )
}

export const reportRide = mutation({
  args: {
    id: v.id('activityParticipants'),
    details: trainingDetails,
    outcome: v.optional(v.string()),
  },
  handler: async (ctx, { id, details, outcome }) => {
    const user = await getCurrentUser(ctx)
    const row = await ctx.db.get(id)
    if (
      !row ||
      row.status !== 'accepted' ||
      row.userId !== user._id ||
      row.role !== 'rider' ||
      row.type !== 'training'
    )
      throw new ConvexError('You cannot report this ride')
    const session = await currentSession(ctx, row)
    if (!session)
      throw new ConvexError('This session has changed. Contact the horse owner')
    if (
      row.date > new Date(Date.now() + 14 * 3600000).toISOString().slice(0, 10)
    )
      throw new ConvexError('You cannot complete a future ride')
    const existing = await sessionReport(ctx, row)
    if (!existing) {
      const occupied = await ctx.db
        .query('trainingRecords')
        .withIndex('by_event_horse_date', (q) =>
          q
            .eq('eventId', row.eventId)
            .eq('horseId', row.horseId)
            .eq('date', row.date),
        )
        .unique()
      if (occupied)
        throw new ConvexError(
          'Another ride has a report on this date. Contact the horse owner',
        )
    }
    if (existing && existing.recordedBy !== user._id)
      throw new ConvexError(
        'This ride already has a report. Ask the horse owner to update it',
      )
    const parsed = trainingRecordSchema.safeParse({
      ...details,
      rider: accountDisplayName(user, user.email),
      outcome,
      status: 'completed',
    })
    if (!parsed.success) throw new ConvexError('Check the ride details')
    const { status, outcome: reportOutcome, ...reportDetails } = parsed.data
    const values = {
      eventId: row.eventId,
      horseId: row.horseId,
      date: existing?.date ?? row.date,
      status,
      details: reportDetails,
      outcome: reportOutcome,
      recordedBy: user._id,
      updatedAt: Date.now(),
    }
    if (existing) await ctx.db.patch(existing._id, values)
    else
      await ctx.db.insert('trainingRecords', {
        ...values,
        createdAt: Date.now(),
      })
  },
})
