import { internal } from './_generated/api'
import { internalMutation } from './_generated/server'
import {
  emailRetentionMs,
  emailSendingLeaseMs,
  finalEmailDeliveryStatuses,
} from './libs/email/deliveryPolicy'

export const recoverStalled = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const staleCutoff = now - emailSendingLeaseMs
    const [staleSending, staleQueued, dueRetries] = await Promise.all([
      ctx.db
        .query('emailDeliveries')
        .withIndex('by_status_updated_at', (q) =>
          q.eq('status', 'sending').lte('updatedAt', staleCutoff),
        )
        .take(100),
      ctx.db
        .query('emailDeliveries')
        .withIndex('by_status_updated_at', (q) =>
          q.eq('status', 'queued').lte('updatedAt', staleCutoff),
        )
        .take(100),
      ctx.db
        .query('emailDeliveries')
        .withIndex('by_status_next_attempt', (q) =>
          q.eq('status', 'retryable_failure').lte('nextAttemptAt', now),
        )
        .take(100),
    ])

    for (const delivery of staleSending) {
      await ctx.db.patch(delivery._id, {
        status: 'retryable_failure',
        nextAttemptAt: now,
        updatedAt: now,
      })
    }

    const candidates = [...staleSending, ...staleQueued, ...dueRetries]
    const deliveries = candidates.filter(
      (delivery) => delivery.template !== undefined,
    )
    const legacyDeliveries = candidates.filter(
      (delivery) => delivery.template === undefined,
    )

    for (const delivery of legacyDeliveries) {
      await ctx.db.patch(delivery._id, {
        status: 'failed',
        error: 'This legacy delivery has no retry payload.',
        nextAttemptAt: undefined,
        updatedAt: now,
      })
    }
    for (const delivery of deliveries) {
      await ctx.scheduler.runAfter(0, internal.emails.sendDelivery, {
        deliveryId: delivery._id,
      })
    }

    return {
      discardedLegacyDeliveries: legacyDeliveries.length,
      recovered: deliveries.length,
    }
  },
})

export const purgeExpired = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - emailRetentionMs
    const [deliveriesByStatus, webhookEvents] = await Promise.all([
      Promise.all(
        finalEmailDeliveryStatuses.map((status) =>
          ctx.db
            .query('emailDeliveries')
            .withIndex('by_status_created_at', (q) =>
              q.eq('status', status).lte('createdAt', cutoff),
            )
            .take(20),
        ),
      ),
      ctx.db
        .query('emailWebhookEvents')
        .withIndex('by_created_at', (q) => q.lte('createdAt', cutoff))
        .take(100),
    ])

    const finalDeliveries = deliveriesByStatus.flat()
    for (const delivery of finalDeliveries) await ctx.db.delete(delivery._id)
    for (const event of webhookEvents) await ctx.db.delete(event._id)

    return {
      deliveriesDeleted: finalDeliveries.length,
      webhookEventsDeleted: webhookEvents.length,
    }
  },
})
