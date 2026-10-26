import { ConvexError, v } from 'convex/values'
import { internalMutation, mutation, query } from './_generated/server'
import { internal } from './_generated/api'
import type { Doc } from './_generated/dataModel'
import type { QueryCtx, MutationCtx } from './_generated/server'
import { assertHorseOwner } from './libs/horsePermissions'
import {
  assertIsStableParticipant,
  getCurrentUser,
} from './libs/stablePermissions'
import { writeRecordShare } from './libs/recordSharing'
import { connectHorse } from './horseTransitions'

const category = v.union(
  v.literal('events'),
  v.literal('training'),
  v.literal('care'),
  v.literal('documents'),
  v.literal('tasks'),
)
const sources = [
  'eventsHorses',
  'horseHealthIssues',
  'horseMedicationRecords',
  'horseWeightRecords',
  'horseNutritionLogs',
  'stableDocuments',
  'careReminders',
] as const
const day = (cutoff: number) => new Date(cutoff).toISOString().slice(0, 10)
async function candidate(
  ctx: QueryCtx | MutationCtx,
  row: Doc<(typeof sources)[number]>,
  cutoff: number,
) {
  if (row._creationTime > cutoff) return null
  if ('eventId' in row && ctx.db.normalizeId('eventsHorses', row._id)) {
    const participation = row as Doc<'eventsHorses'>
    if (
      participation.status === 'declined' ||
      participation.status === 'invited' ||
      participation.status === 'withdrawn'
    )
      return null
    const event = await ctx.db.get(participation.eventId)
    if (!event || event.date > day(cutoff)) return null
    return {
      recordId: event._id as string,
      category: event.type === 'training' ? 'training' : 'events',
      throughDate: event.recurrence ? day(cutoff) : undefined,
      recurring: Boolean(event.recurrence),
    }
  }
  if ('fileName' in row) {
    // Other/insurance can contain financial paperwork; those require explicit record sharing.
    if (row.type === 'other' || row.type === 'insurance') return null
    return {
      recordId: row._id as string,
      category: 'documents',
      recurring: false,
    }
  }
  if ('dueDate' in row)
    return {
      recordId: row._id as string,
      category: row.status === 'pending' ? 'tasks' : 'care',
      recurring: false,
    }
  return { recordId: row._id as string, category: 'care', recurring: false }
}

export const preview = query({
  args: { horseId: v.id('horses'), cutoff: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.horseId)
    if (!horse) throw new ConvexError('Horse not found')
    await assertHorseOwner(ctx, horse)
    const cutoff = Math.min(args.cutoff ?? Date.now(), Date.now())
    const counts = { events: 0, training: 0, care: 0, documents: 0, tasks: 0 }
    let recurring = 0
    const seen = new Set<string>()
    for (const table of sources) {
      const rows =
        table === 'careReminders'
          ? await ctx.db
              .query(table)
              .withIndex('by_horse_id_due_date', (q) =>
                q.eq('horseId', horse._id),
              )
              .collect()
          : await ctx.db
              .query(table)
              .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
              .collect()
      for (const row of rows) {
        const item = await candidate(ctx, row, cutoff)
        if (!item || seen.has(item.recordId)) continue
        seen.add(item.recordId)
        counts[item.category as keyof typeof counts]++
        if (item.recurring) recurring++
      }
    }
    return {
      cutoff,
      throughDate: day(cutoff),
      counts,
      recurring,
      includesCurrentCareProfile: true,
    }
  },
})

export const start = mutation({
  args: {
    horseId: v.id('horses'),
    stableId: v.id('stables'),
    categories: v.array(category),
    cutoff: v.number(),
    requestId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const existing = await ctx.db
      .query('historySharingJobs')
      .withIndex('by_user_request', (q) =>
        q.eq('userId', user._id).eq('requestId', args.requestId),
      )
      .unique()
    if (existing) {
      if (
        existing.horseId !== args.horseId ||
        existing.stableId !== args.stableId
      )
        throw new ConvexError(
          'Retry does not match the original sharing request',
        )
      return existing._id
    }
    let horse = await ctx.db.get(args.horseId)
    if (!horse) throw new ConvexError('Horse not found')
    await assertHorseOwner(ctx, horse)
    await assertIsStableParticipant(ctx, args.stableId, user._id)
    if (horse.stableId && horse.stableId !== args.stableId)
      throw new ConvexError('Review and complete the horse move first')
    if (!horse.stableId) {
      await connectHorse(ctx, horse._id, args.stableId, user._id)
      horse = (await ctx.db.get(horse._id))!
    }
    if (!horse.currentPlacementId)
      throw new ConvexError('Horse placement must be reviewed')
    if (
      !Number.isFinite(args.cutoff) ||
      args.cutoff > Date.now() ||
      args.cutoff < 0
    )
      throw new ConvexError('Invalid history cutoff')
    const id = await ctx.db.insert('historySharingJobs', {
      horseId: horse._id,
      stableId: args.stableId,
      placementId: horse.currentPlacementId,
      userId: user._id,
      requestId: args.requestId,
      cutoff: args.cutoff,
      categories: [...new Set(args.categories)],
      phase: 0,
      processed: 0,
      status: 'running',
    })
    await ctx.scheduler.runAfter(0, internal.historySharing.advance, { id })
    return id
  },
})

export const jobsForHorse = query({
  args: { horseId: v.id('horses') },
  handler: async (ctx, { horseId }) => {
    const horse = await ctx.db.get(horseId)
    if (!horse) return []
    await assertHorseOwner(ctx, horse)
    return ctx.db
      .query('historySharingJobs')
      .withIndex('by_horse', (q) => q.eq('horseId', horseId))
      .collect()
  },
})

export const retry = mutation({
  args: { id: v.id('historySharingJobs') },
  handler: async (ctx, { id }) => {
    const job = await ctx.db.get(id)
    const user = await getCurrentUser(ctx)
    if (!job || job.userId !== user._id)
      throw new ConvexError('Sharing job not found')
    if (job.status === 'complete') return
    await ctx.db.patch(id, { status: 'running', error: undefined })
    await ctx.scheduler.runAfter(0, internal.historySharing.advance, { id })
  },
})

export const advance = internalMutation({
  args: { id: v.id('historySharingJobs') },
  handler: async (ctx, { id }) => {
    const job = await ctx.db.get(id)
    if (!job || job.status !== 'running') return
    const horse = await ctx.db.get(job.horseId)
    if (
      !horse ||
      horse.ownerId !== job.userId ||
      horse.currentPlacementId !== job.placementId ||
      horse.stableId !== job.stableId ||
      horse.transitionId ||
      horse.deletedAt !== undefined
    ) {
      await ctx.db.patch(id, {
        status: 'failed',
        error:
          'Horse ownership or placement changed. Review the horse before retrying.',
      })
      return
    }
    try {
      await assertIsStableParticipant(ctx, job.stableId, job.userId)
    } catch {
      await ctx.db.patch(id, {
        status: 'failed',
        error: 'Stable membership changed. Restore membership before retrying.',
      })
      return
    }
    const grant = {
      horseId: horse._id,
      stableId: job.stableId,
      placementId: job.placementId,
      enabled: true,
      createdBy: job.userId,
    }
    if (job.phase >= sources.length) {
      if (job.categories.includes('care'))
        await writeRecordShare(ctx, { ...grant, recordId: horse._id })
      await ctx.db.patch(id, { status: 'complete', error: undefined })
      return
    }
    const table = sources[job.phase]
    const page =
      table === 'careReminders'
        ? await ctx.db
            .query(table)
            .withIndex('by_horse_id_due_date', (q) =>
              q.eq('horseId', horse._id),
            )
            .paginate({ cursor: job.cursor ?? null, numItems: 40 })
        : await ctx.db
            .query(table)
            .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
            .paginate({ cursor: job.cursor ?? null, numItems: 40 })
    let processed = job.processed
    for (const row of page.page) {
      const item = await candidate(ctx, row, job.cutoff)
      if (!item || !job.categories.includes(item.category)) continue
      await writeRecordShare(ctx, {
        ...grant,
        recordId: item.recordId,
        throughDate: 'throughDate' in item ? item.throughDate : undefined,
      })
      processed++
    }
    await ctx.db.patch(id, {
      processed,
      phase: page.isDone ? job.phase + 1 : job.phase,
      cursor: page.isDone ? undefined : page.continueCursor,
    })
    await ctx.scheduler.runAfter(0, internal.historySharing.advance, { id })
  },
})
