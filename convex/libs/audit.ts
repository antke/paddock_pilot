import type { Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import type { StableAuditDetails } from '../../shared/auditLogs/auditDetails'

export async function recordStableAudit(
  ctx: MutationCtx,
  input: {
    stableId: Id<'stables'> | undefined
    actorUserId: Id<'users'>
    action: string
    entityType: string
    entityId: string
    summary?: string
    details?: StableAuditDetails
  },
) {
  if (!input.stableId) return
  await ctx.db.insert('stableAuditLogs', {
    ...input,
    stableId: input.stableId,
    createdAt: Date.now(),
  })
}
