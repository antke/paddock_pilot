import type { Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'

export async function recordStableAudit(
  ctx: MutationCtx,
  input: {
    stableId: Id<'stables'>
    actorUserId: Id<'users'>
    action: string
    entityType: string
    entityId: string
    summary?: string
  },
) {
  await ctx.db.insert('stableAuditLogs', {
    ...input,
    createdAt: Date.now(),
  })
}
