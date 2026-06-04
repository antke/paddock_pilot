import { ConvexError, v } from 'convex/values'
import { omit } from 'lodash'
import { eventInputSchema } from '../shared/events/eventSchema'
import { internal } from './_generated/api'
import type { Doc, Id } from './_generated/dataModel'
import { mutation, query, type MutationCtx } from './_generated/server'
import {
  assertCanViewStable,
  getCurrentUser,
} from './libs/stablePermissions'
import { eventFields } from './schema'

const validateEventInput = (args: {
  stableId: Id<'stables'>
  horseIds: Array<Id<'horses'>>
  date: string
  time: string
  type: Doc<'events'>['type']
  title: string
  description?: string
  location?: string
  recurrence?: Doc<'events'>['recurrence']
}) => {
  const result = eventInputSchema.safeParse(args)

  if (!result.success) {
    throw new ConvexError(
      result.error.issues[0]?.message ?? 'Invalid event input',
    )
  }

  return result.data
}

const byEventDateAndTime = (a: Doc<'events'>, b: Doc<'events'>) => {
  const dateSort = a.date.localeCompare(b.date)

  if (dateSort !== 0) return dateSort

  return a.time.localeCompare(b.time)
}

const isEvent = (event: Doc<'events'> | null): event is Doc<'events'> => {
  return event !== null
}

const isHorse = (horse: Doc<'horses'> | null): horse is Doc<'horses'> => {
  return horse !== null
}

const isConfirmedEventHorse = (eventHorse: Doc<'eventsHorses'>) => {
  return eventHorse.status === undefined || eventHorse.status === 'confirmed'
}

const getStableHorses = async (
  ctx: MutationCtx,
  stableId: Id<'stables'>,
  horseIds: Array<Id<'horses'>>,
) => {
  const uniqueHorseIds = [...new Set(horseIds)]
  const horses = await Promise.all(
    uniqueHorseIds.map((horseId) => ctx.db.get(horseId)),
  )

  if (horses.some((horse) => !horse)) {
    throw new ConvexError('Horse not found')
  }

  const stableHorses = horses.filter(isHorse)

  if (stableHorses.some((horse) => horse.stableId !== stableId)) {
    throw new ConvexError('All horses must belong to the event stable')
  }

  return stableHorses
}

const getEventHorse = async (
  ctx: MutationCtx,
  eventId: Id<'events'>,
  horseId: Id<'horses'>,
) => {
  return await ctx.db
    .query('eventsHorses')
    .withIndex('by_horse_id_event_id', (q) =>
      q.eq('horseId', horseId).eq('eventId', eventId),
    )
    .unique()
}

const sendEventInvitationEmails = async (
  ctx: MutationCtx,
  eventTitle: string,
  invitedHorses: Array<Doc<'horses'>>,
) => {
  const horsesByOwner = new Map<Id<'users'>, Array<Doc<'horses'>>>()

  for (const horse of invitedHorses) {
    horsesByOwner.set(horse.ownerId, [
      ...(horsesByOwner.get(horse.ownerId) ?? []),
      horse,
    ])
  }

  await Promise.all(
    [...horsesByOwner.entries()].map(async ([ownerId, horses]) => {
      const owner = await ctx.db.get(ownerId)
      if (!owner) return

      await ctx.scheduler.runAfter(0, internal.emails.sendEventHorseInvitation, {
        email: owner.email,
        eventTitle,
        horseNames: horses.map((horse) => horse.name),
      })
    }),
  )
}

const syncConfirmedHorseIds = async (ctx: MutationCtx, eventId: Id<'events'>) => {
  const confirmedRows = await ctx.db
    .query('eventsHorses')
    .withIndex('by_event_id', (q) => q.eq('eventId', eventId))
    .collect()

  await ctx.db.patch(eventId, {
    horseIds: confirmedRows.filter(isConfirmedEventHorse).map((row) => row.horseId),
  })
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx)
    const ownedStables = await ctx.db
      .query('stables')
      .withIndex('by_owner_id', (q) => q.eq('ownerId', user._id))
      .collect()
    const memberships = await ctx.db
      .query('stableMembers')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .collect()
    const stableIds = [
      ...new Set([
        ...ownedStables.map((stable) => stable._id),
        ...memberships.map((membership) => membership.stableId),
      ]),
    ]

    const events = await Promise.all(
      stableIds.map((stableId) =>
        ctx.db
          .query('events')
          .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
          .collect(),
      ),
    )

    return events.flat().sort(byEventDateAndTime)
  },
})

export const get = query({
  args: { id: v.id('events') },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id)
    if (!event) return null

    await assertCanViewStable(ctx, event.stableId)

    return event
  },
})

export const getWithHorses = query({
  args: { id: v.id('events') },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id)
    if (!event) return null

    await assertCanViewStable(ctx, event.stableId)

    const eventHorses = await ctx.db
      .query('eventsHorses')
      .withIndex('by_event_id', (q) => q.eq('eventId', args.id))
      .collect()
    const confirmedEventHorses = eventHorses.filter(isConfirmedEventHorse)
    const pendingEventHorses = eventHorses.filter(
      (eventHorse) => eventHorse.status === 'invited',
    )
    const horses = await Promise.all(
      confirmedEventHorses.map((eventHorse) => ctx.db.get(eventHorse.horseId)),
    )

    return {
      event,
      horses: horses.filter(isHorse),
      eventHorses,
      pendingEventHorses,
    }
  },
})

export const listForStable = query({
  args: { stableId: v.id('stables') },
  handler: async (ctx, args) => {
    await assertCanViewStable(ctx, args.stableId)

    const events = await ctx.db
      .query('events')
      .withIndex('by_stable_id_date', (q) => q.eq('stableId', args.stableId))
      .collect()

    return events.sort(byEventDateAndTime)
  },
})

export const listForHorse = query({
  args: { horseId: v.id('horses') },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.horseId)
    if (!horse) return []

    await assertCanViewStable(ctx, horse.stableId)

    const horseEvents = await ctx.db
      .query('eventsHorses')
      .withIndex('by_horse_id', (q) => q.eq('horseId', args.horseId))
      .take(250)

    const eventIds = [
      ...new Set(
        horseEvents
          .filter(isConfirmedEventHorse)
          .map((horseEvent) => horseEvent.eventId),
      ),
    ]

    const events = await Promise.all(
      eventIds.map((eventId) => ctx.db.get(eventId)),
    )

    return events.filter(isEvent).sort(byEventDateAndTime)
  },
})

export const add = mutation({
  args: { ...omit(eventFields, 'createdBy') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const eventInput = validateEventInput(args)
    const access = await assertCanViewStable(ctx, args.stableId, user._id)

    if (access.role === 'guest') {
      throw new ConvexError('Not authorized to create events in this stable')
    }

    const horses = await getStableHorses(ctx, args.stableId, args.horseIds)
    const confirmedHorses = horses.filter(
      (horse) => access.role === 'owner' || horse.ownerId === user._id,
    )
    const invitedHorses = horses.filter(
      (horse) => access.role !== 'owner' && horse.ownerId !== user._id,
    )
    const now = Date.now()
    const eventId = await ctx.db.insert('events', {
      stableId: args.stableId,
      horseIds: confirmedHorses.map((horse) => horse._id),
      createdBy: user._id,
      date: eventInput.date,
      time: eventInput.time,
      type: eventInput.type,
      title: eventInput.title,
      description: eventInput.description,
      location: eventInput.location,
      recurrence: eventInput.recurrence,
    })

    await Promise.all([
      ...confirmedHorses.map((horse) =>
        ctx.db.insert('eventsHorses', {
          eventId,
          horseId: horse._id,
          status: 'confirmed' as const,
          approvedBy: user._id,
          approvedAt: now,
          createdAt: now,
          updatedAt: now,
        }),
      ),
      ...invitedHorses.map((horse) =>
        ctx.db.insert('eventsHorses', {
          eventId,
          horseId: horse._id,
          status: 'invited' as const,
          invitedBy: user._id,
          invitedAt: now,
          createdAt: now,
          updatedAt: now,
        }),
      ),
    ])

    await sendEventInvitationEmails(ctx, eventInput.title, invitedHorses)

    return eventId
  },
})

export const update = mutation({
  args: { id: v.id('events'), ...omit(eventFields, 'createdBy') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const { id, ...updates } = args
    const eventInput = validateEventInput(updates)

    const event = await ctx.db.get(id)
    if (!event) throw new ConvexError('Event not found')
    if (event.stableId !== args.stableId) {
      throw new ConvexError('Event stable cannot be changed')
    }

    const access = await assertCanViewStable(ctx, args.stableId, user._id)
    const canManageAllHorses = access.role === 'owner'

    if (!canManageAllHorses && event.createdBy !== user._id) {
      throw new ConvexError('Not authorized to update this event')
    }

    const horses = await getStableHorses(ctx, args.stableId, args.horseIds)
    const nextHorseIds = new Set(args.horseIds)
    const existingEventHorses = await ctx.db
      .query('eventsHorses')
      .withIndex('by_event_id', (q) => q.eq('eventId', id))
      .collect()
    const now = Date.now()

    await Promise.all(
      existingEventHorses
        .filter((eventHorse) => !nextHorseIds.has(eventHorse.horseId))
        .map(async (eventHorse) => {
          const horse = await ctx.db.get(eventHorse.horseId)
          if (!horse) return

          if (eventHorse.status === 'declined') {
            await ctx.db.delete(eventHorse._id)
            return
          }

          if (!canManageAllHorses && horse.ownerId !== user._id) {
            throw new ConvexError('Members can only remove their own horses')
          }

          await ctx.db.delete(eventHorse._id)
        }),
    )

    const invitedHorses: Array<Doc<'horses'>> = []

    await Promise.all(
      horses
        .map(async (horse) => {
          const existingEventHorse = existingEventHorses.find(
            (eventHorse) => eventHorse.horseId === horse._id,
          )
          if (existingEventHorse && existingEventHorse.status !== 'declined') {
            return
          }

          const isConfirmed = canManageAllHorses || horse.ownerId === user._id

          if (!isConfirmed) invitedHorses.push(horse)

          if (existingEventHorse) {
            await ctx.db.patch(existingEventHorse._id, {
              status: isConfirmed ? 'confirmed' : 'invited',
              invitedBy: isConfirmed ? undefined : user._id,
              approvedBy: isConfirmed ? user._id : undefined,
              invitedAt: isConfirmed ? undefined : now,
              approvedAt: isConfirmed ? now : undefined,
              updatedAt: now,
            })
            return
          }

          await ctx.db.insert('eventsHorses', {
            eventId: id,
            horseId: horse._id,
            status: isConfirmed ? 'confirmed' : 'invited',
            invitedBy: isConfirmed ? undefined : user._id,
            approvedBy: isConfirmed ? user._id : undefined,
            invitedAt: isConfirmed ? undefined : now,
            approvedAt: isConfirmed ? now : undefined,
            createdAt: now,
            updatedAt: now,
          })
        }),
    )

    await ctx.db.patch(id, {
      stableId: args.stableId,
      date: eventInput.date,
      time: eventInput.time,
      type: eventInput.type,
      title: eventInput.title,
      description: eventInput.description,
      location: eventInput.location,
      recurrence: eventInput.recurrence,
    })
    await syncConfirmedHorseIds(ctx, id)
    await sendEventInvitationEmails(ctx, eventInput.title, invitedHorses)
  },
})

export const approveHorseInvitation = mutation({
  args: { eventHorseId: v.id('eventsHorses') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const eventHorse = await ctx.db.get(args.eventHorseId)
    if (!eventHorse) throw new ConvexError('Event horse invitation not found')
    if (eventHorse.status !== 'invited') {
      throw new ConvexError('This horse invitation is not pending')
    }

    const horse = await ctx.db.get(eventHorse.horseId)
    if (!horse) throw new ConvexError('Horse not found')
    if (horse.ownerId !== user._id) {
      throw new ConvexError('Only the horse owner can approve this invitation')
    }

    const now = Date.now()
    await ctx.db.patch(args.eventHorseId, {
      status: 'confirmed',
      approvedBy: user._id,
      approvedAt: now,
      updatedAt: now,
    })
    await syncConfirmedHorseIds(ctx, eventHorse.eventId)
  },
})

export const declineHorseInvitation = mutation({
  args: { eventHorseId: v.id('eventsHorses') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const eventHorse = await ctx.db.get(args.eventHorseId)
    if (!eventHorse) throw new ConvexError('Event horse invitation not found')
    if (eventHorse.status !== 'invited') {
      throw new ConvexError('This horse invitation is not pending')
    }

    const horse = await ctx.db.get(eventHorse.horseId)
    if (!horse) throw new ConvexError('Horse not found')
    if (horse.ownerId !== user._id) {
      throw new ConvexError('Only the horse owner can decline this invitation')
    }

    const now = Date.now()
    await ctx.db.patch(args.eventHorseId, {
      status: 'declined',
      declinedAt: now,
      updatedAt: now,
    })
  },
})

export const listPendingHorseInvitations = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx)
    const horses = await ctx.db
      .query('horses')
      .withIndex('by_owner_id', (q) => q.eq('ownerId', user._id))
      .collect()
    const invitationRows = await Promise.all(
      horses.map((horse) =>
        ctx.db
          .query('eventsHorses')
          .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
          .filter((q) => q.eq(q.field('status'), 'invited'))
          .collect(),
      ),
    )
    const rows = invitationRows.flat()
    const events = await Promise.all(rows.map((row) => ctx.db.get(row.eventId)))

    return rows.map((row, index) => ({
      invitation: row,
      event: events[index],
      horse: horses.find((horse) => horse._id === row.horseId) ?? null,
    }))
  },
})
