import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { convexTest } from 'convex-test'
import type { TestConvex } from 'convex-test'
import { internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
const now = Date.parse('2026-08-06T12:00:00Z')

describe('email delivery state', () => {
  let t: TestConvex<typeof schema>

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
    t = convexTest(schema, modules)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const seedInvitationDelivery = async () =>
    await t.run(async (ctx) => {
      const userId = await ctx.db.insert('users', {
        clerkId: crypto.randomUUID(),
        firstName: 'Stable',
        lastName: 'Owner',
        email: 'owner@example.com',
        createdAt: now,
        updatedAt: now,
      })
      const stableId = await ctx.db.insert('stables', {
        name: 'Willow Yard',
        location: 'North Field',
        ownerId: userId,
      })
      const token = crypto.randomUUID()
      const invitationId = await ctx.db.insert('stableInvitations', {
        stableId,
        email: 'member@example.com',
        role: 'member',
        status: 'pending',
        token,
        invitedBy: userId,
        createdAt: now,
        updatedAt: now,
        expiresAt: now + 60_000,
        deliveryStatus: 'queued',
        deliveryAttempts: 0,
      })
      const deliveryId = await ctx.db.insert('emailDeliveries', {
        category: 'stable_invitation',
        recipient: 'member@example.com',
        idempotencyKey: crypto.randomUUID(),
        status: 'queued',
        template: {
          kind: 'stable_invitation',
          stableName: 'Willow Yard',
          token,
        },
        relation: { type: 'stableInvitation', id: invitationId },
        relatedEntityType: 'stableInvitation',
        relatedEntityId: invitationId,
        attempts: 0,
        nextAttemptAt: now,
        createdAt: now,
        updatedAt: now,
      })
      return { deliveryId, invitationId }
    })

  const prepareAndAccept = async (deliveryId: Id<'emailDeliveries'>) => {
    await expect(
      t.mutation(internal.emailDeliveries.prepareSend, {
        deliveryId,
        provider: 'resend',
      }),
    ).resolves.toMatchObject({ shouldSend: true })
    await t.mutation(internal.emailDeliveries.recordResult, {
      deliveryId,
      providerMessageId: 'email_1',
      status: 'accepted',
    })
  }

  it('leases a delivery and deduplicates an accepted send', async () => {
    const { deliveryId } = await seedInvitationDelivery()

    await prepareAndAccept(deliveryId)
    await expect(
      t.mutation(internal.emailDeliveries.prepareSend, {
        deliveryId,
        provider: 'resend',
      }),
    ).resolves.toEqual({ shouldSend: false })
  })

  it('schedules retryable failures and stops retrying permanent ones', async () => {
    const retryable = await seedInvitationDelivery()
    await t.mutation(internal.emailDeliveries.prepareSend, {
      deliveryId: retryable.deliveryId,
      provider: 'resend',
    })
    await t.mutation(internal.emailDeliveries.recordFailure, {
      deliveryId: retryable.deliveryId,
      error: 'Provider temporarily unavailable',
      retryable: true,
    })

    const retryableDelivery = await t.run((ctx) =>
      ctx.db.get(retryable.deliveryId),
    )
    expect(retryableDelivery).toMatchObject({
      status: 'retryable_failure',
      attempts: 1,
      nextAttemptAt: now + 60_000,
    })

    const permanent = await seedInvitationDelivery()
    await t.mutation(internal.emailDeliveries.prepareSend, {
      deliveryId: permanent.deliveryId,
      provider: 'resend',
    })
    await t.mutation(internal.emailDeliveries.recordFailure, {
      deliveryId: permanent.deliveryId,
      error: 'Invalid recipient',
      retryable: false,
    })
    const permanentDelivery = await t.run((ctx) =>
      ctx.db.get(permanent.deliveryId),
    )
    expect(permanentDelivery).toMatchObject({ status: 'failed', attempts: 1 })
    expect(permanentDelivery?.nextAttemptAt).toBeUndefined()
  })

  it('reconciles webhooks that arrive before the provider result', async () => {
    const { deliveryId } = await seedInvitationDelivery()
    await t.mutation(internal.emailDeliveries.prepareSend, {
      deliveryId,
      provider: 'resend',
    })
    await t.mutation(internal.emailDeliveries.recordProviderEvent, {
      provider: 'resend',
      eventId: 'webhook-1',
      providerMessageId: 'email_1',
      status: 'delivered',
      occurredAt: now + 200,
    })
    await t.mutation(internal.emailDeliveries.recordResult, {
      deliveryId,
      providerMessageId: 'email_1',
      status: 'accepted',
    })

    const delivery = await t.run((ctx) => ctx.db.get(deliveryId))
    expect(delivery).toMatchObject({
      status: 'delivered',
      deliveredAt: now + 200,
      providerStatusAt: now + 200,
    })
  })

  it('ignores chronologically older terminal webhooks', async () => {
    const { deliveryId } = await seedInvitationDelivery()
    await prepareAndAccept(deliveryId)

    await t.mutation(internal.emailDeliveries.recordProviderEvent, {
      provider: 'resend',
      eventId: 'webhook-complaint',
      providerMessageId: 'email_1',
      status: 'complained',
      occurredAt: now + 200,
    })
    await t.mutation(internal.emailDeliveries.recordProviderEvent, {
      provider: 'resend',
      eventId: 'webhook-delivered',
      providerMessageId: 'email_1',
      status: 'delivered',
      occurredAt: now + 100,
    })

    const delivery = await t.run((ctx) => ctx.db.get(deliveryId))
    expect(delivery).toMatchObject({
      status: 'complained',
      providerStatusAt: now + 200,
    })
  })

  it('synchronizes invitation state after a bounce', async () => {
    const { deliveryId, invitationId } = await seedInvitationDelivery()
    await prepareAndAccept(deliveryId)

    await t.mutation(internal.emailDeliveries.recordProviderEvent, {
      provider: 'resend',
      eventId: 'webhook-bounce',
      providerMessageId: 'email_1',
      status: 'bounced',
      occurredAt: now + 100,
    })

    const invitation = await t.run((ctx) => ctx.db.get(invitationId))
    expect(invitation).toMatchObject({
      deliveryStatus: 'failed',
      deliveryError: 'The invitation email bounced.',
      deliveryAttempts: 1,
    })
  })

  it('does not let an old delivery update a resent invitation', async () => {
    const { deliveryId, invitationId } = await seedInvitationDelivery()
    await prepareAndAccept(deliveryId)
    await t.run(async (ctx) => {
      await ctx.db.patch(invitationId, {
        token: 'replacement-token',
        deliveryStatus: 'queued',
      })
    })

    await t.mutation(internal.emailDeliveries.recordProviderEvent, {
      provider: 'resend',
      eventId: 'webhook-old-bounce',
      providerMessageId: 'email_1',
      status: 'bounced',
      occurredAt: now + 100,
    })

    const invitation = await t.run((ctx) => ctx.db.get(invitationId))
    expect(invitation?.deliveryStatus).toBe('queued')
  })

  it('skips a queued invitation after it is revoked', async () => {
    const { deliveryId, invitationId } = await seedInvitationDelivery()
    await t.run(async (ctx) => {
      await ctx.db.patch(invitationId, {
        status: 'revoked',
        updatedAt: now,
      })
    })

    await expect(
      t.mutation(internal.emailDeliveries.prepareSend, {
        deliveryId,
        provider: 'resend',
      }),
    ).resolves.toEqual({ shouldSend: false })

    const [delivery, invitation] = await t.run(async (ctx) =>
      Promise.all([ctx.db.get(deliveryId), ctx.db.get(invitationId)]),
    )
    expect(delivery).toMatchObject({
      status: 'skipped',
      error: 'Invitation is no longer pending.',
      attempts: 0,
    })
    expect(invitation?.deliveryStatus).toBe('skipped')
  })
})
