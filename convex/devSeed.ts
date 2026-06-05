import { ConvexError, v } from 'convex/values'
import { eventHorseDetailsInputSchema } from '../shared/events/eventHorseDetailsSchema'
import { eventInputSchema } from '../shared/events/eventSchema'
import { healthIssueAddSchema } from '../shared/horses/healthIssueSchema'
import { horseInputSchema } from '../shared/horses/horseSchema'
import { medicationRecordAddSchema } from '../shared/horses/medicationRecordSchema'
import { nutritionLogAddSchema } from '../shared/horses/nutritionLogSchema'
import { weightRecordAddSchema } from '../shared/horses/weightRecordSchema'
import { careReminderInputSchema } from '../shared/reminders/careReminderSchema'
import { stableInputSchema } from '../shared/stables/stableSchema'
import { stableDocumentInputSchema } from '../shared/stables/stableDocumentSchema'
import { stableMemberDetailsInputSchema } from '../shared/stables/stableMemberSchema'
import { stableProviderInputSchema } from '../shared/stables/stableProviderSchema'
import type { Id } from './_generated/dataModel'
import { mutation  } from './_generated/server'
import type {MutationCtx} from './_generated/server';
import { getCurrentUser } from './libs/stablePermissions'

const confirmSeed = 'seed-demo-data'
const demoStableName = 'Paddock Pilot Demo Yard'

type SeedEventInput = {
  title: string
  type: 'vet' | 'training' | 'dentist' | 'hoof_trimming' | 'massage' | 'other'
  status: 'planned' | 'completed' | 'cancelled'
  dateOffsetDays: number
  time: string
  horseIndexes: Array<number>
  description?: string
  location?: string
  providerName?: string
  providerPhone?: string
  totalCost?: number
  costPerHorse?: number
  notesAfterCompletion?: string
  perHorseDetails?: Array<{
    horseIndex: number
    requestedServiceNotes?: string
    completionNotes?: string
    costShare?: number
  }>
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    interval: number
    daysOfWeek?: Array<0 | 1 | 2 | 3 | 4 | 5 | 6>
    monthlyMode?: 'dayOfMonth' | 'weekdayPattern'
    dayOfMonth?: number
    ordinal?: 1 | 2 | 3 | 4 | 'last'
    weekday?: 0 | 1 | 2 | 3 | 4 | 5 | 6
    missingDateStrategy?: 'lastDayOfMonth' | 'skip'
    end?:
      | { type: 'never' }
      | { type: 'on_date'; date: string }
      | { type: 'after_occurrences'; count: number }
  }
}

const toDateKey = (offsetDays: number) => {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)

  return date.toISOString().slice(0, 10)
}

const toTimestamp = (offsetDays: number) => {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)

  return date.getTime()
}

const parseSeed = <T>(
  result: { success: true; data: T } | { success: false; error: { issues: Array<{ message: string }> } },
  label: string,
) => {
  if (result.success) return result.data

  throw new ConvexError(
    `${label}: ${result.error.issues[0]?.message ?? 'Invalid seed data'}`,
  )
}

const upsertDemoUser = async (
  ctx: MutationCtx,
  user: {
    clerkId: string
    firstName: string
    lastName?: string
    email: string
    photoUrl?: string
  },
) => {
  const existingUser = await ctx.db
    .query('users')
    .withIndex('by_email', (q) => q.eq('email', user.email))
    .unique()
  const now = Date.now()

  if (existingUser) {
    await ctx.db.patch(existingUser._id, {
      clerkId: user.clerkId,
      firstName: user.firstName,
      lastName: user.lastName,
      photoUrl: user.photoUrl,
      updatedAt: now,
    })

    return existingUser._id
  }

  return await ctx.db.insert('users', {
    ...user,
    createdAt: now,
    updatedAt: now,
  })
}

const resetStableRows = async (ctx: MutationCtx, stableId: Id<'stables'>) => {
  const [
    events,
    horses,
    members,
    providers,
    documents,
    invitations,
    healthIssues,
    weightRecords,
    medicationRecords,
    nutritionLogs,
    careReminders,
  ] = await Promise.all([
    ctx.db
      .query('events')
      .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
      .collect(),
    ctx.db
      .query('horses')
      .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
      .collect(),
    ctx.db
      .query('stableMembers')
      .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
      .collect(),
    ctx.db
      .query('stableProviders')
      .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
      .collect(),
    ctx.db
      .query('stableDocuments')
      .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
      .collect(),
    ctx.db
      .query('stableInvitations')
      .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
      .collect(),
    ctx.db
      .query('horseHealthIssues')
      .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
      .collect(),
    ctx.db
      .query('horseWeightRecords')
      .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
      .collect(),
    ctx.db
      .query('horseMedicationRecords')
      .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
      .collect(),
    ctx.db
      .query('horseNutritionLogs')
      .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
      .collect(),
    ctx.db
      .query('careReminders')
      .withIndex('by_stable_id_due_date', (q) => q.eq('stableId', stableId))
      .collect(),
  ])

  const eventHorseRows = await Promise.all(
    events.map((event) =>
      ctx.db
        .query('eventsHorses')
        .withIndex('by_event_id', (q) => q.eq('eventId', event._id))
        .collect(),
    ),
  )

  await Promise.all([
    ...eventHorseRows.flat().map((row) => ctx.db.delete(row._id)),
    ...events.map((event) => ctx.db.delete(event._id)),
    ...healthIssues.map((issue) => ctx.db.delete(issue._id)),
    ...weightRecords.map((record) => ctx.db.delete(record._id)),
    ...medicationRecords.map((record) => ctx.db.delete(record._id)),
    ...nutritionLogs.map((log) => ctx.db.delete(log._id)),
    ...careReminders.map((reminder) => ctx.db.delete(reminder._id)),
    ...horses.map((horse) => ctx.db.delete(horse._id)),
    ...members.map((member) => ctx.db.delete(member._id)),
    ...providers.map((provider) => ctx.db.delete(provider._id)),
    ...documents.map((document) => ctx.db.delete(document._id)),
    ...invitations.map((invitation) => ctx.db.delete(invitation._id)),
  ])
}

const upsertDemoStable = async (ctx: MutationCtx, ownerId: Id<'users'>) => {
  const stableInput = parseSeed(
    stableInputSchema.safeParse({
      name: demoStableName,
      location: '12 Demo Lane, Testford',
      description: 'Complete QA seed stable with practical care data.',
      addressLine1: 'Paddock Pilot Demo Yard, 12 Demo Lane',
      addressLine2: 'Testford, Surrey',
      postcode: 'TE5 7QA',
      country: 'United Kingdom',
      contactName: 'Mara Yard Manager',
      contactPhone: '+44 7700 900101',
      emergencyPhone: '+44 7700 900999',
      openingHours: 'Monday-Friday 07:00-20:00\nSaturday-Sunday 08:00-18:00',
      yardRules:
        'Sign in on arrival. Keep gates closed. Label all supplements clearly.',
    }),
    'Stable seed',
  )
  const ownedStables = await ctx.db
    .query('stables')
    .withIndex('by_owner_id', (q) => q.eq('ownerId', ownerId))
    .collect()
  const stable = ownedStables.find(
    (ownedStable) => ownedStable.name === demoStableName,
  )

  if (stable) {
    await ctx.db.patch(stable._id, stableInput)
    await resetStableRows(ctx, stable._id)

    return stable._id
  }

  return await ctx.db.insert('stables', {
    ...stableInput,
    ownerId,
  })
}

const seedMembers = async (
  ctx: MutationCtx,
  stableId: Id<'stables'>,
) => {
  const memberUserId = await upsertDemoUser(ctx, {
    clerkId: 'demo-seed-member',
    firstName: 'Ellis',
    lastName: 'Member',
    email: 'demo.member@paddockpilot.test',
  })
  const guestUserId = await upsertDemoUser(ctx, {
    clerkId: 'demo-seed-guest',
    firstName: 'Gina',
    lastName: 'Guest',
    email: 'demo.guest@paddockpilot.test',
  })
  const memberDetails = parseSeed(
    stableMemberDetailsInputSchema.safeParse({
      displayNameOverride: 'Ellis - weekday cover',
      phone: '+44 7700 900202',
      emergencyContact: 'Sam Member, +44 7700 900203',
    }),
    'Member details seed',
  )
  const guestDetails = parseSeed(
    stableMemberDetailsInputSchema.safeParse({
      displayNameOverride: 'Gina - visiting physio',
      phone: '+44 7700 900303',
      emergencyContact: 'Clinic desk, +44 7700 900304',
    }),
    'Guest details seed',
  )

  await Promise.all([
    ctx.db.insert('stableMembers', {
      stableId,
      userId: memberUserId,
      role: 'member',
      ...memberDetails,
    }),
    ctx.db.insert('stableMembers', {
      stableId,
      userId: guestUserId,
      role: 'guest',
      ...guestDetails,
    }),
  ])
}

const seedInvitations = async (
  ctx: MutationCtx,
  stableId: Id<'stables'>,
  ownerId: Id<'users'>,
) => {
  const now = Date.now()
  const expiresAt = now + 7 * 24 * 60 * 60 * 1000

  await Promise.all([
    ctx.db.insert('stableInvitations', {
      stableId,
      email: 'pending.member@paddockpilot.test',
      role: 'member',
      status: 'pending',
      token: `demo-pending-${stableId}`,
      invitedBy: ownerId,
      createdAt: now,
      updatedAt: now,
      expiresAt,
    }),
    ctx.db.insert('stableInvitations', {
      stableId,
      email: 'waiting.plus@paddockpilot.test',
      role: 'guest',
      status: 'accepted_pending_subscription',
      token: `demo-waiting-${stableId}`,
      invitedBy: ownerId,
      createdAt: now,
      updatedAt: now,
      expiresAt,
      acceptedAt: now,
    }),
    ctx.db.insert('stableInvitations', {
      stableId,
      email: 'revoked.member@paddockpilot.test',
      role: 'member',
      status: 'revoked',
      token: `demo-revoked-${stableId}`,
      invitedBy: ownerId,
      createdAt: now,
      updatedAt: now,
      expiresAt,
    }),
  ])
}

const seedProviders = async (
  ctx: MutationCtx,
  stableId: Id<'stables'>,
  ownerId: Id<'users'>,
) => {
  const providerInputs = [
    {
      stableId,
      type: 'vet' as const,
      name: 'Dr Priya Shah',
      phone: '+44 7700 900401',
      email: 'priya.shah@example.test',
      notes: 'Primary vet for vaccination visits and lameness checks.',
    },
    {
      stableId,
      type: 'farrier' as const,
      name: 'Tom Carter',
      phone: '+44 7700 900402',
      notes: 'Regular hoof trim contact. Prefers text confirmation.',
    },
    {
      stableId,
      type: 'dentist' as const,
      name: 'Oak Equine Dental',
      phone: '+44 7700 900501',
      email: 'bookings@oakequinedental.example.test',
      notes: 'Annual dental checks and rasping.',
    },
    {
      stableId,
      type: 'physio' as const,
      name: 'North Downs Equine Physio',
      phone: '+44 7700 900601',
      notes: 'Useful for massage and post-work soreness reviews.',
    },
    {
      stableId,
      type: 'other' as const,
      name: 'Mara Yard Manager',
      phone: '+44 7700 900101',
      notes: 'On-yard contact for lessons and monthly tape checks.',
    },
  ]
  const now = Date.now()

  await Promise.all(
    providerInputs.map((provider) => {
      const input = parseSeed(
        stableProviderInputSchema.safeParse(provider),
        'Stable provider seed',
      )

      return ctx.db.insert('stableProviders', {
        ...input,
        stableId,
        createdBy: ownerId,
        createdAt: now,
        updatedAt: now,
      })
    }),
  )
}

const seedHorses = async (
  ctx: MutationCtx,
  stableId: Id<'stables'>,
  ownerId: Id<'users'>,
) => {
  const horseInputs = [
    {
      name: 'Juniper Star',
      ownerName: 'Demo Owner',
      age: 9,
      breed: 'Irish Sport Horse',
      sex: 'mare' as const,
      color: 'Bay',
      height: '16.1hh',
      dateOfBirth: '2017-04-12',
      passportNumber: 'GBR-DEMO-001',
      microchipNumber: '985141000000001',
      insuranceProvider: 'Demo Equine Cover',
      insurancePolicyNumber: 'DEMO-JUN-001',
      sire: 'Demo Cavalier',
      dam: 'Juniper Belle',
      discipline: 'Eventing',
      shoeingStatus: 'front_shoes' as const,
      dewormingNotes: 'Worm count clear in April. Recheck in twelve weeks.',
      allergies: ['Bee stings'],
      emergencyNotes: 'Can be anxious in high wind. Load with front bar open.',
      vetName: 'Dr Priya Shah',
      vetPhone: '+44 7700 900401',
      farrierName: 'Tom Carter',
      farrierPhone: '+44 7700 900402',
      feedingRoutine: '07:00 soaked hay. 18:00 balancer and chaff.',
      nutritionNotes: 'Keep sugars low during spring grass flush.',
      nutritionRecommended: ['Low-starch balancer', 'Soaked hay', 'Salt lick'],
      nutritionAvoid: ['Molassed mixes', 'Rich spring grazing'],
    },
    {
      name: 'Copper Field',
      ownerName: 'Ellis Member',
      age: 14,
      breed: 'Welsh Cob',
      sex: 'gelding' as const,
      color: 'Chestnut',
      height: '14.2hh',
      dateOfBirth: '2012-09-03',
      passportNumber: 'GBR-DEMO-002',
      microchipNumber: '985141000000002',
      insuranceProvider: 'Oak Mutual',
      insurancePolicyNumber: 'OAK-COP-2026',
      sire: 'Copper King',
      dam: 'Field Rose',
      discipline: 'Hacking and low-level dressage',
      shoeingStatus: 'full_set' as const,
      dewormingNotes: 'Targeted deworming only after worm count results.',
      allergies: ['Penicillin sensitivity'],
      emergencyNotes: 'Prone to stiffness after hard ground work.',
      vetName: 'Dr Priya Shah',
      vetPhone: '+44 7700 900401',
      farrierName: 'Tom Carter',
      farrierPhone: '+44 7700 900402',
      feedingRoutine: 'AM haynet. PM senior mix with joint supplement.',
      nutritionNotes: 'Monitor weight tape monthly.',
      nutritionRecommended: ['Joint supplement', 'Senior fibre cubes'],
      nutritionAvoid: ['Sudden feed changes'],
    },
    {
      name: 'Blank Canvas',
      ownerName: 'Gina Guest',
      age: 5,
      breed: 'Thoroughbred',
      sex: 'stallion' as const,
      color: 'Grey',
      height: '15.3hh',
      discipline: 'Assessment pending',
      shoeingStatus: 'barefoot' as const,
      allergies: [],
      nutritionRecommended: [],
      nutritionAvoid: [],
    },
  ].map((horse) => parseSeed(horseInputSchema.safeParse(horse), 'Horse seed'))

  return await Promise.all(
    horseInputs.map(({ profileImageId: _profileImageId, ...horseInput }) =>
      ctx.db.insert('horses', {
        ...horseInput,
        stableId,
        ownerId,
      }),
    ),
  )
}

const seedDocuments = async (
  ctx: MutationCtx,
  stableId: Id<'stables'>,
  ownerId: Id<'users'>,
  horseIds: Array<Id<'horses'>>,
) => {
  const documentInputs = [
    {
      stableId,
      horseId: horseIds[0],
      type: 'passport' as const,
      fileName: 'Juniper Star passport scan.pdf',
      contentType: 'application/pdf',
      size: 482_000,
      notes: 'Seed metadata placeholder for passport storage workflow.',
    },
    {
      stableId,
      horseId: horseIds[0],
      type: 'vaccination' as const,
      fileName: 'Juniper vaccination proof.jpg',
      contentType: 'image/jpeg',
      size: 214_000,
      notes: 'Annual booster proof to keep ready for yard moves or shows.',
    },
    {
      stableId,
      horseId: horseIds[1],
      type: 'insurance' as const,
      fileName: 'Copper Field insurance schedule.pdf',
      contentType: 'application/pdf',
      size: 391_000,
      notes: 'Policy summary placeholder for emergency admin checks.',
    },
    {
      stableId,
      type: 'other' as const,
      fileName: 'Demo yard emergency plan.pdf',
      contentType: 'application/pdf',
      size: 128_000,
      notes: 'Stable-wide metadata placeholder for document directory testing.',
    },
  ]
  const now = Date.now()

  await Promise.all(
    documentInputs.map((document) => {
      const input = parseSeed(
        stableDocumentInputSchema.safeParse(document),
        'Stable document seed',
      )

      return ctx.db.insert('stableDocuments', {
        stableId,
        horseId: document.horseId,
        eventId: undefined,
        storageId: undefined,
        type: input.type,
        fileName: input.fileName,
        contentType: input.contentType,
        size: input.size,
        notes: input.notes,
        createdBy: ownerId,
        createdAt: now,
      })
    }),
  )
}

const seedHealthIssues = async (
  ctx: MutationCtx,
  stableId: Id<'stables'>,
  ownerId: Id<'users'>,
  horseIds: Array<Id<'horses'>>,
) => {
  const now = Date.now()
  const issues = [
    {
      horseId: horseIds[0],
      title: 'Watch near fore warmth',
      description: 'Slight warmth after jumping lesson. Cold hose after work.',
      severity: 'medium' as const,
      status: 'active' as const,
      notedAt: toTimestamp(-2),
    },
    {
      horseId: horseIds[1],
      title: 'Resolved shoe pull',
      description: 'Lost front shoe in field. Farrier replaced and checked foot.',
      severity: 'low' as const,
      status: 'resolved' as const,
      notedAt: toTimestamp(-18),
      resolvedAt: toTimestamp(-15),
    },
    {
      horseId: horseIds[2],
      title: 'Dental follow-up needed',
      description: 'Quidding hay occasionally. Book dentist check.',
      severity: 'high' as const,
      status: 'active' as const,
      notedAt: toTimestamp(-1),
    },
  ]

  await Promise.all(
    issues.map((issue) => {
      const issueInput = parseSeed(
        healthIssueAddSchema.safeParse({
          horseId: issue.horseId,
          title: issue.title,
          description: issue.description,
          severity: issue.severity,
        }),
        'Health issue seed',
      )

      return ctx.db.insert('horseHealthIssues', {
        horseId: issue.horseId,
        stableId,
        title: issueInput.title,
        description: issueInput.description,
        severity: issueInput.severity,
        status: issue.status,
        notedAt: issue.notedAt,
        resolvedAt: issue.resolvedAt,
        createdBy: ownerId,
        createdAt: issue.notedAt,
        updatedAt: issue.resolvedAt ?? now,
      })
    }),
  )
}

const seedWeightRecords = async (
  ctx: MutationCtx,
  stableId: Id<'stables'>,
  ownerId: Id<'users'>,
  horseIds: Array<Id<'horses'>>,
) => {
  const records = [
    {
      horseId: horseIds[0],
      weight: 548,
      unit: 'kg' as const,
      measuredAt: toTimestamp(-65),
      bodyConditionScore: 5.5,
      notes: 'Initial demo tape measurement after winter clip.',
    },
    {
      horseId: horseIds[0],
      weight: 542,
      unit: 'kg' as const,
      measuredAt: toTimestamp(-20),
      bodyConditionScore: 5,
      notes: 'Slight drop after increased polework. Keep hay consistent.',
    },
    {
      horseId: horseIds[1],
      weight: 501,
      unit: 'kg' as const,
      measuredAt: toTimestamp(-42),
      bodyConditionScore: 6,
      notes: 'Senior feed started after this check.',
    },
    {
      horseId: horseIds[1],
      weight: 508,
      unit: 'kg' as const,
      measuredAt: toTimestamp(-6),
      bodyConditionScore: 6,
      notes: 'Stable weight. Continue monthly tracking.',
    },
    {
      horseId: horseIds[2],
      weight: 472,
      unit: 'kg' as const,
      measuredAt: toTimestamp(-3),
      notes: 'First record for sparse profile horse.',
    },
  ]

  await Promise.all(
    records.map((record) => {
      const input = parseSeed(
        weightRecordAddSchema.safeParse(record),
        'Weight record seed',
      )

      return ctx.db.insert('horseWeightRecords', {
        horseId: record.horseId,
        stableId,
        weight: input.weight,
        unit: input.unit,
        measuredAt: input.measuredAt,
        bodyConditionScore: input.bodyConditionScore,
        notes: input.notes,
        createdBy: ownerId,
        createdAt: input.measuredAt,
      })
    }),
  )
}

const seedMedicationRecords = async (
  ctx: MutationCtx,
  stableId: Id<'stables'>,
  ownerId: Id<'users'>,
  horseIds: Array<Id<'horses'>>,
) => {
  const records = [
    {
      horseId: horseIds[0],
      medicationName: 'Danilon',
      dosage: '1 sachet',
      frequency: 'Once daily with evening feed',
      startDate: toDateKey(-2),
      prescribedBy: 'Dr Priya Shah',
      reason: 'Short course while monitoring near fore warmth.',
      notes: 'Give in soaked feed and confirm full dose is eaten.',
      status: 'active' as const,
    },
    {
      horseId: horseIds[1],
      medicationName: 'Antibiotic eye ointment',
      dosage: 'Small strip',
      frequency: 'Twice daily',
      startDate: toDateKey(-28),
      endDate: toDateKey(-21),
      prescribedBy: 'Oak Equine Clinic',
      reason: 'Resolved minor eye irritation after dusty bedding.',
      status: 'completed' as const,
    },
    {
      horseId: horseIds[2],
      medicationName: 'Dental comfort supplement',
      dosage: 'As label',
      frequency: 'Daily',
      startDate: toDateKey(-1),
      reason: 'Temporary support until dental appointment is booked.',
      notes: 'Review after dentist visit; not a replacement for veterinary advice.',
      status: 'active' as const,
    },
  ]

  await Promise.all(
    records.map((record) => {
      const input = parseSeed(
        medicationRecordAddSchema.safeParse(record),
        'Medication record seed',
      )
      const now = Date.now()

      return ctx.db.insert('horseMedicationRecords', {
        horseId: record.horseId,
        stableId,
        medicationName: input.medicationName,
        dosage: input.dosage,
        frequency: input.frequency,
        startDate: input.startDate,
        endDate: input.endDate,
        prescribedBy: input.prescribedBy,
        reason: input.reason,
        notes: input.notes,
        status: input.status,
        createdBy: ownerId,
        createdAt: now,
        updatedAt: now,
      })
    }),
  )
}

const seedNutritionLogs = async (
  ctx: MutationCtx,
  stableId: Id<'stables'>,
  ownerId: Id<'users'>,
  horseIds: Array<Id<'horses'>>,
) => {
  const logs = [
    {
      horseId: horseIds[0],
      changedAt: toTimestamp(-20),
      summary: 'Reduced spring sugars',
      feedingRoutineSnapshot: '07:00 soaked hay. 18:00 balancer and chaff.',
      recommendedSnapshot: ['Low-starch balancer', 'Soaked hay', 'Salt lick'],
      avoidSnapshot: ['Molassed mixes', 'Rich spring grazing'],
      notes: 'Logged after weight dipped and grass started coming through.',
    },
    {
      horseId: horseIds[1],
      changedAt: toTimestamp(-42),
      summary: 'Started senior feed and joint support',
      feedingRoutineSnapshot: 'AM haynet. PM senior mix with joint supplement.',
      recommendedSnapshot: ['Joint supplement', 'Senior fibre cubes'],
      avoidSnapshot: ['Sudden feed changes'],
      notes: 'Change made after monthly weight tape and stiffness notes.',
    },
    {
      horseId: horseIds[2],
      changedAt: toTimestamp(-3),
      summary: 'Initial nutrition baseline pending dental check',
      feedingRoutineSnapshot: 'Simple forage-first routine until dental follow-up.',
      recommendedSnapshot: ['Soft soaked fibre', 'Ad-lib forage'],
      avoidSnapshot: ['Hard coarse mix'],
    },
  ]

  await Promise.all(
    logs.map((log) => {
      const input = parseSeed(
        nutritionLogAddSchema.safeParse(log),
        'Nutrition log seed',
      )

      return ctx.db.insert('horseNutritionLogs', {
        horseId: log.horseId,
        stableId,
        changedAt: input.changedAt,
        summary: input.summary,
        feedingRoutineSnapshot: input.feedingRoutineSnapshot,
        recommendedSnapshot: input.recommendedSnapshot,
        avoidSnapshot: input.avoidSnapshot,
        notes: input.notes,
        createdBy: ownerId,
        createdAt: input.changedAt,
      })
    }),
  )
}

const seedEvents = async (
  ctx: MutationCtx,
  stableId: Id<'stables'>,
  ownerId: Id<'users'>,
  horseIds: Array<Id<'horses'>>,
) => {
  const eventInputs: Array<SeedEventInput> = [
    {
      title: 'Vaccination visit',
      type: 'vet',
      status: 'planned',
      dateOffsetDays: 4,
      time: '09:30',
      horseIndexes: [0, 1],
      description: 'Annual boosters and general check.',
      location: 'Main barn treatment area',
      providerName: 'Dr Priya Shah',
      providerPhone: '+44 7700 900401',
      totalCost: 96,
      costPerHorse: 48,
      perHorseDetails: [
        {
          horseIndex: 0,
          requestedServiceNotes:
            'Check near fore warmth before vaccination and confirm Danilon timing.',
          costShare: 48,
        },
        {
          horseIndex: 1,
          requestedServiceNotes: 'Routine booster and senior stiffness check.',
          costShare: 48,
        },
      ],
    },
    {
      title: 'Polework group lesson',
      type: 'training',
      status: 'planned',
      dateOffsetDays: 8,
      time: '15:00',
      horseIndexes: [0],
      description: 'Weekly polework session.',
      location: 'Outdoor arena',
      providerName: 'Mara Yard Manager',
      providerPhone: '+44 7700 900101',
      totalCost: 18,
      costPerHorse: 18,
      perHorseDetails: [
        {
          horseIndex: 0,
          requestedServiceNotes: 'Keep poles low and avoid tight turns if warm.',
          costShare: 18,
        },
      ],
      recurrence: {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [2],
        end: { type: 'after_occurrences', count: 6 },
      },
    },
    {
      title: 'Dental rasp completed',
      type: 'dentist',
      status: 'completed',
      dateOffsetDays: -9,
      time: '11:00',
      horseIndexes: [1],
      location: 'Wash bay',
      providerName: 'Oak Equine Dental',
      providerPhone: '+44 7700 900501',
      totalCost: 95,
      costPerHorse: 95,
      notesAfterCompletion: 'Hooks reduced. Recheck in twelve months.',
      perHorseDetails: [
        {
          horseIndex: 1,
          requestedServiceNotes: 'Check hooks and note any chewing discomfort.',
          completionNotes:
            'Copper stood well. Hooks reduced and no sedation reaction noted.',
          costShare: 95,
        },
      ],
    },
    {
      title: 'Hoof trim follow-up',
      type: 'hoof_trimming',
      status: 'completed',
      dateOffsetDays: -3,
      time: '13:30',
      horseIndexes: [0, 2],
      location: 'Farrier bay',
      providerName: 'Tom Carter',
      providerPhone: '+44 7700 900402',
      totalCost: 70,
      costPerHorse: 35,
      perHorseDetails: [
        {
          horseIndex: 0,
          requestedServiceNotes: 'Rebalance fronts and check near fore warmth.',
          completionNotes: 'Light trim only. Monitor heat for forty-eight hours.',
          costShare: 35,
        },
        {
          horseIndex: 2,
          requestedServiceNotes: 'First demo trim assessment for sparse profile horse.',
          costShare: 35,
        },
      ],
    },
    {
      title: 'Massage appointment cancelled',
      type: 'massage',
      status: 'cancelled',
      dateOffsetDays: 2,
      time: '10:00',
      horseIndexes: [1],
      description: 'Provider unavailable; reschedule after next ride.',
    },
    {
      title: 'Monthly weight tape',
      type: 'other',
      status: 'planned',
      dateOffsetDays: 14,
      time: '08:00',
      horseIndexes: [0, 1, 2],
      description: 'Record condition score and update feed notes.',
      perHorseDetails: [
        {
          horseIndex: 0,
          requestedServiceNotes: 'Retape after reduced sugar ration.',
        },
        {
          horseIndex: 1,
          requestedServiceNotes: 'Track senior feed response.',
        },
        {
          horseIndex: 2,
          requestedServiceNotes: 'Add first body condition score if possible.',
        },
      ],
      recurrence: {
        frequency: 'monthly',
        interval: 1,
        monthlyMode: 'dayOfMonth',
        dayOfMonth: 31,
        missingDateStrategy: 'lastDayOfMonth',
        end: { type: 'never' },
      },
    },
  ]

  for (const event of eventInputs) {
    const selectedHorseIds = event.horseIndexes.map((index) => horseIds[index])
    const eventInput = parseSeed(
      eventInputSchema.safeParse({
        stableId,
        horseIds: selectedHorseIds,
        date: toDateKey(event.dateOffsetDays),
        time: event.time,
        type: event.type,
        title: event.title,
        description: event.description,
        location: event.location,
        providerName: event.providerName,
        providerPhone: event.providerPhone,
        status: event.status,
        totalCost: event.totalCost,
        costPerHorse: event.costPerHorse,
        notesAfterCompletion: event.notesAfterCompletion,
        recurrence: event.recurrence,
      }),
      'Event seed',
    )
    const eventId = await ctx.db.insert('events', {
      ...eventInput,
      stableId,
      horseIds: selectedHorseIds,
      createdBy: ownerId,
    })
    const now = Date.now()

    await Promise.all(
      selectedHorseIds.map((horseId, selectedIndex) => {
        const horseIndex = event.horseIndexes[selectedIndex]
        const details = event.perHorseDetails?.find(
          (detail) => detail.horseIndex === horseIndex,
        )
        const input = parseSeed(
          eventHorseDetailsInputSchema.safeParse(details ?? {}),
          'Event horse service details seed',
        )

        return ctx.db.insert('eventsHorses', {
          eventId,
          horseId,
          requestedServiceNotes: input.requestedServiceNotes,
          completionNotes: input.completionNotes,
          costShare: input.costShare,
          status: 'confirmed',
          approvedBy: ownerId,
          approvedAt: now,
          createdAt: now,
          updatedAt: now,
        })
      }),
    )
  }
}

const seedCareReminders = async (
  ctx: MutationCtx,
  stableId: Id<'stables'>,
  ownerId: Id<'users'>,
  horseIds: Array<Id<'horses'>>,
) => {
  const reminderInputs = [
    {
      stableId,
      horseId: horseIds[0],
      title: 'Recheck near fore warmth',
      description: 'Review heat before the next schooling session and update health notes.',
      category: 'vet' as const,
      dueDate: toDateKey(-1),
      priority: 'high' as const,
      status: 'pending' as const,
    },
    {
      stableId,
      horseId: horseIds[0],
      title: 'Medication check after Danilon course',
      description: 'Confirm whether discomfort has settled and whether vet follow-up is needed.',
      category: 'medication' as const,
      dueDate: toDateKey(2),
      priority: 'medium' as const,
      status: 'pending' as const,
    },
    {
      stableId,
      horseId: horseIds[1],
      title: 'Monthly weight and BCS tape',
      description: 'Record weight and body condition after senior feed change.',
      category: 'weight' as const,
      dueDate: toDateKey(7),
      priority: 'medium' as const,
      status: 'pending' as const,
    },
    {
      stableId,
      horseId: horseIds[2],
      title: 'Book dental follow-up',
      description: 'Confirm appointment timing after first assessment flags dental follow-up.',
      category: 'dentist' as const,
      dueDate: toDateKey(10),
      priority: 'high' as const,
      status: 'pending' as const,
    },
    {
      stableId,
      horseId: horseIds[0],
      title: 'Worm count reminder',
      description: 'Send sample before deciding whether deworming is needed.',
      category: 'deworming' as const,
      dueDate: toDateKey(21),
      priority: 'low' as const,
      status: 'pending' as const,
    },
    {
      stableId,
      title: 'Review insurance renewal documents',
      description: 'Check policy numbers and update horse profiles if renewal details changed.',
      category: 'admin' as const,
      dueDate: toDateKey(30),
      priority: 'medium' as const,
      status: 'pending' as const,
    },
    {
      stableId,
      horseId: horseIds[1],
      title: 'Completed eye ointment follow-up',
      description: 'Course finished and no further irritation reported.',
      category: 'medication' as const,
      dueDate: toDateKey(-20),
      priority: 'low' as const,
      status: 'completed' as const,
    },
  ]
  const now = Date.now()

  await Promise.all(
    reminderInputs.map((reminder) => {
      const input = parseSeed(
        careReminderInputSchema.safeParse(reminder),
        'Care reminder seed',
      )

      return ctx.db.insert('careReminders', {
        ...input,
        stableId,
        horseId: reminder.horseId,
        eventId: undefined,
        createdBy: ownerId,
        completedAt: input.status === 'completed' ? now : undefined,
        createdAt: now,
        updatedAt: now,
      })
    }),
  )
}

const upsertPersonalProForUser = async (
  ctx: MutationCtx,
  userId: Id<'users'>,
) => {
  const existing = await ctx.db
    .query('userSubscriptions')
    .withIndex('by_user_id_plan', (q) =>
      q.eq('userId', userId).eq('plan', 'personal_pro'),
    )
    .unique()
  const now = Date.now()
  const subscription = {
    clerkSubscriptionId: 'dev-seed-personal-pro',
    status: 'active' as const,
    currentPeriodEnd: now + 30 * 24 * 60 * 60 * 1000,
    updatedAt: now,
  }

  if (existing) {
    await ctx.db.patch(existing._id, subscription)
    return
  }

  await ctx.db.insert('userSubscriptions', {
    userId,
    plan: 'personal_pro',
    ...subscription,
    createdAt: now,
  })
}

/**
 * Dev-only demo seed.
 *
 * Usage after setting Convex env `DEV_SEED_ENABLED=true`:
 * pnpm convex run devSeed:seedDemoStable '{"confirm":"seed-demo-data"}'
 *
 * Keep this checklist updated when adding user-visible data fields:
 * - stable operational fields
 * - stable member details and invitations
 * - stable provider directory entries
 * - stable and horse document metadata placeholders
 * - horse profile, care, and nutrition fields
 * - active/resolved health issues with all severities
 * - weight and body condition records
 * - active/completed medication records
 * - nutrition change logs
 * - planned/completed/cancelled events, providers, costs, notes, recurrence
 * - per-horse service notes, outcomes, and cost shares on shared events
 * - pending/completed care reminders across categories and priorities
 * - Personal Pro analysis inputs
 */
export const seedDemoStable = mutation({
  args: { confirm: v.literal(confirmSeed) },
  handler: async (ctx) => {
    if (process.env.DEV_SEED_ENABLED !== 'true') {
      throw new ConvexError('Set DEV_SEED_ENABLED=true before running dev seed')
    }

    const user = await getCurrentUser(ctx)
    const stableId = await upsertDemoStable(ctx, user._id)

    await Promise.all([
      seedMembers(ctx, stableId),
      seedProviders(ctx, stableId, user._id),
      seedInvitations(ctx, stableId, user._id),
      upsertPersonalProForUser(ctx, user._id),
    ])

    const horseIds = await seedHorses(ctx, stableId, user._id)

    await Promise.all([
      seedHealthIssues(ctx, stableId, user._id, horseIds),
      seedDocuments(ctx, stableId, user._id, horseIds),
      seedWeightRecords(ctx, stableId, user._id, horseIds),
      seedMedicationRecords(ctx, stableId, user._id, horseIds),
      seedNutritionLogs(ctx, stableId, user._id, horseIds),
      seedEvents(ctx, stableId, user._id, horseIds),
      seedCareReminders(ctx, stableId, user._id, horseIds),
    ])

    return { stableId }
  },
})
