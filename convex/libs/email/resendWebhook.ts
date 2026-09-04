import type { Doc } from '../../_generated/dataModel'

export type ResendWebhookHeaders = {
  id?: string | null
  signature?: string | null
  timestamp?: string | null
}

export type ResendDeliveryEvent = {
  eventId: string
  occurredAt: number
  providerMessageId: string
  status: Doc<'emailWebhookEvents'>['status']
}

const webhookToleranceSeconds = 5 * 60

const decodeBase64 = (value: string) =>
  Uint8Array.from(atob(value), (character) => character.charCodeAt(0))

const bytesMatch = (left: Uint8Array, right: Uint8Array) => {
  if (left.length !== right.length) return false

  let difference = 0
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index]
  }
  return difference === 0
}

export const verifyResendWebhook = async (input: {
  headers: ResendWebhookHeaders
  now?: number
  payload: string
  secret: string
}) => {
  const { id, signature, timestamp } = input.headers
  if (!id || !signature || !timestamp) return false

  const timestampSeconds = Number(timestamp)
  const nowSeconds = Math.floor((input.now ?? Date.now()) / 1000)
  if (
    !Number.isInteger(timestampSeconds) ||
    Math.abs(nowSeconds - timestampSeconds) > webhookToleranceSeconds
  ) {
    return false
  }

  const encodedSecret = input.secret.startsWith('whsec_')
    ? input.secret.slice('whsec_'.length)
    : input.secret

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      decodeBase64(encodedSecret),
      { hash: 'SHA-256', name: 'HMAC' },
      false,
      ['sign'],
    )
    const signedPayload = new TextEncoder().encode(
      `${id}.${timestamp}.${input.payload}`,
    )
    const expectedSignature = new Uint8Array(
      await crypto.subtle.sign('HMAC', key, signedPayload),
    )

    return signature.split(' ').some((versionedSignature) => {
      const [version, encodedSignature] = versionedSignature.split(',')
      if (version !== 'v1' || !encodedSignature) return false
      return bytesMatch(expectedSignature, decodeBase64(encodedSignature))
    })
  } catch {
    return false
  }
}

const statusByEventType: Record<
  string,
  Doc<'emailWebhookEvents'>['status'] | undefined
> = {
  'email.sent': 'accepted',
  'email.delivered': 'delivered',
  'email.bounced': 'bounced',
  'email.complained': 'complained',
  'email.failed': 'failed',
  'email.suppressed': 'failed',
}

export const translateResendWebhook = (
  value: unknown,
  eventId: string,
): ResendDeliveryEvent | null => {
  if (!value || typeof value !== 'object') return null
  const event = value as Record<string, unknown>
  const data =
    event.data && typeof event.data === 'object'
      ? (event.data as Record<string, unknown>)
      : null
  const status =
    typeof event.type === 'string' ? statusByEventType[event.type] : undefined
  const occurredAt =
    typeof event.created_at === 'string'
      ? Date.parse(event.created_at)
      : Number.NaN

  if (
    !data ||
    typeof data.email_id !== 'string' ||
    !status ||
    !Number.isFinite(occurredAt)
  ) {
    return null
  }

  return {
    eventId,
    occurredAt,
    providerMessageId: data.email_id,
    status,
  }
}
