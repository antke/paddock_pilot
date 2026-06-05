import { ConvexError, v } from 'convex/values'
import { careReminderInputSchema } from '../shared/reminders/careReminderSchema'
import type { Doc, Id } from './_generated/dataModel'
import { mutation, query   } from './_generated/server'
import type {MutationCtx, QueryCtx} from './_generated/server';
import {
  assertCanViewStable,
  getCurrentUser
  
} from './libs/stablePermissions'
import type {StableRole} from './libs/stablePermissions';

const reminderCategoryValidator = v.union(
  v.literal('vet'),
  v.literal('farrier'),
  v.literal('dentist'),
  v.literal('medication'),
  v.literal('nutrition'),
  v.literal('weight'),
  v.literal('deworming'),
  v.literal('admin'),
  v.literal('other'),
)

const reminderPriorityValidator = v.union(
  v.literal('low'),
  v.literal('medium'),
  v.literal('high'),
)

const reminderStatusValidator = v.union(
  v.literal('pending'),
  v.literal('completed'),
  v.literal('dismissed'),
)

const validateReminderInput = (args: {
  stableId: Id<'stables'>
  horseId?: Id<'horses'>
  eventId?: Id<'events'>
  title: string
  description?: string
  category: Doc<'careReminders'>['category']
  dueDate: string
  priority?: Doc<'careReminders'>['priority']
  status?: Doc<'careReminders'>['status']
}) => {
  const result = careReminderInputSchema.safeParse(args)

  if (!result.success) {
    throw new ConvexError(
      result.error.issues[0]?.message ?? 'Invalid reminder input',
    )
  }

  return result.data
}

const todayTimestamp = () => Date.now()

const canManageStableReminder = (role: StableRole | undefined) => {
  return role === 'owner' || role === 'member'
}

const canManageReminder = (
  access: { role: StableRole | undefined; userId: Id<'users'> },
  reminder: Pick<Doc<'careReminders'>, 'horseId'>,
  horse?: Doc<'horses'> | null,
) => {
  if (canManageStableReminder(access.role)) return true
  return Boolean(reminder.horseId && horse?.ownerId === access.userId)
}

const getReminderContext = async (
  ctx: MutationCtx | QueryCtx,
  id: Id<'careReminders'>,
) => {
  const reminder = await ctx.db.get(id)
  if (!reminder) throw new ConvexError('Reminder not found')

  const [horse, event] = await Promise.all([
    reminder.horseId ? ctx.db.get(reminder.horseId) : Promise.resolve(null),
    reminder.eventId ? ctx.db.get(reminder.eventId) : Promise.resolve(null),
  ])

  return { reminder, horse, event }
}

const assertLinkedRowsBelongToStable = async (
  ctx: MutationCtx,
  stableId: Id<'stables'>,
  horseId?: Id<'horses'>,
  eventId?: Id<'events'>,
) => {
  const [horse, event] = await Promise.all([
    horseId ? ctx.db.get(horseId) : Promise.resolve(null),
    eventId ? ctx.db.get(eventId) : Promise.resolve(null),
  ])

  if (horseId && (!horse || horse.stableId !== stableId)) {
    throw new ConvexError('Horse does not belong to this stable')
  }

  if (eventId && (!event || event.stableId !== stableId)) {
    throw new ConvexError('Event does not belong to this stable')
  }

  return { horse, event }
}

const byReminderSort = (a: Doc<'careReminders'>, b: Doc<'careReminders'>) => {
  if (a.status !== b.status) {
    if (a.status === 'pending') return -1
    if (b.status === 'pending') return 1
  }

  const dateSort = a.dueDate.localeCompare(b.dueDate)
  if (dateSort !== 0) return dateSort

  return b.createdAt - a.createdAt
}

export const listForStable = query({
  args: { stableId: v.id('stables') },
  handler: async (ctx, args) => {
    const access = await assertCanViewStable(ctx, args.stableId)
    const reminders = await ctx.db
      .query('careReminders')
      .withIndex('by_stable_id_due_date', (q) => q.eq('stableId', args.stableId))
      .collect()
    const horses = await Promise.all(
      reminders.map((reminder) =>
        reminder.horseId ? ctx.db.get(reminder.horseId) : Promise.resolve(null),
      ),
    )

    return {
      canManageStableReminders: canManageStableReminder(access.role),
      reminders: reminders.sort(byReminderSort).map((reminder) => {
        const horse = horses.find((item) => item?._id === reminder.horseId)

        return {
          reminder,
          horseName: horse?.name,
          canManage: canManageReminder(access, reminder, horse),
        }
      }),
    }
  },
})

export const listForHorse = query({
  args: { horseId: v.id('horses') },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.horseId)
    if (!horse) return { canManage: false, reminders: [] }

    const access = await assertCanViewStable(ctx, horse.stableId)
    const reminders = await ctx.db
      .query('careReminders')
      .withIndex('by_horse_id_due_date', (q) => q.eq('horseId', args.horseId))
      .collect()

    return {
      canManage: canManageReminder(access, { horseId: horse._id }, horse),
      reminders: reminders.sort(byReminderSort),
    }
  },
})

export const add = mutation({
  args: {
    stableId: v.id('stables'),
    horseId: v.optional(v.id('horses')),
    eventId: v.optional(v.id('events')),
    title: v.string(),
    description: v.optional(v.string()),
    category: reminderCategoryValidator,
    dueDate: v.string(),
    priority: v.optional(reminderPriorityValidator),
    status: v.optional(reminderStatusValidator),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const access = await assertCanViewStable(ctx, args.stableId, user._id)
    const input = validateReminderInput(args)
    const { horse } = await assertLinkedRowsBelongToStable(
      ctx,
      args.stableId,
      args.horseId,
      args.eventId,
    )

    if (!canManageReminder(access, { horseId: args.horseId }, horse)) {
      throw new ConvexError('Not authorized to manage this reminder')
    }

    const now = todayTimestamp()
    return await ctx.db.insert('careReminders', {
      ...input,
      stableId: args.stableId,
      horseId: args.horseId,
      eventId: args.eventId,
      status: input.status,
      completedAt: input.status === 'completed' ? now : undefined,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const update = mutation({
  args: {
    id: v.id('careReminders'),
    horseId: v.optional(v.id('horses')),
    eventId: v.optional(v.id('events')),
    title: v.string(),
    description: v.optional(v.string()),
    category: reminderCategoryValidator,
    dueDate: v.string(),
    priority: v.optional(reminderPriorityValidator),
    status: reminderStatusValidator,
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const { reminder, horse } = await getReminderContext(ctx, args.id)
    const access = await assertCanViewStable(ctx, reminder.stableId, user._id)

    if (!canManageReminder(access, reminder, horse)) {
      throw new ConvexError('Not authorized to manage this reminder')
    }

    const input = validateReminderInput({ ...args, stableId: reminder.stableId })
    const nextRows = await assertLinkedRowsBelongToStable(
      ctx,
      reminder.stableId,
      args.horseId,
      args.eventId,
    )

    if (!canManageReminder(access, { horseId: args.horseId }, nextRows.horse)) {
      throw new ConvexError('Not authorized to manage this reminder')
    }

    await ctx.db.patch(args.id, {
      horseId: args.horseId,
      eventId: args.eventId,
      title: input.title,
      description: input.description,
      category: input.category,
      dueDate: input.dueDate,
      priority: input.priority,
      status: input.status,
      completedAt: input.status === 'completed' ? (reminder.completedAt ?? Date.now()) : undefined,
      updatedAt: Date.now(),
    })
  },
})

export const complete = mutation({
  args: { id: v.id('careReminders') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const { reminder, horse } = await getReminderContext(ctx, args.id)
    const access = await assertCanViewStable(ctx, reminder.stableId, user._id)

    if (!canManageReminder(access, reminder, horse)) {
      throw new ConvexError('Not authorized to manage this reminder')
    }

    const now = Date.now()
    await ctx.db.patch(args.id, {
      status: 'completed',
      completedAt: now,
      updatedAt: now,
    })
  },
})

export const dismiss = mutation({
  args: { id: v.id('careReminders') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const { reminder, horse } = await getReminderContext(ctx, args.id)
    const access = await assertCanViewStable(ctx, reminder.stableId, user._id)

    if (!canManageReminder(access, reminder, horse)) {
      throw new ConvexError('Not authorized to manage this reminder')
    }

    await ctx.db.patch(args.id, {
      status: 'dismissed',
      completedAt: undefined,
      updatedAt: Date.now(),
    })
  },
})

export const remove = mutation({
  args: { id: v.id('careReminders') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const { reminder, horse } = await getReminderContext(ctx, args.id)
    const access = await assertCanViewStable(ctx, reminder.stableId, user._id)

    if (!canManageReminder(access, reminder, horse)) {
      throw new ConvexError('Not authorized to manage this reminder')
    }

    await ctx.db.delete(args.id)
  },
})
