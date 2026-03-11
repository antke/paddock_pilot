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
  lastName: v.string(),
  photoUrl: v.string(),
}

const userSchema = defineTable({ ...userFields }).index('by_clerk_id', [
  'clerkId',
])

/**
 * STABLES
 */
export const stableFields = {
  name: v.string(),
  location: v.string(),
  description: v.optional(v.string()),
  ownerId: v.string(), // Clerk user ID
}

const stablesSchema = defineTable({ ...stableFields }).index('by_owner_id', [
  'ownerId',
])

/**
 * STABLE MEMBERS
 */
export const stableMembersFields = {
  stableId: v.id('stables'),
  userId: v.string(), // Clerk user ID
  role: v.union(v.literal('owner'), v.literal('member'), v.literal('guest')),
}

const stableMembersSchema = defineTable({ ...stableMembersFields })
  .index('by_stable_id', ['stableId'])
  .index('by_user_id', ['userId'])

/**
 * HORSES
 */
export const horsesFields = {
  stableId: v.id('stables'),
  ownerId: v.string(), // Clerk user ID
  name: v.string(),
  age: v.number(),
  breed: v.optional(v.string()),
}

const horsesSchema = defineTable({ ...horsesFields })
  .index('by_stable_id', ['stableId'])
  .index('by_owner_id', ['ownerId'])

/**
 * EVENTS
 */
export const eventType = v.union(
  v.literal('medical'),
  v.literal('training'),
  v.literal('maintenance'),
  v.literal('competition'),
  v.literal('other'),
)

export const eventState = v.union(
  v.literal('scheduled'),
  v.literal('completed'),
  v.literal('cancelled'),
)

export const recurrenceEndRule = v.object({
  type: v.union(v.literal('never'), v.literal('on_date')),
  date: v.optional(v.number()),
})

export const eventRecurrenceSetup = v.object({
  pattern: v.union(
    v.literal('daily'),
    v.literal('weekly'),
    v.literal('monthly'),
    v.literal('yearly'),
  ),
  interval: v.number(), // every X days
  daysOfWeek: v.optional(v.array(dayOfWeekNumber)),
  end: recurrenceEndRule,
})

export const eventFields = {
  horseId: v.id('horses'),
  type: eventType,
  tags: v.array(v.string()), // TODO: TBC IF THIS SHOULD BE A LITERAL, MAYBE SUB GROUPS?
  title: v.string(),
  description: v.optional(v.string()),
  date: v.number(),
  time: v.optional(v.string()), // TODO: HOW TO HANDLE TIMES?
  status: eventState,
  recurrence: v.optional(eventRecurrenceSetup),
}

const eventsSchema = defineTable({ ...eventFields })
  .index('by_horse_id', ['horseId'])
  .index('by_horse_id_date', ['horseId', 'date'])
  .index('by_date', ['date'])
  .index('by_status', ['status'])

export default defineSchema({
  users: userSchema,
  stables: stablesSchema,
  stableMembers: stableMembersSchema,
  horses: horsesSchema,
  events: eventsSchema,
})
