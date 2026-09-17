import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { convexTest } from 'convex-test'
import { api, internal } from './_generated/api'
import schema from './schema'

const { getClerkUser } = vi.hoisted(() => ({ getClerkUser: vi.fn() }))
vi.mock('@clerk/backend', () => ({
  createClerkClient: () => ({ users: { getUser: getClerkUser } }),
}))
const modules = import.meta.glob('./**/*.ts')
const identity = (subject: string, email?: string) => ({ subject, email })

async function fixture() {
  const t = convexTest(schema, modules)
  const ids = await t.run(async (ctx) => {
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
      email: '',
      firstName: 'Member',
      createdAt: now,
      updatedAt: now,
    })
    const stableId = await ctx.db.insert('stables', {
      ownerId,
      name: 'Willow Yard',
      location: 'Warsaw',
    })
    const invitationId = await ctx.db.insert('stableInvitations', {
      stableId,
      invitedBy: ownerId,
      email: 'member@example.com',
      role: 'member',
      status: 'pending',
      token: 'invitation-token',
      createdAt: now,
      updatedAt: now,
      expiresAt: now + 60_000,
    })
    return { ownerId, memberId, stableId, invitationId }
  })
  return {
    t,
    ...ids,
    asMember: t.withIdentity(identity('member', ' MEMBER@example.com ')),
  }
}

beforeEach(() => {
  vi.stubEnv('CLERK_SECRET_KEY', '')
  getClerkUser.mockReset()
})
afterEach(() => vi.unstubAllEnvs())

describe('invited account lifecycle', () => {
  it('repairs an existing empty profile from authenticated email claims at sign-in', async () => {
    const { asMember } = await fixture()
    await asMember.action(api.users.syncCurrentUser)
    expect(await asMember.query(api.users.getCurrentUser)).toMatchObject({
      email: 'member@example.com',
    })
    expect(
      await asMember.query(api.stableInvitations.listForCurrentUser),
    ).toMatchObject([{ token: 'invitation-token' }])
    expect(
      await asMember.query(api.stableInvitations.preview, {
        token: 'invitation-token',
      }),
    ).toMatchObject({ viewer: { emailMatches: true } })
    expect(getClerkUser).not.toHaveBeenCalled()
  })

  it('recovers missing JWT emails from Clerk and accepts a verified secondary address', async () => {
    const { t } = await fixture()
    vi.stubEnv('CLERK_SECRET_KEY', 'test-only-key')
    getClerkUser.mockResolvedValue({
      primaryEmailAddressId: 'primary',
      firstName: 'Sam',
      lastName: null,
      imageUrl: '',
      emailAddresses: [
        {
          id: 'primary',
          emailAddress: 'primary@example.com',
          verification: { status: 'verified' },
        },
        {
          id: 'secondary',
          emailAddress: 'MEMBER@example.com',
          verification: { status: 'verified' },
        },
        {
          id: 'unverified',
          emailAddress: 'unverified@example.com',
          verification: { status: 'unverified' },
        },
      ],
    })
    const memberWithoutClaims = t.withIdentity({ subject: 'member' })
    await memberWithoutClaims.action(api.users.syncCurrentUser)
    expect(getClerkUser).toHaveBeenCalledWith('member')
    expect(
      await memberWithoutClaims.query(api.users.getCurrentUser),
    ).toMatchObject({
      email: 'primary@example.com',
      verifiedEmails: ['primary@example.com', 'member@example.com'],
    })
    expect(
      await memberWithoutClaims.query(api.stableInvitations.listForCurrentUser),
    ).toHaveLength(1)
    await expect(
      memberWithoutClaims.mutation(api.stableInvitations.accept, {
        token: 'invitation-token',
      }),
    ).resolves.toMatchObject({ status: 'accepted' })
  })

  it('matches the signed-in identity instead of a stale saved primary email', async () => {
    const { asMember, t, memberId } = await fixture()
    await t.run((ctx) => ctx.db.patch(memberId, { email: 'old@example.com' }))
    expect(
      await asMember.query(api.stableInvitations.preview, {
        token: 'invitation-token',
      }),
    ).toMatchObject({ viewer: { emailMatches: true } })
    await expect(
      asMember.mutation(api.stableInvitations.accept, {
        token: 'invitation-token',
      }),
    ).resolves.toMatchObject({ status: 'accepted' })
    expect(
      await asMember.query(api.stableInvitations.listForCurrentUser),
    ).toEqual([])
  })

  it('does not allow another signed-in account to see, accept, or decline the invitation', async () => {
    const { t } = await fixture()
    const other = t.withIdentity(identity('owner', 'owner@example.com'))
    expect(await other.query(api.stableInvitations.listForCurrentUser)).toEqual(
      [],
    )
    expect(
      await other.query(api.stableInvitations.preview, {
        token: 'invitation-token',
      }),
    ).toMatchObject({ viewer: { emailMatches: false } })
    await expect(
      other.mutation(api.stableInvitations.accept, {
        token: 'invitation-token',
      }),
    ).rejects.toThrow('invited email')
    await expect(
      other.mutation(api.stableInvitations.decline, {
        token: 'invitation-token',
      }),
    ).rejects.toThrow('invited email')
    expect(await t.query(api.stableInvitations.listForCurrentUser)).toEqual([])
  })

  it('does not grant access using an explicitly unverified address', async () => {
    const { t, memberId } = await fixture()
    await t.run((ctx) =>
      ctx.db.patch(memberId, {
        email: 'member@example.com',
        verifiedEmails: [],
      }),
    )
    const unverified = t.withIdentity({
      ...identity('member', 'member@example.com'),
      emailVerified: false,
    })
    expect(
      await unverified.query(api.stableInvitations.listForCurrentUser),
    ).toEqual([])
    await expect(
      unverified.mutation(api.stableInvitations.accept, {
        token: 'invitation-token',
      }),
    ).rejects.toThrow('invited email')
  })

  it('declines once without granting membership and allows creating a stable afterward', async () => {
    const { asMember, t, invitationId } = await fixture()
    await asMember.mutation(api.stableInvitations.decline, {
      token: 'invitation-token',
    })
    expect(
      await asMember.query(api.stableInvitations.listForCurrentUser),
    ).toEqual([])
    expect(await asMember.query(api.stables.list)).toEqual([])
    expect(await t.run((ctx) => ctx.db.get(invitationId))).toMatchObject({
      status: 'declined',
    })
    expect(
      await asMember.query(api.stableInvitations.preview, {
        token: 'invitation-token',
      }),
    ).toMatchObject({
      status: 'declined',
      viewer: { isDeclinedByViewer: true },
    })
    await expect(
      asMember.mutation(api.stableInvitations.accept, {
        token: 'invitation-token',
      }),
    ).rejects.toThrow('no longer pending')
    await expect(
      asMember.mutation(api.stableInvitations.decline, {
        token: 'invitation-token',
      }),
    ).rejects.toThrow('no longer pending')
    await expect(
      asMember.mutation(api.stables.add, {
        name: 'My Yard',
        location: 'Warsaw',
      }),
    ).resolves.toBeTruthy()
  })

  it('allows a member to create an owned stable after accepting', async () => {
    const { asMember, stableId } = await fixture()
    await asMember.mutation(api.stableInvitations.accept, {
      token: 'invitation-token',
    })
    const ownedId = await asMember.mutation(api.stables.add, {
      name: 'My Yard',
      location: 'Warsaw',
    })
    expect(
      await asMember.query(api.stables.getAccess, { id: stableId }),
    ).toMatchObject({ role: 'member' })
    expect(
      await asMember.query(api.stables.getAccess, { id: ownedId }),
    ).toMatchObject({ role: 'owner' })
  })

  it.each(['accepted', 'declined', 'revoked', 'expired'] as const)(
    'does not surface %s invitations at sign-in',
    async (status) => {
      const { asMember, t, invitationId } = await fixture()
      await t.run((ctx) => ctx.db.patch(invitationId, { status }))
      expect(
        await asMember.query(api.stableInvitations.listForCurrentUser),
      ).toEqual([])
    },
  )

  it('does not surface expired links or invitations to archived stables', async () => {
    const { asMember, t, invitationId, stableId } = await fixture()
    await t.run((ctx) =>
      ctx.db.patch(invitationId, { expiresAt: Date.now() - 1 }),
    )
    expect(
      await asMember.query(api.stableInvitations.listForCurrentUser),
    ).toEqual([])
    await t.run(async (ctx) => {
      await ctx.db.patch(invitationId, { expiresAt: Date.now() + 60_000 })
      await ctx.db.patch(stableId, { archivedAt: Date.now() })
    })
    expect(
      await asMember.query(api.stableInvitations.listForCurrentUser),
    ).toEqual([])
  })

  it('preserves the verified email list delivered by the Clerk webhook', async () => {
    const { t, asMember } = await fixture()
    await t.mutation(internal.users.upsertUser, {
      clerkId: 'member',
      email: 'primary@example.com',
      firstName: 'Sam',
      verifiedEmails: ['MEMBER@example.com'],
    })
    expect(
      await asMember.query(api.stableInvitations.listForCurrentUser),
    ).toHaveLength(1)
    await t.mutation(internal.users.upsertUser, {
      clerkId: 'member',
      email: 'primary@example.com',
      firstName: 'Sam',
      verifiedEmails: [],
    })
    expect(
      await asMember.query(api.stableInvitations.listForCurrentUser),
    ).toEqual([])
  })
})
