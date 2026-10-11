import { describe, expect, it } from 'vitest'
import { convexTest } from 'convex-test'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

describe('setup visibility and dismissal', () => {
  it('derives owner readiness, excludes deleted horses, and keeps member access separate', async () => {
    const t = convexTest(schema, modules)
    const fixture = await t.run(async (ctx) => {
      const ownerId = await ctx.db.insert('users', {
        clerkId: 'owner',
        firstName: 'Owner',
        email: 'owner@test.invalid',
        createdAt: 0,
        updatedAt: 0,
      })
      const memberId = await ctx.db.insert('users', {
        clerkId: 'member',
        firstName: 'Member',
        email: 'member@test.invalid',
        createdAt: 0,
        updatedAt: 0,
      })
      const stableId = await ctx.db.insert('stables', {
        ownerId,
        name: 'Yard',
        location: 'Warsaw',
        contactPhone: '123',
      })
      await ctx.db.insert('stableMembers', {
        userId: memberId,
        stableId,
        role: 'member',
      })
      await ctx.db.insert('horses', {
        stableId,
        ownerId,
        name: 'Removed',
        age: 8,
        deletedAt: Date.now(),
      })
      return { stableId }
    })
    const { stableId } = fixture
    const owner = t.withIdentity({ subject: 'owner' })
    const member = t.withIdentity({ subject: 'member' })
    const status = await owner.query(api.stableSetup.get, { stableId })
    expect(
      status?.steps.filter((step) => step.complete).map((step) => step.id),
    ).toEqual(['contact', 'team'])
    expect(await member.query(api.stableSetup.get, { stableId })).toBeNull()
    await expect(
      member.mutation(api.stableSetup.dismissPrompt, { stableId }),
    ).rejects.toThrow('Not authorized')
    await owner.mutation(api.stableSetup.dismissPrompt, { stableId })
    const after = await owner.query(api.stableSetup.get, { stableId })
    expect(after?.dismissed).toBe(true)
    expect(after?.steps).toEqual(status?.steps)
  })
})
