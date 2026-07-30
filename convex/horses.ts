import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Id } from './_generated/dataModel'
import { getUserFromIdentity } from './libs/auth'
import { horsesFields } from './schema'
import { horseInputSchema } from '../shared/horses/horseSchema'
import { calculateHorseAge } from '../shared/horses/horseAge'
import { omit } from 'lodash'
import {
  assertCanCreateStableHorse,
  assertCanManageHorse,
  assertCanViewStable,
  getCurrentUser,
} from './libs/stablePermissions'

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
      horses.map(async (horse) => ({
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

    if (!horse) return horse

    await assertCanViewStable(ctx, horse.stableId)

    return {
      ...horse,
      profileImageUrl: horse.profileImageId
        ? ((await ctx.storage.getUrl(horse.profileImageId)) ?? undefined)
        : undefined,
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
  args: { ...omit(horsesFields, 'ownerId'), stableId: v.id('stables') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    await assertCanCreateStableHorse(ctx, args.stableId, user._id)

    const horseInput = validateHorseInput(args)

    return await ctx.db.insert('horses', {
      ...horseInput,
      ownerId: user?._id,
      stableId: args.stableId,
    })
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
    await ctx.db.patch(id, horseInput)
  },
})

export const deleteHorse = mutation({
  args: { id: v.id('horses') },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.id)
    if (!horse) throw new ConvexError('Horse not found')

    await assertCanManageHorse(ctx, horse)

    await ctx.db.delete(args.id)
  },
})
