import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

/**
 * GENERIC
 */
export const dayOfWeekNumber = v.union(
  v.literal(0),
  v.literal(1),
  v.literal(2),
  v.literal(3),
  v.literal(4),
  v.literal(5),
  v.literal(6),
)

/**
 * USERS
 */

export const userFields = {
  clerkId: v.string(),
  firstName: v.string(),
  lastName: v.optional(v.string()),
  email: v.string(),
  photoUrl: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
}

const userSchema = defineTable({ ...userFields })
  .index('by_clerk_id', ['clerkId'])
  .index('by_email', ['email'])

/**
 * STABLES
 */
export const stableFields = {
  name: v.string(),
  location: v.string(),
  description: v.optional(v.string()),
  ownerId: v.id('users'),
}

const stablesSchema = defineTable({ ...stableFields }).index('by_owner_id', [
  'ownerId',
])

/**
 * STABLE MEMBERS
 */
export const stableMembersFields = {
  stableId: v.id('stables'),
  userId: v.id('users'),
  role: v.union(v.literal('owner'), v.literal('member'), v.literal('guest')),
}

const stableMembersSchema = defineTable({ ...stableMembersFields })
  .index('by_stable_id', ['stableId'])
  .index('by_user_id', ['userId'])
  .index('by_stable_id_user_id', ['stableId', 'userId'])

/**
 * STABLE INVITATIONS
 */
export const stableInvitationRole = v.union(v.literal('member'), v.literal('guest'))

export const stableInvitationStatus = v.union(
  v.literal('pending'),
  v.literal('accepted_pending_subscription'),
  v.literal('accepted'),
  v.literal('revoked'),
  v.literal('expired'),
)

export const stableInvitationsFields = {
  stableId: v.id('stables'),
  email: v.string(),
  role: stableInvitationRole,
  status: stableInvitationStatus,
  token: v.string(),
  invitedBy: v.id('users'),
  acceptedBy: v.optional(v.id('users')),
  createdAt: v.number(),
  updatedAt: v.number(),
  expiresAt: v.number(),
  acceptedAt: v.optional(v.number()),
}

const stableInvitationsSchema = defineTable({ ...stableInvitationsFields })
  .index('by_stable_id', ['stableId'])
  .index('by_email_status', ['email', 'status'])
  .index('by_token', ['token'])
  .index('by_accepted_by_status', ['acceptedBy', 'status'])

/**
 * USER SUBSCRIPTIONS
 */
export const userSubscriptionPlan = v.union(
  v.literal('free'),
  v.literal('personal_plus'),
  v.literal('personal_pro'),
)

export const userSubscriptionStatus = v.union(
  v.literal('active'),
  v.literal('past_due'),
  v.literal('canceled'),
  v.literal('incomplete'),
)

export const userSubscriptionsFields = {
  userId: v.id('users'),
  clerkSubscriptionId: v.optional(v.string()),
  plan: userSubscriptionPlan,
  status: userSubscriptionStatus,
  currentPeriodEnd: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
}

const userSubscriptionsSchema = defineTable({ ...userSubscriptionsFields })
  .index('by_user_id', ['userId'])
  .index('by_user_id_plan', ['userId', 'plan'])

/**
 * HORSES
 */
export const horsesFields = {
  stableId: v.id('stables'),
  ownerId: v.id('users'),
  name: v.string(),
  ownerName: v.optional(v.string()),
  age: v.number(),
  breed: v.optional(v.string()),
  profileImageId: v.optional(v.id('_storage')),
}

const horsesSchema = defineTable({ ...horsesFields })
  .index('by_stable_id', ['stableId'])
  .index('by_owner_id', ['ownerId'])

/**
 * EVENTS
 */
export const eventType = v.union(
  v.literal('vet'),
  v.literal('training'),
  v.literal('dentist'),
  v.literal('hoof_trimming'),
  v.literal('massage'),
  v.literal('other'),
)

export const recurrenceEndRule = v.object({
  type: v.union(
    v.literal('never'),
    v.literal('on_date'),
    v.literal('after_occurrences'),
  ),
  date: v.optional(v.string()),
  count: v.optional(v.number()),
})

export const eventRecurrenceSetup = v.object({
  frequency: v.union(
    v.literal('daily'),
    v.literal('weekly'),
    v.literal('monthly'),
  ),
  interval: v.number(),
  daysOfWeek: v.optional(v.array(dayOfWeekNumber)),
  monthlyMode: v.optional(
    v.union(v.literal('dayOfMonth'), v.literal('weekdayPattern')),
  ),
  dayOfMonth: v.optional(v.number()),
  ordinal: v.optional(
    v.union(
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal('last'),
    ),
  ),
  weekday: v.optional(dayOfWeekNumber),
  missingDateStrategy: v.optional(
    v.union(v.literal('lastDayOfMonth'), v.literal('skip')),
  ),
  end: v.optional(recurrenceEndRule),
})

export const eventFields = {
  horseIds: v.array(v.id('horses')),
  createdBy: v.id('users'),
  stableId: v.id('stables'),
  type: eventType,
  title: v.string(),
  description: v.optional(v.string()),
  location: v.optional(v.string()),
  date: v.string(),
  time: v.string(),
  recurrence: v.optional(eventRecurrenceSetup),
}

const eventsSchema = defineTable({ ...eventFields })
  .index('by_stable_id', ['stableId'])
  .index('by_stable_id_date', ['stableId', 'date'])
  .index('by_created_by', ['createdBy'])
  .index('by_type', ['type'])

export const eventHorsesFields = {
  eventId: v.id('events'),
  horseId: v.id('horses'),
  status: v.optional(
    v.union(
      v.literal('confirmed'),
      v.literal('invited'),
      v.literal('declined'),
    ),
  ),
  invitedBy: v.optional(v.id('users')),
  approvedBy: v.optional(v.id('users')),
  invitedAt: v.optional(v.number()),
  approvedAt: v.optional(v.number()),
  declinedAt: v.optional(v.number()),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
}

const eventHorsesSchema = defineTable({ ...eventHorsesFields })
  .index('by_event_id', ['eventId'])
  .index('by_horse_id', ['horseId'])
  .index('by_horse_id_event_id', ['horseId', 'eventId'])
  .index('by_event_id_status', ['eventId', 'status'])

export default defineSchema({
  users: userSchema,
  stables: stablesSchema,
  stableMembers: stableMembersSchema,
  stableInvitations: stableInvitationsSchema,
  userSubscriptions: userSubscriptionsSchema,
  horses: horsesSchema,
  events: eventsSchema,
  eventsHorses: eventHorsesSchema,
})
