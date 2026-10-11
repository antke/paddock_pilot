import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { convexTest } from 'convex-test'
import type { TestConvex } from 'convex-test'
import schema from './schema'
import { api, internal } from './_generated/api'
import { getDigestClock } from './libs/email/reminderDigest'
import { createEmailContent } from './libs/email/templates'

const modules = import.meta.glob('./**/*.ts')
const now = Date.parse('2026-10-01T07:00:00Z') // 09:00 Warsaw, including DST
const setup = async (enabled = true) => {
  const t = convexTest(schema, modules)
  const ids = await t.run(async (ctx) => {
    const userId = await ctx.db.insert('users', {
      clerkId: 'digest-user',
      firstName: 'Ada',
      email: 'ada@example.com',
      locale: 'pl',
      reminderDigestEnabled: enabled,
      reminderDigestTimezone: 'Europe/Warsaw',
      createdAt: now,
      updatedAt: now,
    })
    const ownerId = await ctx.db.insert('users', {
      clerkId: 'owner',
      firstName: 'Owner',
      email: 'owner@example.com',
      createdAt: now,
      updatedAt: now,
    })
    const stableId = await ctx.db.insert('stables', {
      name: 'Willow',
      location: 'Field',
      ownerId,
    })
    const membershipId = await ctx.db.insert('stableMembers', {
      stableId,
      userId,
      role: 'member',
    })
    const reminderId = await ctx.db.insert('careReminders', {
      stableId,
      title: 'Farrier',
      category: 'farrier',
      dueDate: '2026-10-01',
      status: 'pending',
      createdBy: ownerId,
      createdAt: now,
      updatedAt: now,
    })
    return { userId, ownerId, stableId, membershipId, reminderId }
  })
  return { t, ...ids }
}
const deliveries = (t: TestConvex<typeof schema>) =>
  t.run((ctx) => ctx.db.query('emailDeliveries').collect())

describe('daily care reminder digest', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
  })
  afterEach(() => vi.useRealTimers())

  it('is opt-in, groups due and overdue work, and enqueues once per local day', async () => {
    const { t, userId, stableId, ownerId } = await setup(false)
    await t.mutation(internal.emailMaintenance.queueReminderDigests, {})
    expect(await deliveries(t)).toHaveLength(0)
    await t
      .withIdentity({ subject: 'digest-user' })
      .mutation(api.users.setReminderDigest, {
        enabled: true,
        timezone: 'Europe/Warsaw',
      })
    await t.run(async (ctx) => {
      for (const [dueDate, status] of [
        ['2026-09-20', 'pending'],
        ['2026-10-02', 'pending'],
        ['2026-10-01', 'completed'],
      ] as const) {
        await ctx.db.insert('careReminders', {
          stableId,
          title: 'Care',
          category: 'other',
          dueDate,
          status,
          createdBy: ownerId,
          createdAt: now,
          updatedAt: now,
        })
      }
    })
    await t.mutation(internal.emailMaintenance.queueReminderDigests, {})
    await t.mutation(internal.emailMaintenance.queueReminderDigests, {})
    const queued = await deliveries(t)
    expect(queued).toHaveLength(1)
    expect(queued[0]).toMatchObject({
      locale: 'pl',
      recipient: 'ada@example.com',
      template: {
        kind: 'care_reminder_digest',
        date: '2026-10-01',
        stables: [{ stableId, count: 2 }],
      },
    })
    expect(
      (await t.run((ctx) => ctx.db.get(userId)))?.lastReminderDigestDate,
    ).toBe('2026-10-01')
    vi.setSystemTime(Date.parse('2026-10-02T07:00:00Z'))
    await t.mutation(internal.emailMaintenance.queueReminderDigests, {})
    expect(await deliveries(t)).toHaveLength(2)
  })

  it('waits for local morning and handles date boundaries and daylight saving', async () => {
    const { t } = await setup()
    vi.setSystemTime(now - 60_000)
    await t.mutation(internal.emailMaintenance.queueReminderDigests, {})
    expect(await deliveries(t)).toHaveLength(0)
    expect(
      getDigestClock(Date.parse('2026-10-25T08:00:00Z'), 'Europe/Warsaw'),
    ).toEqual({ date: '2026-10-25', hour: 9 })
    expect(
      getDigestClock(Date.parse('2026-10-01T01:00:00Z'), 'America/New_York'),
    ).toEqual({ date: '2026-09-30', hour: 21 })
  })

  it.each([
    'opt-out',
    'membership-removed',
    'archived',
    'completed',
    'deleted-account',
    'email-changed',
  ] as const)('rechecks %s before sending', async (change) => {
    const { t, userId, membershipId, stableId, reminderId } = await setup()
    await t.mutation(internal.emailMaintenance.queueReminderDigests, {})
    const [delivery] = await deliveries(t)
    await t.run(async (ctx) => {
      if (change === 'opt-out')
        await ctx.db.patch(userId, { reminderDigestEnabled: false })
      if (change === 'membership-removed') await ctx.db.delete(membershipId)
      if (change === 'archived')
        await ctx.db.patch(stableId, { archivedAt: now })
      if (change === 'completed')
        await ctx.db.patch(reminderId, { status: 'completed' })
      if (change === 'deleted-account')
        await ctx.db.patch(userId, { deletedAt: now })
      if (change === 'email-changed')
        await ctx.db.patch(userId, { email: 'new@example.com' })
    })
    expect(
      await t.mutation(internal.emailDeliveries.prepareSend, {
        deliveryId: delivery._id,
        provider: 'console',
      }),
    ).toEqual({ shouldSend: false })
    expect((await deliveries(t))[0].status).toBe('skipped')
  })

  it('recomputes current scope, excludes deleted horses and legacy guest memberships', async () => {
    const { t, ownerId, userId, stableId, reminderId } = await setup()
    await t.mutation(internal.emailMaintenance.queueReminderDigests, {})
    const [delivery] = await deliveries(t)
    await t.run(async (ctx) => {
      const horseId = await ctx.db.insert('horses', {
        stableId,
        ownerId,
        name: 'Deleted horse',
        age: 12,
        deletedAt: now,
      })
      await ctx.db.insert('careReminders', {
        stableId,
        horseId,
        title: 'Deleted horse care',
        category: 'other',
        dueDate: '2026-10-01',
        status: 'pending',
        createdBy: ownerId,
        createdAt: now,
        updatedAt: now,
      })
      const other = await ctx.db.insert('stables', {
        name: 'Other',
        location: 'Field',
        ownerId,
      })
      await ctx.db.insert('stableMembers', {
        stableId: other,
        userId,
        role: 'guest',
      })
      await ctx.db.insert('careReminders', {
        stableId: other,
        title: 'Private',
        category: 'other',
        dueDate: '2026-10-01',
        status: 'pending',
        createdBy: ownerId,
        createdAt: now,
        updatedAt: now,
      })
      await ctx.db.patch(reminderId, { status: 'completed' })
      await ctx.db.insert('careReminders', {
        stableId,
        title: 'Replacement',
        category: 'other',
        dueDate: '2026-10-01',
        status: 'pending',
        createdBy: ownerId,
        createdAt: now,
        updatedAt: now,
      })
    })
    const prepared = await t.mutation(internal.emailDeliveries.prepareSend, {
      deliveryId: delivery._id,
      provider: 'console',
    })
    expect(prepared).toMatchObject({
      shouldSend: true,
      delivery: { template: { stables: [{ stableId, count: 1 }] } },
    })
    if (!prepared.shouldSend) throw Error('Expected digest')
    expect(
      prepared.delivery.template.kind === 'care_reminder_digest' &&
        prepared.delivery.template.stables,
    ).toHaveLength(1)
    const content = createEmailContent(
      prepared.delivery.template,
      'https://paddock.example',
      'pl',
    )
    expect(content.subject).toBe('Przypomnienia o opiece do wykonania')
    expect(content.html).toContain(`/stables/${stableId}/reminders`)
    expect(content.text).toContain('https://paddock.example/profile')
  })

  it('reuses retry idempotency and skips stale digests on the following day', async () => {
    const { t } = await setup()
    await t.mutation(internal.emailMaintenance.queueReminderDigests, {})
    const [delivery] = await deliveries(t)
    await t.mutation(internal.emailDeliveries.prepareSend, {
      deliveryId: delivery._id,
      provider: 'console',
    })
    await t.mutation(internal.emailDeliveries.recordFailure, {
      deliveryId: delivery._id,
      error: 'Temporary failure',
      retryable: true,
    })
    expect((await deliveries(t))[0]).toMatchObject({
      status: 'retryable_failure',
      idempotencyKey: delivery.idempotencyKey,
    })
    vi.setSystemTime(now + 24 * 3600_000)
    expect(
      await t.mutation(internal.emailDeliveries.prepareSend, {
        deliveryId: delivery._id,
        provider: 'console',
      }),
    ).toEqual({ shouldSend: false })
  })

  it('requires authentication and valid timezone to change the preference', async () => {
    const { t } = await setup(false)
    await expect(
      t.mutation(api.users.setReminderDigest, {
        enabled: true,
        timezone: 'Europe/Warsaw',
      }),
    ).rejects.toThrow()
    await expect(
      t
        .withIdentity({ subject: 'digest-user' })
        .mutation(api.users.setReminderDigest, {
          enabled: true,
          timezone: 'Invalid/Zone',
        }),
    ).rejects.toThrow('Invalid timezone')
  })
})
