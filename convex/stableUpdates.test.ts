import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
const setup = async () => {
  const t = convexTest(schema, modules)
  const ids = await t.run(async (ctx) => {
    const makeUser = (clerkId: string) =>
      ctx.db.insert('users', {
        clerkId,
        firstName: clerkId,
        email: `${clerkId}@example.com`,
        createdAt: 1,
        updatedAt: 1,
      })
    const ownerId = await makeUser('owner')
    const memberId = await makeUser('member')
    const otherId = await makeUser('other')
    const outsiderId = await makeUser('outsider')
    const stableId = await ctx.db.insert('stables', {
      name: 'Yard',
      location: 'Field',
      ownerId,
    })
    const membershipId = await ctx.db.insert('stableMembers', {
      stableId,
      userId: memberId,
      role: 'member',
    })
    await ctx.db.insert('stableMembers', {
      stableId,
      userId: otherId,
      role: 'member',
    })
    return { ownerId, memberId, outsiderId, stableId, membershipId }
  })
  return {
    t,
    ...ids,
    owner: t.withIdentity({ subject: 'owner' }),
    member: t.withIdentity({ subject: 'member' }),
    other: t.withIdentity({ subject: 'other' }),
    outsider: t.withIdentity({ subject: 'outsider' }),
  }
}
const paginationOpts = { cursor: null, numItems: 3 }

describe('yard updates', () => {
  it('lets members publish, author correct, owner moderate, and forbids another member editing', async () => {
    const { owner, member, other, stableId, memberId } = await setup()
    const id = await member.mutation(api.stableUpdates.add, {
      stableId,
      body: '  Arena closed until lunch.  ',
    })
    expect(
      (
        await other.query(api.stableUpdates.list, {
          stableId,
          today: '2026-10-01',
          paginationOpts,
        })
      ).page[0],
    ).toMatchObject({
      body: 'Arena closed until lunch.',
      authorId: memberId,
      canManage: false,
    })
    await expect(
      other.mutation(api.stableUpdates.update, { id, body: 'Wrong' }),
    ).rejects.toThrow()
    await expect(
      other.mutation(api.stableUpdates.remove, { id }),
    ).rejects.toThrow()
    await member.mutation(api.stableUpdates.update, { id, body: 'Arena open.' })
    await owner.mutation(api.stableUpdates.update, {
      id,
      body: 'Arena open from noon.',
    })
    await owner.mutation(api.stableUpdates.remove, { id })
    expect(
      (await owner.query(api.stableUpdates.list, { stableId, paginationOpts }))
        .page,
    ).toEqual([])
  })

  it('denies outsiders and revoked members, including authors, and archived yards', async () => {
    const { t, owner, member, outsider, stableId, membershipId } = await setup()
    const id = await member.mutation(api.stableUpdates.add, {
      stableId,
      body: 'Gate repair.',
    })
    await expect(
      outsider.query(api.stableUpdates.list, { stableId, paginationOpts }),
    ).rejects.toThrow()
    await expect(
      outsider.mutation(api.stableUpdates.add, { stableId, body: 'No access' }),
    ).rejects.toThrow()
    await t.run((ctx) => ctx.db.delete(membershipId))
    await expect(
      member.mutation(api.stableUpdates.update, { id, body: 'Removed member' }),
    ).rejects.toThrow()
    await expect(
      member.mutation(api.stableUpdates.remove, { id }),
    ).rejects.toThrow()
    await t.run((ctx) => ctx.db.patch(stableId, { archivedAt: 1 }))
    await expect(
      owner.query(api.stableUpdates.list, { stableId, paginationOpts }),
    ).rejects.toThrow('archived')
    await expect(
      owner.mutation(api.stableUpdates.add, { stableId, body: 'Archived' }),
    ).rejects.toThrow('archived')
    await expect(
      owner.mutation(api.stableUpdates.remove, { id }),
    ).rejects.toThrow('archived')
  })

  it('keeps notices through the inclusive local date, paginates, and can clear expiry', async () => {
    const { owner, stableId } = await setup()
    const expired = await owner.mutation(api.stableUpdates.add, {
      stableId,
      body: 'Expired',
      expiresOn: '2026-09-30',
    })
    await owner.mutation(api.stableUpdates.add, {
      stableId,
      body: 'Today',
      expiresOn: '2026-10-01',
    })
    await owner.mutation(api.stableUpdates.add, {
      stableId,
      body: 'Tomorrow',
      expiresOn: '2026-10-02',
    })
    await owner.mutation(api.stableUpdates.add, { stableId, body: 'No expiry' })
    const today = await owner.query(api.stableUpdates.list, {
      stableId,
      today: '2026-10-01',
      paginationOpts: { cursor: null, numItems: 2 },
    })
    expect(today.page.map((item) => item.body)).toEqual([
      'No expiry',
      'Tomorrow',
    ])
    expect(today.isDone).toBe(false)
    const next = await owner.query(api.stableUpdates.list, {
      stableId,
      today: '2026-10-01',
      paginationOpts: { cursor: today.continueCursor, numItems: 2 },
    })
    expect(next.page.map((item) => item.body)).toEqual(['Today'])
    expect(
      (
        await owner.query(api.stableUpdates.list, {
          stableId,
          today: '2026-10-02',
          paginationOpts,
        })
      ).page.map((item) => item.body),
    ).toEqual(['No expiry', 'Tomorrow'])
    await owner.mutation(api.stableUpdates.update, {
      id: expired,
      body: 'Restored',
    })
    expect(
      (
        await owner.query(api.stableUpdates.list, {
          stableId,
          today: '2026-10-01',
          paginationOpts: { cursor: null, numItems: 20 },
        })
      ).page.map((item) => item.body),
    ).toContain('Restored')
  })

  it('rejects empty, oversized and impossible-date input without changing persisted text', async () => {
    const { owner, stableId } = await setup()
    for (const body of ['   ', 'x'.repeat(2001)])
      await expect(
        owner.mutation(api.stableUpdates.add, { stableId, body }),
      ).rejects.toThrow()
    for (const expiresOn of ['2026-02-30', '2026-99-01', 'tomorrow'])
      await expect(
        owner.mutation(api.stableUpdates.add, {
          stableId,
          body: 'Careful',
          expiresOn,
        }),
      ).rejects.toThrow()
    const id = await owner.mutation(api.stableUpdates.add, {
      stableId,
      body: 'Keep me',
    })
    await expect(
      owner.mutation(api.stableUpdates.update, { id, body: '' }),
    ).rejects.toThrow()
    expect(
      (await owner.query(api.stableUpdates.list, { stableId, paginationOpts }))
        .page[0].body,
    ).toBe('Keep me')
  })
})
