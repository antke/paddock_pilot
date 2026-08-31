import { beforeEach, describe, expect, it } from 'vitest'
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

describe('email lifecycle notifications', () => {
  let t: TestConvex<typeof schema>

  beforeEach(() => {
    t = convexTest(schema, modules)
  })

  it('queues member-removal and stable-archive notifications', async () => {
    const fixture = await t.run(async (ctx) => {
      const now = Date.now()
      const ownerId = await ctx.db.insert('users', {
        clerkId: 'lifecycle-owner',
        email: 'owner@example.com',
        firstName: 'Owner',
        createdAt: now,
        updatedAt: now,
      })
      const removedUserId = await ctx.db.insert('users', {
        clerkId: 'removed-member',
        email: 'removed@example.com',
        firstName: 'Removed',
        createdAt: now,
        updatedAt: now,
      })
      const remainingUserId = await ctx.db.insert('users', {
        clerkId: 'remaining-member',
        email: 'remaining@example.com',
        firstName: 'Remaining',
        createdAt: now,
        updatedAt: now,
      })
      const stableId = await ctx.db.insert('stables', {
        ownerId,
        name: 'Lifecycle Yard',
        location: 'Warsaw',
      })
      const removedMembershipId = await ctx.db.insert('stableMembers', {
        stableId,
        userId: removedUserId,
        role: 'member',
      })
      await ctx.db.insert('stableMembers', {
        stableId,
        userId: remainingUserId,
        role: 'member',
      })
      return { removedMembershipId, stableId }
    })
    const asOwner = t.withIdentity(identity('lifecycle-owner'))

    await asOwner.mutation(api.stableMembers.remove, {
      id: fixture.removedMembershipId,
    })
    await asOwner.mutation(api.stables.remove, { id: fixture.stableId })

    const deliveries = await t.run(async (ctx) =>
      ctx.db.query('emailDeliveries').collect(),
    )
    expect(deliveries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: 'stable_membership_removed',
          recipient: 'removed@example.com',
        }),
        expect.objectContaining({
          category: 'stable_archived',
          recipient: 'remaining@example.com',
        }),
      ]),
    )
  })

  it('queues one welcome and one deletion confirmation per account', async () => {
    const asUser = t.withIdentity(
      identity('account-lifecycle', 'account@example.com'),
    )
    await asUser.mutation(api.users.ensureCurrentUser)
    await t.mutation(internal.users.upsertUser, {
      clerkId: 'account-lifecycle',
      email: 'account@example.com',
      firstName: 'Account',
    })
    await t.mutation(internal.users.deleteUser, {
      clerkId: 'account-lifecycle',
    })

    const deliveries = await t.run(async (ctx) =>
      ctx.db.query('emailDeliveries').collect(),
    )
    expect(
      deliveries.filter((delivery) => delivery.category === 'account_welcome'),
    ).toHaveLength(1)
    expect(
      deliveries.filter((delivery) => delivery.category === 'account_deleted'),
    ).toHaveLength(1)
  })

  it('rate-limits immediate invitation resends', async () => {
    const asOwner = t.withIdentity(identity('resend-owner'))
    await asOwner.mutation(api.users.ensureCurrentUser)
    const stableId = await asOwner.mutation(api.stables.add, {
      name: 'Resend Yard',
      location: 'Warsaw',
    })
    const invitation = await asOwner.mutation(api.stableInvitations.create, {
      stableId,
      email: 'invitee@example.com',
      role: 'member',
    })

    await expect(
      asOwner.mutation(api.stableInvitations.resend, {
        id: invitation.invitationId,
      }),
    ).rejects.toThrow('Wait a minute')
  })
})
