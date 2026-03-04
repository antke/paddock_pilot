import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export const stableFields = {
  name: v.string(),
  location: v.string(),
  description: v.optional(v.string()),
  ownerId: v.string(), // Clerk user ID
}

export const stableMembersFields = {
  stables: v.array(v.id('stables')),
  userId: v.string(), // Clerk user ID
  role: v.union(v.literal('owner'), v.literal('member'), v.literal('guest')),
}

export const horsesFields = {
  stableId: v.id('stables'),
  ownerId: v.string(), // Clerk user ID
  name: v.string(),
  age: v.number(),
  breed: v.optional(v.string()),
}

const stablesSchema = defineTable({ ...stableFields })
const stableMembersSchema = defineTable({ ...stableMembersFields })
const horsesSchema = defineTable({ ...horsesFields }).index('by_stable_id', [
  'stableId',
])

export default defineSchema({
  stables: stablesSchema,
  stableMembers: stableMembersSchema,
  horses: horsesSchema,
})
