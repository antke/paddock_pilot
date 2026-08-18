import { v } from 'convex/values'
import { internal } from './_generated/api'
import { internalAction } from './_generated/server'
import { getConfiguredEmailProvider } from './libs/email/provider'
import {
  EmailProviderError,
  getEmailErrorDetails,
  type EmailMessage,
  type EmailProvider,
} from './libs/email/types'
import { createEmailContent, getAppUrl } from './libs/email/templates'

const getConfiguredAppUrl = (provider: EmailProvider) => {
  try {
    return getAppUrl({
      APP_URL:
        process.env.APP_URL ??
        (provider.name === 'console' ? 'http://localhost:9090' : undefined),
    })
  } catch (error) {
    throw new EmailProviderError(
      error instanceof Error ? error.message : 'Missing APP_URL',
      'Email delivery is not configured.',
    )
  }
}

export const sendDelivery = internalAction({
  args: { deliveryId: v.id('emailDeliveries') },
  handler: async (ctx, args) => {
    try {
      const provider = getConfiguredEmailProvider()
      const prepared = await ctx.runMutation(
        internal.emailDeliveries.prepareSend,
        {
          deliveryId: args.deliveryId,
          provider: provider.name,
        },
      )
      if (!prepared.shouldSend) return

      const content = createEmailContent(
        prepared.delivery.template,
        getConfiguredAppUrl(provider),
      )
      const message: EmailMessage = {
        ...content,
        idempotencyKey: prepared.delivery.idempotencyKey,
        to: prepared.delivery.recipient,
      }
      const result = await provider.send(message)

      await ctx.runMutation(internal.emailDeliveries.recordResult, {
        deliveryId: args.deliveryId,
        providerMessageId: result.providerMessageId,
        status: result.status,
      })
    } catch (error) {
      const details = getEmailErrorDetails(error)
      await ctx.runMutation(internal.emailDeliveries.recordFailure, {
        deliveryId: args.deliveryId,
        error: details.message,
        retryable: details.retryable,
      })
      throw error
    }
  },
})
