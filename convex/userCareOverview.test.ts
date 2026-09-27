import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

describe('care overview attention coverage', () => {
  it('retains high-severity targets beyond the ranked preview without broadening access or returning deleted horses', async () => {
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
      const outsiderId = await ctx.db.insert('users', {
        clerkId: 'outsider',
        email: 'outsider@example.com',
        firstName: 'Outsider',
        createdAt: now,
        updatedAt: now,
      })
      const stableId = await ctx.db.insert('stables', {
        ownerId,
        name: 'Sample yard',
        location: 'Warsaw',
      })
      const privateStableId = await ctx.db.insert('stables', {
        ownerId: outsiderId,
        name: 'Private yard',
        location: 'Warsaw',
      })
      for (let index = 0; index < 8; index++) {
        const horseId = await ctx.db.insert('horses', {
          stableId,
          ownerId,
          name: `Reminder horse ${index}`,
          age: 9,
        })
        for (let reminder = 0; reminder < 2; reminder++) {
          await ctx.db.insert('careReminders', {
            stableId,
            horseId,
            title: 'Overdue sample',
            category: 'farrier',
            dueDate: '2026-09-01',
            status: 'pending',
            createdBy: ownerId,
            createdAt: now,
            updatedAt: now,
          })
        }
      }
      const highHorseId = await ctx.db.insert('horses', {
        stableId,
        ownerId,
        name: 'High-severity horse ranked ninth',
        age: 9,
      })
      const routineHorseId = await ctx.db.insert('horses', {
        stableId,
        ownerId,
        name: 'Routine horse beyond preview',
        age: 9,
      })
      const deletedHorseId = await ctx.db.insert('horses', {
        stableId,
        ownerId,
        name: 'Deleted horse',
        age: 9,
        deletedAt: now,
      })
      const privateHorseId = await ctx.db.insert('horses', {
        stableId: privateStableId,
        ownerId: outsiderId,
        name: 'Private horse',
        age: 9,
      })
      for (const horseId of [
        highHorseId,
        routineHorseId,
        deletedHorseId,
        privateHorseId,
      ]) {
        await ctx.db.insert('horseHealthIssues', {
          horseId,
          stableId: horseId === privateHorseId ? privateStableId : stableId,
          title: 'Sample health issue',
          severity: horseId === routineHorseId ? 'low' : 'high',
          status: 'active',
          notedAt: now,
          createdBy: ownerId,
          createdAt: now,
          updatedAt: now,
        })
      }
      return {
        stableId,
        highHorseId,
        routineHorseId,
        deletedHorseId,
        privateHorseId,
      }
    })
    const result = await t
      .withIdentity({ subject: 'owner', email: 'owner@example.com' })
      .query(api.userCareOverview.getForCurrentUser, { today: '2026-09-19' })
    expect(result.summary.highSeverityIssueCount).toBe(1)
    expect(result.summary.dueReminderCount).toBe(16)
    expect(result.dueReminders).toHaveLength(8)
    expect(result.attentionHorses).toHaveLength(9)
    expect(result.attentionHorses[8]).toMatchObject({
      horseId: fixture.highHorseId,
      stableId: fixture.stableId,
      highIssueCount: 1,
    })
    const returnedIds = result.attentionHorses.map((horse) => horse.horseId)
    for (const id of [
      fixture.routineHorseId,
      fixture.deletedHorseId,
      fixture.privateHorseId,
    ])
      expect(returnedIds).not.toContain(id)
  })
})
