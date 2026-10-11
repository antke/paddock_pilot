import { getHorseDisplayName } from '../shared/horses/horseDisplayName'
import { horseEvent } from './libs/horseEventHistory'
import {
  canEditEvent,
  eventInputAccess,
  eventReadAccess,
  visibleEvent,
} from './libs/eventPermissions'
import {
  assertCanReadHorse,
  assertCanEditHorseRecord,
  assertCanAddHorseRecord,
  getHorseAccess,
  horseRosterSummary,
  accessibleHorses,
} from './libs/horsePermissions'
import { userFacingError } from './libs/userFacingError'
import { getEmailCopy } from '../shared/i18n/email'
import type { Locale } from '../shared/i18n/locale'
import type { EventChangeCode } from '../shared/i18n/eventChanges'
import { translateEventChange } from '../shared/i18n/eventChanges'
import { ConvexError, v } from 'convex/values'
import { isEqual, omit } from 'lodash'
import { isDateKey } from '../shared/training/trainingSchema'
import { eventInputSchema } from '../shared/events/eventSchema'
import type { Doc, Id } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { assertCanViewStable, getCurrentUser } from './libs/stablePermissions'
import { eventFields } from './schema'
import {
  canCreateEventForHorseOwners,
  canManageCreatedRecord,
} from '../shared/stables/stableAccess'
import {
  hasActiveHorse,
  isActiveHorse,
  withActiveEventHorseIds,
} from './libs/horseState'
import { recordStableAudit } from './libs/audit'
import { getEventChangeNotificationOwnerIds } from '../shared/events/eventNotificationRecipients'
import { enqueueEmail } from './libs/email/outbox'

const validateEventInput = (args: {
  stableId?: Id<'stables'>
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
  training?: Doc<'events'>['training']
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

  if (!isDateKey(args.date) || (args.endDate && !isDateKey(args.endDate))) {
    throw new ConvexError('Use a valid calendar date')
  }
  if (args.type !== 'training' && args.training)
    throw new ConvexError('Training details belong in Training log')
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
  stableId: Id<'stables'> | undefined,
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

  if (
    stableHorses.some(
      (horse) =>
        horse.transitionId ||
        (stableId !== undefined && horse.stableId !== stableId),
    )
  ) {
    throw new ConvexError('All horses must belong to the event stable')
  }

  return stableHorses
}

const filterEventsForActiveHorses = async (
  ctx: QueryCtx,
  stableId: Id<'stables'> | undefined,
  events: Array<Doc<'events'>>,
) => {
  const horses = await ctx.db
    .query('horses')
    .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
    .collect()
  const activeHorseIds = new Set(
    horses.filter(isActiveHorse).map((horse) => horse._id),
  )

  return Promise.all(
    events
      .filter((event) => hasActiveHorse(event, activeHorseIds))
      .map((event) =>
        visibleEvent(ctx, withActiveEventHorseIds(event, activeHorseIds)),
      ),
  )
}

const sendEventInvitationEmails = async (
  ctx: MutationCtx,
  stableId: Id<'stables'> | undefined,
  eventId: Id<'events'>,
  eventTitle: string,
  invitedHorses: Array<Doc<'horses'>>,
) => {
  if (!stableId) return
  const horsesByOwner = new Map<Id<'users'>, Array<Doc<'horses'>>>()

  for (const horse of invitedHorses) {
    if (!horse.ownerId) continue
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
          horseNames: horses.map((horse) => getHorseDisplayName(horse)),
          stableId,
          eventId,
        },
      })
    }),
  )
}

const formatUserName = (user: Doc<'users'>, locale?: Locale) =>
  user.preferredName ||
  [user.firstName, user.lastName].filter(Boolean).join(' ') ||
  getEmailCopy(locale).memberFallback

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
      horseName: getHorseDisplayName(input.horse),
      actorName: formatUserName(input.actor, organizer.locale),
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
  const changes: Array<EventChangeCode> = []
  if (event.title !== next.title) changes.push('title')
  if (event.date !== next.date || event.endDate !== next.endDate) {
    changes.push('date')
  }
  if (event.time !== next.time) changes.push('time')
  if (event.location !== next.location) changes.push('location')
  if ((event.status ?? 'planned') !== (next.status ?? 'planned')) {
    changes.push('status')
  }
  if (event.providerName !== next.providerName) changes.push('provider')
  if (horsesChanged) changes.push('horses')
  return changes
}

const notifyEventParticipantsOfChanges = async (
  ctx: MutationCtx,
  input: {
    event: Doc<'events'>
    actorUserId: Id<'users'>
    changes: Array<EventChangeCode>
    horses: Array<Doc<'horses'>>
    nextTitle: string
    excludedOwnerIds?: Set<Id<'users'>>
  },
) => {
  if (input.changes.length === 0) return

  const ownerIds = getEventChangeNotificationOwnerIds({
    actorUserId: input.actorUserId,
    horseOwnerIds: input.horses.flatMap((horse) =>
      horse.ownerId ? [horse.ownerId] : [],
    ),
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
      .filter((row) => isConfirmedEventHorse(row) && !row.participationEndsAt)
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
    const memberStables = await Promise.all(
      memberships
        .filter((membership) => membership.role === 'member')
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

    const personalHorses = await accessibleHorses(ctx, user._id)
    const links = (
      await Promise.all(
        personalHorses.map((horse) =>
          ctx.db
            .query('eventsHorses')
            .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
            .collect(),
        ),
      )
    ).flat()
    const personalEvents = await Promise.all(
      [
        ...new Set(
          links
            .filter(
              (row) => !row.participationEndsAt && isConfirmedEventHorse(row),
            )
            .map((row) => row.eventId),
        ),
      ].map((id) => ctx.db.get(id)),
    )
    const personal = personalEvents.filter(isEvent)
    // A moved horse keeps its frozen participation even when the owner no
    // longer belongs to the former stable. Keep its context separate from a
    // still-visible shared appointment so links open the correct history.
    const historical = (
      await Promise.all(
        links
          .filter(
            (row) => row.participationEndsAt && isConfirmedEventHorse(row),
          )
          .map((row) => horseEvent(ctx, row)),
      )
    ).filter(isEvent)
    const merged = [
      ...new Map(
        [
          ...events.flat(),
          ...(await Promise.all(
            personal.map((event) => visibleEvent(ctx, event)),
          )),
        ].map((event) => [event._id, event]),
      ).values(),
    ]
    return [...merged, ...historical]
      .filter((event) => event.type !== 'training')
      .sort(byEventDateAndTime)
  },
})

export const get = query({
  args: { id: v.id('events') },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id)
    if (!event) return null

    await eventReadAccess(ctx, event)

    return visibleEvent(ctx, event)
  },
})

export const getPermissions = query({
  args: { id: v.id('events') },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id)
    if (!event) return null

    const access = await eventReadAccess(ctx, event)

    return {
      canManageEvent: await canEditEvent(ctx, event),
      canConfirmAnyHorse: access.role === 'owner',
      role: access.role,
    }
  },
})

export const getWithHorses = query({
  args: {
    id: v.string(),
    horseId: v.optional(v.id('horses')),
    participationId: v.optional(v.id('eventsHorses')),
  },
  handler: async (ctx, args) => {
    const eventId = ctx.db.normalizeId('events', args.id)
    if (!eventId) return null

    const event = await ctx.db.get(eventId)
    if (!event) return null

    if (args.horseId) {
      const horse = await ctx.db.get(args.horseId)
      if (!isActiveHorse(horse)) return null
      await assertCanReadHorse(ctx, horse)
      const rows = await ctx.db
        .query('eventsHorses')
        .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
        .collect()
      const row = args.participationId
        ? rows.find(
            (r) => r._id === args.participationId && r.eventId === event._id,
          )
        : (rows.find(
            (r) => r.eventId === event._id && !r.participationEndsAt,
          ) ?? rows.find((r) => r.eventId === event._id))
      if (!row) throw new ConvexError('Horse did not participate in this event')
      return {
        event: (await horseEvent(ctx, row))!,
        horses: [horse],
        eventHorses: [row],
        pendingEventHorses: row.status === 'invited' ? [row] : [],
      }
    }
    const eventAccess = await eventReadAccess(ctx, event)

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
    const readable = new Set<string>()
    const visibleHorses = await Promise.all(
      associatedHorses.filter(isHorse).map(async (horse) => {
        const access = await getHorseAccess(ctx, horse)
        if (access.canRead) readable.add(horse._id)
        return access.canRead ? horse : horseRosterSummary(horse)
      }),
    )
    const horsesById = new Map(
      visibleHorses
        .filter((horse) => eventAccess.stableMember || readable.has(horse._id))
        .map((horse) => [horse._id, horse]),
    )
    const project = (row: Doc<'eventsHorses'>) =>
      readable.has(row.horseId)
        ? row
        : {
            ...row,
            requestedServiceNotes: undefined,
            completionNotes: undefined,
            costShare: undefined,
            history: undefined,
          }
    return {
      event: await visibleEvent(ctx, event),
      horses: confirmedEventHorses.flatMap((row) =>
        horsesById.has(row.horseId) ? [horsesById.get(row.horseId)!] : [],
      ),
      eventHorses: eventHorses
        .filter((row) => horsesById.has(row.horseId))
        .map(project),
      pendingEventHorses: pendingEventHorses
        .filter((row) => horsesById.has(row.horseId))
        .map(project),
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

    return (
      await filterEventsForActiveHorses(
        ctx,
        args.stableId,
        events.filter((event) => event.type !== 'training'),
      )
    ).sort(byEventDateAndTime)
  },
})

export const listForHorse = query({
  args: { horseId: v.string() },
  handler: async (ctx, args) => {
    const horseId = ctx.db.normalizeId('horses', args.horseId)
    if (!horseId) return []

    const horse = await ctx.db.get(horseId)
    if (!isActiveHorse(horse)) return []

    await assertCanReadHorse(ctx, horse)

    const horseEvents = await ctx.db
      .query('eventsHorses')
      .withIndex('by_horse_id', (q) => q.eq('horseId', horseId))
      .collect()

    const records = await Promise.all(
      horseEvents
        .filter(isConfirmedEventHorse)
        .map((row) => horseEvent(ctx, row)),
    )
    return records
      .filter(isEvent)
      .filter((event) => event.type !== 'training')
      .sort(byEventDateAndTime)
  },
})

export const add = mutation({
  args: {
    ...omit(eventFields, 'createdBy'),
    errorFormat: v.optional(v.literal('structured')),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const eventInput = validateEventInput(args)
    const access = await eventInputAccess(ctx, args.stableId, args.horseIds)

    const horses = await getStableHorses(ctx, args.stableId, args.horseIds)

    if (
      !canCreateEventForHorseOwners({
        role: access.role,
        userId: user._id,
        horseOwnerIds: horses.flatMap((horse) =>
          horse.ownerId ? [horse.ownerId] : [],
        ),
      })
    ) {
      throw userFacingError('eventNeedsOwnHorse', args.errorFormat)
    }
    const confirmedHorses = horses.filter(
      (horse) => access.role === 'owner' || horse.ownerId === user._id,
    )
    const invitedHorses = horses.filter(
      (horse) => access.role !== 'owner' && horse.ownerId !== user._id,
    )
    if (eventInput.type === 'training') {
      if (!eventInput.training)
        throw userFacingError('chooseTrainingActivities', args.errorFormat)
      if (
        eventInput.status === 'completed' &&
        eventInput.date >
          new Date(Date.now() + 14 * 3600000).toISOString().slice(0, 10)
      ) {
        throw userFacingError('futureTraining', args.errorFormat)
      }
    }
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
      status: eventInput.type === 'training' ? 'planned' : eventInput.status,
      notesAfterCompletion: eventInput.notesAfterCompletion,
      recurrence: eventInput.recurrence,
      training: eventInput.training,
    })

    await Promise.all([
      ...confirmedHorses.map((horse) =>
        ctx.db.insert('eventsHorses', {
          eventId,
          horseId: horse._id,
          sourcePlacementId: args.stableId
            ? horse.currentPlacementId
            : undefined,
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
          sourcePlacementId: args.stableId
            ? horse.currentPlacementId
            : undefined,
          status: 'invited' as const,
          invitedBy: user._id,
          invitedAt: now,
          createdAt: now,
          updatedAt: now,
        }),
      ),
    ])

    if (
      eventInput.type === 'training' &&
      eventInput.training &&
      eventInput.status &&
      eventInput.status !== 'planned'
    ) {
      for (const horse of confirmedHorses) {
        await ctx.db.insert('trainingRecords', {
          ...(await assertCanAddHorseRecord(ctx, horse, user._id)).recordOrigin,
          eventId,
          horseId: horse._id,
          date: eventInput.date,
          status: eventInput.status,
          details: eventInput.training,
          outcome: eventInput.notesAfterCompletion,
          recordedBy: user._id,
          createdAt: now,
          updatedAt: now,
        })
      }
    }

    await sendEventInvitationEmails(
      ctx,
      args.stableId,
      eventId,
      eventInput.title,
      invitedHorses,
    )
    if (args.stableId)
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
  args: {
    id: v.id('events'),
    trainingOccurrenceDate: v.optional(v.string()),
    trainingHorseId: v.optional(v.id('horses')),
    trainingRecordId: v.optional(v.id('trainingRecords')),
    ...omit(eventFields, 'createdBy'),
    errorFormat: v.optional(v.literal('structured')),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const { id, ...updates } = args

    const event = await ctx.db.get(id)
    if (!event) throw new ConvexError('Event not found')
    if (event.stableId !== args.stableId) {
      throw new ConvexError('Event stable cannot be changed')
    }

    const access = await eventInputAccess(ctx, args.stableId, args.horseIds)
    if (!event.stableId) await eventInputAccess(ctx, undefined, event.horseIds)
    const canManageAllHorses = access.role === 'owner'
    // A stable organizer edits scheduling only; redacted private values must
    // never be overwritten by blanks returned to their form.
    const eventInput = validateEventInput(
      event.stableId && !canManageAllHorses
        ? {
            ...updates,
            description: event.description,
            notesAfterCompletion: event.notesAfterCompletion,
            providerPhone: event.providerPhone,
            totalCost: event.totalCost,
            costPerHorse: event.costPerHorse,
            training: event.training,
          }
        : updates,
    )

    if (
      !canManageCreatedRecord({
        role: access.role,
        userId: user._id,
        createdBy: event.createdBy,
      })
    ) {
      throw new ConvexError('Not authorized to update this event')
    }

    if ((event.type === 'training') !== (eventInput.type === 'training')) {
      throw userFacingError('eventTypeLocked', args.errorFormat)
    }
    if (event.type === 'training') {
      const records = await ctx.db
        .query('trainingRecords')
        .withIndex('by_event_id', (q) => q.eq('eventId', event._id))
        .collect()
      const selectedRecord = args.trainingRecordId
        ? records.find((record) => record._id === args.trainingRecordId)
        : undefined
      if (
        args.trainingRecordId &&
        (!selectedRecord ||
          (args.trainingOccurrenceDate &&
            selectedRecord.date !== args.trainingOccurrenceDate) ||
          (args.trainingHorseId &&
            selectedRecord.horseId !== args.trainingHorseId))
      )
        throw userFacingError('trainingOccurrence', args.errorFormat)
      const previousDetails = selectedRecord?.details ?? event.training
      // An edit from a session applies changed training fields to that horse/date.
      // Preserve outcomes, individual adjustments to other fields, and other dates.
      const changedFields = (
        [
          'activities',
          'format',
          'durationMinutes',
          'rider',
          'focus',
          'nextFocus',
        ] as const
      ).filter(
        (field) =>
          !isEqual(previousDetails?.[field], eventInput.training?.[field]),
      )
      const recordDate =
        args.trainingOccurrenceDate ??
        selectedRecord?.date ??
        (!event.recurrence ? event.date : undefined)
      if (recordDate && changedFields.length > 0 && eventInput.training) {
        for (const record of records.filter(
          (candidate) =>
            candidate.date === recordDate &&
            (!selectedRecord || candidate._id === selectedRecord._id) &&
            (!args.trainingHorseId ||
              candidate.horseId === args.trainingHorseId),
        )) {
          const horse = await ctx.db.get(record.horseId)
          if (!horse) throw new ConvexError('Horse not found')
          await assertCanEditHorseRecord(ctx, horse, record)
          const changes = Object.fromEntries(
            changedFields.map((field) => [field, eventInput.training![field]]),
          )
          await ctx.db.patch(record._id, {
            details: { ...record.details, ...changes },
            updatedAt: Date.now(),
          })
        }
      }
      const hasHistory = records.length > 0 || event.status === 'completed'
      if (
        hasHistory &&
        (event.date !== eventInput.date ||
          event.endDate !== eventInput.endDate ||
          !isEqual(event.recurrence, eventInput.recurrence))
      ) {
        throw userFacingError('trainingScheduleLocked', args.errorFormat)
      }
      if (
        records.some(
          (record) =>
            event.horseIds.includes(record.horseId) &&
            !args.horseIds.includes(record.horseId),
        )
      )
        throw userFacingError('trainingHorseLocked', args.errorFormat)
    }

    const horses = await getStableHorses(ctx, args.stableId, args.horseIds)

    if (
      !canCreateEventForHorseOwners({
        role: access.role,
        userId: user._id,
        horseOwnerIds: horses.flatMap((horse) =>
          horse.ownerId ? [horse.ownerId] : [],
        ),
      })
    ) {
      throw userFacingError('eventRetainsOwnHorse', args.errorFormat)
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
          if (
            horse.deletedAt !== undefined ||
            eventHorse.history ||
            eventHorse.participationEndsAt
          )
            return
          if (horse.transitionId)
            throw new ConvexError('Horse departure is being processed')

          await ctx.db.delete(eventHorse._id)
        }),
    )

    const invitedHorses: Array<Doc<'horses'>> = []

    await Promise.all(
      horses.map(async (horse) => {
        const existingEventHorse = existingEventHorses.find(
          (eventHorse) =>
            eventHorse.horseId === horse._id && !eventHorse.participationEndsAt,
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
          sourcePlacementId: args.stableId
            ? horse.currentPlacementId
            : undefined,
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
      status: event.type === 'training' ? event.status : eventInput.status,
      notesAfterCompletion: eventInput.notesAfterCompletion,
      recurrence: eventInput.recurrence,
      training: args.trainingRecordId ? event.training : eventInput.training,
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
      excludedOwnerIds: new Set(
        invitedHorses.flatMap((horse) =>
          horse.ownerId ? [horse.ownerId] : [],
        ),
      ),
    })
    if (args.stableId)
      await recordStableAudit(ctx, {
        stableId: args.stableId,
        actorUserId: user._id,
        action: 'event.updated',
        entityType: 'event',
        entityId: id,
        summary:
          materialChanges.length > 0
            ? materialChanges
                .map((change) => translateEventChange(change, 'en'))
                .join(', ')
            : eventInput.title,
        details:
          materialChanges.length > 0
            ? { kind: 'event_changes', changes: materialChanges }
            : undefined,
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
    if (event.stableId !== undefined && horse.stableId !== event.stableId) {
      throw new ConvexError('Horse does not belong to the event stable')
    }
    const access = await getHorseAccess(ctx, horse, user._id)

    if (
      horse.transitionId ||
      eventHorse.participationEndsAt ||
      !(
        access.canEditPersonalRecords ||
        (access.isAdmin &&
          horse.currentPlacementId === eventHorse.sourcePlacementId)
      )
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
      summary: `${getHorseDisplayName(horse)} · ${event.title}`,
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
    if (event.stableId !== undefined && horse.stableId !== event.stableId) {
      throw new ConvexError('Horse does not belong to the event stable')
    }
    const access = await getHorseAccess(ctx, horse, user._id)

    if (
      horse.transitionId ||
      eventHorse.participationEndsAt ||
      !(
        access.canEditPersonalRecords ||
        (access.isAdmin &&
          horse.currentPlacementId === eventHorse.sourcePlacementId)
      )
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
      summary: `${getHorseDisplayName(horse)} · ${event.title}`,
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
    if (event.stableId !== undefined && horse.stableId !== event.stableId) {
      throw new ConvexError('Horse does not belong to the event stable')
    }

    const access = await getHorseAccess(ctx, horse, user._id)

    if (
      horse.transitionId ||
      eventHorse.participationEndsAt ||
      !(
        access.canEditPersonalRecords ||
        (access.isAdmin &&
          horse.currentPlacementId === eventHorse.sourcePlacementId)
      )
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
      summary: `${getHorseDisplayName(horse)} · ${event.title}`,
    })
  },
})

export const listPendingHorseInvitations = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx)
    const horses = await accessibleHorses(ctx, user._id)
    const activeHorses: Array<Doc<'horses'>> = []
    for (const horse of horses)
      if ((await getHorseAccess(ctx, horse, user._id)).canEditPersonalRecords)
        activeHorses.push(horse)
    const invitationRows = await Promise.all(
      activeHorses.map((horse) =>
        ctx.db
          .query('eventsHorses')
          .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
          .filter((q) =>
            q.and(
              q.eq(q.field('status'), 'invited'),
              q.eq(q.field('participationEndsAt'), undefined),
            ),
          )
          .collect(),
      ),
    )
    const rows = invitationRows.flat()
    const events = await Promise.all(rows.map((row) => ctx.db.get(row.eventId)))

    return Promise.all(
      rows.map(async (row, index) => ({
        invitation: row,
        event: events[index] ? await visibleEvent(ctx, events[index]) : null,
        horse: activeHorses.find((horse) => horse._id === row.horseId) ?? null,
      })),
    )
  },
})
