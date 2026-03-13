import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { internal } from './_generated/api'
import { WebhookEvent } from '@clerk/backend'
import { verifyWebhook } from '@clerk/backend/webhooks'

const http = httpRouter()

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
  }

  return new Response('OK', { status: 200 })
})

http.route({
  path: '/clerk-users-webhook',
  method: 'POST',
  handler: clerkWebhook,
})

export default http
