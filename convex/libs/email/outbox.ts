import { internal } from '../../_generated/api'
import type { MutationCtx } from '../../_generated/server'
import type { EmailRelation, EmailTemplate } from './types'

export const enqueueEmail = async (
  ctx: MutationCtx,
  input: {
    recipient: string
    relation: EmailRelation
    template: EmailTemplate
  },
) => {
  const now = Date.now()
  const deliveryId = await ctx.db.insert('emailDeliveries', {
    category: input.template.kind,
    recipient: input.recipient,
    idempotencyKey: crypto.randomUUID(),
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
