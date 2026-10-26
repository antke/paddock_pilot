import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const names = (people: Array<{ name: string }>) =>
  people.map((person) => person.name)

const modules = import.meta.glob('./**/*.ts')

async function fixture() {
  const t = convexTest(schema, modules)
  const ids = await t.run(async (ctx) => {
    const user = (clerkId: string, firstName: string, extra = {}) =>
      ctx.db.insert('users', {
        clerkId,
        firstName,
        email: `${clerkId}@example.test`,
        createdAt: 0,
        updatedAt: 0,
        ...extra,
      })
    const actor = await user('actor', 'Alex', {
      lastName: 'Rider',
      preferredName: 'Alex nickname',
    })
    const owner = await user('owner', 'Yard owner', {
      preferredName: 'Yard owner',
    })
    const member = await user('member', 'Stable member')
    const inactive = await user('inactive', 'Inactive member')
    const deleted = await user('deleted', 'Deleted person', { deletedAt: 1 })
    const helper = await user('helper', 'Trusted', { lastName: 'Helper' })
    const otherHelper = await user('other-helper', 'Other helper')
    const outsider = await user('outsider', 'Other yard owner')
    const stableId = await ctx.db.insert('stables', {
      ownerId: owner,
      name: 'Home yard',
      location: 'Warsaw',
    })
    const otherStableId = await ctx.db.insert('stables', {
      ownerId: outsider,
      name: 'Other yard',
      location: 'Warsaw',
    })
    for (const userId of [actor, member, deleted])
      await ctx.db.insert('stableMembers', {
        stableId,
        userId,
        role: 'member',
        ...(userId === member
          ? { displayNameOverride: 'Stable nickname' }
          : {}),
      })
    await ctx.db.insert('stableMembers', {
      stableId,
      userId: inactive,
      role: 'guest',
    })
    const horseId = await ctx.db.insert('horses', {
      age: 10,
      name: 'Juniper',
      ownerId: actor,
      stableId,
    })
    const otherHorseId = await ctx.db.insert('horses', {
      age: 10,
      name: 'Meadow',
      ownerId: actor,
    })
    const privateHorseId = await ctx.db.insert('horses', {
      age: 10,
      name: 'Private horse',
      ownerId: outsider,
      stableId,
    })
    const carerId = await ctx.db.insert('horseCarers', {
      horseId,
      userId: helper,
      role: 'editor',
      invitedBy: actor,
      createdAt: 0,
    })
    await ctx.db.insert('horseCarers', {
      horseId,
      userId: member,
      role: 'viewer',
      invitedBy: actor,
      createdAt: 0,
    })
    await ctx.db.insert('horseCarers', {
      horseId,
      userId: deleted,
      role: 'editor',
      invitedBy: actor,
      createdAt: 0,
    })
    await ctx.db.insert('horseCarers', {
      horseId: otherHorseId,
      userId: otherHelper,
      role: 'viewer',
      invitedBy: actor,
      createdAt: 0,
    })
    await ctx.db.insert('horseCarers', {
      horseId: privateHorseId,
      userId: otherHelper,
      role: 'viewer',
      invitedBy: outsider,
      createdAt: 0,
    })
    return {
      actor,
      owner,
      member,
      stableId,
      otherStableId,
      horseId,
      otherHorseId,
      privateHorseId,
      carerId,
    }
  })
  return {
    t,
    ...ids,
    actorClient: t.withIdentity({ subject: 'actor' }),
    helperClient: t.withIdentity({ subject: 'helper' }),
  }
}

describe('people name suggestions', () => {
  it('combines the current user, active stable directory names and selected horse carers without duplicate people', async () => {
    const f = await fixture()
    expect(
      names(
        await f.actorClient.query(api.people.suggestNames, {
          stableId: f.stableId,
          horseIds: [f.horseId, f.horseId],
        }),
      ),
    ).toEqual([
      'Alex nickname',
      'Yard owner',
      'Stable member',
      'Trusted Helper',
    ])
  })

  it('marks only the current user and uses their preferred account name before directory aliases', async () => {
    const f = await fixture()
    const result = await f.actorClient.query(api.people.suggestNames, {
      stableId: f.stableId,
    })
    expect(result[0]).toEqual({ name: 'Alex nickname', isCurrentUser: true })
    expect(result.slice(1).every((person) => !person.isCurrentUser)).toBe(true)
  })

  it('includes helpers across multiple selected horses and supports stable owners without a membership row', async () => {
    const f = await fixture()
    const result = await f.t
      .withIdentity({ subject: 'owner' })
      .query(api.people.suggestNames, {
        stableId: f.stableId,
        horseIds: [f.horseId, f.otherHorseId],
      })
    expect(names(result)).toEqual([
      'Yard owner',
      'Alex nickname',
      'Stable member',
      'Trusted Helper',
    ])
    const personal = await f.actorClient.query(api.people.suggestNames, {
      horseIds: [f.horseId, f.otherHorseId],
    })
    expect(names(personal)).toContain('Trusted Helper')
    expect(names(personal)).toContain('Other helper')
  })

  it('changes carer suggestions with horse selection and immediately excludes revoked access', async () => {
    const f = await fixture()
    expect(
      names(
        await f.actorClient.query(api.people.suggestNames, {
          horseIds: [f.otherHorseId],
        }),
      ),
    ).toEqual(['Alex nickname', 'Yard owner', 'Stable member', 'Other helper'])
    await f.t.run((ctx) => ctx.db.delete(f.carerId))
    expect(
      names(
        await f.actorClient.query(api.people.suggestNames, {
          horseIds: [f.horseId],
        }),
      ),
    ).not.toContain('Trusted Helper')
  })

  it('does not expose another stable or a private horse through supplied IDs', async () => {
    const f = await fixture()
    expect(
      names(
        await f.actorClient.query(api.people.suggestNames, {
          stableId: f.otherStableId,
          horseIds: [f.privateHorseId],
        }),
      ),
    ).toEqual(['Alex nickname'])
  })

  it('supports a trusted carer without stable membership without exposing the stable directory', async () => {
    const f = await fixture()
    expect(
      names(
        await f.helperClient.query(api.people.suggestNames, {
          stableId: f.stableId,
          horseIds: [f.horseId],
        }),
      ),
    ).toEqual(['Trusted Helper', 'Alex nickname', 'Stable member'])
  })

  it('excludes archived stables and deleted horses while keeping the current user', async () => {
    const f = await fixture()
    await f.t.run(async (ctx) => {
      await ctx.db.patch(f.stableId, { archivedAt: 1 })
      await ctx.db.patch(f.horseId, { deletedAt: 1 })
    })
    expect(
      names(
        await f.actorClient.query(api.people.suggestNames, {
          horseIds: [f.horseId],
        }),
      ),
    ).toEqual(['Alex nickname'])
  })

  it('requires authentication', async () => {
    const f = await fixture()
    await expect(f.t.query(api.people.suggestNames, {})).rejects.toThrow(
      'User not authenticated',
    )
  })
})

it('uses the preferred name instead of the sign-in placeholder for the current user', async () => {
  const f = await fixture()
  await f.t.run((ctx) =>
    ctx.db.patch(f.actor, {
      firstName: 'Member',
      lastName: '',
      preferredName: 'xyz',
    }),
  )
  expect((await f.actorClient.query(api.people.suggestNames, {}))[0]).toEqual({
    name: 'xyz',
    isCurrentUser: true,
  })
})
