import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { runInternal } from './convexCli'
import { dateKey } from './seedData'
import type { SeedData } from './seedData'
import { convexAs, users } from './users'
import type { UserKey } from './users'

type Client = Awaited<ReturnType<typeof convexAs>>

/**
 * Builds the shared world through the public API as each signed-in user, so
 * every row passes the same server rules the app does. Dates are relative to
 * today so the suite never rots.
 */
export async function seed(
  clerkIds: Record<UserKey, string>,
): Promise<SeedData> {
  const as = {} as Record<UserKey, Client>
  const userIds = {} as Record<UserKey, string>
  await Promise.all(
    (Object.keys(clerkIds) as Array<UserKey>).map(async (key) => {
      as[key] = await convexAs(clerkIds[key])
      userIds[key] = await as[key].client.action(api.users.syncCurrentUser, {
        locale: key === 'polish' ? 'pl' : 'en',
      })
      await as[key].client.mutation(api.onboarding.updateAccountProfile, {
        preferredName: `${users[key].firstName} ${users[key].lastName}`,
      })
    }),
  )
  const call = async <T>(
    key: UserKey,
    run: (client: Client['client']) => Promise<T>,
  ) => {
    await as[key].refresh()
    return run(as[key].client)
  }

  try {
    const addStable = (name: string) =>
      call('owner', (c) =>
        c.mutation(api.stables.add, { name, location: 'Kraków' }),
      )
    const hilltop = await addStable('Hilltop Yard')
    const riverside = await addStable('Riverside Yard')
    const oldBarn = await addStable('Old Barn')

    const join = async (stableId: Id<'stables'>, key: UserKey) => {
      await call('owner', (c) =>
        c.mutation(api.stableInvitations.create, {
          stableId,
          email: users[key].email,
          role: 'member',
        }),
      )
      const [invitation] = await call(key, (c) =>
        c.query(api.stableInvitations.listForCurrentUser, {}),
      )
      await call(key, (c) =>
        c.mutation(api.stableInvitations.accept, { token: invitation.token }),
      )
    }
    for (const key of ['member', 'member2', 'polish'] as const)
      await join(hilltop, key)
    // Riverside is where people leave and get removed, so Hilltop's roster never shifts mid-run.
    for (const key of ['member2', 'leaver'] as const) await join(riverside, key)

    // Walk the real onboarding steps so tests land on the stable, not the wizard.
    const steps = {
      owner: ['stable-operations', 'first-horse', 'invite-team', 'complete'],
      member: [
        'stable-introduction',
        'member-details',
        'first-horse',
        'complete',
      ],
    } as const
    const finishOnboarding = async (key: UserKey, stableId: Id<'stables'>) => {
      const path = steps[key === 'owner' ? 'owner' : 'member']
      for (let i = 0; i < path.length - 1; i++)
        await call(key, (c) =>
          c.mutation(api.onboarding.recordStableStep, {
            stableId,
            step: path[i],
            nextStep: path[i + 1],
            deferred: false,
          }),
        )
      await call(key, (c) =>
        c.mutation(api.onboarding.completeStableOnboarding, { stableId }),
      )
    }
    for (const stableId of [hilltop, riverside, oldBarn])
      await finishOnboarding('owner', stableId)
    for (const key of ['member', 'member2', 'polish'] as const)
      await finishOnboarding(key, hilltop)
    for (const key of ['member2', 'leaver'] as const)
      await finishOnboarding(key, riverside)

    const addHorse = (key: UserKey, name: string, stableId?: Id<'stables'>) =>
      call(key, (c) => c.mutation(api.horses.add, { name, age: 9, stableId }))
    const horses = {
      bramble: await addHorse('owner', 'Bramble', hilltop),
      clover: await addHorse('member', 'Clover', hilltop),
      dusty: await addHorse('member2', 'Dusty', hilltop),
      pebble: await addHorse('member', 'Pebble'),
      lark: await addHorse('leaver', 'Lark', riverside),
      willow: await addHorse('member2', 'Willow', hilltop),
      juniper: await addHorse('member2', 'Juniper', hilltop),
      hazel: await addHorse('member2', 'Hazel', hilltop),
      mystery: await call('owner', (c) =>
        c.mutation(api.horseCollaboration.addUnclaimed, {
          stableId: hilltop,
          name: 'Mystery',
          age: 12,
        }),
      ),
      ghost: await call('owner', (c) =>
        c.mutation(api.horseCollaboration.addUnclaimed, {
          stableId: oldBarn,
          name: 'Ghost',
          age: 15,
        }),
      ),
    }

    const addCarer = async (key: UserKey, role: 'editor' | 'viewer') => {
      await call('member', (c) =>
        c.mutation(api.horseCollaboration.invite, {
          horseId: horses.clover,
          email: users[key].email,
          kind: 'carer',
          role,
        }),
      )
      const token = runInternal('e2e:latestEmailToken', {
        recipient: users[key].email,
      })
      await call(key, (c) =>
        c.mutation(api.horseCollaboration.respond, { token, accept: true }),
      )
    }
    await addCarer('editor', 'editor')
    await addCarer('viewer', 'viewer')

    const dates = {
      past: dateKey(-3),
      today: dateKey(0),
      future: dateKey(4),
      seriesStart: dateKey(-14),
      seriesPast: dateKey(-7),
      seriesFuture: dateKey(7),
      trainingStart: dateKey(-7),
      groundworkStart: dateKey(-21),
      groundworkCancelled: dateKey(-14),
      groundworkSkipped: dateKey(-7),
    }
    type EventInput = {
      title: string
      date: string
      horseIds: Array<Id<'horses'>>
      type?: 'vet' | 'other' | 'training'
      recurrence?: {
        frequency: 'weekly'
        interval: 1
        daysOfWeek: Array<0 | 1 | 2 | 3 | 4 | 5 | 6>
      }
    }
    const addEvent = (key: UserKey, input: EventInput) =>
      call(key, (c) =>
        c.mutation(api.events.add, {
          stableId: hilltop,
          destination: 'stable',
          sharedStableIds: [hilltop],
          type: input.type ?? 'other',
          status: 'planned',
          title: input.title,
          date: input.date,
          time: '10:00',
          horseIds: input.horseIds,
          recurrence: input.recurrence,
          training:
            input.type === 'training'
              ? { activities: ['flatwork'], format: 'regular' }
              : undefined,
        }),
      )
    const weekly = (date: string) => ({
      frequency: 'weekly' as const,
      interval: 1 as const,
      daysOfWeek: [new Date(`${date}T12:00:00Z`).getUTCDay() as 0],
    })

    const events = {
      // Past, owner-organised, three owners' horses: withdraw closed, edit to untick.
      pastFarrier: await addEvent('owner', {
        title: 'Past farrier visit',
        date: dates.past,
        horseIds: [horses.bramble, horses.clover, horses.dusty],
      }),
      // Series that started two weeks ago: past and future occurrences.
      weeklyLesson: await addEvent('owner', {
        title: 'Weekly group lesson',
        date: dates.seriesStart,
        horseIds: [horses.bramble, horses.clover],
        recurrence: weekly(dates.seriesStart),
      }),
      // Max invites Mia's Clover; Mia declines.
      declineInvite: await addEvent('member2', {
        title: 'Hack to the lake',
        date: dates.future,
        horseIds: [horses.dusty, horses.clover],
      }),
      // Willow leaves the stable after these happened.
      pastDentistShared: await addEvent('owner', {
        title: 'Past dentist round',
        date: dates.past,
        horseIds: [horses.willow, horses.bramble],
      }),
      pastPhysioAlone: await addEvent('owner', {
        title: 'Past physio for Willow',
        date: dates.past,
        horseIds: [horses.willow],
      }),
      // Juniper moves to Riverside in a journey; these show what the old stable keeps.
      futureVetCheck: await addEvent('owner', {
        title: 'Spring vet check',
        date: dates.future,
        horseIds: [horses.juniper, horses.bramble],
      }),
      pastJuniperClinic: await addEvent('owner', {
        title: 'Past jumping clinic',
        date: dates.past,
        horseIds: [horses.juniper],
      }),
      // Mia's weekly training for Clover, from last week.
      cloverTraining: await addEvent('member', {
        title: 'Clover flatwork',
        type: 'training',
        date: dates.trainingStart,
        horseIds: [horses.clover],
        recurrence: weekly(dates.trainingStart),
      }),
      // Skipped and cancelled dates that are already behind us.
      groundwork: await addEvent('owner', {
        title: 'Sunday groundwork',
        date: dates.groundworkStart,
        horseIds: [horses.bramble, horses.clover],
        recurrence: weekly(dates.groundworkStart),
      }),
      // Mia invites a rider for today's lesson.
      riderLesson: await addEvent('member', {
        title: 'Clover jumping lesson',
        type: 'training',
        date: dates.today,
        horseIds: [horses.clover],
      }),
    }
    runInternal('e2e:seedPastSkips', {
      eventId: events.groundwork,
      skips: [
        { date: dates.groundworkSkipped, horseId: horses.clover },
        { date: dates.groundworkCancelled },
      ],
    })

    // Willow leaves for personal care, so its past events now hold a departed horse.
    const willowPreview = await call('member2', (c) =>
      c.query(api.horseTransitions.preview, { horseId: horses.willow }),
    )
    await call('member2', (c) =>
      c.mutation(api.horseTransitions.depart, {
        horseId: horses.willow,
        revision: willowPreview.revision,
        carryReminderIds: [],
      }),
    )

    const reminders = {
      haynet: await call('owner', (c) =>
        c.mutation(api.careReminders.add, {
          stableId: hilltop,
          title: 'Refill the haynets',
          category: 'other',
          dueDate: dates.today,
          assignedTo: userIds.member as Id<'users'>,
        }),
      ),
      // A horse reminder handed to a member who doesn't own the horse.
      cloverShoes: await call('owner', (c) =>
        c.mutation(api.careReminders.add, {
          stableId: hilltop,
          horseId: horses.clover,
          title: 'Check Clover’s shoes',
          category: 'farrier',
          dueDate: dates.today,
          assignedTo: userIds.member2 as Id<'users'>,
        }),
      ),
    }

    return {
      users: userIds,
      stables: { hilltop, riverside, oldBarn },
      horses,
      events,
      reminders,
      dates,
    }
  } finally {
    await Promise.all(Object.values(as).map((session) => session.close()))
  }
}
