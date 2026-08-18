import { ConvexError, v } from 'convex/values'
import { internalMutation, mutation, query } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import { getUserFromIdentity } from './libs/auth'
import { horsesFields } from './schema'
import { horseInputSchema } from '../shared/horses/horseSchema'
import { calculateHorseAge } from '../shared/horses/horseAge'
import { omit } from 'lodash'
import {
  assertCanCreateStableHorse,
  assertCanManageDeletedHorse,
  assertCanManageHorse,
  assertCanManageStable,
  assertCanPermanentlyDeleteHorses,
  assertCanViewStable,
  assertIsStableParticipant,
  getCurrentUser,
} from './libs/stablePermissions'
import { isActiveHorse } from './libs/horseState'
import { shouldDeleteEventWithHorse } from '../shared/horses/horseDeletion'
import { canManageOwnedRecord } from '../shared/stables/stableAccess'
import {
  assertStorageObjectCanBeClaimed,
  deleteStorageObjectIfUnreferenced,
} from './libs/storageObjects'

export const horseTrashRetentionMs = 14 * 24 * 60 * 60 * 1000

const validateHorseInput = (args: {
  name: string
  ownerName?: string
  age: number
  breed?: string
  sex?: 'mare' | 'gelding' | 'stallion'
  color?: string
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
      horses.filter(isActiveHorse).map(async (horse) => ({
        ...horse,
        profileImageUrl: horse.profileImageId
          ? ((await ctx.storage.getUrl(horse.profileImageId)) ?? undefined)
          : undefined,
      })),
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

    await assertCanViewStable(ctx, horse.stableId)

    return {
      ...horse,
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

    const access = await assertCanViewStable(ctx, horse.stableId)

    return {
      canManageHorse: canManageOwnedRecord({
        role: access.role,
        userId: access.userId,
        ownerId: horse.ownerId,
      }),
      canReassignOwner: access.role === 'owner',
      canPermanentlyDelete:
        access.role === 'owner' &&
        horse.deletedAt !== undefined &&
        Date.now() >= horse.deletedAt + horseTrashRetentionMs,
      role: access.role,
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
    ...omit(horsesFields, 'ownerId'),
    stableId: v.id('stables'),
    ownerId: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const access = await assertCanCreateStableHorse(
      ctx,
      args.stableId,
      user._id,
    )
    const ownerId = args.ownerId ?? user._id

    if (ownerId !== user._id && access.role !== 'owner') {
      throw new ConvexError('Members can only add horses for themselves')
    }

    await assertIsStableParticipant(ctx, args.stableId, ownerId)
    const owner = await ctx.db.get(ownerId)
    if (!owner) throw new ConvexError('Horse owner not found')
    const ownerName =
      args.ownerName ||
      owner.preferredName ||
      [owner.firstName, owner.lastName].filter(Boolean).join(' ')

    const horseInput = validateHorseInput({ ...args, ownerName })
    if (horseInput.profileImageId) {
      await assertHorseProfileImageCanBeClaimed(ctx, horseInput.profileImageId)
    }

    return await ctx.db.insert('horses', {
      ...horseInput,
      ownerId,
      stableId: args.stableId,
    })
  },
})

export const reassignOwner = mutation({
  args: { id: v.id('horses'), ownerId: v.id('users') },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.id)
    if (!horse) throw new ConvexError('Horse not found')

    await assertCanManageStable(ctx, horse.stableId)
    await assertIsStableParticipant(ctx, horse.stableId, args.ownerId)

    await ctx.db.patch(horse._id, { ownerId: args.ownerId })
  },
})

export const update = mutation({
  args: { id: v.id('horses'), ...omit(horsesFields, 'ownerId', 'stableId') },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    const horse = await ctx.db.get(id)
    if (!horse) throw new ConvexError('Horse not found')

    await assertCanManageHorse(ctx, horse)

    const horseInput = validateHorseInput(updates)
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
    age: v.number(),
    dateOfBirth: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.id)
    if (!horse) throw new ConvexError('Horse not found')
    await assertCanManageHorse(ctx, horse)

    const result = horseInputSchema
      .pick({ name: true, age: true, dateOfBirth: true })
      .safeParse(args)
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
    await ctx.db.patch(args.id, { ...result.data, age })
  },
})

export const listDeleted = query({
  args: { stableId: v.id('stables') },
  handler: async (ctx, args) => {
    const access = await assertCanViewStable(ctx, args.stableId)

    const horses = await ctx.db
      .query('horses')
      .withIndex('by_stable_id', (q) => q.eq('stableId', args.stableId))
      .collect()

    return horses
      .filter(
        (horse) =>
          horse.deletedAt !== undefined &&
          (access.role === 'owner' || horse.ownerId === access.userId),
      )
      .map((horse) => ({
        ...horse,
        purgeAt: horse.deletedAt! + horseTrashRetentionMs,
        canPermanentlyDelete:
          access.role === 'owner' &&
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

    await assertCanPermanentlyDeleteHorses(ctx, horse.stableId)
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

    const deleteEvent = shouldDeleteEventWithHorse({
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
