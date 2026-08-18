import { v } from 'convex/values'
import { internal } from './_generated/api'
import type { Doc } from './_generated/dataModel'
import { internalMutation } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import {
  emailDeliveryProvider,
  emailProviderEventStatus,
} from './schema'
import {
  emailRetryDelaysMs,
  emailSendingLeaseMs,
  isFinalEmailDeliveryStatus,
} from './libs/email/deliveryPolicy'

const getProviderStatusPatch = (
  delivery: Doc<'emailDeliveries'>,
  status: Doc<'emailWebhookEvents'>['status'],
  occurredAt: number,
) => {
  if (
    delivery.providerStatusAt !== undefined &&
    occurredAt < delivery.providerStatusAt
  ) {
    return null
  }

  return {
    status,
    providerStatusAt: occurredAt,
    deliveredAt:
      status === 'delivered' ? occurredAt : delivery.deliveredAt,
    bouncedAt: status === 'bounced' ? occurredAt : delivery.bouncedAt,
    complainedAt:
      status === 'complained' ? occurredAt : delivery.complainedAt,
    updatedAt: Date.now(),
  }
}

const getInvitationDeliveryState = (
  status: Doc<'emailDeliveries'>['status'],
) => {
  if (status === 'skipped') return 'skipped' as const
  if (status === 'accepted' || status === 'delivered') return 'sent' as const
  if (
    status === 'bounced' ||
    status === 'complained' ||
    status === 'failed'
  ) {
    return 'failed' as const
  }
  return 'queued' as const
}

const getInvitationDeliveryError = (
  delivery: Doc<'emailDeliveries'>,
  state: ReturnType<typeof getInvitationDeliveryState>,
) => {
  if (state !== 'failed') return undefined
  if (delivery.status === 'bounced') return 'The invitation email bounced.'
  if (delivery.status === 'complained') {
    return 'The recipient marked the invitation email as spam.'
  }
  return delivery.error ?? 'The email provider could not deliver this message.'
}

const syncInvitationDelivery = async (
  ctx: MutationCtx,
  delivery: Doc<'emailDeliveries'>,
) => {
  if (
    delivery.relation?.type !== 'stableInvitation' ||
    delivery.template?.kind !== 'stable_invitation'
  ) {
    return
  }

  const invitation = await ctx.db.get(delivery.relation.id)
  if (!invitation || invitation.token !== delivery.template.token) return

  const state = getInvitationDeliveryState(delivery.status)
  const now = Date.now()
  const wasAcceptedByProvider =
    delivery.status === 'accepted' && delivery.providerStatusAt === undefined
  await ctx.db.patch(invitation._id, {
    deliveryStatus: state,
    deliveryError: getInvitationDeliveryError(delivery, state),
    deliveryAttempts: delivery.attempts,
    lastSentAt:
      wasAcceptedByProvider
        ? now
        : state === 'sent'
          ? invitation.lastSentAt ?? now
          : invitation.lastSentAt,
    updatedAt: now,
  })
}

export const prepareSend = internalMutation({
  args: {
    deliveryId: v.id('emailDeliveries'),
    provider: emailDeliveryProvider,
  },
  handler: async (ctx, args) => {
    const delivery = await ctx.db.get(args.deliveryId)
    if (!delivery) return { shouldSend: false as const }

    const now = Date.now()
    const hasActiveLease =
      delivery.status === 'sending' &&
      now - delivery.updatedAt < emailSendingLeaseMs
    const isWaitingForRetry =
      delivery.status === 'retryable_failure' &&
      delivery.nextAttemptAt !== undefined &&
      delivery.nextAttemptAt > now

    if (
      isFinalEmailDeliveryStatus(delivery.status) ||
      hasActiveLease ||
      isWaitingForRetry
    ) {
      return { shouldSend: false as const }
    }

    if (!delivery.template) {
      const failedDelivery = {
        ...delivery,
        status: 'failed' as const,
        error: 'This legacy delivery has no retry payload.',
        updatedAt: now,
      }
      await ctx.db.patch(delivery._id, {
        status: failedDelivery.status,
        error: failedDelivery.error,
        updatedAt: now,
      })
      await syncInvitationDelivery(ctx, failedDelivery)
      return { shouldSend: false as const }
    }

    const attempts = delivery.attempts + 1
    await ctx.db.patch(delivery._id, {
      provider: args.provider,
      status: 'sending',
      attempts,
      error: undefined,
      nextAttemptAt: undefined,
      updatedAt: now,
    })

    return {
      shouldSend: true as const,
      delivery: {
        idempotencyKey: delivery.idempotencyKey,
        recipient: delivery.recipient,
        template: delivery.template,
      },
    }
  },
})

export const recordResult = internalMutation({
  args: {
    deliveryId: v.id('emailDeliveries'),
    providerMessageId: v.optional(v.string()),
    status: v.union(v.literal('accepted'), v.literal('skipped')),
  },
  handler: async (ctx, args) => {
    const delivery = await ctx.db.get(args.deliveryId)
    if (!delivery) return

    const now = Date.now()
    let currentDelivery: Doc<'emailDeliveries'> = {
      ...delivery,
      providerMessageId: args.providerMessageId,
      status: args.status,
      error: undefined,
      nextAttemptAt: undefined,
      updatedAt: now,
    }
    await ctx.db.patch(delivery._id, {
      providerMessageId: args.providerMessageId,
      status: args.status,
      error: undefined,
      nextAttemptAt: undefined,
      updatedAt: now,
    })

    if (delivery.provider && args.providerMessageId) {
      const pendingEvents = await ctx.db
        .query('emailWebhookEvents')
        .withIndex('by_provider_message_id', (q) =>
          q
            .eq('provider', delivery.provider!)
            .eq('providerMessageId', args.providerMessageId!),
        )
        .collect()

      for (const event of pendingEvents.sort(
        (left, right) => left.occurredAt - right.occurredAt,
      )) {
        const patch = getProviderStatusPatch(
          currentDelivery,
          event.status,
          event.occurredAt,
        )
        if (patch) {
          await ctx.db.patch(delivery._id, patch)
          currentDelivery = { ...currentDelivery, ...patch }
        }
        await ctx.db.patch(event._id, { processedAt: Date.now() })
      }
    }

    await syncInvitationDelivery(ctx, currentDelivery)
  },
})

export const recordFailure = internalMutation({
  args: {
    deliveryId: v.id('emailDeliveries'),
    error: v.string(),
    retryable: v.boolean(),
  },
  handler: async (ctx, args) => {
    const delivery = await ctx.db.get(args.deliveryId)
    if (!delivery || isFinalEmailDeliveryStatus(delivery.status)) return

    const retryDelay = emailRetryDelaysMs[delivery.attempts - 1]
    const shouldRetry = args.retryable && retryDelay !== undefined
    const now = Date.now()
    const nextAttemptAt = shouldRetry ? now + retryDelay : undefined
    const updatedDelivery: Doc<'emailDeliveries'> = {
      ...delivery,
      status: shouldRetry ? 'retryable_failure' : 'failed',
      error: args.error,
      nextAttemptAt,
      updatedAt: now,
    }

    await ctx.db.patch(delivery._id, {
      status: updatedDelivery.status,
      error: args.error,
      nextAttemptAt,
      updatedAt: now,
    })
    await syncInvitationDelivery(ctx, updatedDelivery)

    if (shouldRetry) {
      await ctx.scheduler.runAfter(retryDelay, internal.emails.sendDelivery, {
        deliveryId: delivery._id,
      })
    }
  },
})

export const recordProviderEvent = internalMutation({
  args: {
    provider: emailDeliveryProvider,
    eventId: v.string(),
    providerMessageId: v.string(),
    status: emailProviderEventStatus,
    occurredAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existingEvent = await ctx.db
      .query('emailWebhookEvents')
      .withIndex('by_provider_event_id', (q) =>
        q.eq('provider', args.provider).eq('eventId', args.eventId),
      )
      .unique()
    if (existingEvent) return

    const delivery = await ctx.db
      .query('emailDeliveries')
      .withIndex('by_provider_message_id', (q) =>
        q
          .eq('provider', args.provider)
          .eq('providerMessageId', args.providerMessageId),
      )
      .unique()
    const now = Date.now()
    const eventRecordId = await ctx.db.insert('emailWebhookEvents', {
      provider: args.provider,
      eventId: args.eventId,
      providerMessageId: args.providerMessageId,
      status: args.status,
      occurredAt: args.occurredAt,
      processedAt: delivery ? now : undefined,
      createdAt: now,
    })
    if (!delivery) return

    const patch = getProviderStatusPatch(
      delivery,
      args.status,
      args.occurredAt,
    )
    if (patch) {
      const updatedDelivery: Doc<'emailDeliveries'> = { ...delivery, ...patch }
      await ctx.db.patch(delivery._id, patch)
      await syncInvitationDelivery(ctx, updatedDelivery)
    }
    await ctx.db.patch(eventRecordId, { processedAt: now })
  },
})
