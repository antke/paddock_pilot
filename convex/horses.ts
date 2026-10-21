import {
  getHorseCalendarColour,
  nextHorseCalendarColour,
} from '../shared/horses/horseCalendarColours'
import {
  departurePreview,
  startDeparture,
  revokeHorseAccess,
} from './horseTransitions'
import {
  accessibleHorses,
  assertCanReadHorse,
  getHorseAccess,
  horseRosterSummary,
  auditHorse,
} from './libs/horsePermissions'
import { ConvexError, v } from 'convex/values'
import { internalMutation, mutation, query } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import { getUserFromIdentity } from './libs/auth'
import { horsesFields } from './schema'
import {
  horseIdentitySchema,
  horseInputSchema,
} from '../shared/horses/horseSchema'
import {
  resolveHorseContacts,
  validateHorseContacts,
} from './libs/horseContacts'
import { calculateHorseAge } from '../shared/horses/horseAge'
import { omit } from 'lodash'
import {
  assertCanCreateStableHorse,
  assertCanManageDeletedHorse,
  assertCanManageHorse,
  assertCanViewStable,
  assertIsStableParticipant,
  getCurrentUser,
} from './libs/stablePermissions'
import { isActiveHorse } from './libs/horseState'
import { shouldDeleteEventWithHorse } from '../shared/horses/horseDeletion'
import {
  assertStorageObjectCanBeClaimed,
  deleteStorageObjectIfUnreferenced,
} from './libs/storageObjects'

export const horseTrashRetentionMs = 14 * 24 * 60 * 60 * 1000

const validateHorseInput = (args: {
  name: string
  nickname?: string
  useNickname?: boolean
  ownerName?: string
  age: number
  breed?: string
  sex?: 'mare' | 'gelding' | 'stallion'
  color?: string
  calendarColourId?: string
  height?: string
  dateOfBirth?: string
  passportNumber?: string
  microchipNumber?: string
  insuranceProvider?: string
  insurancePolicyNumber?: string
  sire?: string
  dam?: string
  discipline?: string
  shoeingStatus?: 'barefoot' | 'front_shoes' | 'full_set'
  dewormingNotes?: string
  allergies?: Array<string>
  emergencyNotes?: string
  vetProviderId?: Id<'stableProviders'>
  farrierProviderId?: Id<'stableProviders'>
  vetName?: string
  vetPhone?: string
  farrierName?: string
  farrierPhone?: string
  nutritionNotes?: string
  nutritionRecommended?: Array<string>
  nutritionAvoid?: Array<string>
  feedingRoutine?: string
  profileImageId?: Id<'_storage'>
}) => {
  const result = horseInputSchema.safeParse(args)

  if (!result.success) {
    throw new ConvexError(
      result.error.issues[0]?.message ?? 'Invalid horse info input',
    )
  }

  const age = result.data.dateOfBirth
    ? calculateHorseAge(result.data.dateOfBirth)
    : result.data.age

  if (age === undefined || age < 0 || age > 100) {
    throw new ConvexError('Use a valid date of birth.')
  }

  return {
    ...result.data,
    age,
    profileImageId: args.profileImageId,
    vetProviderId: args.vetProviderId,
    farrierProviderId: args.farrierProviderId,
  }
}

const assertHorseProfileImageCanBeClaimed = async (
  ctx: MutationCtx,
  storageId: Id<'_storage'>,
) => {
  const metadata = await assertStorageObjectCanBeClaimed(ctx, storageId)

  if (
    !metadata.contentType?.startsWith('image/') ||
    metadata.size > 5 * 1024 * 1024
  ) {
    throw new ConvexError('Horse profile image must be an image under 5 MB')
  }
}

export const list = query({
  args: { stableId: v.id('stables') },
  handler: async (ctx, args) => {
    await assertCanViewStable(ctx, args.stableId)

    const horses = await ctx.db
      .query('horses')
      .withIndex('by_stable_id', (q) => q.eq('stableId', args.stableId))
      .order('desc')
      .collect()

    return await Promise.all(
      horses.filter(isActiveHorse).map(async (horse) => {
        const access = await getHorseAccess(ctx, horse)
        const visible = access.canRead
          ? await resolveHorseContacts(ctx, horse)
          : horseRosterSummary(horse)
        return {
          ...visible,
          canRead: access.canRead as boolean | undefined,
          profileImageUrl: horse.profileImageId
            ? ((await ctx.storage.getUrl(horse.profileImageId)) ?? undefined)
            : undefined,
        }
      }),
    )
  },
})

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const horseId = ctx.db.normalizeId('horses', args.id)
    if (!horseId) return null

    const horse = await ctx.db.get(horseId)

    if (!isActiveHorse(horse)) return null

    await assertCanReadHorse(ctx, horse)

    return {
      ...(await resolveHorseContacts(ctx, horse)),
      profileImageUrl: horse.profileImageId
        ? ((await ctx.storage.getUrl(horse.profileImageId)) ?? undefined)
        : undefined,
    }
  },
})

export const getPermissions = query({
  args: { id: v.id('horses') },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.id)
    if (!horse) return null

    const access = await getHorseAccess(ctx, horse)
    if (!access.canRead && !access.canDelete) return null
    return {
      ...access,
      canManageHorse: access.canEditProfile,
      canReassignOwner: access.canTransfer,
      canPermanentlyDelete:
        access.canDelete &&
        horse.deletedAt !== undefined &&
        Date.now() >= horse.deletedAt + horseTrashRetentionMs,
    }
  },
})

export const generateProfileImageUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getUserFromIdentity(ctx)
    if (!user) throw new ConvexError('User not found')

    return await ctx.storage.generateUploadUrl()
  },
})

export const add = mutation({
  args: {
    ...omit(
      horsesFields,
      'ownerId',
      'custodianStableId',
      'currentPlacementId',
      'transitionId',
    ),
    stableId: v.optional(v.id('stables')),
    ownerId: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (args.stableId)
      await assertCanCreateStableHorse(ctx, args.stableId, user._id)
    const ownerId = args.ownerId ?? user._id

    if (ownerId !== user._id) {
      throw new ConvexError('Members can only add horses for themselves')
    }

    if (args.stableId)
      await assertIsStableParticipant(ctx, args.stableId, ownerId)
    const owner = await ctx.db.get(ownerId)
    if (!owner) throw new ConvexError('Horse owner not found')
    const ownerName =
      args.ownerName ||
      owner.preferredName ||
      [owner.firstName, owner.lastName].filter(Boolean).join(' ')

    const horseInput = validateHorseInput({ ...args, ownerName })
    await validateHorseContacts(ctx, args.stableId, horseInput)
    if (horseInput.profileImageId) {
      await assertHorseProfileImageCanBeClaimed(ctx, horseInput.profileImageId)
    }

    const colourRoster = await ctx.db
      .query('horses')
      .withIndex(args.stableId ? 'by_stable_id' : 'by_owner_id', (q) =>
        args.stableId
          ? q.eq('stableId', args.stableId)
          : q.eq('ownerId', ownerId),
      )
      .collect()
    const calendarColourId =
      horseInput.calendarColourId ??
      nextHorseCalendarColour(colourRoster.filter(isActiveHorse))
    const id = await ctx.db.insert('horses', {
      ...horseInput,
      calendarColourId,
      ownerId,
      stableId: args.stableId,
    })
    if (args.stableId) {
      const placementId = await ctx.db.insert('horsePlacements', {
        horseId: id,
        stableId: args.stableId,
        startedAt: Date.now(),
        createdBy: user._id,
      })
      await ctx.db.patch(id, { currentPlacementId: placementId })
    }
    await auditHorse(ctx, id, user._id, 'horse.created')
    return id
  },
})

export const update = mutation({
  args: {
    id: v.id('horses'),
    ...omit(
      horsesFields,
      'ownerId',
      'stableId',
      'custodianStableId',
      'currentPlacementId',
      'transitionId',
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    const horse = await ctx.db.get(id)
    if (!horse) throw new ConvexError('Horse not found')

    await assertCanManageHorse(ctx, horse)

    const horseInput = validateHorseInput({
      ...updates,
      calendarColourId:
        updates.calendarColourId ?? getHorseCalendarColour(horse),
      nickname: updates.nickname ?? horse.nickname,
      useNickname: updates.useNickname ?? horse.useNickname,
    })
    await validateHorseContacts(ctx, horse.stableId, horseInput)
    if (
      horseInput.profileImageId &&
      horseInput.profileImageId !== horse.profileImageId
    ) {
      await assertHorseProfileImageCanBeClaimed(ctx, horseInput.profileImageId)
    }
    await ctx.db.patch(id, horseInput)
    if (
      horse.profileImageId &&
      horse.profileImageId !== horseInput.profileImageId
    ) {
      await deleteStorageObjectIfUnreferenced(ctx, horse.profileImageId)
    }
  },
})

export const updateOnboardingBasics = mutation({
  args: {
    id: v.id('horses'),
    name: v.string(),
    nickname: v.optional(v.string()),
    useNickname: v.optional(v.boolean()),
    age: v.number(),
    dateOfBirth: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.id)
    if (!horse) throw new ConvexError('Horse not found')
    await assertCanManageHorse(ctx, horse)

    const result = horseIdentitySchema
      .safeExtend({
        age: horseInputSchema.shape.age,
        dateOfBirth: horseInputSchema.shape.dateOfBirth,
      })
      .safeParse({
        ...args,
        nickname: args.nickname ?? horse.nickname,
        useNickname: args.useNickname ?? horse.useNickname,
      })
    if (!result.success) {
      throw new ConvexError(
        result.error.issues[0]?.message ?? 'Invalid horse details',
      )
    }
    const age = result.data.dateOfBirth
      ? calculateHorseAge(result.data.dateOfBirth)
      : result.data.age
    if (age === undefined || age < 0 || age > 100) {
      throw new ConvexError('Use a valid birth date or age.')
    }
    const { name, nickname, useNickname, dateOfBirth } = result.data
    await ctx.db.patch(args.id, {
      name,
      nickname,
      useNickname,
      dateOfBirth,
      age,
    })
  },
})

export const listDeleted = query({
  args: { stableId: v.id('stables') },
  handler: async (ctx, args) => {
    const access = await assertCanViewStable(ctx, args.stableId)

    const currentHorses = await ctx.db
      .query('horses')
      .withIndex('by_stable_id', (q) => q.eq('stableId', args.stableId))
      .collect()
    const unclaimed =
      access.role === 'owner'
        ? await ctx.db
            .query('horses')
            .withIndex('by_custodian_stable_id', (q) =>
              q.eq('custodianStableId', args.stableId),
            )
            .collect()
        : []
    const horses = [
      ...new Map(
        [...currentHorses, ...unclaimed].map((h) => [h._id, h]),
      ).values(),
    ]
    return horses
      .filter(
        (horse) =>
          horse.deletedAt !== undefined &&
          (horse.ownerId === access.userId ||
            (!horse.ownerId && access.role === 'owner')),
      )
      .map((horse) => ({
        ...horse,
        purgeAt: horse.deletedAt! + horseTrashRetentionMs,
        canPermanentlyDelete:
          (horse.ownerId === access.userId ||
            (!horse.ownerId && access.role === 'owner')) &&
          Date.now() >= horse.deletedAt! + horseTrashRetentionMs,
      }))
      .sort((a, b) => b.deletedAt! - a.deletedAt!)
  },
})

export const deleteHorse = mutation({
  args: { id: v.id('horses') },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.id)
    if (!horse) throw new ConvexError('Horse not found')

    const access = await assertCanManageDeletedHorse(ctx, horse)
    if (horse.deletedAt !== undefined) return

    if (horse.currentPlacementId) {
      const preview = await departurePreview(ctx, horse)
      await startDeparture(ctx, horse, {
        actorUserId: access.userId,
        carryReminderIds: preview.reminders.map((r) => r._id),
      })
    }
    await revokeHorseAccess(ctx, horse._id)
    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      deletedBy: access.userId,
    })
  },
})

export const restoreHorse = mutation({
  args: { id: v.id('horses') },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.id)
    if (!horse) throw new ConvexError('Horse not found')

    await assertCanManageDeletedHorse(ctx, horse)
    if (horse.deletedAt === undefined) return
    // An unclaimed horse returns to its custodian with a new placement. The
    // previous placement and the stable's retained records remain immutable.
    if (
      !horse.ownerId &&
      horse.custodianStableId &&
      !horse.currentPlacementId
    ) {
      const placementId = await ctx.db.insert('horsePlacements', {
        horseId: horse._id,
        stableId: horse.custodianStableId,
        createdBy: (await getCurrentUser(ctx))._id,
        startedAt: Date.now(),
      })
      await ctx.db.patch(horse._id, {
        stableId: horse.custodianStableId,
        currentPlacementId: placementId,
      })
    }
    await ctx.db.patch(args.id, {
      deletedAt: undefined,
      deletedBy: undefined,
    })
  },
})

export const permanentlyDeleteHorse = mutation({
  args: { id: v.id('horses') },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.id)
    if (!horse) throw new ConvexError('Horse not found')

    await assertCanManageDeletedHorse(ctx, horse)
    if (horse.deletedAt === undefined) {
      throw new ConvexError('Move the horse to deleted horses first')
    }
    if (Date.now() < horse.deletedAt + horseTrashRetentionMs) {
      throw new ConvexError('The horse retention period has not ended')
    }
    await permanentlyDeleteHorseData(ctx, horse)
  },
})

export const purgeExpiredDeletedHorses = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - horseTrashRetentionMs
    const expiredHorses = await ctx.db
      .query('horses')
      .withIndex('by_deleted_at', (q) =>
        q.gt('deletedAt', 0).lte('deletedAt', cutoff),
      )
      .take(25)

    for (const horse of expiredHorses) {
      await permanentlyDeleteHorseData(ctx, horse)
    }

    return expiredHorses.length
  },
})

async function permanentlyDeleteHorseData(
  ctx: MutationCtx,
  horse: Doc<'horses'>,
) {
  if (horse.transitionId) return
  await revokeHorseAccess(ctx, horse._id)
  const [
    healthIssues,
    weightRecords,
    medicationRecords,
    nutritionLogs,
    reminders,
    documents,
    eventHorseRows,
  ] = await Promise.all([
    ctx.db
      .query('horseHealthIssues')
      .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
      .collect(),
    ctx.db
      .query('horseWeightRecords')
      .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
      .collect(),
    ctx.db
      .query('horseMedicationRecords')
      .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
      .collect(),
    ctx.db
      .query('horseNutritionLogs')
      .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
      .collect(),
    ctx.db
      .query('careReminders')
      .withIndex('by_horse_id_due_date', (q) => q.eq('horseId', horse._id))
      .collect(),
    ctx.db
      .query('stableDocuments')
      .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
      .collect(),
    ctx.db
      .query('eventsHorses')
      .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
      .collect(),
  ])

  const trainingRecords = await ctx.db
    .query('trainingRecords')
    .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
    .collect()
  for (const record of trainingRecords) await ctx.db.delete(record._id)

  const reminderIds = new Set(reminders.map((reminder) => reminder._id))
  const documentIds = new Set(documents.map((document) => document._id))
  const storageIds = new Set(
    documents.flatMap((document) =>
      document.storageId ? [document.storageId] : [],
    ),
  )
  const eventIds = [...new Set(eventHorseRows.map((row) => row.eventId))]

  for (const eventId of eventIds) {
    const event = await ctx.db.get(eventId)
    const rows = await ctx.db
      .query('eventsHorses')
      .withIndex('by_event_id', (q) => q.eq('eventId', eventId))
      .collect()

    if (!event) {
      for (const association of rows.filter(
        (candidate) => candidate.horseId === horse._id,
      )) {
        await ctx.db.delete(association._id)
      }
      continue
    }

    const deleteEvent =
      !event.stableId &&
      shouldDeleteEventWithHorse({
        horseId: horse._id,
        eventHorseIds: event.horseIds,
        associatedHorseIds: rows.map((row) => row.horseId),
      })

    if (!deleteEvent) {
      for (const association of rows.filter(
        (candidate) => candidate.horseId === horse._id,
      )) {
        await ctx.db.delete(association._id)
      }

      await ctx.db.patch(event._id, {
        horseIds: event.horseIds.filter((horseId) => horseId !== horse._id),
      })
      continue
    }

    const [eventDocuments, eventReminders] = await Promise.all([
      ctx.db
        .query('stableDocuments')
        .withIndex('by_event_id', (q) => q.eq('eventId', event._id))
        .collect(),
      ctx.db
        .query('careReminders')
        .withIndex('by_event_id', (q) => q.eq('eventId', event._id))
        .collect(),
    ])

    for (const document of eventDocuments) {
      documentIds.add(document._id)
      if (document.storageId) storageIds.add(document.storageId)
    }
    for (const reminder of eventReminders) reminderIds.add(reminder._id)
    for (const row of rows) await ctx.db.delete(row._id)
    await ctx.db.delete(event._id)
  }

  await Promise.all([
    ...healthIssues.map((row) => ctx.db.delete(row._id)),
    ...weightRecords.map((row) => ctx.db.delete(row._id)),
    ...medicationRecords.map((row) => ctx.db.delete(row._id)),
    ...nutritionLogs.map((row) => ctx.db.delete(row._id)),
    ...[...reminderIds].map((id) => ctx.db.delete(id)),
    ...[...documentIds].map((id) => ctx.db.delete(id)),
  ])

  await ctx.db.delete(horse._id)

  if (horse.profileImageId) storageIds.add(horse.profileImageId)
  await Promise.all(
    [...storageIds].map((storageId) =>
      deleteStorageObjectIfUnreferenced(ctx, storageId),
    ),
  )
}

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx)
    return Promise.all(
      (await accessibleHorses(ctx, user._id)).map(async (horse) => ({
        ...horse,
        access: await getHorseAccess(ctx, horse, user._id),
        profileImageUrl: horse.profileImageId
          ? await ctx.storage.getUrl(horse.profileImageId)
          : null,
      })),
    )
  },
})

/** Public roster identity only; membership never grants private horse records. */
export const calendarRoster = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx)
    const [personal, ownedStables, memberships] = await Promise.all([
      accessibleHorses(ctx, user._id),
      ctx.db
        .query('stables')
        .withIndex('by_owner_id', (q) => q.eq('ownerId', user._id))
        .collect(),
      ctx.db
        .query('stableMembers')
        .withIndex('by_user_id', (q) => q.eq('userId', user._id))
        .collect(),
    ])
    const memberStables = await Promise.all(
      memberships
        .filter((m) => m.role === 'member')
        .map((m) => ctx.db.get(m.stableId)),
    )
    const ids = [
      ...new Set(
        [...ownedStables, ...memberStables].flatMap((stable) =>
          stable && stable.archivedAt === undefined ? [stable._id] : [],
        ),
      ),
    ]
    const rosters = await Promise.all(
      ids.map((stableId) =>
        ctx.db
          .query('horses')
          .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
          .collect(),
      ),
    )
    return [
      ...new Map(
        [...personal, ...rosters.flat()]
          .filter(isActiveHorse)
          .map((horse) => [horse._id, horse]),
      ).values(),
    ].map((horse) => ({
      _id: horse._id,
      name: horse.name,
      nickname: horse.nickname,
      useNickname: horse.useNickname,
      calendarColourId: getHorseCalendarColour(horse),
    }))
  },
})

export const listMyDeleted = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx)
    return (
      await ctx.db
        .query('horses')
        .withIndex('by_owner_id', (q) => q.eq('ownerId', user._id))
        .collect()
    )
      .filter((horse) => horse.deletedAt !== undefined)
      .map((horse) => ({
        ...horse,
        purgeAt: horse.deletedAt! + horseTrashRetentionMs,
      }))
  },
})
