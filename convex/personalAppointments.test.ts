import { afterEach, expect, it, vi } from 'vitest'
import { convexTest } from 'convex-test'
import schema from './schema'
import { api } from './_generated/api'

const modules = import.meta.glob('./**/*.ts')
afterEach(() => vi.useRealTimers())

it('lists frozen horse appointments after a move without granting former-stable access', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-07T12:00:00Z'))
  const t = convexTest(schema, modules)
  const client = (name: string) =>
    t.withIdentity({
      subject: name,
      email: `${name}@example.com`,
      emailVerified: true,
    })
  const admin = client('admin')
  const owner = client('owner')
  const outsider = client('outsider')
  for (const user of [admin, owner, outsider])
    await user.mutation(api.users.ensureCurrentUser, {})
  const ownerId = (await owner.query(api.users.getCurrentUser))!._id
  const stableId = await admin.mutation(api.stables.add, {
    name: 'Willow',
    location: 'Warsaw',
  })
  const membershipId = await t.run((ctx) =>
    ctx.db.insert('stableMembers', {
      stableId,
      userId: ownerId,
      role: 'member',
    }),
  )
  const horseId = await owner.mutation(api.horses.add, {
    name: 'Juniper',
    age: 8,
  })
  await owner.mutation(api.horseTransitions.connect, { horseId, stableId })
  const otherHorseId = await admin.mutation(api.horses.add, {
    name: 'Willow horse',
    age: 6,
    stableId,
  })
  const eventId = await admin.mutation(api.events.add, {
    stableId,
    horseIds: [horseId, otherHorseId],
    type: 'vet',
    title: 'Original weekly care',
    date: '2026-09-01',
    time: '09:00',
    recurrence: { frequency: 'weekly', interval: 1, daysOfWeek: [2] },
    notesAfterCompletion: 'Private shared notes',
  })
  const participation = (await owner.query(api.events.getWithHorses, {
    id: eventId,
  }))!.eventHorses.find((row) => row.horseId === horseId)!
  await owner.mutation(api.eventHorseDetails.update, {
    id: participation._id,
    completionNotes: 'Juniper care history',
  })
  const preview = await owner.query(api.horseTransitions.preview, { horseId })
  await owner.mutation(api.horseTransitions.depart, {
    horseId,
    revision: preview.revision,
    carryReminderIds: [],
  })
  await t.finishAllScheduledFunctions(vi.runAllTimers)
  await t.run((ctx) =>
    ctx.db.patch(eventId, { title: 'Changed stable schedule' }),
  )

  // A live shared schedule and a horse's old schedule are distinct records.
  const both = await owner.query(api.events.list, {})
  expect(both.map((row) => row.title)).toEqual(
    expect.arrayContaining(['Original weekly care', 'Changed stable schedule']),
  )

  await t.run((ctx) => ctx.db.delete(membershipId))
  const rows = await owner.query(api.events.list, {})
  expect(rows).toHaveLength(1)
  expect(rows[0]).toMatchObject({
    _id: eventId,
    contextHorseId: horseId,
    contextParticipationId: participation._id,
    title: 'Original weekly care',
    notesAfterCompletion: 'Juniper care history',
    recurrence: { end: { type: 'on_date', date: '2026-10-07' } },
  })
  const detail = await owner.query(api.events.getWithHorses, {
    id: eventId,
    horseId,
    participationId: participation._id,
  })
  expect(detail?.event.title).toBe('Original weekly care')
  expect(await outsider.query(api.events.list, {})).toEqual([])
})
