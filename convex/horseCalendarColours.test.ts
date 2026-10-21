import { expect, it } from 'vitest'
import { convexTest } from 'convex-test'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
it.each(['violet', '#a23bc4'])(
  'saves shared colours, preserves them on unrelated edits and exposes only authorised roster identity (%s)',
  async (chosen) => {
    const t = convexTest(schema, modules)
    const { stableId } = await t.run(async (ctx) => {
      const user = (clerkId: string) =>
        ctx.db.insert('users', {
          clerkId,
          email: `${clerkId}@example.com`,
          firstName: clerkId,
          createdAt: 0,
          updatedAt: 0,
        })
      const ownerId = await user('owner')
      const memberId = await user('member')
      await user('outsider')
      const yardId = await ctx.db.insert('stables', {
        name: 'Yard',
        location: 'Warsaw',
        ownerId,
      })
      await ctx.db.insert('stableMembers', {
        stableId: yardId,
        userId: memberId,
        role: 'member',
      })
      return { stableId: yardId }
    })
    const owner = t.withIdentity({ subject: 'owner' })
    const member = t.withIdentity({ subject: 'member' })
    const outsider = t.withIdentity({ subject: 'outsider' })
    const input = {
      name: 'Zapi',
      ownerName: 'Owner',
      age: 8,
      stableId,
      color: 'Bay',
      emergencyNotes: 'Private medical notes',
    }
    const id = await owner.mutation(api.horses.add, input)
    await expect(
      owner.mutation(api.horses.add, {
        ...input,
        calendarColourId: 'url(https://example.com)',
      }),
    ).rejects.toThrow()
    const second = await owner.mutation(api.horses.add, {
      ...input,
      name: 'Luna',
    })
    const firstColour = (await owner.query(api.horses.get, { id }))!
      .calendarColourId
    expect(firstColour).toBeTruthy()
    expect(
      (await owner.query(api.horses.get, { id: second }))!.calendarColourId,
    ).not.toBe(firstColour)
    await owner.mutation(api.horses.update, {
      id,
      name: 'Zapi',
      ownerName: 'Owner',
      age: 9,
      color: 'Bay',
      calendarColourId: chosen,
    })
    await owner.mutation(api.horses.update, {
      id,
      name: 'Zapi',
      ownerName: 'Owner',
      age: 10,
      color: 'Bay',
    })
    expect(await owner.query(api.horses.get, { id })).toMatchObject({
      calendarColourId: chosen.startsWith('#') ? chosen.toUpperCase() : chosen,
      color: 'Bay',
    })
    const roster = await member.query(api.horses.calendarRoster, {})
    expect(roster.find((horse) => horse._id === id)).toMatchObject({
      name: 'Zapi',
      calendarColourId: chosen.startsWith('#') ? chosen.toUpperCase() : chosen,
    })
    expect(roster[0]).not.toHaveProperty('emergencyNotes')
    expect(roster[0]).not.toHaveProperty('ownerId')
    expect(await outsider.query(api.horses.calendarRoster, {})).toEqual([])
    expect(
      (await member.query(api.horses.list, { stableId })).find(
        (horse) => horse._id === id,
      )?.calendarColourId,
    ).toBe(chosen.startsWith('#') ? chosen.toUpperCase() : chosen)
    expect(
      (
        await member.query(api.training.listForStable, { stableId })
      ).horses.find((horse) => horse._id === id)?.calendarColourId,
    ).toBe(chosen.startsWith('#') ? chosen.toUpperCase() : chosen)
    await expect(
      member.mutation(api.horses.update, {
        id,
        name: 'Zapi',
        ownerName: 'Owner',
        age: 10,
        calendarColourId: 'rose',
      }),
    ).rejects.toThrow()
  },
)
