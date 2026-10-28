import { defaultTrainingDetails } from '../../shared/training/trainingSchema'
import { ConvexError } from 'convex/values'
import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { accessibleHorses, getHorseAccess } from './horsePermissions'
import { calendarMember } from './activitySharing'
import { isActiveHorse } from './horseState'

type Ctx = QueryCtx | MutationCtx

/** Selectable accounts are fellow stable members and owners of editable horses. */
export async function attendanceOptions(ctx: Ctx, userId: Id<'users'>) {
  const owned = await ctx.db
    .query('stables')
    .withIndex('by_owner_id', (q) => q.eq('ownerId', userId))
    .collect()
  const memberships = await ctx.db
    .query('stableMembers')
    .withIndex('by_user_id', (q) => q.eq('userId', userId))
    .collect()
  const stableIds = new Set([
    ...owned.map((s) => s._id),
    ...memberships.map((m) => m.stableId),
  ])
  const ids = new Set<Id<'users'>>([userId])
  const personalIds = new Set<Id<'users'>>([userId])
  const personStables = new Map<Id<'users'>, Id<'stables'>[]>()
  const addStable = (id: Id<'users'>, stableId: Id<'stables'>) => {
    ids.add(id)
    personStables.set(id, [...(personStables.get(id) ?? []), stableId])
  }
  for (const stableId of stableIds) {
    if (!(await calendarMember(ctx, stableId, userId))) continue
    const stable = await ctx.db.get(stableId)
    if (stable) addStable(stable.ownerId, stableId)
    const members = await ctx.db
      .query('stableMembers')
      .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
      .collect()
    for (const member of members)
      if (member.role === 'member') addStable(member.userId, stableId)
  }
  for (const horse of await accessibleHorses(ctx, userId)) {
    if (
      horse.ownerId &&
      (await getHorseAccess(ctx, horse, userId)).canEditPersonalRecords
    ) {
      ids.add(horse.ownerId)
      personalIds.add(horse.ownerId)
    }
  }
  const people = []
  for (const id of ids) {
    const person = await ctx.db.get(id)
    if (!person || person.deletedAt !== undefined) continue
    people.push({
      id,
      name:
        person.preferredName ||
        [person.firstName, person.lastName].filter(Boolean).join(' '),
      photoUrl: person.photoUrl,
      stableIds: personStables.get(id) ?? [],
      personal: personalIds.has(id),
    })
  }
  return people.sort((a, b) => a.name.localeCompare(b.name))
}

/** Called only inside the authorized activity create/update transaction. */
export async function saveAttendees(
  ctx: MutationCtx,
  eventId: Id<'events'>,
  peopleIds: Id<'users'>[],
  actor: Id<'users'>,
) {
  if (peopleIds.length > 100 || new Set(peopleIds).size !== peopleIds.length)
    throw new ConvexError('Select up to 100 different people')
  const previous = await ctx.db
    .query('eventAttendees')
    .withIndex('by_event', (q) => q.eq('eventId', eventId))
    .collect()
  const options = new Set(
    (await attendanceOptions(ctx, actor)).map((p) => p.id),
  )
  for (const id of peopleIds) {
    if (!options.has(id) && !previous.some((p) => p.userId === id))
      throw new ConvexError('Choose people from your stable or horse owners')
  }
  for (const row of previous)
    if (!peopleIds.includes(row.userId)) await ctx.db.delete(row._id)
  for (const userId of peopleIds)
    if (!previous.some((p) => p.userId === userId))
      await ctx.db.insert('eventAttendees', { eventId, userId })
  await ctx.db.patch(eventId, { peopleIds })
}

export async function attendanceDetail(
  ctx: Ctx,
  eventId: Id<'events'>,
  userId: Id<'users'>,
) {
  const row = await ctx.db
    .query('eventAttendees')
    .withIndex('by_event', (q) => q.eq('eventId', eventId))
    .filter((q) => q.eq(q.field('userId'), userId))
    .first()
  const event = row ? await ctx.db.get(eventId) : null
  if (!event || !event.peopleIds?.includes(userId)) return null
  const horses: Array<
    Pick<Doc<'horses'>, '_id' | '_creationTime' | 'name'> & {
      canRecord: boolean
    }
  > = []
  for (const id of event.horseIds) {
    const horse = await ctx.db.get(id)
    if (isActiveHorse(horse))
      horses.push({
        _id: horse._id,
        _creationTime: horse._creationTime,
        name: horse.name,
        canRecord: false,
      })
  }
  const projected: Doc<'events'> = {
    _id: event._id,
    _creationTime: event._creationTime,
    createdBy: event.createdBy,
    title: event.title,
    type: event.type,
    date: event.date,
    endDate: event.endDate,
    time: event.time,
    location: event.location,
    status: event.status,
    recurrence: event.recurrence,
    horseIds: horses.map((h) => h._id),
  }
  const records: Array<Doc<'trainingRecords'> & { canEdit: boolean }> = (
    await ctx.db
      .query('trainingRecords')
      .withIndex('by_event_id', (q) => q.eq('eventId', eventId))
      .collect()
  )
    .filter((record) => horses.some((horse) => horse._id === record.horseId))
    .map((record) => ({
      _id: record._id,
      _creationTime: record._creationTime,
      eventId: record.eventId,
      horseId: record.horseId,
      date: record.date,
      scheduledDate: record.scheduledDate,
      status: record.status,
      recordedBy: record.recordedBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      details: defaultTrainingDetails,
      canEdit: false,
    }))
  return { event: projected, horses, records, readDetails: false }
}
