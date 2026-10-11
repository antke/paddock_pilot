import { describe, expect, it } from 'vitest'
import { convexTest } from 'convex-test'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
async function fixture() {
  const t = convexTest(schema, modules)
  const ids = await t.run(async (ctx) => {
    const now = Date.now()
    const people = await Promise.all(
      ['owner', 'member', 'other', 'outsider'].map((clerkId) =>
        ctx.db.insert('users', {
          clerkId,
          email: `${clerkId}@example.com`,
          firstName: clerkId,
          phone: 'private',
          createdAt: now,
          updatedAt: now,
        }),
      ),
    )
    const [ownerId, memberId, otherId, outsiderId] = people
    const stableId = await ctx.db.insert('stables', {
      ownerId,
      name: 'Yard',
      location: 'Warsaw',
    })
    const memberMembershipId = await ctx.db.insert('stableMembers', {
      stableId,
      userId: memberId,
      role: 'member',
    })
    await ctx.db.insert('stableMembers', {
      stableId,
      userId: otherId,
      role: 'member',
    })
    const horseId = await ctx.db.insert('horses', {
      stableId,
      ownerId: memberId,
      name: 'Milo',
      age: 8,
    })
    return {
      ownerId,
      memberId,
      otherId,
      outsiderId,
      stableId,
      horseId,
      memberMembershipId,
    }
  })
  const owner = t.withIdentity({ subject: 'owner' })
  const member = t.withIdentity({ subject: 'member' })
  const other = t.withIdentity({ subject: 'other' })
  const input = {
    stableId: ids.stableId,
    title: 'Farrier',
    category: 'farrier' as const,
    dueDate: '2026-10-01',
  }
  return { t, ...ids, owner, member, other, input }
}

describe('reminder responsibility and correction', () => {
  it('lets only a manager delegate, and an active assignee complete without gaining edit rights', async () => {
    const f = await fixture()
    const id = await f.owner.mutation(api.careReminders.add, {
      ...f.input,
      assignedTo: f.memberId,
    })
    const item = await f.member.query(api.careReminders.get, {
      stableId: f.stableId,
      id,
    })
    expect(item).toMatchObject({
      canManage: false,
      canComplete: true,
      assigneeName: 'member',
    })
    await expect(
      f.member.mutation(api.careReminders.update, {
        id,
        title: 'Changed',
        category: 'farrier',
        dueDate: '2026-10-03',
        assignedTo: f.otherId,
      }),
    ).rejects.toThrow('Not authorized')
    await expect(
      f.other.mutation(api.careReminders.complete, { id }),
    ).rejects.toThrow('Not authorized')
    await expect(
      f.member.mutation(api.careReminders.complete, {
        id,
        nextDueDate: '2026-11-01',
      }),
    ).rejects.toThrow('Not authorized')
    await f.member.mutation(api.careReminders.complete, { id })
    const done = await f.member.query(api.careReminders.get, {
      stableId: f.stableId,
      id,
    })
    expect(done).toMatchObject({
      completedByName: 'member',
      canReopen: true,
      reminder: { status: 'completed', completedBy: f.memberId },
    })
    await f.member.mutation(api.careReminders.reopen, { id })
    expect(await f.t.run((ctx) => ctx.db.get(id))).toMatchObject({
      status: 'pending',
    })
    await f.t.run((ctx) => ctx.db.delete(f.memberMembershipId))
    await expect(
      f.member.mutation(api.careReminders.complete, { id }),
    ).rejects.toThrow('Not authorized')
  })

  it('validates assignee membership and exposes names without private contact data', async () => {
    const f = await fixture()
    await expect(
      f.owner.mutation(api.careReminders.add, {
        ...f.input,
        assignedTo: f.outsiderId,
      }),
    ).rejects.toThrow('Not authorized')
    const options = await f.member.query(api.careReminders.assigneeOptions, {
      stableId: f.stableId,
    })
    expect(options).toHaveLength(3)
    expect(
      options.every(
        (person) => Object.keys(person).sort().join(',') === 'id,name',
      ),
    ).toBe(true)
    await f.t.run((ctx) =>
      ctx.db.insert('horseCarers', {
        horseId: f.horseId,
        userId: f.otherId,
        role: 'editor',
        invitedBy: f.memberId,
        createdAt: Date.now(),
      }),
    )
    const id = await f.member.mutation(api.careReminders.add, {
      ...f.input,
      horseId: f.horseId,
      assignedTo: f.otherId,
    })
    await f.other.mutation(api.careReminders.complete, { id })
    expect(
      (
        await f.member.query(api.careReminders.listForHorse, {
          horseId: f.horseId,
        })
      ).items?.[0],
    ).toMatchObject({ canManage: true, completedByName: 'other' })
  })

  it('preserves completion history and creates one follow-up across retries and reopening', async () => {
    const f = await fixture()
    const id = await f.owner.mutation(api.careReminders.add, {
      ...f.input,
      assignedTo: f.memberId,
    })
    const followUp = await f.owner.mutation(api.careReminders.complete, {
      id,
      nextDueDate: '2026-11-01',
    })
    const done = await f.t.run((ctx) => ctx.db.get(id))
    expect(
      await f.owner.mutation(api.careReminders.complete, {
        id,
        nextDueDate: '2026-12-01',
      }),
    ).toBe(followUp)
    expect(await f.t.run((ctx) => ctx.db.get(id))).toEqual(done)
    await f.owner.mutation(api.careReminders.update, {
      id,
      title: 'Farrier notes updated',
      category: 'farrier',
      dueDate: '2026-10-01',
      assignedTo: f.memberId,
    })
    expect(await f.t.run((ctx) => ctx.db.get(id))).toMatchObject({
      status: 'completed',
      completedBy: done?.completedBy,
      completedAt: done?.completedAt,
    })

    expect(await f.t.run((ctx) => ctx.db.get(followUp!))).toMatchObject({
      status: 'pending',
      dueDate: '2026-11-01',
      assignedTo: f.memberId,
    })
    await f.owner.mutation(api.careReminders.reopen, { id })
    await f.owner.mutation(api.careReminders.complete, {
      id,
      nextDueDate: '2027-01-01',
    })
    expect(
      await f.t.run((ctx) => ctx.db.query('careReminders').collect()),
    ).toHaveLength(2)
  })

  it('preserves event linkage and member event-creator edit access on follow-up care', async () => {
    const f = await fixture()
    const eventId = await f.t.run((ctx) =>
      ctx.db.insert('events', {
        stableId: f.stableId,
        createdBy: f.memberId,
        horseIds: [],
        type: 'vet',
        title: 'Yard vet visit',
        date: '2026-10-01',
        time: '10:00',
      }),
    )
    const id = await f.member.mutation(api.careReminders.add, {
      ...f.input,
      eventId,
    })
    const followUpId = await f.member.mutation(api.careReminders.complete, {
      id,
      nextDueDate: '2026-11-01',
    })
    expect(followUpId).toBeTruthy()
    expect(
      await f.member.query(api.careReminders.get, {
        stableId: f.stableId,
        id: followUpId!,
      }),
    ).toMatchObject({
      canManage: true,
      reminder: { eventId, status: 'pending', dueDate: '2026-11-01' },
    })
    await f.member.mutation(api.careReminders.update, {
      id: followUpId!,
      eventId,
      title: 'Book the next vet review',
      category: 'vet',
      dueDate: '2026-11-04',
    })
    expect(await f.t.run((ctx) => ctx.db.get(followUpId!))).toMatchObject({
      eventId,
      title: 'Book the next vet review',
      dueDate: '2026-11-04',
    })
    await expect(
      f.other.mutation(api.careReminders.update, {
        id: followUpId!,
        eventId,
        title: 'Unauthorized edit',
        category: 'vet',
        dueDate: '2026-11-05',
      }),
    ).rejects.toThrow('Not authorized')
  })

  it('reschedules, reopens dismissed work, rejects impossible dates, and scopes selected links', async () => {
    const f = await fixture()
    const id = await f.owner.mutation(api.careReminders.add, f.input)
    await f.owner.mutation(api.careReminders.update, {
      id,
      title: 'Book visit',
      category: 'vet',
      dueDate: '2026-12-01',
    })
    await expect(
      f.owner.mutation(api.careReminders.complete, {
        id,
        nextDueDate: '2027-02-30',
      }),
    ).rejects.toThrow('valid date')
    await expect(
      f.owner.mutation(api.careReminders.add, {
        ...f.input,
        dueDate: '2026-02-30',
      }),
    ).rejects.toThrow('valid due date')
    await f.owner.mutation(api.careReminders.dismiss, { id })
    await f.owner.mutation(api.careReminders.reopen, { id })
    expect(
      await f.owner.query(api.careReminders.get, { stableId: f.stableId, id }),
    ).toMatchObject({
      reminder: {
        status: 'pending',
        title: 'Book visit',
        dueDate: '2026-12-01',
      },
    })
    expect(
      await f.owner.query(api.careReminders.get, {
        stableId: f.stableId,
        id: 'bad-id',
      }),
    ).toBeNull()
    const otherStableId = await f.t.run((ctx) =>
      ctx.db.insert('stables', {
        ownerId: f.ownerId,
        name: 'Other',
        location: 'Warsaw',
      }),
    )
    expect(
      await f.owner.query(api.careReminders.get, {
        stableId: otherStableId,
        id,
      }),
    ).toBeNull()
    const list = await f.owner.query(api.careReminders.listForStablePaginated, {
      stableId: f.stableId,
      state: 'pending',
      paginationOpts: { numItems: 30, cursor: null },
    })
    expect(list.page.map((item) => item.reminder._id)).toEqual([id])
    await f.owner.mutation(api.careReminders.dismiss, { id })
    const outstanding = await f.owner.query(
      api.careReminders.listForStablePaginated,
      {
        stableId: f.stableId,
        state: 'pending',
        paginationOpts: { numItems: 1, cursor: null },
      },
    )
    expect(outstanding.page).toEqual([])
    // A dashboard link is resolved independently of the default page/filter.
    expect(
      await f.owner.query(api.careReminders.get, { stableId: f.stableId, id }),
    ).toMatchObject({ reminder: { status: 'dismissed' } })
  })
})
