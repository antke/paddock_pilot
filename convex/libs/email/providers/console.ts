import type {
  EmailDeliveryResult,
  EmailMessage,
  EmailProvider,
} from '../types'

export const consoleEmailProvider: EmailProvider = {
  name: 'console',
  async send(message: EmailMessage): Promise<EmailDeliveryResult> {
    console.info('[email:console]', {
      category: message.category,
      idempotencyKey: message.idempotencyKey,
    })

    return { provider: 'console', status: 'skipped' }
  },
}
