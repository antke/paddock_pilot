import type { Locale } from '../../../shared/i18n/locale'
import { internal } from '../../_generated/api'
import type { MutationCtx } from '../../_generated/server'
import type { EmailRelation, EmailTemplate } from './types'

export const enqueueEmail = async (
  ctx: MutationCtx,
  input: {
    locale?: Locale
    dedupeKey?: string
    recipient: string
    relation: EmailRelation
    template: EmailTemplate
  },
) => {
  if (input.dedupeKey) {
    const existingDelivery = await ctx.db
      .query('emailDeliveries')
      .withIndex('by_dedupe_key', (q) => q.eq('dedupeKey', input.dedupeKey))
      .unique()

    if (existingDelivery) return existingDelivery._id
  }

  const recipient = await ctx.db
    .query('users')
    .withIndex('by_email', (q) =>
      q.eq('email', input.recipient.trim().toLowerCase()),
    )
    .first()
  const locale = recipient?.locale ?? input.locale ?? 'en'
  const now = Date.now()
  const deliveryId = await ctx.db.insert('emailDeliveries', {
    category: input.template.kind,
    locale,
    recipient: input.recipient,
    idempotencyKey: crypto.randomUUID(),
    dedupeKey: input.dedupeKey,
    status: 'queued',
    template: input.template,
    relation: input.relation,
    relatedEntityType: input.relation.type,
    relatedEntityId: input.relation.id,
    attempts: 0,
    nextAttemptAt: now,
    createdAt: now,
    updatedAt: now,
  })

  await ctx.scheduler.runAfter(0, internal.emails.sendDelivery, { deliveryId })
  return deliveryId
}
