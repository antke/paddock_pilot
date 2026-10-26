import { ConvexError } from 'convex/values'
import type { Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'

export async function creationReplay(
  ctx: MutationCtx,
  userId: Id<'users'>,
  requestId: string | undefined,
  operation: string,
) {
  if (!requestId) return null
  if (requestId.length > 200) throw new ConvexError('Invalid creation request')
  const row = await ctx.db
    .query('recordCreationRequests')
    .withIndex('by_user_request', (q) =>
      q.eq('userId', userId).eq('requestId', requestId),
    )
    .unique()
  if (row && row.operation !== operation)
    throw new ConvexError(
      'Creation retry does not match the original operation',
    )
  return row?.recordId ?? null
}

export async function recordCreation(
  ctx: MutationCtx,
  userId: Id<'users'>,
  requestId: string | undefined,
  operation: string,
  recordId: string,
) {
  if (requestId)
    await ctx.db.insert('recordCreationRequests', {
      userId,
      requestId,
      operation,
      recordId,
    })
}
