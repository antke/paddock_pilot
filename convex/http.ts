import { httpRouter } from 'convex/server'
import type { WebhookEvent } from '@clerk/backend'
import { httpAction } from './_generated/server'
import { internal } from './_generated/api'
import { verifyWebhook } from '@clerk/backend/webhooks'
import {
  translateResendWebhook,
  verifyResendWebhook,
} from './libs/email/resendWebhook'

const http = httpRouter()

const getString = (value: unknown) =>
  typeof value === 'string' ? value : undefined

const getRecord = (value: unknown) =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

const toTimestamp = (value: unknown) => {
  if (typeof value !== 'number') return undefined
  return value < 1_000_000_000_000 ? value * 1000 : value
}

const toSubscriptionStatus = (eventType: string, dataStatus?: string) => {
  if (eventType.endsWith('.active')) return 'active' as const
  if (eventType.endsWith('.pastDue')) return 'past_due' as const
  if (eventType.endsWith('.canceled')) return 'canceled' as const
  if (eventType.endsWith('.incomplete')) return 'incomplete' as const
  if (eventType.endsWith('.upcoming')) return 'upcoming' as const
  if (eventType.endsWith('.abandoned')) return 'abandoned' as const
  if (eventType.endsWith('.ended')) return 'ended' as const

  if (dataStatus === 'active') return 'active' as const
  if (dataStatus === 'past_due' || dataStatus === 'pastDue') {
    return 'past_due' as const
  }
  if (dataStatus === 'canceled') return 'canceled' as const
  if (dataStatus === 'ended') return 'ended' as const
  if (dataStatus === 'incomplete') return 'incomplete' as const
  if (dataStatus === 'upcoming') return 'upcoming' as const
  if (dataStatus === 'abandoned') return 'abandoned' as const

  return undefined
}

const toSubscriptionPlan = (planKey?: string) => {
  const normalizedPlanKey = planKey?.toLowerCase()
  if (!normalizedPlanKey) return undefined

  if (normalizedPlanKey.includes('personal_pro')) return 'personal_pro' as const
  if (normalizedPlanKey.includes('personal_plus'))
    return 'personal_plus' as const
  if (normalizedPlanKey.includes('plus')) return 'personal_plus' as const
  if (normalizedPlanKey.includes('pro')) return 'personal_pro' as const

  return 'free' as const
}

const getBillingPayload = (event: WebhookEvent) => {
  const data = getRecord(event.data)
  const payer = getRecord(data.payer)
  const plan = getRecord(data.plan)
  const subscription = getRecord(data.subscription)
  const subscriptionItem = getRecord(data.subscription_item)

  const clerkUserId =
    getString(payer.id) ??
    getString(payer.user_id) ??
    getString(data.user_id) ??
    getString(data.userId)

  const planKey =
    getString(plan.slug) ??
    getString(plan.key) ??
    getString(plan.id) ??
    getString(data.plan_slug) ??
    getString(data.plan_id)

  const status = toSubscriptionStatus(event.type, getString(data.status))
  const mappedPlan = toSubscriptionPlan(planKey)

  if (!clerkUserId || !mappedPlan || !status) return null

  return {
    clerkUserId,
    clerkSubscriptionId:
      getString(subscription.id) ??
      getString(subscriptionItem.subscription_id) ??
      getString(data.subscription_id) ??
      getString(data.id),
    plan: mappedPlan,
    status,
    currentPeriodEnd: toTimestamp(
      data.period_end ?? data.current_period_end ?? subscriptionItem.period_end,
    ),
    sourceUpdatedAt:
      toTimestamp(data.updated_at ?? subscriptionItem.updated_at) ?? Date.now(),
  }
}

const clerkWebhook = httpAction(async (ctx, request) => {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
  if (!webhookSecret) {
    return new Response('Missing CLERK_WEBHOOK_SECRET', { status: 500 })
  }

  let event: WebhookEvent
  try {
    event = await verifyWebhook(request, { signingSecret: webhookSecret })
  } catch {
    return new Response('Invalid webhook signature', { status: 400 })
  }

  switch (event.type) {
    case 'user.created':
    case 'user.updated': {
      const { id, email_addresses, first_name, last_name, image_url } =
        event.data

      const primaryEmail = email_addresses.find(
        (e) => e.id === event.data.primary_email_address_id,
      )

      await ctx.runMutation(internal.users.upsertUser, {
        clerkId: id,
        email: primaryEmail?.email_address ?? '',
        firstName: first_name ?? '',
        lastName: last_name ?? '',
        photoUrl: image_url || undefined,
      })
      break
    }
    case 'user.deleted': {
      if (event.data.id) {
        await ctx.runMutation(internal.users.deleteUser, {
          clerkId: event.data.id,
        })
      }
      break
    }
    case 'subscription.created':
    case 'subscription.updated':
    case 'subscription.active':
    case 'subscription.pastDue':
    case 'subscriptionItem.updated':
    case 'subscriptionItem.active':
    case 'subscriptionItem.canceled':
    case 'subscriptionItem.upcoming':
    case 'subscriptionItem.abandoned':
    case 'subscriptionItem.ended':
    case 'subscriptionItem.incomplete':
    case 'subscriptionItem.pastDue': {
      const billingPayload = getBillingPayload(event)
      if (!billingPayload) break

      await ctx.runMutation(internal.userSubscriptions.upsertForClerkUser, {
        clerkUserId: billingPayload.clerkUserId,
        clerkSubscriptionId: billingPayload.clerkSubscriptionId,
        plan: billingPayload.plan,
        status: billingPayload.status,
        currentPeriodEnd: billingPayload.currentPeriodEnd,
        sourceUpdatedAt: billingPayload.sourceUpdatedAt,
      })
      break
    }
  }

  return new Response('OK', { status: 200 })
})

http.route({
  path: '/clerk-users-webhook',
  method: 'POST',
  handler: clerkWebhook,
})

const resendEmailWebhook = httpAction(async (ctx, request) => {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
  if (!webhookSecret) {
    return new Response('Missing RESEND_WEBHOOK_SECRET', { status: 500 })
  }

  const payload = await request.text()
  const eventId = request.headers.get('svix-id')
  const isVerified = await verifyResendWebhook({
    payload,
    secret: webhookSecret,
    headers: {
      id: eventId,
      timestamp: request.headers.get('svix-timestamp'),
      signature: request.headers.get('svix-signature'),
    },
  })

  if (!isVerified || !eventId) {
    return new Response('Invalid webhook signature', { status: 400 })
  }

  let value: unknown
  try {
    value = JSON.parse(payload)
  } catch {
    return new Response('Invalid webhook payload', { status: 400 })
  }

  const event = translateResendWebhook(value, eventId)
  if (event) {
    await ctx.runMutation(internal.emailDeliveries.recordProviderEvent, {
      provider: 'resend',
      ...event,
    })
  }

  return new Response('OK', { status: 200 })
})

http.route({
  path: '/resend-email-webhook',
  method: 'POST',
  handler: resendEmailWebhook,
})

export default http
