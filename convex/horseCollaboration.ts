import { getHorseDisplayName } from '../shared/horses/horseDisplayName'
import { horseIdentitySchema } from '../shared/horses/horseSchema'
import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { carerRole, horseInvitationKind } from './horseOwnershipSchema'
import { getInvitationEmails } from './libs/auth'
import {
  assertHorseOwner,
  assertCanReadHorse,
  auditHorse,
  getHorseAccess,
} from './libs/horsePermissions'
import {
  assertCanManageStable,
  getCurrentUser,
  getStableMembership,
} from './libs/stablePermissions'
import {
  departurePreview,
  revokeHorseAccess,
  startDeparture,
} from './horseTransitions'
import { enqueueEmail } from './libs/email/outbox'

export const addUnclaimed = mutation({
  args: {
    stableId: v.id('stables'),
    name: v.string(),
    nickname: v.optional(v.string()),
    useNickname: v.optional(v.boolean()),
    age: v.number(),
    ownerName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const access = await assertCanManageStable(ctx, args.stableId)
    const identity = horseIdentitySchema.safeParse(args)
    if (!identity.success)
      throw new ConvexError(identity.error.issues[0].message)
    if (
      !args.name.trim() ||
      !Number.isFinite(args.age) ||
      args.age < 0 ||
      args.age > 100
    )
      throw new ConvexError('Use a horse name and valid age')
    const horseId = await ctx.db.insert('horses', {
      ...args,
      ...identity.data,
      custodianStableId: args.stableId,
    })
    const placementId = await ctx.db.insert('horsePlacements', {
      horseId,
      stableId: args.stableId,
      createdBy: access.userId,
      startedAt: Date.now(),
    })
    await ctx.db.patch(horseId, { currentPlacementId: placementId })
    await auditHorse(ctx, horseId, access.userId, 'horse.created_unclaimed')
    return horseId
  },
})

export const invite = mutation({
  args: {
    horseId: v.id('horses'),
    email: v.string(),
    kind: horseInvitationKind,
    role: v.optional(carerRole),
  },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.horseId)
    if (!horse || horse.deletedAt !== undefined || horse.transitionId)
      throw new ConvexError('Horse is unavailable')
    const user = await getCurrentUser(ctx)
    if (args.kind === 'claim') {
      const access = await getHorseAccess(ctx, horse, user._id)
      if (!access.isCustodian)
        throw new ConvexError('Only the custodian can invite the owner')
    } else await assertHorseOwner(ctx, horse, user._id)
    if (args.kind === 'carer' && !args.role)
      throw new ConvexError('Choose view or edit access')
    const email = args.email.trim().toLowerCase()
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      (await getInvitationEmails(ctx, user)).includes(email)
    )
      throw new ConvexError('Enter another person’s valid email address')
    const recent = await ctx.db
      .query('horseInvitations')
      .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
      .collect()
    if (recent.filter((i) => i.createdAt > Date.now() - 3600000).length >= 20)
      throw new ConvexError('Please wait before sending more invitations')
    for (const invitation of recent)
      if (
        invitation.status === 'pending' &&
        (invitation.email === email ||
          (args.kind !== 'carer' && invitation.kind === args.kind))
      )
        await ctx.db.patch(invitation._id, { status: 'revoked' })
    const token = crypto.randomUUID()
    const id = await ctx.db.insert('horseInvitations', {
      ...args,
      email,
      token,
      invitedBy: user._id,
      expectedOwnerId: horse.ownerId,
      expectedPlacementId: horse.currentPlacementId,
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + 14 * 86400000,
    })
    await enqueueEmail(ctx, {
      recipient: email,
      locale: user.locale,
      dedupeKey: `horse-invitation:${id}`,
      relation: { type: 'horseInvitation', id },
      template: {
        kind: 'horse_access_invitation',
        horseName: getHorseDisplayName(horse),
        invitationKind: args.kind,
        token,
      },
    })
    await auditHorse(
      ctx,
      horse._id,
      user._id,
      `invitation.${args.kind}.created`,
    )
    return id
  },
})

export const management = query({
  args: { horseId: v.id('horses') },
  handler: async (ctx, { horseId }) => {
    const horse = await ctx.db.get(horseId)
    if (!horse) throw new ConvexError('Horse not found')
    const access = await assertCanReadHorse(ctx, horse)
    const placements = await ctx.db
      .query('horsePlacements')
      .withIndex('by_horse_id', (q) => q.eq('horseId', horseId))
      .collect()
    const history = await Promise.all(
      placements.map(async (placement) => ({
        ...placement,
        stableName: (await ctx.db.get(placement.stableId))?.name ?? '',
      })),
    )
    const carers = access.isOwner
      ? await ctx.db
          .query('horseCarers')
          .withIndex('by_horse_id', (q) => q.eq('horseId', horseId))
          .collect()
      : []
    const owner = horse.ownerId ? await ctx.db.get(horse.ownerId) : null
    const currentStable = access.stable
      ? await ctx.db.get(access.stable._id)
      : null
    const stableAdmin = currentStable
      ? await ctx.db.get(currentStable.ownerId)
      : null
    return {
      horseName: getHorseDisplayName(horse),
      ownerName:
        owner?.preferredName ||
        owner?.firstName ||
        owner?.email ||
        horse.ownerName ||
        '',
      stableAdminName:
        stableAdmin?.preferredName ||
        stableAdmin?.firstName ||
        stableAdmin?.email ||
        undefined,
      access,
      placements: history,
      carers: await Promise.all(
        carers.map(async (carer) => {
          const user = await ctx.db.get(carer.userId)
          return {
            ...carer,
            name: user?.preferredName ?? user?.firstName ?? '',
            email: user?.email ?? '',
          }
        }),
      ),
      invitations:
        access.isOwner || access.isCustodian
          ? await ctx.db
              .query('horseInvitations')
              .withIndex('by_horse_id', (q) => q.eq('horseId', horseId))
              .collect()
          : [],
      audit: await ctx.db
        .query('horseAuditLogs')
        .withIndex('by_horse_id', (q) => q.eq('horseId', horseId))
        .order('desc')
        .take(100),
    }
  },
})

export const updateCarer = mutation({
  args: { id: v.id('horseCarers'), role: v.optional(carerRole) },
  handler: async (ctx, { id, role }) => {
    const carer = await ctx.db.get(id)
    const horse = carer ? await ctx.db.get(carer.horseId) : null
    if (!carer || !horse) throw new ConvexError('Carer not found')
    const access = await assertHorseOwner(ctx, horse)
    if (role) await ctx.db.patch(id, { role })
    else await ctx.db.delete(id)
    await auditHorse(
      ctx,
      horse._id,
      access.userId,
      role ? 'carer.changed' : 'carer.revoked',
    )
  },
})

export const revokeInvitation = mutation({
  args: { id: v.id('horseInvitations') },
  handler: async (ctx, { id }) => {
    const invitation = await ctx.db.get(id)
    const horse = invitation ? await ctx.db.get(invitation.horseId) : null
    if (!invitation || !horse) throw new ConvexError('Invitation not found')
    const access = await getHorseAccess(ctx, horse)
    if ((!access.isOwner && !access.isCustodian) || horse.transitionId)
      throw new ConvexError('Not authorized to revoke this invitation')
    if (invitation.status === 'pending')
      await ctx.db.patch(id, { status: 'revoked' })
  },
})

export const invitation = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const invitation = await ctx.db
      .query('horseInvitations')
      .withIndex('by_token', (q) => q.eq('token', token))
      .unique()
    if (!invitation) return null
    const user = await getCurrentUser(ctx)
    if (!(await getInvitationEmails(ctx, user)).includes(invitation.email))
      throw new ConvexError('Sign in using the invited email address')
    const horse = await ctx.db.get(invitation.horseId)
    if (!horse || horse.deletedAt !== undefined) return null
    // An old token is not a continuing grant to the horse's live data.
    if (invitation.status === 'accepted') {
      if (
        invitation.acceptedBy !== user._id ||
        !(await getHorseAccess(ctx, horse, user._id)).canRead
      )
        return null
    } else if (
      invitation.status !== 'pending' ||
      invitation.expiresAt <= Date.now() ||
      horse.ownerId !== invitation.expectedOwnerId ||
      horse.currentPlacementId !== invitation.expectedPlacementId
    ) {
      return null
    }
    if (horse.transitionId) {
      const transition = await ctx.db.get(horse.transitionId)
      if (
        transition?.invitationId !== invitation._id ||
        transition.targetOwnerId !== user._id
      )
        return null
    }
    let leaving = false
    if (
      invitation.status === 'pending' &&
      invitation.kind === 'transfer' &&
      horse.stableId
    ) {
      const membership = await getStableMembership(
        ctx,
        horse.stableId,
        user._id,
      )
      leaving = !membership.role
    }
    return {
      invitation,
      horseName: getHorseDisplayName(horse),
      stableName: horse.stableId
        ? (await ctx.db.get(horse.stableId))?.name
        : undefined,
      expired: false,
      processing: Boolean(horse.transitionId),
      leaving,
      departure:
        leaving && !horse.transitionId
          ? await departurePreview(ctx, horse)
          : null,
    }
  },
})

/** Recovery state only. Never return horse, recipient, or care data here. */
export const invitationStatus = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await getCurrentUser(ctx)
    const entry = await ctx.db
      .query('horseInvitations')
      .withIndex('by_token', (q) => q.eq('token', token))
      .unique()
    if (!entry) return { status: 'unavailable' as const }
    if (!(await getInvitationEmails(ctx, user)).includes(entry.email))
      return { status: 'wrong_account' as const }
    if (entry.status === 'revoked') return { status: 'revoked' as const }
    if (entry.status === 'declined') return { status: 'declined' as const }
    if (entry.status === 'pending' && entry.expiresAt <= Date.now())
      return { status: 'expired' as const }
    const horse = await ctx.db.get(entry.horseId)
    if (!horse || horse.deletedAt !== undefined)
      return { status: 'unavailable' as const }
    if (entry.status === 'accepted') {
      if (
        entry.acceptedBy !== user._id ||
        !(await getHorseAccess(ctx, horse, user._id)).canRead
      )
        return { status: 'unavailable' as const }
    } else if (
      entry.status !== 'pending' ||
      horse.ownerId !== entry.expectedOwnerId ||
      horse.currentPlacementId !== entry.expectedPlacementId
    )
      return { status: 'unavailable' as const }
    if (horse.transitionId) {
      const transition = await ctx.db.get(horse.transitionId)
      if (
        transition?.invitationId !== entry._id ||
        transition.targetOwnerId !== user._id
      )
        return { status: 'unavailable' as const }
    }
    return { status: 'ready' as const }
  },
})

export const respond = mutation({
  args: {
    token: v.string(),
    accept: v.boolean(),
    departureRevision: v.optional(v.string()),
    carryReminderIds: v.optional(v.array(v.id('careReminders'))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const invitation = await ctx.db
      .query('horseInvitations')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .unique()
    if (
      !invitation ||
      !(await getInvitationEmails(ctx, user)).includes(invitation.email)
    )
      throw new ConvexError('Invitation is not addressed to this account')
    if (invitation.status === 'accepted' && invitation.acceptedBy === user._id)
      return invitation.horseId
    if (invitation.status !== 'pending' || invitation.expiresAt <= Date.now())
      throw new ConvexError('Invitation is no longer available')
    const horse = await ctx.db.get(invitation.horseId)
    if (
      !horse ||
      horse.deletedAt !== undefined ||
      horse.transitionId ||
      horse.ownerId !== invitation.expectedOwnerId ||
      horse.currentPlacementId !== invitation.expectedPlacementId
    )
      throw new ConvexError(
        'Horse ownership or placement changed; request a new invitation',
      )
    if (!args.accept) {
      await ctx.db.patch(invitation._id, { status: 'declined' })
      return horse._id
    }
    if (invitation.kind === 'carer') {
      if (
        !horse.ownerId ||
        invitation.invitedBy !== horse.ownerId ||
        !invitation.role
      )
        throw new ConvexError('Invalid carer invitation')
      const existing = await ctx.db
        .query('horseCarers')
        .withIndex('by_horse_user', (q) =>
          q.eq('horseId', horse._id).eq('userId', user._id),
        )
        .unique()
      if (existing) await ctx.db.patch(existing._id, { role: invitation.role })
      else
        await ctx.db.insert('horseCarers', {
          horseId: horse._id,
          userId: user._id,
          role: invitation.role,
          invitedBy: invitation.invitedBy,
          createdAt: Date.now(),
        })
    } else {
      if (invitation.kind === 'claim') {
        if (horse.ownerId || !horse.custodianStableId)
          throw new ConvexError('Horse has already been claimed')
        const stable = await ctx.db.get(horse.custodianStableId)
        if (
          !stable ||
          stable.archivedAt !== undefined ||
          stable.ownerId !== invitation.invitedBy
        )
          throw new ConvexError('Custodian is no longer available')
        const membership = await getStableMembership(ctx, stable._id, user._id)
        if (!membership.role) {
          if (membership.membership)
            await ctx.db.patch(membership.membership._id, { role: 'member' })
          else
            await ctx.db.insert('stableMembers', {
              stableId: stable._id,
              userId: user._id,
              role: 'member',
            })
        }
      } else {
        if (horse.ownerId !== invitation.invitedBy)
          throw new ConvexError(
            'Only the current owner can transfer this horse',
          )
        if (
          horse.stableId &&
          !(await getStableMembership(ctx, horse.stableId, user._id)).role
        ) {
          const preview = await departurePreview(ctx, horse)
          if (
            args.departureRevision !== preview.revision ||
            !args.carryReminderIds ||
            args.carryReminderIds.some(
              (id) => !preview.reminders.some((r) => r._id === id),
            )
          )
            throw new ConvexError(
              'Review departure before accepting this transfer',
            )
          await startDeparture(ctx, horse, {
            actorUserId: user._id,
            targetOwnerId: user._id,
            invitationId: invitation._id,
            carryReminderIds: args.carryReminderIds,
          })
          return horse._id
        }
      }
      await ctx.db.patch(horse._id, {
        ownerId: user._id,
        ownerName: user.preferredName ?? user.firstName,
        custodianStableId: undefined,
      })
      await revokeHorseAccess(ctx, horse._id, invitation._id)
      const reminders = await ctx.db
        .query('careReminders')
        .withIndex('by_horse_id_due_date', (q) => q.eq('horseId', horse._id))
        .collect()
      for (const reminder of reminders)
        if (!reminder.stableId && reminder.status === 'pending')
          await ctx.db.patch(reminder._id, {
            assignedTo: user._id,
            updatedAt: Date.now(),
          })
    }
    await ctx.db.patch(invitation._id, {
      status: 'accepted',
      acceptedBy: user._id,
    })
    await auditHorse(
      ctx,
      horse._id,
      user._id,
      `invitation.${invitation.kind}.accepted`,
    )
    return horse._id
  },
})
