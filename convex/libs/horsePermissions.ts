import { ConvexError } from 'convex/values'
import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { getUserFromIdentity } from './auth'

type Ctx = MutationCtx | QueryCtx
type HorseStableSummary = Pick<
  Doc<'stables'>,
  | '_id'
  | 'name'
  | 'addressLine1'
  | 'addressLine2'
  | 'postcode'
  | 'country'
  | 'contactName'
  | 'contactPhone'
  | 'emergencyPhone'
>

export async function getHorseAccess(
  ctx: Ctx,
  horse: Doc<'horses'>,
  userId?: Id<'users'>,
) {
  const actor = userId
    ? await ctx.db.get(userId)
    : await getUserFromIdentity(ctx)
  if (!actor || actor.deletedAt !== undefined)
    throw new ConvexError('User not authenticated')
  const [carer, stable, custodian] = await Promise.all([
    ctx.db
      .query('horseCarers')
      .withIndex('by_horse_user', (q) =>
        q.eq('horseId', horse._id).eq('userId', actor._id),
      )
      .unique(),
    horse.stableId ? ctx.db.get(horse.stableId) : Promise.resolve(null),
    !horse.ownerId && horse.deletedAt !== undefined && horse.custodianStableId
      ? ctx.db.get(horse.custodianStableId)
      : Promise.resolve(null),
  ])
  const activeStable = stable?.archivedAt === undefined ? stable : null
  const isOwner = horse.ownerId === actor._id
  const isAdmin = Boolean(activeStable && activeStable.ownerId === actor._id)
  const isCustodian =
    !horse.ownerId && isAdmin && horse.custodianStableId === activeStable?._id
  const canRestoreUnclaimed = Boolean(
    custodian &&
    custodian.archivedAt === undefined &&
    custodian.ownerId === actor._id,
  )
  const isEditor = isOwner || carer?.role === 'editor' || isCustodian
  const active = horse.deletedAt === undefined
  const writable = active && !horse.transitionId
  return {
    userId: actor._id,
    stable: activeStable
      ? ({
          _id: activeStable._id,
          name: activeStable.name,
          addressLine1: activeStable.addressLine1,
          addressLine2: activeStable.addressLine2,
          postcode: activeStable.postcode,
          country: activeStable.country,
          contactName: activeStable.contactName,
          contactPhone: activeStable.contactPhone,
          emergencyPhone: activeStable.emergencyPhone,
        } as HorseStableSummary)
      : null,
    isOwner,
    isAdmin,
    isCustodian,
    carerRole: carer?.role,
    role: isAdmin ? ('owner' as const) : ('member' as const),
    canRead: active && (isOwner || Boolean(carer) || isAdmin),
    canEditProfile: writable && isEditor,
    canAddRecords: writable && (isEditor || isAdmin),
    canEditPersonalRecords: writable && isEditor,
    canManageAccess: writable && isOwner,
    canMove: writable && isOwner,
    canTransfer: writable && isOwner,
    canDelete:
      !horse.transitionId && (isOwner || isCustodian || canRestoreUnclaimed),
  }
}

export async function assertCanReadHorse(
  ctx: Ctx,
  horse: Doc<'horses'>,
  userId?: Id<'users'>,
) {
  const access = await getHorseAccess(ctx, horse, userId)
  if (!access.canRead)
    throw new ConvexError('Not authorized to view this horse')
  return access
}

export async function assertCanEditHorseProfile(
  ctx: Ctx,
  horse: Doc<'horses'>,
  userId?: Id<'users'>,
) {
  const access = await getHorseAccess(ctx, horse, userId)
  if (!access.canEditProfile)
    throw new ConvexError('Not authorized to edit this horse profile')
  return access
}

export async function assertHorseOwner(
  ctx: Ctx,
  horse: Doc<'horses'>,
  userId?: Id<'users'>,
) {
  const access = await getHorseAccess(ctx, horse, userId)
  if (!access.isOwner || horse.transitionId || horse.deletedAt !== undefined) {
    throw new ConvexError('Only the horse owner can perform this action')
  }
  return access
}

export async function assertCanAddHorseRecord(
  ctx: Ctx,
  horse: Doc<'horses'>,
  userId?: Id<'users'>,
) {
  const access = await getHorseAccess(ctx, horse, userId)
  if (!access.canAddRecords)
    throw new ConvexError('Not authorized to add horse records')
  // Personal edits stay personal, even when their author also belongs to a stable.
  return {
    ...access,
    recordOrigin:
      access.canEditPersonalRecords && !access.isCustodian
        ? {}
        : {
            stableId: horse.stableId,
            sourcePlacementId: horse.currentPlacementId,
          },
  }
}

export async function assertCanEditHorseRecord(
  ctx: Ctx,
  horse: Doc<'horses'>,
  record: {
    stableId?: Id<'stables'>
    sourcePlacementId?: Id<'horsePlacements'>
  },
) {
  const access = await getHorseAccess(ctx, horse)
  if (!canEditHorseRecord(access, horse, record)) {
    throw new ConvexError('Not authorized to edit this horse record')
  }
  return access
}

export const horseRosterSummary = (horse: Doc<'horses'>): Doc<'horses'> => ({
  _id: horse._id,
  _creationTime: horse._creationTime,
  name: horse.name,
  nickname: horse.nickname,
  useNickname: horse.useNickname,
  calendarColourId: horse.calendarColourId,
  age: horse.age,
  breed: horse.breed,
  sex: horse.sex,
  ownerName: horse.ownerName,
  profileImageId: horse.profileImageId,
  stableId: horse.stableId,
  ownerId: horse.ownerId,
})

export async function accessibleHorses(ctx: Ctx, userId: Id<'users'>) {
  const [owned, carers] = await Promise.all([
    ctx.db
      .query('horses')
      .withIndex('by_owner_id', (q) => q.eq('ownerId', userId))
      .collect(),
    ctx.db
      .query('horseCarers')
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
      .collect(),
  ])
  const shared = await Promise.all(
    carers.map((carer) => ctx.db.get(carer.horseId)),
  )
  return [
    ...new Map(
      [...owned, ...shared]
        .filter((horse): horse is Doc<'horses'> =>
          Boolean(horse && horse.deletedAt === undefined),
        )
        .map((horse) => [horse._id, horse]),
    ).values(),
  ]
}

export async function auditHorse(
  ctx: MutationCtx,
  horseId: Id<'horses'>,
  actorUserId: Id<'users'>,
  action: string,
  details?: string,
) {
  await ctx.db.insert('horseAuditLogs', {
    horseId,
    actorUserId,
    action,
    details,
    createdAt: Date.now(),
  })
}

export function canEditHorseRecord(
  access: Awaited<ReturnType<typeof getHorseAccess>>,
  horse: Doc<'horses'>,
  record: {
    stableId?: Id<'stables'>
    sourcePlacementId?: Id<'horsePlacements'>
  },
) {
  return (
    access.canAddRecords &&
    (access.canEditPersonalRecords ||
      (access.isAdmin &&
        record.stableId !== undefined &&
        record.stableId === horse.stableId &&
        record.sourcePlacementId === horse.currentPlacementId))
  )
}
