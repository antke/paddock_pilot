import { describe, expect, it, vi } from 'vitest'
import { getConfiguredEmailProvider } from './provider'
import { createResendEmailProvider } from './providers/resend'
import { EmailProviderError, type EmailMessage } from './types'

const message: EmailMessage = {
  category: 'stable_invitation',
  html: '<p>Hello</p>',
  idempotencyKey: 'stable-invitation/test',
  subject: 'Hello',
  text: 'Hello',
  to: 'member@example.com',
}

describe('email providers', () => {
  it('uses the console provider when no external provider is configured', () => {
    expect(getConfiguredEmailProvider({}).name).toBe('console')
    expect(
      getConfiguredEmailProvider({ RESEND_API_KEY: 're_not_enabled' }).name,
    ).toBe('console')
  })

  it('fails clearly when Resend is selected without an API key', () => {
    expect(() =>
      getConfiguredEmailProvider({ EMAIL_PROVIDER: 'resend' }),
    ).toThrow('Missing RESEND_API_KEY')
  })

  it('requires an explicit sender when Resend is selected', () => {
    expect(() =>
      getConfiguredEmailProvider({
        EMAIL_PROVIDER: 'resend',
        RESEND_API_KEY: 're_test',
      }),
    ).toThrow('Missing RESEND_FROM_EMAIL')
  })

  it('translates the generic message into a Resend API request', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ id: 'email_123' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const provider = createResendEmailProvider({
      apiKey: 're_test',
      fetcher,
      from: 'Paddock Pilot <notifications@example.com>',
    })

    await expect(provider.send(message)).resolves.toEqual({
      provider: 'resend',
      providerMessageId: 'email_123',
      status: 'accepted',
    })
    expect(fetcher).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer re_test',
          'Idempotency-Key': message.idempotencyKey,
        }),
      }),
    )

    const request = fetcher.mock.calls[0]?.[1]
    expect(JSON.parse(String(request?.body))).toMatchObject({
      from: 'Paddock Pilot <notifications@example.com>',
      to: message.to,
      subject: message.subject,
      tags: [{ name: 'category', value: 'stable_invitation' }],
    })
  })

  it.each([
    { status: 429, retryable: true },
    { status: 500, retryable: true },
    { status: 422, retryable: false },
  ])('classifies HTTP $status failures', async ({ status, retryable }) => {
    const provider = createResendEmailProvider({
      apiKey: 're_test',
      fetcher: vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ name: 'provider_error' }), { status }),
      ),
      from: 'Paddock Pilot <notifications@example.com>',
    })

    const error = await provider.send(message).catch((value: unknown) => value)
    expect(error).toBeInstanceOf(EmailProviderError)
    expect((error as EmailProviderError).retryable).toBe(retryable)
  })

  it('treats network failures as retryable', async () => {
    const provider = createResendEmailProvider({
      apiKey: 're_test',
      fetcher: vi
        .fn<typeof fetch>()
        .mockRejectedValue(new TypeError('Network unavailable')),
      from: 'Paddock Pilot <notifications@example.com>',
    })

    const error = await provider.send(message).catch((value: unknown) => value)
    expect(error).toBeInstanceOf(EmailProviderError)
    expect((error as EmailProviderError).retryable).toBe(true)
  })
})
