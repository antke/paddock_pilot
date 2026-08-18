import type { Doc } from '../../_generated/dataModel'

export const emailSendingLeaseMs = 5 * 60 * 1000
export const emailRetentionMs = 30 * 24 * 60 * 60 * 1000
export const emailRetryDelaysMs = [
  60 * 1000,
  5 * 60 * 1000,
  30 * 60 * 1000,
] as const

export const finalEmailDeliveryStatuses = [
  'accepted',
  'delivered',
  'bounced',
  'complained',
  'failed',
  'skipped',
] as const satisfies ReadonlyArray<Doc<'emailDeliveries'>['status']>

const finalStatuses = new Set<Doc<'emailDeliveries'>['status']>(
  finalEmailDeliveryStatuses,
)

export const isFinalEmailDeliveryStatus = (
  status: Doc<'emailDeliveries'>['status'],
) => finalStatuses.has(status)
