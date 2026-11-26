import { ConvexError, v } from 'convex/values'
import { internal } from './_generated/api'
import type { TableNames } from './_generated/dataModel'
import {
  internalAction,
  internalMutation,
  internalQuery,
} from './_generated/server'
import schema from './schema'

// Set only on the disposable e2e deployment (see e2e/README.md), never on dev or prod.
const requireE2eDeployment = () => {
  if (process.env.E2E_RESET_ENABLED !== 'true')
    throw new ConvexError('E2E reset is disabled on this deployment')
}

const tables = Object.keys(schema.tables) as Array<TableNames>

export const wipePage = internalMutation({
  args: { table: v.string() },
  handler: async (ctx, args) => {
    requireE2eDeployment()
    if (args.table === '_storage') {
      const files = await ctx.db.system.query('_storage').take(100)
      for (const file of files) await ctx.storage.delete(file._id)
      return files.length
    }
    const rows = await ctx.db.query(args.table as TableNames).take(200)
    for (const row of rows) await ctx.db.delete(row._id)
    return rows.length
  },
})

/** Stands in for opening the inbox: the newest invitation token sent to an address. */
export const latestEmailToken = internalQuery({
  args: { recipient: v.string() },
  handler: async (ctx, args) => {
    requireE2eDeployment()
    const emails = await ctx.db.query('emailDeliveries').order('desc').take(500)
    for (const email of emails)
      if (
        email.recipient === args.recipient.toLowerCase() &&
        email.template &&
        'token' in email.template
      )
        return email.template.token
    return null
  },
})

/** The app refuses new skips on past dates; this stands in for skips made back when the date was ahead. */
export const seedPastSkips = internalMutation({
  args: {
    eventId: v.id('events'),
    skips: v.array(
      v.object({ date: v.string(), horseId: v.optional(v.id('horses')) }),
    ),
  },
  handler: async (ctx, args) => {
    requireE2eDeployment()
    await ctx.db.patch(args.eventId, { occurrenceSkips: args.skips })
  },
})

/**
 * Freezes a horse mid-move: every screen reads "moving" from horse.transitionId.
 * The transition is stored as complete, so the resume cron never runs it.
 */
export const holdMove = internalMutation({
  args: { horseId: v.id('horses'), hold: v.boolean() },
  handler: async (ctx, args) => {
    requireE2eDeployment()
    const horse = await ctx.db.get(args.horseId)
    if (!horse?.currentPlacementId || !horse.ownerId)
      throw new ConvexError('Hold a placed, owned horse')
    if (!args.hold) {
      if (horse.transitionId) await ctx.db.delete(horse.transitionId)
      await ctx.db.patch(horse._id, { transitionId: undefined })
      return
    }
    const transitionId = await ctx.db.insert('horseTransitions', {
      horseId: horse._id,
      placementId: horse.currentPlacementId,
      actorUserId: horse.ownerId,
      carryReminderIds: [],
      phase: 0,
      startedAt: Date.now(),
      status: 'complete',
    })
    await ctx.db.patch(horse._id, { transitionId })
  },
})

/** Empties every table and stored file so each e2e run seeds from scratch. */
export const reset = internalAction({
  args: {},
  handler: async (ctx) => {
    requireE2eDeployment()
    for (const table of [...tables, '_storage'])
      while ((await ctx.runMutation(internal.e2e.wipePage, { table })) > 0) {
        /* bounded transactions */
      }
    return { tables: tables.length }
  },
})
