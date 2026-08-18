import { beforeEach, describe, expect, it, vi } from 'vitest'
import { convexTest } from 'convex-test'
import type { TestConvex } from 'convex-test'
import { api, internal } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

const identity = (subject: string, email = `${subject}@example.com`) => ({
  subject,
  email,
  givenName: subject,
})

describe('authenticated account and stable security flows', () => {
  let t: TestConvex<typeof schema>

  beforeEach(() => {
    t = convexTest(schema, modules)
  })

  it('bootstraps a Convex user synchronously from the authenticated identity', async () => {
    const asNewUser = t.withIdentity(identity('new-user'))

    await expect(asNewUser.query(api.users.getCurrentUser)).resolves.toBeNull()
    await asNewUser.mutation(api.users.ensureCurrentUser)

    const user = await asNewUser.query(api.users.getCurrentUser)
    expect(user).toMatchObject({
      clerkId: 'new-user',
      email: 'new-user@example.com',
      firstName: 'new-user',
    })
    await expect(asNewUser.query(api.stables.list)).resolves.toEqual([])
  })

  it('requires an effective paid plan for member access but not owner access', async () => {
    const fixture = await t.run(async (ctx) => {
      const now = Date.now()
      const ownerId = await ctx.db.insert('users', {
        clerkId: 'owner',
        email: 'owner@example.com',
        firstName: 'Owner',
        createdAt: now,
        updatedAt: now,
      })
      const memberId = await ctx.db.insert('users', {
        clerkId: 'member',
        email: 'member@example.com',
        firstName: 'Member',
        createdAt: now,
        updatedAt: now,
      })
      const stableId = await ctx.db.insert('stables', {
        ownerId,
        name: 'Willow Yard',
        location: 'Warsaw',
      })
      await ctx.db.insert('stableMembers', {
        stableId,
        userId: memberId,
        role: 'member',
      })
      return { memberId, stableId }
    })

    await expect(
      t.withIdentity(identity('owner')).query(api.stables.get, {
        id: fixture.stableId,
      }),
    ).resolves.toMatchObject({ name: 'Willow Yard' })
    await expect(
      t.withIdentity(identity('member')).query(api.stables.get, {
        id: fixture.stableId,
      }),
    ).rejects.toThrow('Not authorized')

    await t.run(async (ctx) => {
      const now = Date.now()
      await ctx.db.insert('userSubscriptions', {
        userId: fixture.memberId,
        plan: 'personal_plus',
        status: 'active',
        sourceUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
      })
    })

    await expect(
      t.withIdentity(identity('member')).query(api.stables.get, {
        id: fixture.stableId,
      }),
    ).resolves.toMatchObject({ name: 'Willow Yard' })

    await t.run(async (ctx) => {
      const subscription = await ctx.db
        .query('userSubscriptions')
        .withIndex('by_user_id', (q) => q.eq('userId', fixture.memberId))
        .unique()
      if (!subscription) throw new Error('Subscription fixture missing')
      await ctx.db.patch(subscription._id, { status: 'ended' })
    })
    await expect(
      t.withIdentity(identity('member')).query(api.stables.get, {
        id: fixture.stableId,
      }),
    ).rejects.toThrow('Not authorized')
  })

  it('patches only operational stable details and keeps the mutation owner-only', async () => {
    const fixture = await t.run(async (ctx) => {
      const now = Date.now()
      const ownerId = await ctx.db.insert('users', {
        clerkId: 'operations-owner',
        email: 'operations-owner@example.com',
        firstName: 'Owner',
        createdAt: now,
        updatedAt: now,
      })
      const memberId = await ctx.db.insert('users', {
        clerkId: 'operations-member',
        email: 'operations-member@example.com',
        firstName: 'Member',
        createdAt: now,
        updatedAt: now,
      })
      const stableId = await ctx.db.insert('stables', {
        ownerId,
        name: 'Operations Yard',
        location: 'Krakow',
        description: 'Keep this description',
        addressLine1: '12 Stable Lane',
      })
      await ctx.db.insert('stableMembers', {
        stableId,
        userId: memberId,
        role: 'member',
      })
      await ctx.db.insert('userSubscriptions', {
        userId: memberId,
        plan: 'personal_plus',
        status: 'active',
        sourceUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
      })
      return { stableId }
    })

    await expect(
      t
        .withIdentity(identity('operations-member'))
        .mutation(api.stables.updateOperations, {
          id: fixture.stableId,
          contactName: 'Member edit',
        }),
    ).rejects.toThrow('Not authorized')

    const asOwner = t.withIdentity(identity('operations-owner'))
    await asOwner.mutation(api.stables.updateOperations, {
      id: fixture.stableId,
      contactName: 'Yard office',
      contactPhone: '+48 123 456 789',
      openingHours: '06:00–20:00',
    })

    await expect(
      asOwner.query(api.stables.get, { id: fixture.stableId }),
    ).resolves.toMatchObject({
      name: 'Operations Yard',
      location: 'Krakow',
      description: 'Keep this description',
      addressLine1: '12 Stable Lane',
      contactName: 'Yard office',
      contactPhone: '+48 123 456 789',
      openingHours: '06:00–20:00',
    })
  })

  it('persists billing snapshots that arrive before user provisioning', async () => {
    await t.mutation(internal.userSubscriptions.upsertForClerkUser, {
      clerkUserId: 'paid-user',
      clerkSubscriptionId: 'sub_123',
      plan: 'personal_plus',
      status: 'active',
      sourceUpdatedAt: 200,
    })

    const pendingBefore = await t.run(async (ctx) =>
      ctx.db.query('pendingUserSubscriptions').collect(),
    )
    expect(pendingBefore).toHaveLength(1)

    const asPaidUser = t.withIdentity(identity('paid-user'))
    await asPaidUser.mutation(api.users.ensureCurrentUser)

    const subscriptions = await asPaidUser.query(
      api.userSubscriptions.getCurrent,
    )
    expect(subscriptions).toHaveLength(1)
    expect(subscriptions[0]).toMatchObject({
      plan: 'personal_plus',
      status: 'active',
      sourceUpdatedAt: 200,
    })
    const pendingAfter = await t.run(async (ctx) =>
      ctx.db.query('pendingUserSubscriptions').collect(),
    )
    expect(pendingAfter).toEqual([])
  })

  it('does not let an older billing event overwrite a newer snapshot', async () => {
    const asUser = t.withIdentity(identity('billing-user'))
    await asUser.mutation(api.users.ensureCurrentUser)

    await t.mutation(internal.userSubscriptions.upsertForClerkUser, {
      clerkUserId: 'billing-user',
      plan: 'personal_plus',
      status: 'ended',
      sourceUpdatedAt: 300,
    })
    await t.mutation(internal.userSubscriptions.upsertForClerkUser, {
      clerkUserId: 'billing-user',
      plan: 'personal_plus',
      status: 'active',
      sourceUpdatedAt: 250,
    })

    const subscriptions = await asUser.query(api.userSubscriptions.getCurrent)
    expect(subscriptions[0]?.status).toBe('ended')
  })

  it('archives a stable without orphaning its records', async () => {
    const asOwner = t.withIdentity(identity('archive-owner'))
    await asOwner.mutation(api.users.ensureCurrentUser)
    const stableId = await asOwner.mutation(api.stables.add, {
      name: 'Archive Yard',
      location: 'Krakow',
    })
    const owner = await asOwner.query(api.users.getCurrentUser)
    if (!owner) throw new Error('Owner fixture missing')
    const horseId = await t.run(async (ctx) =>
      ctx.db.insert('horses', {
        stableId,
        ownerId: owner._id,
        name: 'Juniper',
        age: 7,
      }),
    )

    await asOwner.mutation(api.stables.remove, { id: stableId })

    await expect(asOwner.query(api.stables.list)).resolves.toEqual([])
    const preserved = await t.run(async (ctx) => ({
      stable: await ctx.db.get(stableId),
      horse: await ctx.db.get(horseId),
    }))
    expect(preserved.stable?.archivedAt).toEqual(expect.any(Number))
    expect(preserved.horse?._id).toBe(horseId)
  })

  it('tombstones deleted users and archives their owned stables', async () => {
    const asOwner = t.withIdentity(identity('deleted-owner'))
    await asOwner.mutation(api.users.ensureCurrentUser)
    const stableId = await asOwner.mutation(api.stables.add, {
      name: 'Preserved Yard',
      location: 'Lublin',
    })
    const owner = await asOwner.query(api.users.getCurrentUser)
    if (!owner) throw new Error('Owner fixture missing')
    const horseId = await t.run(async (ctx) =>
      ctx.db.insert('horses', {
        stableId,
        ownerId: owner._id,
        name: 'Rowan',
        age: 9,
      }),
    )

    await t.mutation(internal.users.deleteUser, { clerkId: 'deleted-owner' })

    await expect(asOwner.query(api.users.getCurrentUser)).resolves.toBeNull()
    const preserved = await t.run(async (ctx) => ({
      user: await ctx.db.get(owner._id),
      stable: await ctx.db.get(stableId),
      horse: await ctx.db.get(horseId),
    }))
    expect(preserved.user).toMatchObject({
      firstName: 'Deleted',
      deletedAt: expect.any(Number),
    })
    expect(preserved.stable?.archivedAt).toEqual(expect.any(Number))
    expect(preserved.horse?.ownerId).toBe(owner._id)
  })

  it('returns explicit member summaries rather than raw user documents', async () => {
    const fixture = await t.run(async (ctx) => {
      const now = Date.now()
      const ownerId = await ctx.db.insert('users', {
        clerkId: 'privacy-owner',
        email: 'owner@example.com',
        firstName: 'Owner',
        phone: 'private-global-phone',
        timezone: 'Europe/Warsaw',
        createdAt: now,
        updatedAt: now,
      })
      const stableId = await ctx.db.insert('stables', {
        ownerId,
        name: 'Privacy Yard',
        location: 'Gdansk',
      })
      return { stableId }
    })

    const result = await t
      .withIdentity(identity('privacy-owner', 'owner@example.com'))
      .query(api.stableMembers.listWithUsers, { stableId: fixture.stableId })
    const owner = result.owner as Record<string, unknown>

    expect(owner.email).toBe('owner@example.com')
    expect(owner).not.toHaveProperty('clerkId')
    expect(owner).not.toHaveProperty('phone')
    expect(owner).not.toHaveProperty('timezone')
    expect(owner).not.toHaveProperty('profileImageId')
  })

  it('rejects profile storage objects that were not issued for the user', async () => {
    const asUser = t.withIdentity(identity('profile-user'))
    await asUser.mutation(api.users.ensureCurrentUser)
    const storageId = await t.run(async (ctx) =>
      ctx.storage.store(
        new Blob(['not really an image'], { type: 'image/png' }),
      ),
    )

    await expect(
      asUser.mutation(api.onboarding.updateAccountProfile, {
        preferredName: 'Profile user',
        profileImageId: storageId,
      }),
    ).rejects.toThrow('could not be verified')
  })

  it('prevents storage aliases from deleting another document file', async () => {
    const fixture = await t.run(async (ctx) => {
      const now = Date.now()
      const ownerId = await ctx.db.insert('users', {
        clerkId: 'document-owner',
        email: 'document-owner@example.com',
        firstName: 'Owner',
        createdAt: now,
        updatedAt: now,
      })
      const stableId = await ctx.db.insert('stables', {
        ownerId,
        name: 'Document Yard',
        location: 'Torun',
      })
      await ctx.db.insert('userSubscriptions', {
        userId: ownerId,
        plan: 'personal_pro',
        status: 'active',
        sourceUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
      })
      const horseId = await ctx.db.insert('horses', {
        stableId,
        ownerId,
        name: 'Maple',
        age: 9,
      })
      const storageId = await ctx.storage.store(
        new Blob(['shared document'], { type: 'application/pdf' }),
      )
      const originalDocumentId = await ctx.db.insert('stableDocuments', {
        stableId,
        storageId,
        type: 'other',
        fileName: 'original.pdf',
        contentType: 'application/pdf',
        size: 15,
        createdBy: ownerId,
        createdAt: now,
      })
      const duplicateDocumentId = await ctx.db.insert('stableDocuments', {
        stableId,
        horseId,
        storageId,
        type: 'other',
        fileName: 'duplicate.pdf',
        contentType: 'application/pdf',
        size: 15,
        createdBy: ownerId,
        createdAt: now,
      })

      return {
        duplicateDocumentId,
        horseId,
        originalDocumentId,
        stableId,
        storageId,
      }
    })
    const asOwner = t.withIdentity(identity('document-owner'))

    await expect(
      asOwner.mutation(api.stableDocuments.add, {
        stableId: fixture.stableId,
        horseId: fixture.horseId,
        storageId: fixture.storageId,
        type: 'other',
        fileName: 'alias.pdf',
        contentType: 'application/pdf',
        size: 15,
      }),
    ).rejects.toThrow('already in use')

    await asOwner.mutation(api.stableDocuments.remove, {
      id: fixture.duplicateDocumentId,
    })
    const preserved = await t.run(async (ctx) => ({
      file: await ctx.storage.get(fixture.storageId),
      original: await ctx.db.get(fixture.originalDocumentId),
    }))
    expect(preserved.file).not.toBeNull()
    expect(preserved.original?._id).toBe(fixture.originalDocumentId)

    const listed = await asOwner.query(api.stableDocuments.listForStable, {
      stableId: fixture.stableId,
    })
    expect(listed.documents[0]?.document).not.toHaveProperty('storageId')
  })

  it('requires the deleted-horse retention period before final removal', async () => {
    const fixture = await t.run(async (ctx) => {
      const now = Date.now()
      const ownerId = await ctx.db.insert('users', {
        clerkId: 'horse-delete-owner',
        email: 'horse-delete-owner@example.com',
        firstName: 'Owner',
        createdAt: now,
        updatedAt: now,
      })
      const stableId = await ctx.db.insert('stables', {
        ownerId,
        name: 'Retention Yard',
        location: 'Lodz',
      })
      const horseId = await ctx.db.insert('horses', {
        stableId,
        ownerId,
        name: 'Willow',
        age: 11,
      })
      return { horseId }
    })
    const asOwner = t.withIdentity(identity('horse-delete-owner'))

    await expect(
      asOwner.mutation(api.horses.permanentlyDeleteHorse, {
        id: fixture.horseId,
      }),
    ).rejects.toThrow('Move the horse')

    await asOwner.mutation(api.horses.deleteHorse, { id: fixture.horseId })
    await expect(
      asOwner.mutation(api.horses.permanentlyDeleteHorse, {
        id: fixture.horseId,
      }),
    ).rejects.toThrow('retention period')

    await t.run(async (ctx) => {
      await ctx.db.patch(fixture.horseId, {
        deletedAt: Date.now() - 14 * 24 * 60 * 60 * 1000 - 1,
      })
    })
    await asOwner.mutation(api.horses.permanentlyDeleteHorse, {
      id: fixture.horseId,
    })
    await expect(
      t.run(async (ctx) => ctx.db.get(fixture.horseId)),
    ).resolves.toBeNull()
  })

  it('purges abandoned upload tokens and unreferenced storage objects', async () => {
    vi.useFakeTimers()
    try {
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
      const fixture = await t.run(async (ctx) => {
        const now = Date.now()
        const userId = await ctx.db.insert('users', {
          clerkId: 'abandoned-upload-user',
          email: 'abandoned-upload-user@example.com',
          firstName: 'Uploader',
          createdAt: now,
          updatedAt: now,
        })
        const tokenId = await ctx.db.insert('pendingProfileUploads', {
          userId,
          token: 'abandoned-token',
          createdAt: now,
        })
        const storageId = await ctx.storage.store(
          new Blob(['orphan'], { type: 'image/png' }),
        )
        return { storageId, tokenId }
      })

      vi.setSystemTime(new Date('2026-01-02T01:00:00Z'))
      await t.mutation(internal.storageMaintenance.purgeOrphanedUploads, {})

      const cleaned = await t.run(async (ctx) => ({
        file: await ctx.storage.get(fixture.storageId),
        token: await ctx.db.get(fixture.tokenId),
      }))
      expect(cleaned).toEqual({ file: null, token: null })
    } finally {
      vi.useRealTimers()
    }
  })

  it('rejects out-of-sequence onboarding transitions', async () => {
    const asOwner = t.withIdentity(identity('steps-owner'))
    await asOwner.mutation(api.users.ensureCurrentUser)
    const stableId = await asOwner.mutation(api.stables.add, {
      name: 'Stepper Yard',
      location: 'Poznan',
    })

    await expect(
      asOwner.mutation(api.onboarding.recordStableStep, {
        stableId,
        step: 'stable-operations',
        nextStep: 'complete',
        deferred: false,
      }),
    ).rejects.toThrow('out of sequence')
  })

  it('finds and completes resumable onboarding for an existing stable', async () => {
    const asOwner = t.withIdentity(identity('resume-owner'))
    await asOwner.mutation(api.users.ensureCurrentUser)
    const stableId = await asOwner.mutation(api.stables.add, {
      name: 'Resume Yard',
      location: 'Wroclaw',
    })

    await expect(
      asOwner.query(api.onboarding.getNextIncompleteStable),
    ).resolves.toMatchObject({
      stableId,
      role: 'owner',
      currentStep: 'stable-operations',
    })

    await asOwner.mutation(api.onboarding.recordStableStep, {
      stableId,
      step: 'stable-operations',
      nextStep: 'first-horse',
      deferred: true,
    })
    await asOwner.mutation(api.onboarding.recordStableStep, {
      stableId,
      step: 'first-horse',
      nextStep: 'invite-team',
      deferred: true,
    })
    await asOwner.mutation(api.onboarding.recordStableStep, {
      stableId,
      step: 'invite-team',
      nextStep: 'complete',
      deferred: true,
    })
    await asOwner.mutation(api.onboarding.completeStableOnboarding, {
      stableId,
    })

    await expect(
      asOwner.query(api.onboarding.getNextIncompleteStable),
    ).resolves.toBeNull()
  })

  it('activates a plan-gated stable invitation after billing arrives', async () => {
    const asOwner = t.withIdentity(identity('invite-owner'))
    const asMember = t.withIdentity(
      identity('invited-member', 'invited@example.com'),
    )
    await asOwner.mutation(api.users.ensureCurrentUser)
    await asMember.mutation(api.users.ensureCurrentUser)
    const stableId = await asOwner.mutation(api.stables.add, {
      name: 'Invitation Yard',
      location: 'Sopot',
    })
    const { token } = await asOwner.mutation(api.stableInvitations.create, {
      stableId,
      email: 'invited@example.com',
      role: 'member',
    })

    await expect(
      asMember.mutation(api.stableInvitations.accept, { token }),
    ).resolves.toMatchObject({ status: 'accepted_pending_subscription' })
    await expect(asMember.query(api.stables.list)).resolves.toEqual([])

    await t.mutation(internal.userSubscriptions.upsertForClerkUser, {
      clerkUserId: 'invited-member',
      plan: 'personal_plus',
      status: 'active',
      sourceUpdatedAt: Date.now(),
    })

    await expect(asMember.query(api.stables.list)).resolves.toMatchObject([
      { _id: stableId },
    ])
    await expect(
      asMember.query(api.onboarding.getNextIncompleteStable),
    ).resolves.toMatchObject({
      stableId,
      role: 'member',
      currentStep: 'stable-introduction',
    })
  })

  it('rejects malformed stable invitation emails in the mutation', async () => {
    const asOwner = t.withIdentity(identity('invalid-invite-owner'))
    await asOwner.mutation(api.users.ensureCurrentUser)
    const stableId = await asOwner.mutation(api.stables.add, {
      name: 'Validation Yard',
      location: 'Szczecin',
    })

    await expect(
      asOwner.mutation(api.stableInvitations.create, {
        stableId,
        email: 'not-an-email',
        role: 'member',
      }),
    ).rejects.toThrow('valid email')
    await expect(
      t.run(async (ctx) => ctx.db.query('stableInvitations').collect()),
    ).resolves.toEqual([])
  })

  it('enforces the event-horse invitation, response, and withdrawal lifecycle', async () => {
    const fixture = await t.run(async (ctx) => {
      const now = Date.now()
      const ownerId = await ctx.db.insert('users', {
        clerkId: 'event-owner',
        email: 'event-owner@example.com',
        firstName: 'Owner',
        createdAt: now,
        updatedAt: now,
      })
      const creatorId = await ctx.db.insert('users', {
        clerkId: 'event-creator',
        email: 'creator@example.com',
        firstName: 'Creator',
        createdAt: now,
        updatedAt: now,
      })
      const inviteeId = await ctx.db.insert('users', {
        clerkId: 'event-invitee',
        email: 'invitee@example.com',
        firstName: 'Invitee',
        createdAt: now,
        updatedAt: now,
      })
      const stableId = await ctx.db.insert('stables', {
        ownerId,
        name: 'Shared Event Yard',
        location: 'Gdynia',
      })
      for (const userId of [creatorId, inviteeId]) {
        await ctx.db.insert('stableMembers', {
          stableId,
          userId,
          role: 'member',
        })
        await ctx.db.insert('userSubscriptions', {
          userId,
          plan: 'personal_plus',
          status: 'active',
          sourceUpdatedAt: now,
          createdAt: now,
          updatedAt: now,
        })
      }
      const creatorHorseId = await ctx.db.insert('horses', {
        stableId,
        ownerId: creatorId,
        name: 'Fern',
        age: 8,
      })
      const invitedHorseId = await ctx.db.insert('horses', {
        stableId,
        ownerId: inviteeId,
        name: 'Clover',
        age: 10,
      })
      return { stableId, creatorHorseId, invitedHorseId }
    })

    const asCreator = t.withIdentity(
      identity('event-creator', 'creator@example.com'),
    )
    const asInvitee = t.withIdentity(
      identity('event-invitee', 'invitee@example.com'),
    )
    const asOwner = t.withIdentity(identity('event-owner'))
    const eventId = await asCreator.mutation(api.events.add, {
      stableId: fixture.stableId,
      horseIds: [fixture.creatorHorseId, fixture.invitedHorseId],
      date: '2026-09-10',
      time: '10:00',
      type: 'vet',
      title: 'Shared vet visit',
      status: 'planned',
    })
    const invitation = await t.run(async (ctx) =>
      ctx.db
        .query('eventsHorses')
        .withIndex('by_horse_id_event_id', (q) =>
          q.eq('horseId', fixture.invitedHorseId).eq('eventId', eventId),
        )
        .unique(),
    )
    if (!invitation) throw new Error('Horse invitation fixture missing')
    expect(invitation.status).toBe('invited')

    await expect(
      asInvitee.mutation(api.events.update, {
        id: eventId,
        stableId: fixture.stableId,
        horseIds: [fixture.invitedHorseId],
        date: '2026-09-10',
        time: '11:00',
        type: 'vet',
        title: 'Unauthorized edit',
        status: 'planned',
      }),
    ).rejects.toThrow('Not authorized')

    await asInvitee.mutation(api.events.approveHorseInvitation, {
      eventHorseId: invitation._id,
    })
    await expect(
      asInvitee.query(api.events.get, { id: eventId }),
    ).resolves.toMatchObject({
      horseIds: expect.arrayContaining([
        fixture.creatorHorseId,
        fixture.invitedHorseId,
      ]),
    })

    await asInvitee.mutation(api.events.withdrawHorseFromEvent, {
      eventHorseId: invitation._id,
    })
    await expect(
      asInvitee.mutation(api.eventHorseDetails.update, {
        id: invitation._id,
        completionNotes: 'Should not be accepted after withdrawal',
      }),
    ).rejects.toThrow('Inactive horse participation')
    await expect(
      asInvitee.query(api.events.get, { id: eventId }),
    ).resolves.toMatchObject({
      horseIds: [fixture.creatorHorseId],
    })

    const declinedEventId = await asCreator.mutation(api.events.add, {
      stableId: fixture.stableId,
      horseIds: [fixture.creatorHorseId, fixture.invitedHorseId],
      date: '2026-09-11',
      time: '14:00',
      type: 'hoof_trimming',
      title: 'Shared farrier visit',
      status: 'planned',
    })
    const declinedInvitation = await t.run(async (ctx) =>
      ctx.db
        .query('eventsHorses')
        .withIndex('by_horse_id_event_id', (q) =>
          q
            .eq('horseId', fixture.invitedHorseId)
            .eq('eventId', declinedEventId),
        )
        .unique(),
    )
    if (!declinedInvitation) {
      throw new Error('Declined horse invitation fixture missing')
    }
    await asInvitee.mutation(api.events.declineHorseInvitation, {
      eventHorseId: declinedInvitation._id,
    })
    await expect(
      asInvitee.query(api.events.get, { id: declinedEventId }),
    ).resolves.toMatchObject({
      horseIds: [fixture.creatorHorseId],
    })

    const deletedHorseEventId = await asCreator.mutation(api.events.add, {
      stableId: fixture.stableId,
      horseIds: [fixture.creatorHorseId, fixture.invitedHorseId],
      date: '2026-09-12',
      time: '09:00',
      type: 'dentist',
      title: 'Deleted horse invitation',
      status: 'planned',
    })
    const deletedHorseInvitation = await t.run(async (ctx) =>
      ctx.db
        .query('eventsHorses')
        .withIndex('by_horse_id_event_id', (q) =>
          q
            .eq('horseId', fixture.invitedHorseId)
            .eq('eventId', deletedHorseEventId),
        )
        .unique(),
    )
    if (!deletedHorseInvitation) {
      throw new Error('Deleted horse invitation fixture missing')
    }
    await asInvitee.mutation(api.horses.deleteHorse, {
      id: fixture.invitedHorseId,
    })
    await expect(
      asInvitee.mutation(api.events.approveHorseInvitation, {
        eventHorseId: deletedHorseInvitation._id,
      }),
    ).rejects.toThrow('Horse not found')

    const audit = await asOwner.query(api.auditLogs.listForStable, {
      stableId: fixture.stableId,
    })
    expect(audit.map((entry) => entry.action)).toEqual(
      expect.arrayContaining([
        'event.created',
        'event_horse.approved',
        'event_horse.declined',
        'event_horse.withdrawn',
      ]),
    )
  })
})
