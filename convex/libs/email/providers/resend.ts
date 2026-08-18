import {
  EmailProviderError,
  type EmailDeliveryResult,
  type EmailMessage,
  type EmailProvider,
} from '../types'

type ResendProviderOptions = {
  apiKey: string
  fetcher?: typeof fetch
  from: string
  timeoutMs?: number
}

const getResendError = async (response: Response) => {
  try {
    const body = (await response.json()) as {
      message?: unknown
      name?: unknown
    }
    const detail = [body.name, body.message]
      .filter((value): value is string => typeof value === 'string')
      .join(': ')
    return {
      code: typeof body.name === 'string' ? body.name : undefined,
      detail: detail || `HTTP ${response.status}`,
    }
  } catch {
    return { code: undefined, detail: `HTTP ${response.status}` }
  }
}

const isRetryableResponse = (response: Response, code?: string) =>
  response.status === 408 ||
  response.status === 425 ||
  response.status === 429 ||
  response.status >= 500 ||
  code === 'concurrent_idempotent_requests'

export const createResendEmailProvider = ({
  apiKey,
  fetcher = fetch,
  from,
  timeoutMs = 15_000,
}: ResendProviderOptions): EmailProvider => ({
  name: 'resend',
  async send(message: EmailMessage): Promise<EmailDeliveryResult> {
    let response: Response
    try {
      response = await fetcher('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': message.idempotencyKey,
        },
        body: JSON.stringify({
          from,
          to: message.to,
          subject: message.subject,
          html: message.html,
          text: message.text,
          tags: [{ name: 'category', value: message.category }],
        }),
        signal: AbortSignal.timeout(timeoutMs),
      })
    } catch (error) {
      throw new EmailProviderError(
        error instanceof Error ? error.message : 'Resend request failed',
        'The email provider is temporarily unavailable.',
        { code: 'network_error', retryable: true },
      )
    }

    if (!response.ok) {
      const providerError = await getResendError(response)
      throw new EmailProviderError(
        `Resend rejected the email: ${providerError.detail}`,
        'The email provider did not accept this message.',
        {
          code: providerError.code,
          retryable: isRetryableResponse(response, providerError.code),
        },
      )
    }

    const body = (await response.json()) as { id?: unknown }
    if (typeof body.id !== 'string' || !body.id) {
      throw new EmailProviderError(
        'Resend returned no message ID',
        'The email provider returned an invalid response.',
        { code: 'invalid_response', retryable: true },
      )
    }

    return {
      provider: 'resend',
      providerMessageId: body.id,
      status: 'accepted',
    }
  },
})
