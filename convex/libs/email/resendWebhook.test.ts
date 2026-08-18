import { describe, expect, it } from 'vitest'
import {
  translateResendWebhook,
  verifyResendWebhook,
} from './resendWebhook'

const encodeBase64 = (value: Uint8Array) =>
  btoa(String.fromCharCode(...value))

const sign = async (input: {
  id: string
  payload: string
  secret: Uint8Array<ArrayBuffer>
  timestamp: string
}) => {
  const key = await crypto.subtle.importKey(
    'raw',
    input.secret,
    { hash: 'SHA-256', name: 'HMAC' },
    false,
    ['sign'],
  )
  const signature = new Uint8Array(
    await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(
        `${input.id}.${input.timestamp}.${input.payload}`,
      ),
    ),
  )
  return `v1,${encodeBase64(signature)}`
}

describe('Resend webhooks', () => {
  it('verifies the raw signed payload and rejects a modified payload', async () => {
    const now = Date.parse('2026-08-06T12:00:00Z')
    const timestamp = String(Math.floor(now / 1000))
    const secret = new TextEncoder().encode('test webhook secret')
    const payload = '{"type":"email.delivered"}'
    const signature = await sign({
      id: 'event_123',
      payload,
      secret,
      timestamp,
    })
    const verification = {
      headers: { id: 'event_123', signature, timestamp },
      now,
      secret: `whsec_${encodeBase64(secret)}`,
    }

    await expect(
      verifyResendWebhook({ ...verification, payload }),
    ).resolves.toBe(true)
    await expect(
      verifyResendWebhook({ ...verification, payload: `${payload} ` }),
    ).resolves.toBe(false)
  })

  it('translates supported delivery events and ignores unrelated events', () => {
    expect(
      translateResendWebhook(
        {
          type: 'email.bounced',
          created_at: '2026-08-06T12:00:00Z',
          data: { email_id: 'email_123' },
        },
        'event_123',
      ),
    ).toEqual({
      eventId: 'event_123',
      occurredAt: Date.parse('2026-08-06T12:00:00Z'),
      providerMessageId: 'email_123',
      status: 'bounced',
    })
    expect(
      translateResendWebhook(
        {
          type: 'email.opened',
          created_at: '2026-08-06T12:00:00Z',
          data: { email_id: 'email_123' },
        },
        'event_124',
      ),
    ).toBeNull()
  })
})
