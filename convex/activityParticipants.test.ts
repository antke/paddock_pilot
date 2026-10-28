import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
async function fixture() {
  const t = convexTest(schema, modules)
  const owner = t.withIdentity({
    subject: 'owner',
    email: 'owner@example.test',
  })
  const rider = t.withIdentity({
    subject: 'rider',
    email: 'rider@example.test',
  })
  const stranger = t.withIdentity({
    subject: 'stranger',
    email: 'stranger@example.test',
  })
  for (const actor of [owner, rider, stranger])
    await actor.mutation(api.users.ensureCurrentUser, {})
  const horseId = await owner.mutation(api.horses.add, { name: 'Luna', age: 8 })
  const eventId = await owner.mutation(api.events.add, {
    horseIds: [horseId],
    type: 'training',
    title: 'Ride',
    date: '2026-01-05',
    time: '10:00',
    description: 'Private owner information',
    training: {
      activities: ['hacking'],
      format: 'regular',
      focus: 'Private planning notes',
    },
  })
  const invite = () =>
    owner.mutation(api.activityParticipants.invite, {
      eventId,
      horseId,
      date: '2026-01-05',
      email: 'rider@example.test',
      role: 'rider',
    })
  return { t, owner, rider, stranger, horseId, eventId, invite }
}
const details = {
  activities: ['hacking' as const],
  format: 'regular' as const,
  durationMinutes: 45,
}

describe('activity participation', () => {
  it('lets an accepted rider report the same ride the owner sees, without granting horse access', async () => {
    const f = await fixture()
    const id = await f.invite()
    expect(await f.invite()).toBe(id)
    const pending = await f.rider.query(api.activityParticipants.mine, {})
    expect(pending[0]).toMatchObject({ status: 'invited', canReport: false })
    expect(JSON.stringify(pending)).not.toContain('Private')
    await expect(
      f.rider.mutation(api.activityParticipants.reportRide, { id, details }),
    ).rejects.toThrow()
    await f.rider.mutation(api.activityParticipants.respond, {
      id,
      accept: true,
    })
    await f.rider.mutation(api.activityParticipants.reportRide, {
      id,
      details,
      outcome: 'Relaxed ride',
    })
    const history = await f.owner.query(api.training.listForHorse, {
      horseId: f.horseId,
    })
    expect(history.records).toHaveLength(1)
    expect(history.records[0]).toMatchObject({
      eventId: f.eventId,
      status: 'completed',
      outcome: 'Relaxed ride',
    })
    expect(
      (await f.rider.query(api.activityParticipants.mine, {}))[0].report
        ?.outcome,
    ).toBe('Relaxed ride')
    expect(await f.rider.query(api.horses.listMine, {})).toEqual([])
    await expect(
      f.rider.query(api.training.listForHorse, { horseId: f.horseId }),
    ).rejects.toThrow()
    await expect(
      f.rider.query(api.events.getWithHorses, { id: f.eventId }),
    ).rejects.toThrow()
    expect(await f.stranger.query(api.activityParticipants.mine, {})).toEqual(
      [],
    )
  })

  it('requires the invited verified identity and rejects invitations from unrelated users', async () => {
    const f = await fixture()
    const id = await f.invite()
    await expect(
      f.stranger.mutation(api.activityParticipants.respond, {
        id,
        accept: true,
      }),
    ).rejects.toThrow()
    const unverified = f.t.withIdentity({
      subject: 'rider',
      email: 'rider@example.test',
      emailVerified: false,
    })
    await expect(
      unverified.mutation(api.activityParticipants.respond, {
        id,
        accept: true,
      }),
    ).rejects.toThrow()
    await expect(
      f.stranger.mutation(api.activityParticipants.invite, {
        eventId: f.eventId,
        horseId: f.horseId,
        date: '2026-01-05',
        email: 'rider@example.test',
        role: 'rider',
      }),
    ).rejects.toThrow()
    expect(
      await f.stranger.query(api.activityParticipants.forEvent, {
        eventId: f.eventId,
        date: '2026-01-05',
      }),
    ).toEqual({ horses: [], participants: [] })
  })

  it('revokes access and reporting immediately without removing the horse history', async () => {
    const f = await fixture()
    const id = await f.invite()
    await f.rider.mutation(api.activityParticipants.respond, {
      id,
      accept: true,
    })
    await f.rider.mutation(api.activityParticipants.reportRide, { id, details })
    await f.owner.mutation(api.activityParticipants.revoke, { id })
    expect(await f.rider.query(api.activityParticipants.mine, {})).toEqual([])
    await expect(
      f.rider.mutation(api.activityParticipants.reportRide, { id, details }),
    ).rejects.toThrow()
    expect(
      (await f.owner.query(api.training.listForHorse, { horseId: f.horseId }))
        .records,
    ).toHaveLength(1)
  })

  it('does not let a rider overwrite someone else’s report or read owner notes', async () => {
    const f = await fixture()
    const id = await f.invite()
    await f.rider.mutation(api.activityParticipants.respond, {
      id,
      accept: true,
    })
    await f.owner.mutation(api.training.saveRecord, {
      eventId: f.eventId,
      horseId: f.horseId,
      date: '2026-01-05',
      status: 'completed',
      details,
      outcome: 'Owner-only notes',
    })
    const mine = await f.rider.query(api.activityParticipants.mine, {})
    expect(mine[0]).toMatchObject({
      reported: true,
      canReport: false,
      report: null,
    })
    expect(JSON.stringify(mine)).not.toContain('Owner-only')
    await expect(
      f.rider.mutation(api.activityParticipants.reportRide, { id, details }),
    ).rejects.toThrow()
  })

  it('does not grant future sessions or access after a horse participation changes', async () => {
    const f = await fixture()
    await expect(
      f.owner.mutation(api.activityParticipants.invite, {
        eventId: f.eventId,
        horseId: f.horseId,
        date: '2026-01-06',
        email: 'rider@example.test',
        role: 'rider',
      }),
    ).rejects.toThrow()
    const id = await f.invite()
    await f.t.run(async (ctx) => {
      const row = (await ctx.db.query('eventsHorses').collect())[0]
      await ctx.db.patch(row._id, { participationEndsAt: '2026-01-05' })
    })
    expect(await f.rider.query(api.activityParticipants.mine, {})).toEqual([])
    await expect(
      f.rider.mutation(api.activityParticipants.respond, { id, accept: true }),
    ).rejects.toThrow()
  })
})

it('keeps a fresh invitation idempotent after an earlier decline or revocation', async () => {
  const f = await fixture()
  const declined = await f.invite()
  await f.rider.mutation(api.activityParticipants.respond, {
    id: declined,
    accept: false,
  })
  const fresh = await f.invite()
  expect(fresh).not.toBe(declined)
  expect(await f.invite()).toBe(fresh)
  await f.rider.mutation(api.activityParticipants.respond, {
    id: fresh,
    accept: true,
  })
  await f.owner.mutation(api.activityParticipants.revoke, { id: fresh })
  const replacement = await f.invite()
  expect(replacement).not.toBe(fresh)
  expect(await f.invite()).toBe(replacement)
  expect(await f.rider.query(api.activityParticipants.mine, {})).toHaveLength(1)
})

it('keeps a rescheduled rider report visible and edits it without duplicating or moving it back', async () => {
  const f = await fixture()
  const id = await f.invite()
  await f.rider.mutation(api.activityParticipants.respond, { id, accept: true })
  await f.rider.mutation(api.activityParticipants.reportRide, { id, details })
  const original = (await f.rider.query(api.activityParticipants.mine, {}))[0]
    .report!
  await f.owner.mutation(api.training.saveRecord, {
    eventId: f.eventId,
    horseId: f.horseId,
    date: '2026-01-05',
    newDate: '2026-01-06',
    status: 'completed',
    details,
  })
  const calendar = await f.rider.query(api.activities.view, {
    personal: true,
    stableIds: [],
    training: true,
  })
  expect(calendar.records).toHaveLength(1)
  expect(calendar.records[0]).toMatchObject({
    _id: original.id,
    date: '2026-01-06',
    scheduledDate: '2026-01-05',
  })
  const participation = (
    await f.rider.query(api.activityParticipants.mine, {})
  )[0]
  expect(participation).toMatchObject({
    reported: true,
    canReport: true,
    report: { id: original.id },
  })
  await f.rider.mutation(api.activityParticipants.reportRide, {
    id,
    details,
    outcome: 'Updated report',
  })
  const records = await f.t.run((ctx) =>
    ctx.db.query('trainingRecords').collect(),
  )
  expect(records).toHaveLength(1)
  expect(records[0]).toMatchObject({
    _id: original.id,
    date: '2026-01-06',
    scheduledDate: '2026-01-05',
    outcome: 'Updated report',
  })
})

it('does not let a rider overwrite a rescheduled owner report', async () => {
  const f = await fixture()
  const id = await f.invite()
  await f.rider.mutation(api.activityParticipants.respond, { id, accept: true })
  await f.owner.mutation(api.training.saveRecord, {
    eventId: f.eventId,
    horseId: f.horseId,
    date: '2026-01-05',
    status: 'completed',
    details,
  })
  await f.owner.mutation(api.training.saveRecord, {
    eventId: f.eventId,
    horseId: f.horseId,
    date: '2026-01-05',
    newDate: '2026-01-06',
    status: 'completed',
    details,
  })
  expect(
    (await f.rider.query(api.activityParticipants.mine, {}))[0],
  ).toMatchObject({ reported: true, canReport: false, report: null })
  await expect(
    f.rider.mutation(api.activityParticipants.reportRide, { id, details }),
  ).rejects.toThrow('already has a report')
  expect(
    await f.t.run((ctx) => ctx.db.query('trainingRecords').collect()),
  ).toHaveLength(1)
})
