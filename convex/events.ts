import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getUserFromIdentity } from './libs/auth'
import { eventFields } from './schema'

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('events').order('desc').collect()
  },
})

export const listForStable = query({
  args: { stableId: v.id('stables') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('events')
      .withIndex('by_stable_id', (q) => q.eq('stableId', args.stableId))
      .order('desc')
      .collect()
  },
})

export const listForHorse = query({
  args: { horseId: v.id('horses') },
  handler: async (ctx, args) => {
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

    return events
  },
})

export const add = mutation({
  args: { ...eventFields },
  handler: async (ctx, args) => {
    const user = await getUserFromIdentity(ctx)
    if (!user) throw new ConvexError('User not found')

    return await ctx.db.insert('events', {
      ...args,
      organiser: user._id,
    })
  },
})
