import { describe, expect, it } from 'vitest'
import { convexTest } from 'convex-test'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
describe('medication completion chronology', () => {
  it('leaves a future course active when the requested completion precedes its start', async () => {
    const t = convexTest(schema, modules)
    const fixture = await t.run(async (ctx) => {
      const now = Date.now()
      const ownerId = await ctx.db.insert('users', {
        clerkId: 'owner',
        email: 'owner@example.com',
        firstName: 'Owner',
        createdAt: now,
        updatedAt: now,
      })
      const stableId = await ctx.db.insert('stables', {
        ownerId,
        name: 'Sample yard',
        location: 'Warsaw',
      })
      const horseId = await ctx.db.insert('horses', {
        ownerId,
        stableId,
        name: 'Juniper',
        age: 9,
      })
      const id = await ctx.db.insert('horseMedicationRecords', {
        horseId,
        stableId,
        createdBy: ownerId,
        createdAt: now,
        updatedAt: now,
        medicationName: 'Sample course',
        dosage: 'As prescribed',
        startDate: '2099-01-01',
        status: 'active',
      })
      return { id }
    })
    const owner = t.withIdentity({
      subject: 'owner',
      email: 'owner@example.com',
    })
    await expect(
      owner.mutation(api.horseMedicationRecords.complete, {
        id: fixture.id,
        endDate: '2098-12-31',
      }),
    ).rejects.toThrow('before its start date')
    expect(await t.run((ctx) => ctx.db.get(fixture.id))).toMatchObject({
      status: 'active',
      startDate: '2099-01-01',
    })
    await owner.mutation(api.horseMedicationRecords.complete, {
      id: fixture.id,
      endDate: '2099-01-01',
    })
    expect(await t.run((ctx) => ctx.db.get(fixture.id))).toMatchObject({
      status: 'completed',
      endDate: '2099-01-01',
    })
  })
})
