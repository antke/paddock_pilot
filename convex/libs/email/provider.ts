import { consoleEmailProvider } from './providers/console'
import { createResendEmailProvider } from './providers/resend'
import { EmailProviderError } from './types'
import type { EmailProvider } from './types'

export type EmailProviderEnvironment = {
  EMAIL_PROVIDER?: string
  RESEND_API_KEY?: string
  RESEND_FROM_EMAIL?: string
}

export const getConfiguredEmailProvider = (
  environment: EmailProviderEnvironment = process.env,
  fetcher: typeof fetch = fetch,
): EmailProvider => {
  const configuredProvider =
    environment.EMAIL_PROVIDER?.trim().toLowerCase() || 'console'

  if (configuredProvider === 'console') return consoleEmailProvider

  if (configuredProvider === 'resend') {
    if (!environment.RESEND_API_KEY) {
      throw new EmailProviderError(
        'Missing RESEND_API_KEY',
        'Email delivery is not configured.',
      )
    }
    if (!environment.RESEND_FROM_EMAIL?.trim()) {
      throw new EmailProviderError(
        'Missing RESEND_FROM_EMAIL',
        'Email delivery is not configured.',
      )
    }

    return createResendEmailProvider({
      apiKey: environment.RESEND_API_KEY,
      fetcher,
      from: environment.RESEND_FROM_EMAIL,
    })
  }

  throw new EmailProviderError(
    `Unsupported EMAIL_PROVIDER: ${configuredProvider}`,
    'Email delivery is not configured.',
  )
}
