import {
  assertCanReadHorse,
  assertCanAddHorseRecord,
  getHorseAccess,
} from './libs/horsePermissions'
import { ConvexError, v } from 'convex/values'
import { paginationOptsValidator } from 'convex/server'
import type { PaginationResult } from 'convex/server'
import {
  careReminderDueDateSchema,
  careReminderInputSchema,
} from '../shared/reminders/careReminderSchema'
import { canManageLinkedRecord } from '../shared/stables/stableAccess'
import type { Doc, Id } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import {
  careReminderCategory as reminderCategoryValidator,
  careReminderPriority as reminderPriorityValidator,
  careReminderStatus as reminderStatusValidator,
} from './schema'
import { assertCanViewStable, getCurrentUser } from './libs/stablePermissions'
import type { StableRole } from './libs/stablePermissions'
import { resolveTodayDateKey } from './libs/dateKeys'
import { isActiveHorse } from './libs/horseState'

const reminderStateFilterValidator = v.union(
  v.literal('overdue'),
  v.literal('pending'),
  v.literal('completed'),
  v.literal('dismissed'),
)

const validateReminderInput = (args: {
  stableId?: Id<'stables'>
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

const canManageReminder = (
  access: { role: StableRole; userId: Id<'users'>; canManage?: boolean },
  reminder: Pick<Doc<'careReminders'>, 'horseId' | 'eventId'>,
  horse?: Doc<'horses'> | null,
  event?: Doc<'events'> | null,
) =>
  access.canManage ??
  canManageLinkedRecord({
    role: access.role,
    userId: access.userId,
    horseOwnerId: reminder.horseId ? horse?.ownerId : undefined,
    eventCreatedBy: reminder.eventId ? event?.createdBy : undefined,
  })

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
  stableId: Id<'stables'> | undefined,
  horseId?: Id<'horses'>,
  eventId?: Id<'events'>,
) => {
  const [horse, event] = await Promise.all([
    horseId ? ctx.db.get(horseId) : Promise.resolve(null),
    eventId ? ctx.db.get(eventId) : Promise.resolve(null),
  ])

  if (
    horseId &&
    (!horse ||
      horse.transitionId ||
      (stableId !== undefined && horse.stableId !== stableId))
  ) {
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

const mapStableReminderListItems = async (
  ctx: QueryCtx,
  access: { role: StableRole; userId: Id<'users'>; canManage?: boolean },
  reminders: Array<Doc<'careReminders'>>,
): Promise<Array<StableReminderListItem>> => {
  const horses = await Promise.all(
    reminders.map((reminder) =>
      reminder.horseId ? ctx.db.get(reminder.horseId) : Promise.resolve(null),
    ),
  )
  const events = await Promise.all(
    reminders.map((reminder) =>
      reminder.eventId ? ctx.db.get(reminder.eventId) : Promise.resolve(null),
    ),
  )

  const people = await Promise.all(
    reminders.map(async (reminder) => ({
      assignee: reminder.assignedTo
        ? await ctx.db.get(reminder.assignedTo)
        : null,
      completer: reminder.completedBy
        ? await ctx.db.get(reminder.completedBy)
        : null,
    })),
  )

  const recordAccess = await Promise.all(
    horses.map((horse) =>
      horse ? getHorseAccess(ctx, horse, access.userId) : null,
    ),
  )
  return reminders.flatMap((reminder, index) => {
    const horse = horses[index]
    const event = events[index]
    if (reminder.horseId && !isActiveHorse(horse)) return []
    const permission = recordAccess[index]
    if (horse && !permission?.canRead && reminder.assignedTo !== access.userId)
      return []
    const itemAccess = {
      ...access,
      canManage: permission
        ? permission.canEditPersonalRecords ||
          (permission.isAdmin &&
            reminder.sourcePlacementId === horse?.currentPlacementId &&
            reminder.stableId === horse?.stableId &&
            permission.canAddRecords)
        : access.role === 'owner' || event?.createdBy === access.userId,
    }

    return [
      {
        reminder,
        horseName: horse?.name,
        assigneeName: people[index].assignee
          ? personName(people[index].assignee)
          : undefined,
        completedByName: people[index].completer
          ? personName(people[index].completer)
          : undefined,
        canComplete:
          canManageReminder(itemAccess, reminder, horse, event) ||
          reminder.assignedTo === access.userId,
        canReopen:
          canManageReminder(itemAccess, reminder, horse, event) ||
          (reminder.completedBy === access.userId &&
            reminder.assignedTo === access.userId),
        canManage: canManageReminder(itemAccess, reminder, horse, event),
      },
    ]
  })
}

type StableReminderListItem = {
  reminder: Doc<'careReminders'>
  horseName?: string
  canManage: boolean
  canComplete: boolean
  canReopen: boolean
  assigneeName?: string
  completedByName?: string
}

const mapStableReminderPage = async (
  ctx: QueryCtx,
  access: { role: StableRole; userId: Id<'users'>; canManage?: boolean },
  page: PaginationResult<Doc<'careReminders'>>,
): Promise<PaginationResult<StableReminderListItem>> => ({
  ...page,
  page: await mapStableReminderListItems(ctx, access, page.page),
})

export const listForStable = query({
  args: { stableId: v.id('stables') },
  handler: async (ctx, args) => {
    const access = await assertCanViewStable(ctx, args.stableId)
    const reminders = await ctx.db
      .query('careReminders')
      .withIndex('by_stable_id_due_date', (q) =>
        q.eq('stableId', args.stableId),
      )
      .collect()

    return {
      canManageStableReminders: access.capabilities.canManageStableReminders,
      reminders: await mapStableReminderListItems(
        ctx,
        access,
        reminders.sort(byReminderSort),
      ),
    }
  },
})

export const getStableReminderPermissions = query({
  args: { stableId: v.id('stables') },
  handler: async (ctx, args) => {
    const access = await assertCanViewStable(ctx, args.stableId)

    return {
      canManageStableReminders: access.capabilities.canManageStableReminders,
    }
  },
})

export const listForStablePaginated = query({
  args: {
    stableId: v.id('stables'),
    searchQuery: v.optional(v.string()),
    horseId: v.optional(v.id('horses')),
    stableWideOnly: v.optional(v.boolean()),
    state: v.optional(reminderStateFilterValidator),
    category: v.optional(reminderCategoryValidator),
    today: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const access = await assertCanViewStable(ctx, args.stableId)
    const searchQuery = args.searchQuery?.trim()

    if (searchQuery) {
      let remindersQuery = ctx.db
        .query('careReminders')
        .withSearchIndex('search_title', (q) =>
          q.search('title', searchQuery).eq('stableId', args.stableId),
        )

      if (args.stableWideOnly) {
        remindersQuery = remindersQuery.filter((q) =>
          q.eq(q.field('horseId'), undefined),
        )
      } else if (args.horseId) {
        remindersQuery = remindersQuery.filter((q) =>
          q.eq(q.field('horseId'), args.horseId),
        )
      }

      if (args.state === 'overdue') {
        const today = resolveTodayDateKey(args.today)
        remindersQuery = remindersQuery.filter((q) =>
          q.and(
            q.eq(q.field('status'), 'pending'),
            q.lt(q.field('dueDate'), today),
          ),
        )
      } else if (args.state) {
        remindersQuery = remindersQuery.filter((q) =>
          q.eq(q.field('status'), args.state),
        )
      }

      if (args.category) {
        remindersQuery = remindersQuery.filter((q) =>
          q.eq(q.field('category'), args.category),
        )
      }

      const page = await remindersQuery.paginate(args.paginationOpts)

      return mapStableReminderPage(ctx, access, page)
    }

    if (args.stableWideOnly || args.horseId) {
      const horseId = args.stableWideOnly ? undefined : args.horseId
      let remindersQuery = ctx.db
        .query('careReminders')
        .withIndex('by_stable_id_horse_id_due_date', (q) =>
          q.eq('stableId', args.stableId).eq('horseId', horseId),
        )

      if (args.state === 'overdue') {
        const today = resolveTodayDateKey(args.today)
        remindersQuery = remindersQuery.filter((q) =>
          q.and(
            q.eq(q.field('status'), 'pending'),
            q.lt(q.field('dueDate'), today),
          ),
        )
      } else if (args.state) {
        remindersQuery = remindersQuery.filter((q) =>
          q.eq(q.field('status'), args.state),
        )
      }

      if (args.category) {
        remindersQuery = remindersQuery.filter((q) =>
          q.eq(q.field('category'), args.category),
        )
      }

      const page = await remindersQuery.paginate(args.paginationOpts)

      return mapStableReminderPage(ctx, access, page)
    }

    if (args.state === 'overdue') {
      const today = resolveTodayDateKey(args.today)
      let remindersQuery = ctx.db
        .query('careReminders')
        .withIndex('by_stable_id_status_due_date', (q) =>
          q
            .eq('stableId', args.stableId)
            .eq('status', 'pending')
            .lt('dueDate', today),
        )

      if (args.category) {
        remindersQuery = remindersQuery.filter((q) =>
          q.eq(q.field('category'), args.category),
        )
      }

      const page = await remindersQuery.paginate(args.paginationOpts)

      return mapStableReminderPage(ctx, access, page)
    }

    if (args.state) {
      const status = args.state
      let remindersQuery = ctx.db
        .query('careReminders')
        .withIndex('by_stable_id_status_due_date', (q) =>
          q.eq('stableId', args.stableId).eq('status', status),
        )

      if (args.category) {
        remindersQuery = remindersQuery.filter((q) =>
          q.eq(q.field('category'), args.category),
        )
      }

      const page = await remindersQuery.paginate(args.paginationOpts)

      return mapStableReminderPage(ctx, access, page)
    }

    if (args.category) {
      const category = args.category
      const page = await ctx.db
        .query('careReminders')
        .withIndex('by_stable_id_category_due_date', (q) =>
          q.eq('stableId', args.stableId).eq('category', category),
        )
        .paginate(args.paginationOpts)

      return mapStableReminderPage(ctx, access, page)
    }

    const page = await ctx.db
      .query('careReminders')
      .withIndex('by_stable_id_due_date', (q) =>
        q.eq('stableId', args.stableId),
      )
      .paginate(args.paginationOpts)

    return mapStableReminderPage(ctx, access, page)
  },
})

export const listForHorse = query({
  args: { horseId: v.id('horses') },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.horseId)
    if (!isActiveHorse(horse)) {
      return { canManage: false, reminders: [] }
    }

    const permission = await assertCanReadHorse(ctx, horse)
    const access = { ...permission, canManage: permission.canAddRecords }
    const reminders = await ctx.db
      .query('careReminders')
      .withIndex('by_horse_id_due_date', (q) => q.eq('horseId', args.horseId))
      .collect()

    return {
      canManage: canManageReminder(
        access,
        { horseId: horse._id, eventId: undefined },
        horse,
      ),
      reminders: reminders.sort(byReminderSort),
      items: await mapStableReminderListItems(
        ctx,
        access,
        reminders.sort(byReminderSort),
      ),
    }
  },
})

export const add = mutation({
  args: {
    stableId: v.optional(v.id('stables')),
    assignedTo: v.optional(v.id('users')),
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
    const targetHorse = args.horseId ? await ctx.db.get(args.horseId) : null
    const horsePermission = targetHorse
      ? await assertCanAddHorseRecord(ctx, targetHorse, user._id)
      : null
    const access = horsePermission
      ? { ...horsePermission, canManage: true }
      : await assertCanViewStable(ctx, args.stableId, user._id)
    const input = validateReminderInput(args)
    const { horse, event } = await assertLinkedRowsBelongToStable(
      ctx,
      args.stableId,
      args.horseId,
      args.eventId,
    )

    if (
      !canManageReminder(
        access,
        { horseId: args.horseId, eventId: args.eventId },
        horse,
        event,
      )
    ) {
      throw new ConvexError('Not authorized to manage this reminder')
    }

    await assertAssignee(
      ctx,
      horsePermission ? horsePermission.recordOrigin.stableId : args.stableId,
      args.assignedTo,
      args.horseId,
    )
    const now = todayTimestamp()
    return await ctx.db.insert('careReminders', {
      ...input,
      stableId: horsePermission
        ? horsePermission.recordOrigin.stableId
        : args.stableId,
      sourcePlacementId: horsePermission?.recordOrigin.sourcePlacementId,
      horseId: args.horseId,
      eventId: args.eventId,
      status: input.status,
      assignedTo: args.assignedTo,
      completedBy: input.status === 'completed' ? user._id : undefined,
      completedAt: input.status === 'completed' ? now : undefined,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const addForHorses = mutation({
  args: {
    stableId: v.id('stables'),
    horseIds: v.array(v.id('horses')),
    assignedTo: v.optional(v.id('users')),
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

    if (args.horseIds.length === 0) {
      throw new ConvexError('Select at least one horse')
    }

    const input = validateReminderInput({
      stableId: args.stableId,
      title: args.title,
      description: args.description,
      category: args.category,
      dueDate: args.dueDate,
      priority: args.priority,
      status: args.status,
    })
    const horseIds = [...new Set(args.horseIds)]
    const horses = await Promise.all(
      horseIds.map((horseId) => ctx.db.get(horseId)),
    )

    if (
      horses.some(
        (horse) => !isActiveHorse(horse) || horse.stableId !== args.stableId,
      )
    ) {
      throw new ConvexError('Horse does not belong to this stable')
    }

    if (
      access.role !== 'owner' &&
      horses.some((horse) => horse?.ownerId !== user._id)
    ) {
      throw new ConvexError('Members can only add reminders for their horses')
    }

    const now = todayTimestamp()
    return await Promise.all(
      horseIds.map(async (horseId) => {
        const horse = horses.find((h) => h?._id === horseId)!
        const permission = await assertCanAddHorseRecord(ctx, horse, user._id)
        await assertAssignee(
          ctx,
          permission.recordOrigin.stableId,
          args.assignedTo,
          horseId,
        )
        return ctx.db.insert('careReminders', {
          ...permission.recordOrigin,
          horseId,
          title: input.title,
          description: input.description,
          category: input.category,
          dueDate: input.dueDate,
          priority: input.priority,
          status: input.status,
          assignedTo: args.assignedTo,
          completedBy: input.status === 'completed' ? user._id : undefined,
          completedAt: input.status === 'completed' ? now : undefined,
          createdBy: user._id,
          createdAt: now,
          updatedAt: now,
        })
      }),
    )
  },
})

export const update = mutation({
  args: {
    id: v.id('careReminders'),
    assignedTo: v.optional(v.id('users')),
    horseId: v.optional(v.id('horses')),
    eventId: v.optional(v.id('events')),
    title: v.string(),
    description: v.optional(v.string()),
    category: reminderCategoryValidator,
    dueDate: v.string(),
    priority: v.optional(reminderPriorityValidator),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const { reminder, horse, event } = await getReminderContext(ctx, args.id)
    const access = await getReminderAccess(ctx, reminder, user._id)

    if (!canManageReminder(access, reminder, horse, event)) {
      throw new ConvexError('Not authorized to manage this reminder')
    }

    const input = validateReminderInput({
      ...args,
      stableId: reminder.stableId,
      status: reminder.status,
    })
    if (args.horseId !== reminder.horseId || args.eventId !== reminder.eventId)
      throw new ConvexError('Create a new task to change its horse or event')
    const nextRows = await assertLinkedRowsBelongToStable(
      ctx,
      reminder.stableId,
      args.horseId,
      args.eventId,
    )

    if (
      !canManageReminder(
        access,
        { horseId: args.horseId, eventId: args.eventId },
        nextRows.horse,
        nextRows.event,
      )
    ) {
      throw new ConvexError('Not authorized to manage this reminder')
    }

    await assertAssignee(ctx, reminder.stableId, args.assignedTo, args.horseId)
    await ctx.db.patch(args.id, {
      assignedTo: args.assignedTo,
      horseId: args.horseId,
      eventId: args.eventId,
      title: input.title,
      description: input.description,
      category: input.category,
      dueDate: input.dueDate,
      priority: input.priority,
      updatedAt: Date.now(),
    })
  },
})

// Completion is separate from record editing: only managers or the assigned active
// member can confirm care. A retry cannot create a second follow-up or rewrite history.
export const complete = mutation({
  args: { id: v.id('careReminders'), nextDueDate: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const { reminder, horse, event } = await getReminderContext(ctx, args.id)
    const access = await getReminderAccess(ctx, reminder, user._id)
    const canManage = canManageReminder(access, reminder, horse, event)
    if (!canManage && reminder.assignedTo !== user._id) {
      throw new ConvexError('Not authorized to complete this reminder')
    }
    if (reminder.status === 'completed') return reminder.followUpReminderId
    if (reminder.status !== 'pending')
      throw new ConvexError('Reopen this reminder before completing it')
    // Scheduling follow-up care retains the existing edit permission boundary.
    if (args.nextDueDate && !canManage)
      throw new ConvexError('Not authorized to schedule follow-up care')
    if (
      args.nextDueDate &&
      (!careReminderDueDateSchema.safeParse(args.nextDueDate).success ||
        args.nextDueDate <= reminder.dueDate)
    ) {
      throw new ConvexError(
        'Next due date must be a valid date after the current due date',
      )
    }
    const now = Date.now()
    let followUpReminderId = reminder.followUpReminderId
    if (args.nextDueDate && !followUpReminderId) {
      followUpReminderId = await ctx.db.insert('careReminders', {
        stableId: reminder.stableId,
        sourcePlacementId: reminder.sourcePlacementId,
        horseId: reminder.horseId,
        eventId: reminder.eventId,
        title: reminder.title,
        description: reminder.description,
        category: reminder.category,
        priority: reminder.priority,
        dueDate: args.nextDueDate,
        status: 'pending',
        assignedTo: reminder.assignedTo,
        createdBy: user._id,
        createdAt: now,
        updatedAt: now,
      })
    }
    await ctx.db.patch(args.id, {
      status: 'completed',
      completedAt: now,
      completedBy: user._id,
      followUpReminderId,
      updatedAt: now,
    })
    return followUpReminderId
  },
})

export const reopen = mutation({
  args: { id: v.id('careReminders') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const { reminder, horse, event } = await getReminderContext(ctx, args.id)
    const access = await getReminderAccess(ctx, reminder, user._id)
    if (
      !canManageReminder(access, reminder, horse, event) &&
      !(
        reminder.status === 'completed' &&
        reminder.completedBy === user._id &&
        reminder.assignedTo === user._id
      )
    ) {
      throw new ConvexError('Not authorized to reopen this reminder')
    }
    // Keep any independently scheduled follow-up; never silently delete care.
    await ctx.db.patch(args.id, {
      status: 'pending',
      completedAt: undefined,
      completedBy: undefined,
      updatedAt: Date.now(),
    })
  },
})

export const dismiss = mutation({
  args: { id: v.id('careReminders') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const { reminder, horse, event } = await getReminderContext(ctx, args.id)
    const access = await getReminderAccess(ctx, reminder, user._id)

    if (!canManageReminder(access, reminder, horse, event)) {
      throw new ConvexError('Not authorized to manage this reminder')
    }

    await ctx.db.patch(args.id, {
      status: 'dismissed',
      completedAt: undefined,
      completedBy: undefined,
      updatedAt: Date.now(),
    })
  },
})

export const remove = mutation({
  args: { id: v.id('careReminders') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const { reminder, horse, event } = await getReminderContext(ctx, args.id)
    const access = await getReminderAccess(ctx, reminder, user._id)

    if (!canManageReminder(access, reminder, horse, event)) {
      throw new ConvexError('Not authorized to manage this reminder')
    }

    await ctx.db.delete(args.id)
  },
})

const personName = (user: Doc<'users'>) =>
  user.preferredName ||
  [user.firstName, user.lastName].filter(Boolean).join(' ')

const assertAssignee = async (
  ctx: MutationCtx,
  stableId: Id<'stables'> | undefined,
  assignedTo?: Id<'users'>,
  horseId?: Id<'horses'>,
) => {
  if (!assignedTo) return
  const user = await ctx.db.get(assignedTo)
  if (!user || user.deletedAt !== undefined)
    throw new ConvexError('Assignee is unavailable')
  if (stableId) await assertCanViewStable(ctx, stableId, assignedTo)
  else {
    const horse = horseId ? await ctx.db.get(horseId) : null
    if (
      !horse ||
      !(await getHorseAccess(ctx, horse, assignedTo)).canEditPersonalRecords
    )
      throw new ConvexError('Choose the owner or an editor carer')
  }
}

export const assigneeOptions = query({
  args: {
    stableId: v.optional(v.id('stables')),
    horseId: v.optional(v.id('horses')),
  },
  handler: async (ctx, args) => {
    if (args.horseId) {
      const horse = await ctx.db.get(args.horseId)
      if (!horse) return []
      const access = await assertCanReadHorse(ctx, horse)
      if (!access.isAdmin || access.canEditPersonalRecords) {
        const carers = await ctx.db
          .query('horseCarers')
          .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
          .collect()
        const ids = [
          ...new Set([
            ...(horse.ownerId ? [horse.ownerId] : []),
            ...carers.filter((c) => c.role === 'editor').map((c) => c.userId),
          ]),
        ]
        const people = await Promise.all(ids.map((id) => ctx.db.get(id)))
        return people.flatMap((user) =>
          user && user.deletedAt === undefined
            ? [{ id: user._id, name: personName(user) }]
            : [],
        )
      }
    }
    const access = await assertCanViewStable(ctx, args.stableId)
    const members = await ctx.db
      .query('stableMembers')
      .withIndex('by_stable_id', (q) => q.eq('stableId', access.stable._id))
      .collect()
    const ids = [
      ...new Set([
        access.stable.ownerId,
        ...members.filter((m) => m.role === 'member').map((m) => m.userId),
      ]),
    ]
    const people = await Promise.all(ids.map((id) => ctx.db.get(id)))
    return people.flatMap((user) =>
      user && user.deletedAt === undefined
        ? [{ id: user._id, name: personName(user) }]
        : [],
    )
  },
})

export const get = query({
  args: { stableId: v.id('stables'), id: v.string() },
  handler: async (ctx, args) => {
    const access = await assertCanViewStable(ctx, args.stableId)
    const id = ctx.db.normalizeId('careReminders', args.id)
    const reminder = id ? await ctx.db.get(id) : null
    if (!reminder || reminder.stableId !== args.stableId) return null
    return (
      (await mapStableReminderListItems(ctx, access, [reminder]))[0] ?? null
    )
  },
})

async function getReminderAccess(
  ctx: MutationCtx,
  reminder: Doc<'careReminders'>,
  userId: Id<'users'>,
) {
  if (!reminder.horseId)
    return assertCanViewStable(ctx, reminder.stableId, userId)
  const horse = await ctx.db.get(reminder.horseId)
  if (!horse) throw new ConvexError('Horse not found')
  const access = await getHorseAccess(ctx, horse, userId)
  if (!access.canRead) {
    if (reminder.assignedTo !== userId || !reminder.stableId)
      throw new ConvexError('Not authorized to view this reminder')
    await assertCanViewStable(ctx, reminder.stableId, userId)
  }
  if (horse.transitionId)
    throw new ConvexError('Horse is moving; please try again shortly')
  return {
    ...access,
    canManage:
      access.canEditPersonalRecords ||
      (access.isAdmin &&
        access.canAddRecords &&
        reminder.stableId === horse.stableId &&
        reminder.sourcePlacementId === horse.currentPlacementId),
  }
}
