import { beforeEach, describe, expect, it, vi } from 'vitest'
import { convexTest } from 'convex-test'
import type { TestConvex } from 'convex-test'
import schema from './schema'
import { api, internal } from './_generated/api'

const modules = import.meta.glob('./**/*.ts')
const identity = (name: string) => ({
  subject: name,
  email: `${name}@example.com`,
  emailVerified: true,
})

describe('independent horse ownership', () => {
  let t: TestConvex<typeof schema>
  beforeEach(() => {
    t = convexTest(schema, modules)
  })
  async function fixture() {
    const admin = t.withIdentity(identity('admin'))
    const owner = t.withIdentity(identity('owner'))
    const viewer = t.withIdentity(identity('viewer'))
    const member = t.withIdentity(identity('member'))
    for (const client of [admin, owner, viewer, member])
      await client.mutation(api.users.ensureCurrentUser, {})
    const ownerId = (await owner.query(api.users.getCurrentUser))!._id
    const memberId = (await member.query(api.users.getCurrentUser))!._id
    const stableId = await admin.mutation(api.stables.add, {
      name: 'Willow',
      location: 'Warsaw',
    })
    await t.run(async (ctx) => {
      await ctx.db.insert('stableMembers', {
        userId: ownerId,
        stableId,
        role: 'member',
      })
      await ctx.db.insert('stableMembers', {
        userId: memberId,
        stableId,
        role: 'member',
      })
    })
    const horseId = await owner.mutation(api.horses.add, {
      name: 'Juniper',
      age: 8,
    })
    return { admin, owner, viewer, member, ownerId, stableId, horseId }
  }
  it('supports personal horses and records without a stable', async () => {
    const { owner, horseId } = await fixture()
    await owner.mutation(api.horseWeightRecords.add, {
      horseId,
      weight: 510,
      unit: 'kg',
      measuredAt: Date.now(),
    })
    const horse = await owner.query(api.horses.get, { id: horseId })
    expect(horse?.stableId).toBeUndefined()
    expect(
      await owner.query(api.horseWeightRecords.listForHorse, { horseId }),
    ).toHaveLength(1)
    expect(await owner.query(api.horses.listMine)).toHaveLength(1)
    await owner.mutation(api.events.add, {
      horseIds: [horseId],
      title: 'Personal vet visit',
      date: '2027-01-02',
      time: '10:00',
      type: 'vet',
      description: 'Bring the last blood results',
      notesAfterCompletion: 'Results reviewed',
      totalCost: 250,
    })
    expect(
      await owner.query(api.events.listForHorse, { horseId }),
    ).toMatchObject([
      {
        description: 'Bring the last blood results',
        notesAfterCompletion: 'Results reviewed',
        totalCost: 250,
      },
    ])
  })
  it('limits admins to their stable records and denies private history to members', async () => {
    const { owner, admin, member, horseId, stableId } = await fixture()
    await owner.mutation(api.horseTransitions.connect, { horseId, stableId })
    const personalId = await owner.mutation(api.horseWeightRecords.add, {
      horseId,
      weight: 510,
      unit: 'kg',
      measuredAt: Date.now(),
    })
    const stableRecordId = await admin.mutation(api.horseWeightRecords.add, {
      horseId,
      weight: 520,
      unit: 'kg',
      measuredAt: Date.now(),
    })
    expect(
      await admin.query(api.horseWeightRecords.listForHorse, { horseId }),
    ).toHaveLength(2)
    await expect(
      admin.mutation(api.horseWeightRecords.remove, { id: personalId }),
    ).rejects.toThrow()
    await admin.mutation(api.horseWeightRecords.remove, { id: stableRecordId })
    await expect(
      admin.mutation(api.horses.update, {
        id: horseId,
        name: 'Changed',
        age: 8,
      }),
    ).rejects.toThrow()
    await expect(
      member.query(api.horseWeightRecords.listForHorse, { horseId }),
    ).rejects.toThrow()
    await expect(
      member.query(api.horses.get, { id: horseId }),
    ).rejects.toThrow()
    expect(
      await member.query(api.horses.getPermissions, { id: horseId }),
    ).toBeNull()
    const roster = await member.query(api.horses.list, { stableId })
    expect(roster[0].name).toBe('Juniper')
    expect(roster[0].nutritionNotes).toBeUndefined()
  })
  it('accepts viewer and editor carers without stable membership and revokes access', async () => {
    const { owner, viewer, horseId } = await fixture()
    const id = await owner.mutation(api.horseCollaboration.invite, {
      horseId,
      email: 'viewer@example.com',
      kind: 'carer',
      role: 'viewer',
    })
    const invitation = await t.run((ctx) => ctx.db.get(id))
    await viewer.mutation(api.horseCollaboration.respond, {
      token: invitation!.token,
      accept: true,
    })
    expect(await viewer.query(api.horses.get, { id: horseId })).not.toBeNull()
    await expect(
      viewer.mutation(api.horseWeightRecords.add, {
        horseId,
        weight: 500,
        unit: 'kg',
        measuredAt: Date.now(),
      }),
    ).rejects.toThrow()
    const management = await owner.query(api.horseCollaboration.management, {
      horseId,
    })
    await owner.mutation(api.horseCollaboration.updateCarer, {
      id: management.carers[0]._id,
      role: 'editor',
    })
    await viewer.mutation(api.horseWeightRecords.add, {
      horseId,
      weight: 500,
      unit: 'kg',
      measuredAt: Date.now(),
    })
    await expect(
      viewer.mutation(api.horseCollaboration.invite, {
        horseId,
        email: 'member@example.com',
        kind: 'carer',
        role: 'viewer',
      }),
    ).rejects.toThrow()
    await owner.mutation(api.horseCollaboration.updateCarer, {
      id: management.carers[0]._id,
    })
    await expect(
      viewer.query(api.horses.get, { id: horseId }),
    ).rejects.toThrow()
  })
  it('retains only originating stable records while preserving the complete personal history', async () => {
    vi.useFakeTimers()
    try {
      const { owner, admin, horseId, stableId } = await fixture()
      await owner.mutation(api.horseTransitions.connect, { horseId, stableId })
      await owner.mutation(api.horseWeightRecords.add, {
        horseId,
        weight: 500,
        unit: 'kg',
        measuredAt: Date.now(),
      })
      await admin.mutation(api.horseWeightRecords.add, {
        horseId,
        weight: 510,
        unit: 'kg',
        measuredAt: Date.now(),
      })
      const preview = await owner.query(api.horseTransitions.preview, {
        horseId,
      })
      await owner.mutation(api.horseTransitions.depart, {
        horseId,
        revision: preview.revision,
        carryReminderIds: [],
      })
      await t.finishAllScheduledFunctions(vi.runAllTimers)
      expect(
        (await owner.query(api.horses.get, { id: horseId }))?.stableId,
      ).toBeUndefined()
      expect(
        await owner.query(api.horseWeightRecords.listForHorse, { horseId }),
      ).toHaveLength(2)
      await expect(
        admin.query(api.horseWeightRecords.listForHorse, { horseId }),
      ).rejects.toThrow()
      const snapshots = (
        await admin.query(api.horseTransitions.stableHistory, {
          stableId,
          paginationOpts: { numItems: 100, cursor: null },
        })
      ).page
      expect(
        snapshots.filter((s) => s.kind === 'horseWeightRecords'),
      ).toHaveLength(1)
      expect(snapshots[0].data.weight).toBe(510)
    } finally {
      vi.useRealTimers()
    }
  })
  it('claims the same horse and grants explicit membership', async () => {
    const { admin, viewer, stableId } = await fixture()
    const horseId = await admin.mutation(api.horseCollaboration.addUnclaimed, {
      name: 'Ash',
      age: 7,
      stableId,
    })
    const id = await admin.mutation(api.horseCollaboration.invite, {
      horseId,
      kind: 'claim',
      email: 'viewer@example.com',
    })
    const invitation = await t.run((ctx) => ctx.db.get(id))
    expect(
      await viewer.mutation(api.horseCollaboration.respond, {
        token: invitation!.token,
        accept: true,
      }),
    ).toBe(horseId)
    const horse = await viewer.query(api.horses.get, { id: horseId })
    expect(horse?.ownerId).toBe(
      (await viewer.query(api.users.getCurrentUser))?._id,
    )
    expect(horse?.custodianStableId).toBeUndefined()
    expect(await viewer.query(api.stables.list)).toHaveLength(1)
  })
  it('transfers personal ownership only on acceptance and blocks previous owner access', async () => {
    const { owner, viewer, horseId } = await fixture()
    const id = await owner.mutation(api.horseCollaboration.invite, {
      horseId,
      kind: 'transfer',
      email: 'viewer@example.com',
    })
    const invitation = await t.run((ctx) => ctx.db.get(id))
    await expect(
      viewer.query(api.horses.get, { id: horseId }),
    ).rejects.toThrow()
    await viewer.mutation(api.horseCollaboration.respond, {
      token: invitation!.token,
      accept: true,
    })
    await expect(owner.query(api.horses.get, { id: horseId })).rejects.toThrow()
    expect(
      await viewer.mutation(api.horseCollaboration.respond, {
        token: invitation!.token,
        accept: true,
      }),
    ).toBe(horseId)
  })
  it('does not automatically give a stable admin ownership when an owner deletes their account', async () => {
    const { owner, admin, horseId, stableId, ownerId } = await fixture()
    await owner.mutation(api.horseTransitions.connect, { horseId, stableId })
    await t.mutation(internal.users.deleteUser, { clerkId: 'owner' })
    const horse = await t.run((ctx) => ctx.db.get(horseId))
    expect(horse?.ownerId).toBe(ownerId)
    expect(horse?.deletedAt).toEqual(expect.any(Number))
    await expect(
      admin.mutation(api.horses.restoreHorse, { id: horseId }),
    ).rejects.toThrow()
  })
  it('requires fresh departure review and locks edits until paginated snapshots finish', async () => {
    vi.useFakeTimers()
    try {
      const f = await fixture()
      await f.owner.mutation(api.horseTransitions.connect, {
        horseId: f.horseId,
        stableId: f.stableId,
      })
      const before = await f.owner.query(api.horseTransitions.preview, {
        horseId: f.horseId,
      })
      const taskId = await f.admin.mutation(api.careReminders.add, {
        stableId: f.stableId,
        horseId: f.horseId,
        title: 'Check feet',
        category: 'farrier',
        dueDate: '2027-01-01',
      })
      await expect(
        f.owner.mutation(api.horseTransitions.depart, {
          horseId: f.horseId,
          revision: before.revision,
          carryReminderIds: [],
        }),
      ).rejects.toThrow('Review departure again')
      for (let i = 0; i < 55; i++)
        await f.admin.mutation(api.horseWeightRecords.add, {
          horseId: f.horseId,
          weight: 500 + i,
          unit: 'kg',
          measuredAt: Date.now(),
        })
      const preview = await f.owner.query(api.horseTransitions.preview, {
        horseId: f.horseId,
      })
      const transition = await f.owner.mutation(api.horseTransitions.depart, {
        horseId: f.horseId,
        revision: preview.revision,
        carryReminderIds: [taskId],
      })
      await expect(
        f.owner.mutation(api.horseWeightRecords.add, {
          horseId: f.horseId,
          weight: 500,
          unit: 'kg',
          measuredAt: Date.now(),
        }),
      ).rejects.toThrow()
      await t.finishAllScheduledFunctions(vi.runAllTimers)
      await t.mutation(internal.horseTransitions.advance, { id: transition })
      const snapshots = (
        await f.admin.query(api.horseTransitions.stableHistory, {
          stableId: f.stableId,
          paginationOpts: { numItems: 100, cursor: null },
        })
      ).page
      expect(
        snapshots.filter((r) => r.kind === 'horseWeightRecords'),
      ).toHaveLength(55)
      const tasks = (
        await f.owner.query(api.careReminders.listForHorse, {
          horseId: f.horseId,
        })
      ).reminders
      expect(tasks.filter((r) => r.status === 'pending')).toMatchObject([
        { assignedTo: f.ownerId },
      ])
      expect(
        tasks.find((r) => r.status === 'pending')?.stableId,
      ).toBeUndefined()
      expect(tasks.find((r) => r._id === taskId)?.status).toBe('dismissed')
    } finally {
      vi.useRealTimers()
    }
  })
  it('keeps personal care visible in dashboards and digest without leaking it to stable members', async () => {
    const f = await fixture()
    await f.owner.mutation(api.careReminders.add, {
      horseId: f.horseId,
      title: 'Private task',
      category: 'other',
      dueDate: '2026-10-01',
    })
    const summary = await f.owner.query(
      api.userCareOverview.getForCurrentUser,
      { today: '2026-10-05' },
    )
    expect(summary.summary.horseCount).toBe(1)
    expect(summary.dueReminders.map((r) => r.title)).toContain('Private task')
    await f.owner.mutation(api.horseTransitions.connect, {
      horseId: f.horseId,
      stableId: f.stableId,
    })
    const unrelated = await f.member.query(
      api.userCareOverview.getForCurrentUser,
      { today: '2026-10-05' },
    )
    expect(unrelated.dueReminders).toHaveLength(0)
    expect(unrelated.summary.horseCount).toBe(0)
    const { getReminderDigestStables } =
      await import('./libs/email/reminderDigest')
    const digest = await t.run(async (ctx) =>
      getReminderDigestStables(
        ctx,
        (await ctx.db.get(f.ownerId))!,
        '2026-10-05',
      ),
    )
    expect(digest).toMatchObject([{ count: 1 }])
    expect(digest[0].stableId).toBeUndefined()
  })
  it('keeps shared event details private and preserves recurring history after departure', async () => {
    vi.useFakeTimers()
    try {
      const f = await fixture()
      await f.owner.mutation(api.horseTransitions.connect, {
        horseId: f.horseId,
        stableId: f.stableId,
      })
      const eventId = await f.admin.mutation(api.events.add, {
        stableId: f.stableId,
        horseIds: [f.horseId],
        type: 'vet',
        title: 'Weekly care',
        date: '2026-01-01',
        time: '10:00',
        notesAfterCompletion: 'Shared private notes',
        recurrence: { frequency: 'daily', interval: 1 },
      })
      const row = (await f.owner.query(api.events.getWithHorses, {
        id: eventId,
      }))!.eventHorses[0]
      await f.owner.mutation(api.eventHorseDetails.update, {
        id: row._id,
        completionNotes: 'Horse-only clinical note',
      })
      const member = await f.member.query(api.events.getWithHorses, {
        id: eventId,
      })
      expect(member?.event.notesAfterCompletion).toBeUndefined()
      expect(member?.eventHorses[0].completionNotes).toBeUndefined()
      expect(
        (await f.member.query(api.eventHorseDetails.listForEvent, { eventId }))
          .rows,
      ).toHaveLength(0)
      const preview = await f.owner.query(api.horseTransitions.preview, {
        horseId: f.horseId,
      })
      await f.owner.mutation(api.horseTransitions.depart, {
        horseId: f.horseId,
        revision: preview.revision,
        carryReminderIds: [],
      })
      await t.finishAllScheduledFunctions(vi.runAllTimers)
      await t.run((ctx) =>
        ctx.db.patch(eventId, {
          title: 'Changed after departure',
          notesAfterCompletion: 'New stable private notes',
        }),
      )
      const events = await f.owner.query(api.events.listForHorse, {
        horseId: f.horseId,
      })
      expect(events[0].title).toBe('Weekly care')
      expect(events[0].notesAfterCompletion).toBe('Horse-only clinical note')
      expect(events[0].recurrence?.end).toMatchObject({ type: 'on_date' })
      const detail = await f.owner.query(api.events.getWithHorses, {
        id: eventId,
        horseId: f.horseId,
      })
      expect(detail?.event.title).toBe('Weekly care')
      await expect(
        f.admin.mutation(api.eventHorseDetails.update, {
          id: row._id,
          completionNotes: 'Changed',
        }),
      ).rejects.toThrow()
    } finally {
      vi.useRealTimers()
    }
  })
  it('permits editor carer personal events while preventing access to another horse', async () => {
    const f = await fixture()
    const invitationId = await f.owner.mutation(api.horseCollaboration.invite, {
      horseId: f.horseId,
      email: 'viewer@example.com',
      kind: 'carer',
      role: 'editor',
    })
    const invitation = await t.run((ctx) => ctx.db.get(invitationId))
    await f.viewer.mutation(api.horseCollaboration.respond, {
      token: invitation!.token,
      accept: true,
    })
    const eventId = await f.viewer.mutation(api.events.add, {
      horseIds: [f.horseId],
      type: 'vet',
      title: 'Home visit',
      date: '2027-01-01',
      time: '10:00',
    })
    expect(
      (await f.owner.query(api.events.getPermissions, { id: eventId }))
        ?.canManageEvent,
    ).toBe(true)
    await expect(
      f.member.query(api.events.get, { id: eventId }),
    ).rejects.toThrow()
    const otherHorse = await f.member.mutation(api.horses.add, {
      name: 'Other horse',
      age: 9,
    })
    await expect(
      f.viewer.mutation(api.events.add, {
        horseIds: [f.horseId, otherHorse],
        type: 'vet',
        title: 'Not allowed',
        date: '2027-01-01',
        time: '10:00',
      }),
    ).rejects.toThrow()
  })
  it('revokes live document access on departure and retains stable files through horse purge', async () => {
    vi.useFakeTimers()
    try {
      const f = await fixture()
      await f.owner.mutation(api.horseTransitions.connect, {
        horseId: f.horseId,
        stableId: f.stableId,
      })
      const storageId = await t.run((ctx) =>
        ctx.storage.store(
          new Blob(['Stable clinical document'], { type: 'text/plain' }),
        ),
      )
      const documentId = await f.admin.mutation(api.stableDocuments.add, {
        horseId: f.horseId,
        type: 'other',
        fileName: 'clinical.txt',
        storageId,
      })
      expect(
        (
          await f.admin.query(api.stableDocuments.authorizeDownload, {
            id: documentId,
          })
        ).storageId,
      ).toBe(storageId)
      await f.owner.mutation(api.horses.deleteHorse, { id: f.horseId })
      await t.finishAllScheduledFunctions(vi.runAllTimers)
      await expect(
        f.admin.query(api.stableDocuments.authorizeDownload, {
          id: documentId,
        }),
      ).rejects.toThrow()
      const snapshot = (
        await f.admin.query(api.horseTransitions.stableHistory, {
          stableId: f.stableId,
          paginationOpts: { numItems: 100, cursor: null },
        })
      ).page.find((r) => r.kind === 'stableDocuments')!
      vi.advanceTimersByTime(15 * 86400000)
      await t.mutation(internal.horses.purgeExpiredDeletedHorses, {})
      expect(await t.run((ctx) => ctx.db.get(f.horseId))).toBeNull()
      expect(
        (
          await f.admin.query(api.stableDocuments.authorizeDownload, {
            id: snapshot._id,
          })
        ).storageId,
      ).toBe(storageId)
      expect(
        await t.run(async (ctx) => (await ctx.storage.get(storageId)) !== null),
      ).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })
  it('rejects invitation forwarding, expiration and stale ownership', async () => {
    const f = await fixture()
    const id = await f.owner.mutation(api.horseCollaboration.invite, {
      horseId: f.horseId,
      email: 'viewer@example.com',
      kind: 'transfer',
    })
    const invite = (await t.run((ctx) => ctx.db.get(id)))!
    await expect(
      f.member.mutation(api.horseCollaboration.respond, {
        token: invite.token,
        accept: true,
      }),
    ).rejects.toThrow('not addressed')
    await t.run((ctx) => ctx.db.patch(id, { expiresAt: 1 }))
    await expect(
      f.viewer.mutation(api.horseCollaboration.respond, {
        token: invite.token,
        accept: true,
      }),
    ).rejects.toThrow('no longer available')
  })
  it('restores an unclaimed horse to a new custodian placement after archive', async () => {
    vi.useFakeTimers()
    try {
      const f = await fixture()
      const horseId = await f.admin.mutation(
        api.horseCollaboration.addUnclaimed,
        { stableId: f.stableId, name: 'Ash', age: 7 },
      )
      const original = (await t.run((ctx) => ctx.db.get(horseId)))!
        .currentPlacementId
      await f.admin.mutation(api.horses.deleteHorse, { id: horseId })
      await t.finishAllScheduledFunctions(vi.runAllTimers)
      expect(
        await f.admin.query(api.horses.listDeleted, { stableId: f.stableId }),
      ).toHaveLength(1)
      await expect(
        f.member.mutation(api.horses.restoreHorse, { id: horseId }),
      ).rejects.toThrow()
      await f.admin.mutation(api.horses.restoreHorse, { id: horseId })
      const restored = await f.admin.query(api.horses.get, { id: horseId })
      expect(restored?.ownerId).toBeUndefined()
      expect(restored?.stableId).toBe(f.stableId)
      expect(restored?.currentPlacementId).not.toBe(original)
    } finally {
      vi.useRealTimers()
    }
  })
  it('moves the same horse between two stables and preserves origin permissions on return', async () => {
    vi.useFakeTimers()
    try {
      const f = await fixture()
      const secondStable = await f.viewer.mutation(api.stables.add, {
        name: 'Meadowbrook',
        location: 'Krakow',
      })
      await t.run((ctx) =>
        ctx.db.insert('stableMembers', {
          stableId: secondStable,
          userId: f.ownerId,
          role: 'member',
        }),
      )
      await f.owner.mutation(api.horseTransitions.connect, {
        horseId: f.horseId,
        stableId: f.stableId,
      })
      const recordId = await f.admin.mutation(api.horseWeightRecords.add, {
        horseId: f.horseId,
        weight: 510,
        unit: 'kg',
        measuredAt: Date.now(),
      })
      for (const stableId of [secondStable, f.stableId]) {
        const preview = await f.owner.query(api.horseTransitions.preview, {
          horseId: f.horseId,
        })
        await f.owner.mutation(api.horseTransitions.depart, {
          horseId: f.horseId,
          targetStableId: stableId,
          revision: preview.revision,
          carryReminderIds: [],
        })
        await t.finishAllScheduledFunctions(vi.runAllTimers)
        expect(
          (await f.owner.query(api.horses.get, { id: f.horseId }))?.stableId,
        ).toBe(stableId)
      }
      expect(await f.owner.query(api.horses.listMine)).toHaveLength(1)
      expect(
        await f.admin.query(api.horseWeightRecords.listForHorse, {
          horseId: f.horseId,
        }),
      ).toHaveLength(1)
      await expect(
        f.admin.mutation(api.horseWeightRecords.remove, { id: recordId }),
      ).rejects.toThrow()
      const placements = await t.run((ctx) =>
        ctx.db
          .query('horsePlacements')
          .withIndex('by_horse_id', (q) => q.eq('horseId', f.horseId))
          .collect(),
      )
      expect(placements.filter((p) => !p.endedAt)).toHaveLength(1)
    } finally {
      vi.useRealTimers()
    }
  })
  it('carries pending stable tasks when membership is removed without transferring ownership', async () => {
    vi.useFakeTimers()
    try {
      const f = await fixture()
      await f.owner.mutation(api.horseTransitions.connect, {
        horseId: f.horseId,
        stableId: f.stableId,
      })
      await f.admin.mutation(api.careReminders.add, {
        stableId: f.stableId,
        horseId: f.horseId,
        title: 'Book dentist',
        category: 'dentist',
        dueDate: '2027-01-02',
      })
      const membership = await t.run((ctx) =>
        ctx.db
          .query('stableMembers')
          .withIndex('by_stable_id_user_id', (q) =>
            q.eq('stableId', f.stableId).eq('userId', f.ownerId),
          )
          .unique(),
      )
      await f.admin.mutation(api.stableMembers.remove, { id: membership!._id })
      await t.finishAllScheduledFunctions(vi.runAllTimers)
      const horse = await f.owner.query(api.horses.get, { id: f.horseId })
      expect(horse?.ownerId).toBe(f.ownerId)
      expect(horse?.stableId).toBeUndefined()
      const tasks = await f.owner.query(api.careReminders.listForHorse, {
        horseId: f.horseId,
      })
      expect(
        tasks.reminders.filter((r) => r.status === 'pending'),
      ).toMatchObject([{ title: 'Book dentist', assignedTo: f.ownerId }])
      await expect(
        f.admin.query(api.horses.get, { id: f.horseId }),
      ).rejects.toThrow()
    } finally {
      vi.useRealTimers()
    }
  })
  it('completes an accepted transfer outside the stable with selected tasks and no old access', async () => {
    vi.useFakeTimers()
    try {
      const f = await fixture()
      await f.owner.mutation(api.horseTransitions.connect, {
        horseId: f.horseId,
        stableId: f.stableId,
      })
      const task = await f.admin.mutation(api.careReminders.add, {
        stableId: f.stableId,
        horseId: f.horseId,
        title: 'Check feet',
        category: 'farrier',
        dueDate: '2027-01-02',
      })
      const inviteId = await f.owner.mutation(api.horseCollaboration.invite, {
        horseId: f.horseId,
        kind: 'transfer',
        email: 'viewer@example.com',
      })
      const invitation = (await t.run((ctx) => ctx.db.get(inviteId)))!
      const details = await f.viewer.query(api.horseCollaboration.invitation, {
        token: invitation.token,
      })
      await f.viewer.mutation(api.horseCollaboration.respond, {
        token: invitation.token,
        accept: true,
        departureRevision: details!.departure!.revision,
        carryReminderIds: [task],
      })
      expect(
        (
          await f.viewer.query(api.horseCollaboration.invitation, {
            token: invitation.token,
          })
        )?.processing,
      ).toBe(true)
      await t.finishAllScheduledFunctions(vi.runAllTimers)
      const newOwnerId = (await f.viewer.query(api.users.getCurrentUser))!._id
      expect(
        await f.viewer.query(api.horses.get, { id: f.horseId }),
      ).toMatchObject({ ownerId: newOwnerId })
      expect(
        (await f.viewer.query(api.horses.get, { id: f.horseId }))?.stableId,
      ).toBeUndefined()
      expect(
        (
          await f.viewer.query(api.careReminders.listForHorse, {
            horseId: f.horseId,
          })
        ).reminders.filter((r) => r.status === 'pending'),
      ).toMatchObject([{ assignedTo: newOwnerId }])
      await expect(
        f.owner.query(api.horses.get, { id: f.horseId }),
      ).rejects.toThrow()
      await expect(
        f.admin.query(api.horses.get, { id: f.horseId }),
      ).rejects.toThrow()
    } finally {
      vi.useRealTimers()
    }
  })
  it('preserves private shared-event fields when a member organizer updates scheduling', async () => {
    const f = await fixture()
    await f.owner.mutation(api.horseTransitions.connect, {
      horseId: f.horseId,
      stableId: f.stableId,
    })
    const eventId = await f.owner.mutation(api.events.add, {
      stableId: f.stableId,
      horseIds: [f.horseId],
      title: 'Vet visit',
      date: '2027-01-02',
      time: '10:00',
      type: 'vet',
      description: 'Private clinical detail',
      totalCost: 300,
    })
    expect(
      (await f.owner.query(api.events.get, { id: eventId }))?.description,
    ).toBeUndefined()
    await f.owner.mutation(api.events.update, {
      id: eventId,
      stableId: f.stableId,
      horseIds: [f.horseId],
      title: 'Vet visit later',
      date: '2027-01-03',
      time: '11:00',
      type: 'vet',
      description: '',
    })
    expect(await t.run((ctx) => ctx.db.get(eventId))).toMatchObject({
      description: 'Private clinical detail',
      totalCost: 300,
      date: '2027-01-03',
    })
  })
})
