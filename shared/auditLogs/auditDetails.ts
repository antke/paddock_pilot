import { v } from 'convex/values'
import type { Infer } from 'convex/values'

/** Optional structured display data. Legacy summary strings remain valid. */
export const stableAuditDetailsValidator = v.union(
  v.object({
    kind: v.literal('training_recorded'),
    horseName: v.string(),
    status: v.union(
      v.literal('planned'),
      v.literal('completed'),
      v.literal('cancelled'),
      v.literal('skipped'),
    ),
    date: v.string(),
  }),
  v.object({ kind: v.literal('event_changes'), changes: v.array(v.string()) }),
  v.object({
    kind: v.literal('member_removed'),
    memberName: v.optional(v.string()),
    reassignedHorseCount: v.number(),
  }),
)
export type StableAuditDetails = Infer<typeof stableAuditDetailsValidator>
