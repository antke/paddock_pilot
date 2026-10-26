import type { Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'
import { accountDisplayName } from '../../shared/users/displayName'

/** Attribution only: never expose account emails or other private user fields. */
export async function creatorName(ctx: QueryCtx, userId: Id<'users'>) {
  const user = await ctx.db.get(userId)
  if (!user || user.deletedAt !== undefined) return null
  return accountDisplayName(user) || null
}
