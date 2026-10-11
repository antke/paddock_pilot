import { afterEach, expect, it, vi } from 'vitest'
import { convexTest } from 'convex-test'
import schema from './schema'
import { api } from './_generated/api'

const modules = import.meta.glob('./**/*.ts')
afterEach(() => vi.useRealTimers())
async function fixture() {
  vi.useFakeTimers()
  const t = convexTest(schema, modules)
  const client = (name: string) =>
    t.withIdentity({
      subject: name,
      email: `${name}@example.com`,
      emailVerified: true,
    })
  const owner = client('owner'),
    recipient = client('recipient'),
    other = client('other')
  for (const user of [owner, recipient, other])
    await user.mutation(api.users.ensureCurrentUser, {})
  const horseId = await owner.mutation(api.horses.add, {
    name: 'Private horse',
    age: 8,
  })
  const id = await owner.mutation(api.horseCollaboration.invite, {
    horseId,
    email: 'recipient@example.com',
    kind: 'carer',
    role: 'viewer',
  })
  const token = (await t.run((ctx) => ctx.db.get(id)))!.token
  return { t, owner, recipient, other, horseId, id, token }
}
it('returns only safe account recovery state and never grants private details to another account', async () => {
  const f = await fixture()
  expect(
    await f.other.query(api.horseCollaboration.invitationStatus, {
      token: f.token,
    }),
  ).toEqual({ status: 'wrong_account' })
  await expect(
    f.other.query(api.horseCollaboration.invitation, { token: f.token }),
  ).rejects.toThrow('invited email')
  expect(
    await f.other.query(api.horseCollaboration.invitationStatus, {
      token: 'missing',
    }),
  ).toEqual({ status: 'unavailable' })
})
it.each(['expired', 'revoked', 'declined'] as const)(
  'gives the recipient %s recovery without horse data and preserves the private query null contract',
  async (state) => {
    const f = await fixture()
    await f.t.run((ctx) =>
      ctx.db.patch(
        f.id,
        state === 'expired' ? { expiresAt: Date.now() - 1 } : { status: state },
      ),
    )
    expect(
      await f.recipient.query(api.horseCollaboration.invitationStatus, {
        token: f.token,
      }),
    ).toEqual({ status: state })
    expect(
      await f.recipient.query(api.horseCollaboration.invitation, {
        token: f.token,
      }),
    ).toBeNull()
    expect(
      await f.other.query(api.horseCollaboration.invitationStatus, {
        token: f.token,
      }),
    ).toEqual({ status: 'wrong_account' })
  },
)
it('keeps accepted tokens unavailable after the carer grant is removed', async () => {
  const f = await fixture()
  expect(
    await f.recipient.query(api.horseCollaboration.invitationStatus, {
      token: f.token,
    }),
  ).toEqual({ status: 'ready' })
  await f.recipient.mutation(api.horseCollaboration.respond, {
    token: f.token,
    accept: true,
  })
  const management = await f.owner.query(api.horseCollaboration.management, {
    horseId: f.horseId,
  })
  await f.owner.mutation(api.horseCollaboration.updateCarer, {
    id: management.carers[0]._id,
  })
  expect(
    await f.recipient.query(api.horseCollaboration.invitationStatus, {
      token: f.token,
    }),
  ).toEqual({ status: 'unavailable' })
  expect(
    await f.recipient.query(api.horseCollaboration.invitation, {
      token: f.token,
    }),
  ).toBeNull()
})
it('returns account identity metadata instead of a stale free-text owner name', async () => {
  const f = await fixture()
  const owner = (await f.owner.query(api.users.getCurrentUser))!
  await f.t.run(async (ctx) => {
    await ctx.db.patch(owner._id, { preferredName: 'Actual owner' })
    await ctx.db.patch(f.horseId, { ownerName: 'Old imported owner' })
  })
  const stableId = await f.owner.mutation(api.stables.add, {
    name: 'Willow',
    location: 'Warsaw',
  })
  await f.owner.mutation(api.horseTransitions.connect, {
    horseId: f.horseId,
    stableId,
  })
  expect(
    await f.owner.query(api.horseCollaboration.management, {
      horseId: f.horseId,
    }),
  ).toMatchObject({
    horseName: 'Private horse',
    ownerName: 'Actual owner',
    stableAdminName: 'Actual owner',
  })
})
