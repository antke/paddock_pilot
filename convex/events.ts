import { ConvexError, v } from 'convex/values'
import { omit } from 'lodash'
import { eventInputSchema } from '../shared/events/eventSchema'
import type { Doc, Id } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { assertCanViewStable, getCurrentUser } from './libs/stablePermissions'
import { eventFields } from './schema'
import {
  canCreateEventForHorseOwners,
  canManageCreatedRecord,
  canManageOwnedRecord,
} from '../shared/stables/stableAccess'
import { hasPersonalPlus } from './libs/entitlements'
import {
  hasActiveHorse,
  isActiveHorse,
  withActiveEventHorseIds,
} from './libs/horseState'
import { recordStableAudit } from './libs/audit'
import { getEventChangeNotificationOwnerIds } from '../shared/events/eventNotificationRecipients'
import { enqueueEmail } from './libs/email/outbox'

const validateEventInput = (args: {
  stableId: Id<'stables'>
  horseIds: Array<Id<'horses'>>
  date: string
  time: string
  type: Doc<'events'>['type']
  title: string
  description?: string
  location?: string
  providerName?: string
  providerPhone?: string
  totalCost?: number
  costPerHorse?: number
  status?: Doc<'events'>['status']
  notesAfterCompletion?: string
  endDate?: string
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
  return isActiveHorse(horse)
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

  if (stableHorses.length !== uniqueHorseIds.length) {
    throw new ConvexError('Horse not found or is in the deleted horses area')
  }

  if (stableHorses.some((horse) => horse.stableId !== stableId)) {
    throw new ConvexError('All horses must belong to the event stable')
  }

  return stableHorses
}

const filterEventsForActiveHorses = async (
  ctx: QueryCtx,
  stableId: Id<'stables'>,
  events: Array<Doc<'events'>>,
) => {
  const horses = await ctx.db
    .query('horses')
    .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
    .collect()
  const activeHorseIds = new Set(
    horses.filter(isActiveHorse).map((horse) => horse._id),
  )

  return events
    .filter((event) => hasActiveHorse(event, activeHorseIds))
    .map((event) => withActiveEventHorseIds(event, activeHorseIds))
}

const sendEventInvitationEmails = async (
  ctx: MutationCtx,
  stableId: Id<'stables'>,
  eventId: Id<'events'>,
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

      await enqueueEmail(ctx, {
        recipient: owner.email,
        relation: { type: 'event', id: eventId },
        template: {
          kind: 'event_horse_invitation',
          eventTitle,
          horseNames: horses.map((horse) => horse.name),
          stableId,
          eventId,
        },
      })
    }),
  )
}

const formatUserName = (user: Doc<'users'>) =>
  user.preferredName ||
  [user.firstName, user.lastName].filter(Boolean).join(' ') ||
  'A stable member'

const notifyEventOrganizerOfParticipation = async (
  ctx: MutationCtx,
  input: {
    event: Doc<'events'>
    horse: Doc<'horses'>
    actor: Doc<'users'>
    status: 'approved' | 'declined' | 'withdrawn'
  },
) => {
  if (input.event.createdBy === input.actor._id) return

  const organizer = await ctx.db.get(input.event.createdBy)
  if (!organizer || organizer.deletedAt !== undefined) return

  await enqueueEmail(ctx, {
    recipient: organizer.email,
    relation: { type: 'event', id: input.event._id },
    template: {
      kind: 'event_participation_update',
      eventTitle: input.event.title,
      horseName: input.horse.name,
      actorName: formatUserName(input.actor),
      status: input.status,
      stableId: input.event.stableId,
      eventId: input.event._id,
    },
  })
}

const getMaterialEventChanges = (
  event: Doc<'events'>,
  next: ReturnType<typeof validateEventInput>,
  horsesChanged: boolean,
) => {
  const changes: Array<string> = []
  if (event.title !== next.title) changes.push('Event title changed')
  if (event.date !== next.date || event.endDate !== next.endDate) {
    changes.push('Event date changed')
  }
  if (event.time !== next.time) changes.push('Event time changed')
  if (event.location !== next.location) changes.push('Location changed')
  if ((event.status ?? 'planned') !== (next.status ?? 'planned')) {
    changes.push('Event status changed')
  }
  if (event.providerName !== next.providerName) changes.push('Provider changed')
  if (horsesChanged) changes.push('Horse participation changed')
  return changes
}

const notifyEventParticipantsOfChanges = async (
  ctx: MutationCtx,
  input: {
    event: Doc<'events'>
    actorUserId: Id<'users'>
    changes: Array<string>
    horses: Array<Doc<'horses'>>
    nextTitle: string
    excludedOwnerIds?: Set<Id<'users'>>
  },
) => {
  if (input.changes.length === 0) return

  const ownerIds = getEventChangeNotificationOwnerIds({
    actorUserId: input.actorUserId,
    horseOwnerIds: input.horses.map((horse) => horse.ownerId),
    excludedOwnerIds: input.excludedOwnerIds,
  })
  const owners = await Promise.all(
    ownerIds.map((ownerId) => ctx.db.get(ownerId)),
  )

  await Promise.all(
    owners.flatMap((owner) =>
      owner && owner.deletedAt === undefined
        ? [
            enqueueEmail(ctx, {
              recipient: owner.email,
              relation: { type: 'event', id: input.event._id },
              template: {
                kind: 'event_details_changed',
                eventTitle: input.nextTitle,
                changes: input.changes,
                stableId: input.event.stableId,
                eventId: input.event._id,
              },
            }),
          ]
        : [],
    ),
  )
}

const syncConfirmedHorseIds = async (
  ctx: MutationCtx,
  eventId: Id<'events'>,
) => {
  const confirmedRows = await ctx.db
    .query('eventsHorses')
    .withIndex('by_event_id', (q) => q.eq('eventId', eventId))
    .collect()

  await ctx.db.patch(eventId, {
    horseIds: confirmedRows
      .filter(isConfirmedEventHorse)
      .map((row) => row.horseId),
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
    const canUseMemberStables = await hasPersonalPlus(ctx, user._id)
    const memberStables = await Promise.all(
      memberships
        .filter(
          (membership) => canUseMemberStables && membership.role === 'member',
        )
        .map((membership) => ctx.db.get(membership.stableId)),
    )
    const stableIds = [
      ...new Set([
        ...ownedStables
          .filter((stable) => stable.archivedAt === undefined)
          .map((stable) => stable._id),
        ...memberStables.flatMap((stable) =>
          stable && stable.archivedAt === undefined ? [stable._id] : [],
        ),
      ]),
    ]

    const events = await Promise.all(
      stableIds.map(async (stableId) => {
        const stableEvents = await ctx.db
          .query('events')
          .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
          .collect()

        return filterEventsForActiveHorses(ctx, stableId, stableEvents)
      }),
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

export const getPermissions = query({
  args: { id: v.id('events') },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id)
    if (!event) return null

    const access = await assertCanViewStable(ctx, event.stableId)

    return {
      canManageEvent: canManageCreatedRecord({
        role: access.role,
        userId: access.userId,
        createdBy: event.createdBy,
      }),
      canConfirmAnyHorse: access.role === 'owner',
      role: access.role,
    }
  },
})

export const getWithHorses = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const eventId = ctx.db.normalizeId('events', args.id)
    if (!eventId) return null

    const event = await ctx.db.get(eventId)
    if (!event) return null

    await assertCanViewStable(ctx, event.stableId)

    const eventHorses = await ctx.db
      .query('eventsHorses')
      .withIndex('by_event_id', (q) => q.eq('eventId', eventId))
      .collect()
    const confirmedEventHorses = eventHorses.filter(isConfirmedEventHorse)
    const pendingEventHorses = eventHorses.filter(
      (eventHorse) => eventHorse.status === 'invited',
    )
    const associatedHorses = await Promise.all(
      eventHorses.map((eventHorse) => ctx.db.get(eventHorse.horseId)),
    )
    const activeHorseIds = new Set(
      associatedHorses.filter(isHorse).map((horse) => horse._id),
    )
    const activeHorsesById = new Map(
      associatedHorses.filter(isHorse).map((horse) => [horse._id, horse]),
    )

    return {
      event: withActiveEventHorseIds(event, activeHorseIds),
      horses: confirmedEventHorses.flatMap((row) => {
        const horse = activeHorsesById.get(row.horseId)
        return horse ? [horse] : []
      }),
      eventHorses: eventHorses.filter((row) => activeHorseIds.has(row.horseId)),
      pendingEventHorses: pendingEventHorses.filter((row) =>
        activeHorseIds.has(row.horseId),
      ),
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

    return (await filterEventsForActiveHorses(ctx, args.stableId, events)).sort(
      byEventDateAndTime,
    )
  },
})

export const listForHorse = query({
  args: { horseId: v.string() },
  handler: async (ctx, args) => {
    const horseId = ctx.db.normalizeId('horses', args.horseId)
    if (!horseId) return []

    const horse = await ctx.db.get(horseId)
    if (!isActiveHorse(horse)) return []

    await assertCanViewStable(ctx, horse.stableId)

    const horseEvents = await ctx.db
      .query('eventsHorses')
      .withIndex('by_horse_id', (q) => q.eq('horseId', horseId))
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

    const horses = await getStableHorses(ctx, args.stableId, args.horseIds)

    if (
      !canCreateEventForHorseOwners({
        role: access.role,
        userId: user._id,
        horseOwnerIds: horses.map((horse) => horse.ownerId),
      })
    ) {
      throw new ConvexError(
        'A member-created event must include at least one of their horses',
      )
    }
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
      endDate: eventInput.endDate,
      time: eventInput.time,
      type: eventInput.type,
      title: eventInput.title,
      description: eventInput.description,
      location: eventInput.location,
      providerName: eventInput.providerName,
      providerPhone: eventInput.providerPhone,
      totalCost: eventInput.totalCost,
      costPerHorse: eventInput.costPerHorse,
      status: eventInput.status,
      notesAfterCompletion: eventInput.notesAfterCompletion,
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

    await sendEventInvitationEmails(
      ctx,
      args.stableId,
      eventId,
      eventInput.title,
      invitedHorses,
    )
    await recordStableAudit(ctx, {
      stableId: args.stableId,
      actorUserId: user._id,
      action: 'event.created',
      entityType: 'event',
      entityId: eventId,
      summary: eventInput.title,
    })

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

    if (
      !canManageCreatedRecord({
        role: access.role,
        userId: user._id,
        createdBy: event.createdBy,
      })
    ) {
      throw new ConvexError('Not authorized to update this event')
    }

    const horses = await getStableHorses(ctx, args.stableId, args.horseIds)

    if (
      !canCreateEventForHorseOwners({
        role: access.role,
        userId: user._id,
        horseOwnerIds: horses.map((horse) => horse.ownerId),
      })
    ) {
      throw new ConvexError(
        'A member-managed event must retain at least one of their horses',
      )
    }
    const nextHorseIds = new Set(args.horseIds)
    const existingEventHorses = await ctx.db
      .query('eventsHorses')
      .withIndex('by_event_id', (q) => q.eq('eventId', id))
      .collect()
    const existingActiveHorseIds = new Set(
      existingEventHorses
        .filter(
          (row) => row.status !== 'declined' && row.status !== 'withdrawn',
        )
        .map((row) => row.horseId),
    )
    const existingActiveHorses = (
      await Promise.all(
        [...existingActiveHorseIds].map((horseId) => ctx.db.get(horseId)),
      )
    ).filter(isHorse)
    const horsesChanged =
      existingActiveHorseIds.size !== nextHorseIds.size ||
      [...nextHorseIds].some((horseId) => !existingActiveHorseIds.has(horseId))
    const materialChanges = getMaterialEventChanges(
      event,
      eventInput,
      horsesChanged,
    )
    const now = Date.now()

    await Promise.all(
      existingEventHorses
        .filter((eventHorse) => !nextHorseIds.has(eventHorse.horseId))
        .map(async (eventHorse) => {
          const horse = await ctx.db.get(eventHorse.horseId)
          if (!horse) return
          if (horse.deletedAt !== undefined) return

          await ctx.db.delete(eventHorse._id)
        }),
    )

    const invitedHorses: Array<Doc<'horses'>> = []

    await Promise.all(
      horses.map(async (horse) => {
        const existingEventHorse = existingEventHorses.find(
          (eventHorse) => eventHorse.horseId === horse._id,
        )
        if (
          existingEventHorse &&
          existingEventHorse.status !== 'declined' &&
          existingEventHorse.status !== 'withdrawn'
        ) {
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
            declinedAt: undefined,
            withdrawnBy: undefined,
            withdrawnAt: undefined,
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
      endDate: eventInput.endDate,
      time: eventInput.time,
      type: eventInput.type,
      title: eventInput.title,
      description: eventInput.description,
      location: eventInput.location,
      providerName: eventInput.providerName,
      providerPhone: eventInput.providerPhone,
      totalCost: eventInput.totalCost,
      costPerHorse: eventInput.costPerHorse,
      status: eventInput.status,
      notesAfterCompletion: eventInput.notesAfterCompletion,
      recurrence: eventInput.recurrence,
    })
    await syncConfirmedHorseIds(ctx, id)
    await sendEventInvitationEmails(
      ctx,
      args.stableId,
      id,
      eventInput.title,
      invitedHorses,
    )
    await notifyEventParticipantsOfChanges(ctx, {
      event,
      actorUserId: user._id,
      changes: materialChanges,
      horses: [...horses, ...existingActiveHorses],
      nextTitle: eventInput.title,
      excludedOwnerIds: new Set(invitedHorses.map((horse) => horse.ownerId)),
    })
    await recordStableAudit(ctx, {
      stableId: args.stableId,
      actorUserId: user._id,
      action: 'event.updated',
      entityType: 'event',
      entityId: id,
      summary:
        materialChanges.length > 0
          ? materialChanges.join(', ')
          : eventInput.title,
    })
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
    if (!isActiveHorse(horse)) throw new ConvexError('Horse not found')
    const event = await ctx.db.get(eventHorse.eventId)
    if (!event) throw new ConvexError('Event not found')
    if (horse.stableId !== event.stableId) {
      throw new ConvexError('Horse does not belong to the event stable')
    }
    const access = await assertCanViewStable(ctx, event.stableId, user._id)

    if (
      !canManageOwnedRecord({
        role: access.role,
        userId: user._id,
        ownerId: horse.ownerId,
      })
    ) {
      throw new ConvexError(
        'Only the stable admin or horse owner can approve this invitation',
      )
    }

    const now = Date.now()
    await ctx.db.patch(args.eventHorseId, {
      status: 'confirmed',
      approvedBy: user._id,
      approvedAt: now,
      updatedAt: now,
    })
    await syncConfirmedHorseIds(ctx, eventHorse.eventId)
    await notifyEventOrganizerOfParticipation(ctx, {
      event,
      horse,
      actor: user,
      status: 'approved',
    })
    await recordStableAudit(ctx, {
      stableId: event.stableId,
      actorUserId: user._id,
      action: 'event_horse.approved',
      entityType: 'eventHorse',
      entityId: eventHorse._id,
      summary: `${horse.name} · ${event.title}`,
    })
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
    if (!isActiveHorse(horse)) throw new ConvexError('Horse not found')
    const event = await ctx.db.get(eventHorse.eventId)
    if (!event) throw new ConvexError('Event not found')
    if (horse.stableId !== event.stableId) {
      throw new ConvexError('Horse does not belong to the event stable')
    }
    const access = await assertCanViewStable(ctx, event.stableId, user._id)

    if (
      !canManageOwnedRecord({
        role: access.role,
        userId: user._id,
        ownerId: horse.ownerId,
      })
    ) {
      throw new ConvexError(
        'Only the stable admin or horse owner can decline this invitation',
      )
    }

    const now = Date.now()
    await ctx.db.patch(args.eventHorseId, {
      status: 'declined',
      declinedAt: now,
      updatedAt: now,
    })
    await notifyEventOrganizerOfParticipation(ctx, {
      event,
      horse,
      actor: user,
      status: 'declined',
    })
    await recordStableAudit(ctx, {
      stableId: event.stableId,
      actorUserId: user._id,
      action: 'event_horse.declined',
      entityType: 'eventHorse',
      entityId: eventHorse._id,
      summary: `${horse.name} · ${event.title}`,
    })
  },
})

export const withdrawHorseFromEvent = mutation({
  args: { eventHorseId: v.id('eventsHorses') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const eventHorse = await ctx.db.get(args.eventHorseId)
    if (!eventHorse) throw new ConvexError('Event horse row not found')
    if (!isConfirmedEventHorse(eventHorse)) {
      throw new ConvexError('Only a confirmed horse can be withdrawn')
    }

    const [horse, event] = await Promise.all([
      ctx.db.get(eventHorse.horseId),
      ctx.db.get(eventHorse.eventId),
    ])
    if (!isActiveHorse(horse)) throw new ConvexError('Horse not found')
    if (!event) throw new ConvexError('Event not found')
    if (horse.stableId !== event.stableId) {
      throw new ConvexError('Horse does not belong to the event stable')
    }

    const access = await assertCanViewStable(ctx, event.stableId, user._id)
    if (
      !canManageOwnedRecord({
        role: access.role,
        userId: user._id,
        ownerId: horse.ownerId,
      })
    ) {
      throw new ConvexError(
        'Only the stable admin or horse owner can withdraw this horse',
      )
    }

    const now = Date.now()
    await ctx.db.patch(eventHorse._id, {
      status: 'withdrawn',
      withdrawnBy: user._id,
      withdrawnAt: now,
      updatedAt: now,
    })
    await syncConfirmedHorseIds(ctx, eventHorse.eventId)
    await notifyEventOrganizerOfParticipation(ctx, {
      event,
      horse,
      actor: user,
      status: 'withdrawn',
    })
    await recordStableAudit(ctx, {
      stableId: event.stableId,
      actorUserId: user._id,
      action: 'event_horse.withdrawn',
      entityType: 'eventHorse',
      entityId: eventHorse._id,
      summary: `${horse.name} · ${event.title}`,
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
    const memberships = await ctx.db
      .query('stableMembers')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .collect()
    const canUseMemberStables = await hasPersonalPlus(ctx, user._id)
    const ownedStables = await ctx.db
      .query('stables')
      .withIndex('by_owner_id', (q) => q.eq('ownerId', user._id))
      .collect()
    const memberStables = await Promise.all(
      memberships
        .filter(
          (membership) => canUseMemberStables && membership.role === 'member',
        )
        .map((membership) => ctx.db.get(membership.stableId)),
    )
    const accessibleStableIds = new Set([
      ...ownedStables
        .filter((stable) => stable.archivedAt === undefined)
        .map((stable) => stable._id),
      ...memberStables.flatMap((stable) =>
        stable && stable.archivedAt === undefined ? [stable._id] : [],
      ),
    ])
    const activeHorses = horses.filter(
      (horse) =>
        isActiveHorse(horse) && accessibleStableIds.has(horse.stableId),
    )
    const invitationRows = await Promise.all(
      activeHorses.map((horse) =>
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
      horse: activeHorses.find((horse) => horse._id === row.horseId) ?? null,
    }))
  },
})
