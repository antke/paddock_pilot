import {
  attendanceDetail,
  attendanceOptions,
  saveAttendees,
} from './libs/eventAttendees'
import { compareEventTimes } from '../shared/events/eventTime'
import {
  projectActivityShare,
  writeActivityCalendars,
} from './libs/activitySharing'
import {
  assertHorseWorkspace,
  initializeRecordSharing,
  recordCapabilities,
  visibleHorse,
} from './libs/recordCapabilities'
import { creationReplay, recordCreation } from './libs/creationRequests'
import { creatorName } from './libs/creatorName'
import { getHorseDisplayName } from '../shared/horses/horseDisplayName'
import { horseEvent } from './libs/horseEventHistory'
import {
  canEditEvent,
  eventInputAccess,
  eventReadAccess,
  visibleEvent,
  sharedEventsForStable,
  eventParticipantAccess,
  schedulingEvent,
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
import {
  eventInputSchema,
  createEventSchemas,
} from '../shared/events/eventSchema'
import type { Doc, Id } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { getCurrentUser, assertCanViewStable } from './libs/stablePermissions'
import { eventFields } from './schema'
import { canCreateEventForHorseOwners } from '../shared/stables/stableAccess'
import { isActiveHorse } from './libs/horseState'
import { recordStableAudit } from './libs/audit'
import { getEventChangeNotificationOwnerIds } from '../shared/events/eventNotificationRecipients'
import { enqueueEmail } from './libs/email/outbox'

const validateEventInput = (
  args: {
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
  },
  allowEmptyHorses = false,
) => {
  const result = (
    allowEmptyHorses
      ? createEventSchemas(undefined, undefined, { allowEmptyHorses: true })
          .eventInputSchema
      : eventInputSchema
  ).safeParse(args)

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

  return compareEventTimes(a.time, b.time)
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
  handler: listPersonalEvents,
})

export async function listPersonalEvents(ctx: QueryCtx) {
  const user = await getCurrentUser(ctx)
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
  const unassigned = (
    await ctx.db
      .query('events')
      .withIndex('by_created_by', (q) => q.eq('createdBy', user._id))
      .collect()
  ).filter((event) => !event.stableId && !event.horseIds.length)
  const personal = [...personalEvents.filter(isEvent), ...unassigned]
  // A moved horse keeps its frozen participation even when the owner no
  // longer belongs to the former stable. Keep its context separate from a
  // still-visible shared appointment so links open the correct history.
  const historical = (
    await Promise.all(
      links
        .filter((row) => row.participationEndsAt && isConfirmedEventHorse(row))
        .map((row) => horseEvent(ctx, row)),
    )
  ).filter(isEvent)
  const candidates = personal
  const projections = await Promise.all(
    candidates.map(async (event) => {
      if ('contextParticipationId' in event) return event
      const canonical = await ctx.db.get(event._id)
      return canonical ? visibleEvent(ctx, canonical) : event
    }),
  )
  const personalIds = new Set(personalHorses.map((horse) => horse._id))
  const merged = new Map(
    [...projections, ...historical].map((event) => [
      event._id +
        ('contextParticipationId' in event
          ? ':' + event.contextParticipationId
          : ''),
      event,
    ]),
  )
  return [...merged.values()]
    .map((event) => ({
      ...event,
      horseIds: event.horseIds.filter((id) => personalIds.has(id)),
    }))
    .filter((event) => event.type !== 'training')
    .sort(byEventDateAndTime)
}

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
    stableId: v.optional(v.id('stables')),
    horseId: v.optional(v.id('horses')),
    participationId: v.optional(v.id('eventsHorses')),
  },
  handler: async (ctx, args) => {
    const eventId = ctx.db.normalizeId('events', args.id)
    if (!eventId) return null

    const event = await ctx.db.get(eventId)
    if (!event) return null
    const scopedEvent = args.stableId
      ? (await sharedEventsForStable(ctx, args.stableId)).find(
          (item) => item._id === event._id,
        )
      : undefined
    if (args.stableId && !scopedEvent) return null

    if (args.horseId) {
      const horse = await ctx.db.get(args.horseId)
      if (!isActiveHorse(horse)) return null
      const permitted = await eventParticipantAccess(ctx, event)
      const participant = permitted.participants.find(
        (p) => p.horse._id === horse._id,
      )
      if (
        !participant ||
        (scopedEvent && !scopedEvent.horseIds.includes(horse._id))
      )
        throw new ConvexError('Not authorized to view this event')
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
      const projectedEvent = await horseEvent(ctx, row, args.stableId)
      if (!projectedEvent)
        throw new ConvexError('Not authorized to view this event')
      const projectedRow = participant.readDetails
        ? row
        : {
            ...row,
            requestedServiceNotes: undefined,
            completionNotes: undefined,
            costShare: undefined,
            history: undefined,
          }
      return {
        createdByName: await creatorName(ctx, event.createdBy),
        event: projectedEvent,
        horses: [await visibleHorse(ctx, horse, Boolean(args.stableId))],
        eventHorses: [projectedRow],
        pendingEventHorses: row.status === 'invited' ? [projectedRow] : [],
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
    const permitted = await eventParticipantAccess(ctx, event)
    const participantIds = new Set(
      permitted.participants
        .filter(
          (p) => !scopedEvent || scopedEvent.horseIds.includes(p.horse._id),
        )
        .map((p) => p.horse._id),
    )
    const rosterInvitations = new Set<string>()
    if (event.stableId && event.createdBy === permitted.user._id) {
      const membership = await ctx.db
        .query('stableMembers')
        .withIndex('by_stable_id_user_id', (q) =>
          q.eq('stableId', event.stableId!).eq('userId', permitted.user._id),
        )
        .unique()
      const stable = await ctx.db.get(event.stableId)
      if (
        stable &&
        stable.archivedAt === undefined &&
        (stable.ownerId === permitted.user._id || membership?.role === 'member')
      ) {
        for (const row of eventHorses) {
          const horse = associatedHorses.find((h) => h?._id === row.horseId)
          if (
            horse &&
            horse.deletedAt === undefined &&
            !horse.transitionId &&
            !row.participationEndsAt &&
            row.status === 'invited' &&
            horse.stableId === event.stableId &&
            horse.currentPlacementId === row.sourcePlacementId
          ) {
            rosterInvitations.add(horse._id)
            participantIds.add(horse._id)
          }
        }
      }
    }
    const readable = new Set<string>()
    const visibleHorses = await Promise.all(
      associatedHorses
        .filter(isHorse)
        .filter((horse) => participantIds.has(horse._id))
        .map(async (horse) => {
          const access = await getHorseAccess(ctx, horse)
          if (
            permitted.participants.some(
              (p) => p.horse._id === horse._id && p.readDetails,
            )
          )
            readable.add(horse._id)
          return access.canRead
            ? await visibleHorse(ctx, horse, Boolean(args.stableId))
            : horseRosterSummary(horse)
        }),
    )
    const horsesById = new Map(
      visibleHorses
        .filter(
          (horse) =>
            eventAccess.stableMember ||
            readable.has(horse._id) ||
            rosterInvitations.has(horse._id),
        )
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
      createdByName: await creatorName(ctx, event.createdBy),
      event: scopedEvent ?? (await visibleEvent(ctx, event)),
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
  handler: async (ctx, args) =>
    (await sharedEventsForStable(ctx, args.stableId))
      .filter((event) => event.type !== 'training')
      .sort(byEventDateAndTime),
})

export const listForHorse = query({
  args: { horseId: v.string(), stableId: v.optional(v.id('stables')) },
  handler: async (ctx, args) => {
    const horseId = ctx.db.normalizeId('horses', args.horseId)
    if (!horseId) return []

    const horse = await ctx.db.get(horseId)
    if (!isActiveHorse(horse)) return []

    await assertCanReadHorse(ctx, horse)
    await assertHorseWorkspace(ctx, horse, args.stableId)

    const horseEvents = await ctx.db
      .query('eventsHorses')
      .withIndex('by_horse_id', (q) => q.eq('horseId', horseId))
      .collect()

    const records = await Promise.all(
      horseEvents
        .filter(isConfirmedEventHorse)
        .map((row) => horseEvent(ctx, row, args.stableId)),
    )
    return records
      .filter(isEvent)
      .filter((event) => event.type !== 'training')
      .sort(byEventDateAndTime)
  },
})

export const add = mutation({
  args: {
    sharedStableIds: v.optional(v.array(v.id('stables'))),
    destination: v.optional(
      v.union(v.literal('personal'), v.literal('stable')),
    ),
    requestId: v.optional(v.string()),
    ...omit(eventFields, 'createdBy'),
    shareWithStable: v.optional(v.boolean()),
    sharing: v.optional(
      v.array(v.object({ horseId: v.string(), enabled: v.boolean() })),
    ),
    errorFormat: v.optional(v.literal('structured')),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const replay = await creationReplay(
      ctx,
      user._id,
      args.requestId,
      'events.add',
    )
    if (replay) return ctx.db.normalizeId('events', replay)!
    if (
      args.destination &&
      (args.destination === 'stable') !== Boolean(args.stableId)
    )
      throw new ConvexError('Choose a valid event destination')
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
    const directIds = new Set<string>()
    for (const horse of horses) {
      const permission = await getHorseAccess(ctx, horse, user._id)
      if (args.destination === 'personal' && !permission.canEditPersonalRecords)
        throw new ConvexError(
          'Personal events require owner or editor access to every horse',
        )
      if (permission.canAddRecords) directIds.add(horse._id)
    }
    if (args.sharedStableIds) {
      const selected = [...new Set(args.sharedStableIds)]
      if (selected.length > 30)
        throw new ConvexError('Select up to 30 calendars')
      for (const id of selected) await assertCanViewStable(ctx, id, user._id)
      for (const horse of horses) {
        const permission = await getHorseAccess(ctx, horse, user._id)
        if (
          (!permission.canEditPersonalRecords || permission.isCustodian) &&
          (selected.length !== 1 || selected[0] !== args.stableId)
        )
          throw new ConvexError(
            'Sharing across stables requires owner or editor access to every horse',
          )
      }
    }
    const confirmedHorses = horses.filter((horse) => directIds.has(horse._id))
    const invitedHorses = horses.filter((horse) => !directIds.has(horse._id))
    if (
      eventInput.type === 'training' &&
      eventInput.status === 'completed' &&
      invitedHorses.length
    )
      throw userFacingError('trainingRequiresPermission', args.errorFormat)
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

    await saveAttendees(ctx, eventId, args.peopleIds ?? [], user._id)

    for (const horse of confirmedHorses) {
      await initializeRecordSharing(
        ctx,
        horse,
        eventId,
        args.sharedStableIds === undefined
          ? Boolean(args.stableId)
          : Boolean(
              args.stableId && args.sharedStableIds.includes(args.stableId),
            ),
      )
    }

    if (args.sharedStableIds?.length && !args.stableId) {
      await writeActivityCalendars(
        ctx,
        (await ctx.db.get(eventId))!,
        args.sharedStableIds,
        user._id,
      )
    } else if (args.sharedStableIds?.some((id) => id !== args.stableId)) {
      await writeActivityCalendars(
        ctx,
        (await ctx.db.get(eventId))!,
        args.sharedStableIds,
        user._id,
      )
    }

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

    await recordCreation(ctx, user._id, args.requestId, 'events.add', eventId)
    return eventId
  },
})

export const update = mutation({
  args: {
    sharing: v.optional(
      v.array(v.object({ horseId: v.string(), enabled: v.boolean() })),
    ),
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

    if (!(await canEditEvent(ctx, event)))
      throw new ConvexError('Not authorized to update this event')
    // Existing participants are authorized by the canonical sharing capability.
    // Creation rules apply only to additions, not to edits of shared personal events.
    const newParticipantIds = args.horseIds.filter(
      (horseId) => !event.horseIds.includes(horseId),
    )
    if (newParticipantIds.length)
      await eventInputAccess(ctx, args.stableId, newParticipantIds)
    const eventInput = validateEventInput(updates, true)
    if (args.peopleIds !== undefined)
      await saveAttendees(ctx, id, args.peopleIds, user._id)

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
      const removedHorseIds = event.horseIds.filter(
        (horseId) => !args.horseIds.includes(horseId),
      )
      const addedHorseIds = args.horseIds.filter(
        (horseId) => !event.horseIds.includes(horseId),
      )
      const recordsToMove = records.filter(
        (record) =>
          removedHorseIds.includes(record.horseId) &&
          record.date === recordDate &&
          (!selectedRecord || record._id === selectedRecord._id) &&
          (!args.trainingHorseId || record.horseId === args.trainingHorseId),
      )
      // Reassign only an unambiguous replacement. Removing participants otherwise
      // leaves their existing records intact and editable in their horse history.
      const movingRecord =
        removedHorseIds.length === 1 && addedHorseIds.length === 1
          ? recordsToMove[0]
          : undefined
      const replacementHorse = movingRecord
        ? await ctx.db.get(addedHorseIds[0])
        : undefined
      if (movingRecord && !replacementHorse)
        throw new ConvexError('Horse not found')
      for (const record of records) {
        const moving = record._id === movingRecord?._id
        const editing =
          record.date === recordDate &&
          (!selectedRecord || record._id === selectedRecord._id) &&
          (!args.trainingHorseId || record.horseId === args.trainingHorseId)
        const changingDate =
          editing &&
          event.date !== eventInput.date &&
          (!event.recurrence || Boolean(selectedRecord))
        const nextDate = changingDate
          ? new Date(
              Date.parse(`${record.date}T00:00:00Z`) +
                Date.parse(`${eventInput.date}T00:00:00Z`) -
                Date.parse(`${event.date}T00:00:00Z`),
            )
              .toISOString()
              .slice(0, 10)
          : record.date
        if (
          !moving &&
          !changingDate &&
          !(editing && changedFields.length && eventInput.training)
        )
          continue
        const horse = await ctx.db.get(record.horseId)
        if (!horse) throw new ConvexError('Horse not found')
        if (
          !(await recordCapabilities(ctx, horse, record, user._id)).editContent
        ) {
          // Shared scheduling permissions do not grant access to private logs.
          if (moving || selectedRecord)
            await assertCanEditHorseRecord(ctx, horse, record)
          continue
        }
        const nextHorseId =
          moving && replacementHorse ? replacementHorse._id : record.horseId
        if (
          (moving || changingDate) &&
          records.some(
            (other) =>
              other._id !== record._id &&
              other.horseId === nextHorseId &&
              other.date === nextDate,
          )
        )
          throw userFacingError('trainingHorseConflict', args.errorFormat)
        const origin =
          moving && replacementHorse
            ? (await assertCanAddHorseRecord(ctx, replacementHorse, user._id))
                .recordOrigin
            : undefined
        const changes = Object.fromEntries(
          changedFields.map((field) => [field, eventInput.training?.[field]]),
        )
        await ctx.db.patch(record._id, {
          date: nextDate,
          scheduledDate:
            record.scheduledDate ??
            (changingDate && event.recurrence ? record.date : undefined),
          ...(moving && replacementHorse
            ? {
                horseId: replacementHorse._id,
                stableId: origin?.stableId,
                sourcePlacementId: origin?.sourcePlacementId,
              }
            : {}),
          ...(editing && eventInput.training
            ? { details: { ...record.details, ...changes } }
            : {}),
          updatedAt: Date.now(),
        })
      }
    }

    const horses = await getStableHorses(ctx, args.stableId, args.horseIds)

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

          // Keep participation notes, costs and provenance when a horse is removed.
          if (eventHorse.status !== 'withdrawn')
            await ctx.db.patch(eventHorse._id, {
              status: 'withdrawn',
              withdrawnBy: user._id,
              withdrawnAt: now,
              updatedAt: now,
            })
        }),
    )

    const removedParticipants = existingEventHorses.filter(
      (row) =>
        existingActiveHorseIds.has(row.horseId) &&
        !nextHorseIds.has(row.horseId) &&
        !row.participationEndsAt,
    )
    const addedParticipants = horses.filter(
      (horse) => !existingActiveHorseIds.has(horse._id),
    )
    const sourceParticipation =
      removedParticipants.length === 1 && addedParticipants.length === 1
        ? removedParticipants[0]
        : undefined
    let replacementDetails: Pick<
      Doc<'eventsHorses'>,
      'requestedServiceNotes' | 'completionNotes' | 'costShare'
    > = {}
    if (sourceParticipation) {
      const sourceHorse = await ctx.db.get(sourceParticipation.horseId)
      const targetHorse = addedParticipants[0]
      if (
        sourceHorse &&
        (await recordCapabilities(ctx, sourceHorse, sourceParticipation))
          .editContent &&
        (await getHorseAccess(ctx, targetHorse)).canAddRecords
      ) {
        replacementDetails = {
          requestedServiceNotes: sourceParticipation.requestedServiceNotes,
          completionNotes: sourceParticipation.completionNotes,
          costShare: sourceParticipation.costShare,
        }
      }
    }
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

        const isConfirmed = (await getHorseAccess(ctx, horse, user._id))
          .canAddRecords

        if (!isConfirmed) invitedHorses.push(horse)
        else
          await initializeRecordSharing(ctx, horse, id, Boolean(args.stableId))

        if (existingEventHorse) {
          await ctx.db.patch(existingEventHorse._id, {
            ...(sourceParticipation && horse._id === addedParticipants[0]._id
              ? {
                  requestedServiceNotes:
                    existingEventHorse.requestedServiceNotes ??
                    replacementDetails.requestedServiceNotes,
                  completionNotes:
                    existingEventHorse.completionNotes ??
                    replacementDetails.completionNotes,
                  costShare:
                    existingEventHorse.costShare ??
                    replacementDetails.costShare,
                }
              : {}),
            sourcePlacementId: args.stableId
              ? (await ctx.db.get(horse._id))?.currentPlacementId
              : undefined,
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
          ...(sourceParticipation && horse._id === addedParticipants[0]._id
            ? replacementDetails
            : {}),
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

    await initializeRecordSharing(ctx, horse, event._id)
    const now = Date.now()
    await ctx.db.patch(args.eventHorseId, {
      status: 'confirmed',
      sourcePlacementId: (await ctx.db.get(horse._id))?.currentPlacementId,
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
  args: { stableId: v.optional(v.id('stables')) },
  handler: async (
    ctx,
    args,
  ): Promise<
    Array<{
      invitation: Doc<'eventsHorses'>
      event: Doc<'events'> | null
      horse: Doc<'horses'>
    }>
  > => {
    const user = await getCurrentUser(ctx)
    const personal = await accessibleHorses(ctx, user._id)
    if (args.stableId) await assertCanViewStable(ctx, args.stableId)
    const stables = await ctx.db
      .query('stables')
      .withIndex('by_owner_id', (q) => q.eq('ownerId', user._id))
      .collect()
    const rosters = await Promise.all(
      stables
        .filter((s) => s.archivedAt === undefined && s._id === args.stableId)
        .map((s) =>
          ctx.db
            .query('horses')
            .withIndex('by_stable_id', (q) => q.eq('stableId', s._id))
            .collect(),
        ),
    )
    const horses = [
      ...new Map(
        [
          ...personal.filter(
            (horse) => !args.stableId || horse.stableId === args.stableId,
          ),
          ...rosters.flat(),
        ].map((h) => [h._id, h]),
      ).values(),
    ]
    const activeHorses: Array<Doc<'horses'>> = []
    for (const horse of horses)
      if ((await getHorseAccess(ctx, horse, user._id)).canAddRecords)
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

    return rows.flatMap((row, index) => {
      const event = events[index]
      const horse = activeHorses.find((h) => h._id === row.horseId)
      if (
        !event ||
        !horse ||
        horse.transitionId ||
        horse.stableId !== event.stableId ||
        horse.currentPlacementId !== row.sourcePlacementId
      )
        return []
      return [
        {
          invitation: {
            ...row,
            requestedServiceNotes: undefined,
            completionNotes: undefined,
            costShare: undefined,
            history: undefined,
          },
          event: {
            ...schedulingEvent(event),
            horseIds: [],
          },
          horse: horseRosterSummary(horse),
        },
      ]
    })
  },
})

/** One source of truth for destination pickers; no clinical horse data. */
export const creationOptions = query({
  args: { eventId: v.optional(v.id('events')) },
  handler: async (ctx, { eventId }) => {
    const user = await getCurrentUser(ctx)
    const owned = await ctx.db
      .query('stables')
      .withIndex('by_owner_id', (q) => q.eq('ownerId', user._id))
      .collect()
    const memberships = await ctx.db
      .query('stableMembers')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .collect()
    const joined = await Promise.all(
      memberships
        .filter((m) => m.role === 'member')
        .map((m) => ctx.db.get(m.stableId)),
    )
    const stables = [
      ...new Map(
        [...owned, ...joined]
          .filter((s): s is Doc<'stables'> =>
            Boolean(s && s.archivedAt === undefined),
          )
          .map((s) => [s._id, s]),
      ).values(),
    ]
    const option = async (horse: Doc<'horses'>) => {
      const access = await getHorseAccess(ctx, horse, user._id)
      const summary = horseRosterSummary(horse)
      if (horse.ownerId)
        summary.ownerName =
          (await creatorName(ctx, horse.ownerId)) ?? horse.ownerName
      return {
        ...summary,
        requiresApproval: !access.canAddRecords,
        canShareAcrossStables:
          access.canEditPersonalRecords && !access.isCustodian,
      }
    }
    const personal = []
    for (const horse of await accessibleHorses(ctx, user._id)) {
      if ((await getHorseAccess(ctx, horse, user._id)).canEditPersonalRecords)
        personal.push(await option(horse))
    }
    const people = await attendanceOptions(ctx, user._id)
    if (eventId) {
      const event = await ctx.db.get(eventId)
      if (!event || !(await canEditEvent(ctx, event)))
        throw new ConvexError('Not authorized to edit this event')
      for (const id of event.peopleIds ?? []) {
        if (people.some((person) => person.id === id)) continue
        const person = await ctx.db.get(id)
        if (person)
          people.push({
            id,
            name:
              person.preferredName ||
              [person.firstName, person.lastName].filter(Boolean).join(' '),
            photoUrl: person.photoUrl,
            stableIds: [],
            personal: false,
          })
      }
    }
    return {
      personal,
      people,
      stables: await Promise.all(
        stables.map(async (stable) => ({
          id: stable._id,
          name: stable.name,
          horses: await Promise.all(
            (
              await ctx.db
                .query('horses')
                .withIndex('by_stable_id', (q) => q.eq('stableId', stable._id))
                .collect()
            )
              .filter((h) => isActiveHorse(h) && !h.transitionId)
              .map(option),
          ),
        })),
      ),
    }
  },
})

/** Invitation status is scheduling information, never clinical history. */
export const participationSummary = query({
  args: { eventId: v.id('events') },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId)
    if (!event) return []
    const { user, rows, participants } = await eventParticipantAccess(
      ctx,
      event,
    )
    await eventReadAccess(ctx, event)
    const stable = event.stableId ? await ctx.db.get(event.stableId) : null
    const membership = event.stableId
      ? await ctx.db
          .query('stableMembers')
          .withIndex('by_stable_id_user_id', (q) =>
            q.eq('stableId', event.stableId!).eq('userId', user._id),
          )
          .unique()
      : null
    const organizer =
      event.createdBy === user._id &&
      (stable?.ownerId === user._id || membership?.role === 'member')
    const result = []
    for (const row of rows) {
      const horse = await ctx.db.get(row.horseId)
      if (
        !horse ||
        horse.deletedAt !== undefined ||
        row.participationEndsAt ||
        horse.transitionId
      )
        continue
      const current =
        horse.stableId === event.stableId &&
        horse.currentPlacementId === row.sourcePlacementId
      const access = await getHorseAccess(ctx, horse, user._id)
      if (!(
        participants.some((p) => p.horse._id === horse._id) ||
        (current && (organizer || access.isAdmin))
      ))
        continue
      result.push({
        id: row._id,
        name: getHorseDisplayName(horse),
        status: row.status ?? 'confirmed',
      })
    }
    return result
  },
})

/** Attendance names are scheduling information; this never grants horse access. */
export const attendingPeople = query({
  args: { eventId: v.id('events') },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId)
    if (!event) return []
    const { user, participants } = await eventParticipantAccess(ctx, event)
    let allowed =
      participants.length > 0 ||
      Boolean(await attendanceDetail(ctx, eventId, user._id))
    if (!allowed) {
      const shares = await ctx.db
        .query('activityCalendarShares')
        .withIndex('by_event', (q) => q.eq('eventId', eventId))
        .collect()
      for (const share of shares)
        if (await projectActivityShare(ctx, share, user._id)) {
          allowed = true
          break
        }
    }
    if (!allowed) return []
    const people = []
    for (const id of event.peopleIds ?? []) {
      const person = await ctx.db.get(id)
      if (person && person.deletedAt === undefined)
        people.push({
          id,
          name:
            person.preferredName ||
            [person.firstName, person.lastName].filter(Boolean).join(' '),
        })
    }
    return people
  },
})
