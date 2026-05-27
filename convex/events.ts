import { ConvexError, v } from 'convex/values'
import { omit } from 'lodash'
import { eventInputSchema } from '../shared/events/eventSchema'
import type { Doc, Id } from './_generated/dataModel'
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from './_generated/server'
import { getUserFromIdentity, requireAuth } from './libs/auth'
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

const getCurrentUser = async (ctx: MutationCtx | QueryCtx) => {
  await requireAuth(ctx)

  const user = await getUserFromIdentity(ctx)
  if (!user) throw new ConvexError('User not found')

  return user
}

const assertCanAccessStableEvents = async (
  ctx: MutationCtx | QueryCtx,
  stableId: Id<'stables'>,
  userId: Id<'users'>,
) => {
  const stable = await ctx.db.get(stableId)
  if (!stable) throw new ConvexError('Stable not found')

  // Current MVP: stable owner/admin can manage events for any horse in their stable.
  // Future: regular users should only add horses they own, with invitations for other owners.
  if (stable.ownerId !== userId) {
    throw new ConvexError('Not authorized to access events for this stable')
  }

  return stable
}

const assertHorsesBelongToStable = async (
  ctx: MutationCtx,
  stableId: Id<'stables'>,
  horseIds: Array<Id<'horses'>>,
) => {
  const horses = await Promise.all(
    horseIds.map((horseId) => ctx.db.get(horseId)),
  )

  if (horses.some((horse) => !horse)) {
    throw new ConvexError('Horse not found')
  }

  if (horses.some((horse) => horse?.stableId !== stableId)) {
    throw new ConvexError('All horses must belong to the event stable')
  }
}

const byEventDateAndTime = (a: Doc<'events'>, b: Doc<'events'>) => {
  const dateSort = a.date.localeCompare(b.date)

  if (dateSort !== 0) return dateSort

  return a.time.localeCompare(b.time)
}

const isEvent = (event: Doc<'events'> | null): event is Doc<'events'> => {
  return event !== null
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx)

    const events = await ctx.db
      .query('events')
      .withIndex('by_created_by', (q) => q.eq('createdBy', user._id))
      .collect()

    return events.sort(byEventDateAndTime)
  },
})

export const get = query({
  args: { id: v.id('events') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)

    const event = await ctx.db.get(args.id)
    if (!event) return null

    await assertCanAccessStableEvents(ctx, event.stableId, user._id)

    return event
  },
})

export const listForStable = query({
  args: { stableId: v.id('stables') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    await assertCanAccessStableEvents(ctx, args.stableId, user._id)

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
    const user = await getCurrentUser(ctx)

    const horse = await ctx.db.get(args.horseId)
    if (!horse) return []

    await assertCanAccessStableEvents(ctx, horse.stableId, user._id)

    const horseEvents = await ctx.db
      .query('eventsHorses')
      .withIndex('by_horse_id', (q) => q.eq('horseId', args.horseId))
      .take(250)

    const eventIds = [
      ...new Set(horseEvents.map((horseEvent) => horseEvent.eventId)),
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

    await assertCanAccessStableEvents(ctx, args.stableId, user._id)
    await assertHorsesBelongToStable(ctx, args.stableId, args.horseIds)

    const eventId = await ctx.db.insert('events', {
      stableId: args.stableId,
      horseIds: args.horseIds,
      createdBy: user._id,
      date: eventInput.date,
      time: eventInput.time,
      type: eventInput.type,
      title: eventInput.title,
      description: eventInput.description,
      location: eventInput.location,
      recurrence: eventInput.recurrence,
    })

    await Promise.all(
      args.horseIds.map((horseId) =>
        ctx.db.insert('eventsHorses', { eventId, horseId }),
      ),
    )

    return eventId
  },
})
