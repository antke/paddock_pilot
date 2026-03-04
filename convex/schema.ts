import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export const stableFields = {
  name: v.string(),
  location: v.string(),
  description: v.optional(v.string()),
  ownerId: v.string(), // Clerk user ID
}

const stablesSchema = defineTable({ ...stableFields })

export const stableMembersFields = {
  stables: v.array(v.id('stables')),
  userId: v.string(), // Clerk user ID
  role: v.union(v.literal('owner'), v.literal('member'), v.literal('guest')),
}

const stableMembersSchema = defineTable({ ...stableMembersFields })

export default defineSchema({
  stables: stablesSchema,
  stableMembers: stableMembersSchema,
})
