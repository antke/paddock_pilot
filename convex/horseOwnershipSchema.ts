import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const carerRole = v.union(v.literal('viewer'), v.literal('editor'))
export const horseInvitationKind = v.union(
  v.literal('carer'),
  v.literal('claim'),
  v.literal('transfer'),
)

export const horseOwnershipTables = {
  horsePlacements: defineTable({
    horseId: v.id('horses'),
    stableId: v.id('stables'),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    createdBy: v.id('users'),
  })
    .index('by_horse_id', ['horseId'])
    .index('by_stable_id', ['stableId']),
  horseCarers: defineTable({
    horseId: v.id('horses'),
    userId: v.id('users'),
    role: carerRole,
    invitedBy: v.id('users'),
    createdAt: v.number(),
  })
    .index('by_horse_user', ['horseId', 'userId'])
    .index('by_user_id', ['userId'])
    .index('by_horse_id', ['horseId']),
  horseInvitations: defineTable({
    horseId: v.id('horses'),
    kind: horseInvitationKind,
    role: v.optional(carerRole),
    email: v.string(),
    token: v.string(),
    invitedBy: v.id('users'),
    expectedOwnerId: v.optional(v.id('users')),
    expectedPlacementId: v.optional(v.id('horsePlacements')),
    status: v.union(
      v.literal('pending'),
      v.literal('accepted'),
      v.literal('declined'),
      v.literal('revoked'),
    ),
    acceptedBy: v.optional(v.id('users')),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index('by_token', ['token'])
    .index('by_horse_id', ['horseId'])
    .index('by_email', ['email']),
  horseAuditLogs: defineTable({
    horseId: v.id('horses'),
    actorUserId: v.id('users'),
    action: v.string(),
    details: v.optional(v.string()),
    createdAt: v.number(),
  }).index('by_horse_id', ['horseId']),
  horseSnapshots: defineTable({
    horseId: v.id('horses'),
    stableId: v.id('stables'),
    placementId: v.id('horsePlacements'),
    horseName: v.string(),
    kind: v.string(),
    sourceId: v.string(),
    // Server-produced immutable historical data; never accepted from clients.
    data: v.any(),
    storageId: v.optional(v.id('_storage')),
    createdAt: v.number(),
  })
    .index('by_placement_id', ['placementId'])
    .index('by_stable_id', ['stableId'])
    .index('by_storage_id', ['storageId'])
    .index('by_horse_id', ['horseId']),
  horseTransitions: defineTable({
    horseId: v.id('horses'),
    actorUserId: v.id('users'),
    placementId: v.id('horsePlacements'),
    targetStableId: v.optional(v.id('stables')),
    targetOwnerId: v.optional(v.id('users')),
    invitationId: v.optional(v.id('horseInvitations')),
    carryReminderIds: v.array(v.id('careReminders')),
    phase: v.number(),
    cursor: v.optional(v.string()),
    startedAt: v.number(),
    status: v.union(v.literal('running'), v.literal('complete')),
  })
    .index('by_horse_id', ['horseId'])
    .index('by_status', ['status']),
  personalProviders: defineTable({
    userId: v.id('users'),
    name: v.string(),
    phone: v.optional(v.string()),
    type: v.union(
      v.literal('vet'),
      v.literal('farrier'),
      v.literal('dentist'),
      v.literal('trainer'),
      v.literal('physio'),
      v.literal('saddler'),
      v.literal('other'),
    ),
    createdAt: v.number(),
  }).index('by_user_id', ['userId']),
}
