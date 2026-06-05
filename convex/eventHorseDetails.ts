import { ConvexError, v } from 'convex/values'
import { eventHorseDetailsInputSchema } from '../shared/events/eventHorseDetailsSchema'
import type { Doc, Id } from './_generated/dataModel'
import { mutation, query   } from './_generated/server'
import type {MutationCtx, QueryCtx} from './_generated/server';
import { assertCanViewStable, getCurrentUser } from './libs/stablePermissions'

type Ctx = MutationCtx | QueryCtx

const isHorse = (horse: Doc<'horses'> | null): horse is Doc<'horses'> => {
  return horse !== null
}

const validateDetailsInput = (args: {
  requestedServiceNotes?: string
  completionNotes?: string
  costShare?: number
}) => {
  const result = eventHorseDetailsInputSchema.safeParse(args)

  if (!result.success) {
    throw new ConvexError(
      result.error.issues[0]?.message ?? 'Invalid service details input',
    )
  }

  return result.data
}

const canManageEventHorse = (
  access: Awaited<ReturnType<typeof assertCanViewStable>>,
  event: Doc<'events'>,
  horse: Doc<'horses'>,
) => {
  return (
    access.role === 'owner' ||
    event.createdBy === access.userId ||
    horse.ownerId === access.userId
  )
}

const getEventHorseContext = async (ctx: Ctx, id: Id<'eventsHorses'>) => {
  const eventHorse = await ctx.db.get(id)
  if (!eventHorse) throw new ConvexError('Event horse row not found')

  const [event, horse] = await Promise.all([
    ctx.db.get(eventHorse.eventId),
    ctx.db.get(eventHorse.horseId),
  ])

  if (!event) throw new ConvexError('Event not found')
  if (!horse) throw new ConvexError('Horse not found')

  return { eventHorse, event, horse }
}

export const listForEvent = query({
  args: { eventId: v.id('events') },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId)
    if (!event) return { event: null, rows: [] }

    const access = await assertCanViewStable(ctx, event.stableId)
    const eventHorseRows = await ctx.db
      .query('eventsHorses')
      .withIndex('by_event_id', (q) => q.eq('eventId', args.eventId))
      .collect()
    const horses = await Promise.all(
      eventHorseRows.map((row) => ctx.db.get(row.horseId)),
    )
    const horsesById = new Map(
      horses.filter(isHorse).map((horse) => [horse._id, horse]),
    )

    return {
      event,
      rows: eventHorseRows
        .map((row) => {
          const horse = horsesById.get(row.horseId)

          return {
            eventHorse: row,
            horse,
            canManage: horse ? canManageEventHorse(access, event, horse) : false,
          }
        })
        .sort((a, b) =>
          (a.horse?.name ?? 'Unknown horse').localeCompare(
            b.horse?.name ?? 'Unknown horse',
          ),
        ),
    }
  },
})

export const update = mutation({
  args: {
    id: v.id('eventsHorses'),
    requestedServiceNotes: v.optional(v.string()),
    completionNotes: v.optional(v.string()),
    costShare: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const { id, ...details } = args
    const input = validateDetailsInput(details)
    const { eventHorse, event, horse } = await getEventHorseContext(ctx, id)
    const access = await assertCanViewStable(ctx, event.stableId, user._id)

    if (!canManageEventHorse(access, event, horse)) {
      throw new ConvexError('Not authorized to update service details')
    }

    await ctx.db.patch(eventHorse._id, {
      requestedServiceNotes: input.requestedServiceNotes,
      completionNotes: input.completionNotes,
      costShare: input.costShare,
      updatedAt: Date.now(),
    })
  },
})
