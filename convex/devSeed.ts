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
import { internalMutation } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import { deleteStorageObjectIfUnreferenced } from './libs/storageObjects'
import { getCurrentUser } from './libs/stablePermissions'

const confirmSeed = 'seed-demo-data'
const demoStableName = 'Paddock Pilot Demo Yard'

type SeedEventInput = {
  title: string
  type: 'vet' | 'training' | 'dentist' | 'hoof_trimming' | 'massage' | 'other'
  status: 'planned' | 'completed' | 'cancelled'
  dateOffsetDays: number
  endDateOffsetDays?: number
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

type NonEmptyReadonlyArray<T> = readonly [T, ...T[]]

const pickSeedValue = <TValues extends NonEmptyReadonlyArray<unknown>>(
  values: TValues,
  index: number,
): TValues[number] => {
  const value = values[index % values.length]

  if (value === undefined) {
    throw new ConvexError('Seed values must include at least one option')
  }

  return value
}

const getSeedHorseId = (horseIds: Array<Id<'horses'>>, index: number) => {
  const horseId = horseIds[index % horseIds.length]

  if (!horseId) {
    throw new ConvexError('Seed horses must be created before dependent rows')
  }

  return horseId
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
  result:
    | { success: true; data: T }
    | { success: false; error: { issues: Array<{ message: string }> } },
  label: string,
) => {
  if (result.success) return result.data

  throw new ConvexError(
    `${label}: ${result.error.issues[0]?.message ?? 'Invalid seed data'}`,
  )
}

const createSeedDocumentFile = (fileName: string, notes?: string) => {
  const pdfText = [fileName, notes ?? 'Paddock Pilot demo document']
    .flatMap((line) => wrapSeedPdfText(line))
    .map(escapeSeedPdfText)
  const contentLines = pdfText.map(
    (line, index) => `${index === 0 ? '' : 'T*\n'}(${line}) Tj`,
  )
  const content = [
    'BT',
    '/F1 16 Tf',
    '72 720 Td',
    '18 TL',
    ...contentLines,
    'ET',
  ].join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let pdf = '%PDF-1.4\n'
  const objectOffsets: Array<number> = []

  objects.forEach((object, index) => {
    objectOffsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })

  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  pdf += objectOffsets
    .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
    .join('')
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`
  pdf += `startxref\n${xrefOffset}\n%%EOF\n`

  return new Blob([pdf], { type: 'application/pdf' })
}

const wrapSeedPdfText = (value: string) => {
  const words = value.replace(/\s+/g, ' ').trim().split(' ')
  const lines: Array<string> = []

  words.forEach((word) => {
    const current = lines.at(-1)

    if (!current || `${current} ${word}`.length > 72) {
      lines.push(word)
    } else {
      lines[lines.length - 1] = `${current} ${word}`
    }
  })

  return lines.length > 0 ? lines : ['Paddock Pilot demo document']
}

const escapeSeedPdfText = (value: string) =>
  value.replace(/[^\x20-\x7e]/g, '?').replace(/([\\()])/g, '\\$1')

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

const getSeedOwner = async (ctx: MutationCtx, ownerEmail?: string) => {
  if (!ownerEmail) return await getCurrentUser(ctx)

  const owner = await ctx.db
    .query('users')
    .withIndex('by_email', (q) => q.eq('email', ownerEmail))
    .unique()

  if (!owner) {
    throw new ConvexError(
      `Seed owner user not found for ${ownerEmail}. Sign in once first, then rerun the seed with that email.`,
    )
  }

  return owner
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

  const documentStorageIds = [
    ...new Set(
      documents.flatMap((document) =>
        document.storageId ? [document.storageId] : [],
      ),
    ),
  ]

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

  await Promise.all(
    documentStorageIds.map((storageId) =>
      deleteStorageObjectIfUnreferenced(ctx, storageId),
    ),
  )
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

const seedMembers = async (ctx: MutationCtx, stableId: Id<'stables'>) => {
  const memberUserId = await upsertDemoUser(ctx, {
    clerkId: 'demo-seed-member',
    firstName: 'Ellis',
    lastName: 'Member',
    email: 'demo.member@paddockpilot.test',
  })
  const secondMemberUserId = await upsertDemoUser(ctx, {
    clerkId: 'demo-seed-member-two',
    firstName: 'Gina',
    lastName: 'Member',
    email: 'demo.member.two@paddockpilot.test',
  })
  const memberDetails = parseSeed(
    stableMemberDetailsInputSchema.safeParse({
      displayNameOverride: 'Ellis - weekday cover',
      phone: '+44 7700 900202',
      emergencyContact: 'Sam Member, +44 7700 900203',
    }),
    'Member details seed',
  )
  const secondMemberDetails = parseSeed(
    stableMemberDetailsInputSchema.safeParse({
      displayNameOverride: 'Gina - visiting physio',
      phone: '+44 7700 900303',
      emergencyContact: 'Clinic desk, +44 7700 900304',
    }),
    'Second member details seed',
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
      userId: secondMemberUserId,
      role: 'member',
      ...secondMemberDetails,
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
      role: 'member',
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
    ...[
      [
        'vet',
        'South Ridge Equine Clinic',
        '+44 7700 901001',
        'afterhours@southridge.example.test',
      ],
      ['farrier', 'Hannah Vale Farriery', '+44 7700 901002', undefined],
      [
        'dentist',
        'Cedar Dental Services',
        '+44 7700 901003',
        'cedar.dental@example.test',
      ],
      ['physio', 'Larkspur Equine Therapy', '+44 7700 901004', undefined],
      [
        'saddler',
        'Fells Saddle Fitting',
        '+44 7700 901005',
        'fitters@fells.example.test',
      ],
      ['other', 'Arena Maintenance Team', '+44 7700 901006', undefined],
      ['vet', 'Dr Niamh Patel', '+44 7700 901007', 'niamh.patel@example.test'],
      ['farrier', 'Oak Lane Hoof Care', '+44 7700 901008', undefined],
      ['dentist', 'Riverbend Equine Dental', '+44 7700 901009', undefined],
      [
        'physio',
        'Heather Moor Bodywork',
        '+44 7700 901010',
        'heather.moor@example.test',
      ],
      ['saddler', 'North Tack Workshop', '+44 7700 901011', undefined],
      [
        'other',
        'Hay Supplier Desk',
        '+44 7700 901012',
        'orders@haydesk.example.test',
      ],
      ['vet', 'Mobile Vaccination Cover', '+44 7700 901013', undefined],
      ['farrier', 'Emergency Farrier Cover', '+44 7700 901014', undefined],
      [
        'other',
        'Transport Coordinator',
        '+44 7700 901015',
        'transport@example.test',
      ],
    ].map(([type, name, phone, email], index) => ({
      stableId,
      type: type as
        | 'vet'
        | 'farrier'
        | 'dentist'
        | 'physio'
        | 'saddler'
        | 'other',
      name,
      phone,
      email,
      notes: `Generated demo provider ${index + 1} for provider list and filtering checks.`,
    })),
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
    ...[
      [
        'Willow Moon',
        'Mara Yard Manager',
        7,
        'Connemara',
        'mare',
        'Dun',
        '14.1hh',
        'Working hunter',
      ],
      [
        'Atlas Grove',
        'Demo Owner',
        11,
        'Warmblood',
        'gelding',
        'Dark bay',
        '16.3hh',
        'Dressage',
      ],
      [
        'Misty Vale',
        'Ellis Member',
        18,
        'Arab cross',
        'mare',
        'Grey',
        '15.0hh',
        'Hacking',
      ],
      [
        'Redbrook Echo',
        'Gina Guest',
        6,
        'Irish Draught',
        'gelding',
        'Chestnut',
        '16.2hh',
        'All-rounder',
      ],
      [
        'Sable Finch',
        'Demo Owner',
        10,
        'Thoroughbred',
        'mare',
        'Black',
        '15.2hh',
        'Retraining',
      ],
      [
        'Harbour Light',
        'Ellis Member',
        13,
        'Cob',
        'gelding',
        'Piebald',
        '14.3hh',
        'Leisure riding',
      ],
      [
        'Fern Hollow',
        'Mara Yard Manager',
        8,
        'New Forest',
        'mare',
        'Bay',
        '13.2hh',
        'Pony club',
      ],
      [
        'Bramble King',
        'Demo Owner',
        16,
        'Highland',
        'gelding',
        'Mouse dun',
        '14.0hh',
        'Trail riding',
      ],
      [
        'Quartz River',
        'Ellis Member',
        4,
        'Sport Horse',
        'stallion',
        'Bay',
        '15.3hh',
        'Youngstock',
      ],
      [
        'Meadow Lark',
        'Gina Guest',
        12,
        'Welsh Section D',
        'mare',
        'Palomino',
        '14.2hh',
        'Showing',
      ],
      [
        'Oak Dancer',
        'Demo Owner',
        15,
        'Hanoverian',
        'gelding',
        'Bay',
        '17.0hh',
        'Dressage',
      ],
      [
        'Clover Drift',
        'Ellis Member',
        9,
        'Appaloosa',
        'mare',
        'Spotted',
        '15.1hh',
        'Western groundwork',
      ],
      [
        'Silver Kite',
        'Mara Yard Manager',
        20,
        'Irish Cob',
        'gelding',
        'Grey',
        '15.0hh',
        'Light hacking',
      ],
      [
        'Foxglove Bay',
        'Demo Owner',
        6,
        'Exmoor',
        'mare',
        'Bay',
        '12.3hh',
        'Companion and in-hand',
      ],
      [
        'Rookwood Storm',
        'Gina Guest',
        17,
        'Friesian cross',
        'gelding',
        'Black',
        '16.0hh',
        'Schoolmaster',
      ],
      [
        'Pearl Orchard',
        'Ellis Member',
        8,
        'Andalusian',
        'mare',
        'Grey',
        '15.2hh',
        'Classical schooling',
      ],
      [
        'Thistle Run',
        'Demo Owner',
        5,
        'Native cross',
        'gelding',
        'Roan',
        '14.0hh',
        'Fitness building',
      ],
    ].map(
      (
        [name, ownerName, age, breed, sex, color, height, discipline],
        index,
      ) => ({
        name,
        ownerName,
        age,
        breed,
        sex: sex as 'mare' | 'gelding' | 'stallion',
        color,
        height,
        dateOfBirth: `${2006 + (index % 15)}-${String((index % 12) + 1).padStart(2, '0')}-15`,
        passportNumber: `GBR-DEMO-${String(index + 4).padStart(3, '0')}`,
        microchipNumber: `9851410000000${String(index + 4).padStart(2, '0')}`,
        insuranceProvider: index % 4 === 0 ? undefined : 'Demo Equine Cover',
        insurancePolicyNumber:
          index % 4 === 0
            ? undefined
            : `DEMO-POL-${String(index + 4).padStart(3, '0')}`,
        discipline,
        shoeingStatus: pickSeedValue(
          ['barefoot', 'front_shoes', 'full_set'] as const,
          index,
        ),
        dewormingNotes:
          'Generated seed profile: keep worm count and vaccine history visible for list checks.',
        allergies: index % 5 === 0 ? ['Dust sensitivity'] : [],
        emergencyNotes:
          index % 3 === 0
            ? 'Prefers quiet handling for clipping and injections.'
            : undefined,
        vetName: 'Dr Priya Shah',
        vetPhone: '+44 7700 900401',
        farrierName: 'Tom Carter',
        farrierPhone: '+44 7700 900402',
        feedingRoutine:
          'Forage-first demo ration with balancer adjusted to workload.',
        nutritionNotes:
          index % 4 === 0
            ? undefined
            : 'Use generated nutrition notes to test profile coverage and filtering.',
        nutritionRecommended: ['Forage', 'Balancer'],
        nutritionAvoid: index % 6 === 0 ? ['Rich spring grass'] : [],
      }),
    ),
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
      notes: 'Demo passport identity record for document workflow checks.',
    },
    {
      stableId,
      horseId: horseIds[0],
      type: 'vaccination' as const,
      fileName: 'Juniper vaccination proof.pdf',
      contentType: 'application/pdf',
      notes: 'Annual booster proof to keep ready for yard moves or shows.',
    },
    {
      stableId,
      horseId: horseIds[1],
      type: 'insurance' as const,
      fileName: 'Copper Field insurance schedule.pdf',
      contentType: 'application/pdf',
      notes: 'Policy summary for emergency administration checks.',
    },
    {
      stableId,
      horseId: undefined,
      type: 'other' as const,
      fileName: 'Demo yard emergency plan.pdf',
      contentType: 'application/pdf',
      notes: 'Stable-wide emergency plan for document directory testing.',
    },
    ...Array.from({ length: 20 }, (_, index) => {
      const type = pickSeedValue(
        [
          'passport',
          'vaccination',
          'insurance',
          'vet_report',
          'farrier',
          'dental',
          'other',
        ] as const,
        index,
      )
      const horseId =
        index % 5 === 0 ? undefined : getSeedHorseId(horseIds, index)

      return {
        stableId,
        horseId,
        type,
        fileName: `${horseId ? 'Horse' : 'Stable'} demo ${type.replace('_', ' ')} document ${index + 1}.pdf`,
        contentType: 'application/pdf',
        notes: `Generated document ${index + 1} for document list density, category filters, and stable-wide/horse-linked rows.`,
      }
    }),
  ]
  const now = Date.now()

  await Promise.all(
    documentInputs.map(async (document) => {
      const input = parseSeed(
        stableDocumentInputSchema.safeParse(document),
        'Stable document seed',
      )
      const file = createSeedDocumentFile(input.fileName, input.notes)
      const storageId = await ctx.storage.store(file)

      return ctx.db.insert('stableDocuments', {
        stableId,
        horseId: document.horseId,
        eventId: undefined,
        storageId,
        type: input.type,
        fileName: input.fileName,
        contentType: file.type,
        size: file.size,
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
      description:
        'Lost front shoe in field. Farrier replaced and checked foot.',
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
    ...Array.from({ length: 20 }, (_, index) => {
      const status =
        index % 3 === 0 ? ('resolved' as const) : ('active' as const)
      const notedOffset = -120 + index * 6

      return {
        horseId: getSeedHorseId(horseIds, index),
        title: pickSeedValue(
          [
            'Minor girth rub watch',
            'Seasonal cough check',
            'Hind stiffness note',
            'Small field scrape',
            'Appetite dip monitor',
            'Tendon fill observation',
            'Eye watering check',
            'Saddle pressure mark',
          ] as const,
          index,
        ),
        description: `Generated health issue ${index + 1} for severity, active/resolved, and horse care list testing.`,
        severity: pickSeedValue(['low', 'medium', 'high'] as const, index),
        status,
        notedAt: toTimestamp(notedOffset),
        resolvedAt:
          status === 'resolved' ? toTimestamp(notedOffset + 3) : undefined,
      }
    }),
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
    ...Array.from({ length: 20 }, (_, index) => ({
      horseId: getSeedHorseId(horseIds, index),
      weight: 430 + ((index * 17) % 170),
      unit: 'kg' as const,
      measuredAt: toTimestamp(-220 + index * 11),
      bodyConditionScore: 4 + (index % 5) * 0.5,
      notes: `Generated tape record ${index + 1} for trend charts and dense weight history lists.`,
    })),
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
      notes:
        'Review after dentist visit; not a replacement for veterinary advice.',
      status: 'active' as const,
    },
    ...Array.from({ length: 20 }, (_, index) => {
      const status =
        index % 4 === 0 ? ('active' as const) : ('completed' as const)
      const startOffset = -160 + index * 7

      return {
        horseId: getSeedHorseId(horseIds, index),
        medicationName: pickSeedValue(
          [
            'Electrolyte support',
            'Joint supplement',
            'Probiotic paste',
            'Eye ointment',
            'Cough syrup',
            'Skin cream',
            'Gastric support',
            'Hoof supplement',
          ] as const,
          index,
        ),
        dosage: pickSeedValue(
          ['1 scoop', '2 measures', 'Small strip', 'As label', '5 ml'] as const,
          index,
        ),
        frequency: pickSeedValue(
          [
            'Once daily',
            'Twice daily',
            'After hard work',
            'With evening feed',
          ] as const,
          index,
        ),
        startDate: toDateKey(startOffset),
        endDate:
          status === 'completed' ? toDateKey(startOffset + 5) : undefined,
        prescribedBy: index % 3 === 0 ? 'Dr Priya Shah' : undefined,
        reason: `Generated medication record ${index + 1} for active/completed medication list coverage.`,
        notes:
          index % 2 === 0
            ? 'Seed note: confirm administration in feed chart.'
            : undefined,
        status,
      }
    }),
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
      feedingRoutineSnapshot:
        'Simple forage-first routine until dental follow-up.',
      recommendedSnapshot: ['Soft soaked fibre', 'Ad-lib forage'],
      avoidSnapshot: ['Hard coarse mix'],
    },
    ...Array.from({ length: 20 }, (_, index) => ({
      horseId: getSeedHorseId(horseIds, index),
      changedAt: toTimestamp(-200 + index * 9),
      summary: pickSeedValue(
        [
          'Adjusted hay ration',
          'Added electrolyte support',
          'Reduced hard feed',
          'Started soaked fibre',
          'Updated turnout grazing plan',
          'Added balancer note',
          'Changed supplement timing',
          'Reviewed senior feed',
        ] as const,
        index,
      ),
      feedingRoutineSnapshot: `Generated feeding snapshot ${index + 1}: forage-first baseline with workload-based concentrate adjustment.`,
      recommendedSnapshot: [
        pickSeedValue(
          ['Forage', 'Balancer', 'Soaked fibre', 'Electrolytes'] as const,
          index,
        ),
        pickSeedValue(
          [
            'Salt lick',
            'Joint support',
            'Senior cubes',
            'Low starch mix',
          ] as const,
          index + 1,
        ),
      ],
      avoidSnapshot: index % 4 === 0 ? ['Rich spring grass'] : [],
      notes: `Generated nutrition log ${index + 1} for chronological nutrition history lists.`,
    })),
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
  const horseCount = horseIds.length
  const eventInputs: Array<SeedEventInput> = [
    {
      title: 'Three-day away show',
      type: 'training',
      status: 'planned',
      dateOffsetDays: 10,
      endDateOffsetDays: 12,
      time: '07:00',
      horseIndexes: [0, 1],
      description:
        'Regional show weekend with travel, stabling, warm-up, and competition days.',
      location: 'South Downs Showground',
      providerName: 'Mara Yard Manager',
      providerPhone: '+44 7700 900101',
      totalCost: 420,
      costPerHorse: 210,
      perHorseDetails: [
        {
          horseIndex: 0,
          requestedServiceNotes:
            'Pack low-sugar feed and keep turnout boots available.',
          costShare: 210,
        },
        {
          horseIndex: 1,
          requestedServiceNotes:
            'Confirm overnight stabling and senior feed portions.',
          costShare: 210,
        },
      ],
    },
    {
      title: 'Owner holiday cover',
      type: 'other',
      status: 'planned',
      dateOffsetDays: 18,
      endDateOffsetDays: 24,
      time: '08:00',
      horseIndexes: [0, 1, 2],
      description:
        'Full yard cover while owner is away: daily checks, feeds, turnout, and notes.',
      location: 'Main yard',
      providerName: 'Mara Yard Manager',
      providerPhone: '+44 7700 900101',
      perHorseDetails: [
        {
          horseIndex: 0,
          requestedServiceNotes:
            'Monitor near fore warmth during daily checks.',
        },
        {
          horseIndex: 1,
          requestedServiceNotes: 'Keep senior supplement routine unchanged.',
        },
        {
          horseIndex: 2,
          requestedServiceNotes: 'Record any handling or settling notes.',
        },
      ],
    },
    {
      title: 'Residential fitness camp',
      type: 'training',
      status: 'planned',
      dateOffsetDays: 31,
      endDateOffsetDays: 35,
      time: '09:00',
      horseIndexes: [0],
      description:
        'Five-day conditioning block to test long event spans across several timeline columns.',
      location: 'Hilltop Training Centre',
      providerName: 'North Downs Equine Fitness',
      providerPhone: '+44 7700 900701',
      totalCost: 350,
      costPerHorse: 350,
      perHorseDetails: [
        {
          horseIndex: 0,
          requestedServiceNotes:
            'Keep sessions low intensity if near fore heat returns after travel.',
          costShare: 350,
        },
      ],
    },
    {
      title: 'Post-show recovery plan',
      type: 'massage',
      status: 'planned',
      dateOffsetDays: 13,
      endDateOffsetDays: 15,
      time: '10:30',
      horseIndexes: [0, 1],
      description:
        'Three-day recovery window after the away show with stretching and light bodywork.',
      location: 'Treatment area',
      providerName: 'North Downs Equine Physio',
      providerPhone: '+44 7700 900601',
      totalCost: 120,
      costPerHorse: 60,
      perHorseDetails: [
        {
          horseIndex: 0,
          requestedServiceNotes: 'Focus over back and shoulder after travel.',
          costShare: 60,
        },
        {
          horseIndex: 1,
          requestedServiceNotes: 'Gentle senior mobility check only.',
          costShare: 60,
        },
      ],
    },
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
          requestedServiceNotes:
            'Keep poles low and avoid tight turns if warm.',
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
          completionNotes:
            'Light trim only. Monitor heat for forty-eight hours.',
          costShare: 35,
        },
        {
          horseIndex: 2,
          requestedServiceNotes:
            'First demo trim assessment for sparse profile horse.',
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
    ...Array.from({ length: 20 }, (_, index): SeedEventInput => {
      const status = pickSeedValue(
        ['completed', 'planned', 'cancelled'] as const,
        index,
      )
      const type = pickSeedValue(
        [
          'vet',
          'training',
          'dentist',
          'hoof_trimming',
          'massage',
          'other',
        ] as const,
        index,
      )
      const horseIndexes =
        index % 4 === 0
          ? [index % horseCount, (index + 3) % horseCount]
          : [index % horseCount]

      return {
        title: pickSeedValue(
          [
            'Lameness review',
            'Flatwork schooling',
            'Dental assessment',
            'Routine hoof balance',
            'Back and shoulder release',
            'Body condition audit',
            'Vaccination booster',
            'Arena confidence session',
          ] as const,
          index,
        ),
        type,
        status,
        dateOffsetDays: -220 + index * 18,
        time: pickSeedValue(
          ['08:15', '09:30', '10:45', '12:00', '14:15', '16:30'] as const,
          index,
        ),
        horseIndexes,
        description: `Generated one-off event ${index + 1} for dense event list, timeline, and status filtering checks.`,
        location: pickSeedValue(
          [
            'Main barn',
            'Outdoor arena',
            'Farrier bay',
            'Wash bay',
            'South paddock',
          ] as const,
          index,
        ),
        providerName:
          index % 6 === 0
            ? undefined
            : pickSeedValue(
                [
                  'Dr Priya Shah',
                  'Tom Carter',
                  'Oak Equine Dental',
                  'Mara Yard Manager',
                ] as const,
                index,
              ),
        providerPhone: index % 6 === 0 ? undefined : '+44 7700 900401',
        totalCost: status === 'cancelled' ? undefined : 35 + index * 4,
        costPerHorse: status === 'cancelled' ? undefined : 35 + index * 2,
        notesAfterCompletion:
          status === 'completed'
            ? `Generated completion note ${index + 1} for analysis documentation coverage.`
            : undefined,
        perHorseDetails: horseIndexes.map((horseIndex) => ({
          horseIndex,
          requestedServiceNotes: `Generated request note for event ${index + 1}.`,
          completionNotes:
            status === 'completed'
              ? `Generated per-horse completion note for event ${index + 1}.`
              : undefined,
          costShare: status === 'cancelled' ? undefined : 30 + index,
        })),
      }
    }),
    ...Array.from({ length: 20 }, (_, index): SeedEventInput => {
      const frequency = pickSeedValue(
        ['weekly', 'monthly', 'daily'] as const,
        index,
      )
      const recurrence: SeedEventInput['recurrence'] =
        frequency === 'weekly'
          ? {
              frequency,
              interval: (index % 3) + 1,
              daysOfWeek: [
                pickSeedValue([0, 1, 2, 3, 4, 5, 6] as const, index),
              ],
              end: { type: 'after_occurrences', count: 6 + (index % 6) },
            }
          : frequency === 'monthly'
            ? {
                frequency,
                interval: (index % 2) + 1,
                monthlyMode: index % 2 === 0 ? 'dayOfMonth' : 'weekdayPattern',
                dayOfMonth: index % 2 === 0 ? 5 + (index % 20) : undefined,
                ordinal:
                  index % 2 === 0
                    ? undefined
                    : pickSeedValue([1, 2, 3, 4, 'last'] as const, index),
                weekday:
                  index % 2 === 0
                    ? undefined
                    : pickSeedValue([0, 1, 2, 3, 4, 5, 6] as const, index + 2),
                end:
                  index % 5 === 0
                    ? { type: 'never' }
                    : { type: 'after_occurrences', count: 8 },
              }
            : {
                frequency,
                interval: 1 + (index % 2),
                end: { type: 'after_occurrences', count: 5 + (index % 5) },
              }
      const horseIndexes = [index % horseCount, (index + 5) % horseCount]

      return {
        title: pickSeedValue(
          [
            'Recurring polework block',
            'Recurring hoof care round',
            'Recurring weight tape clinic',
            'Recurring physio review',
            'Recurring dentist rota',
            'Recurring turnout check',
            'Recurring medication audit',
            'Recurring fitness session',
          ] as const,
          index,
        ),
        type: pickSeedValue(
          [
            'training',
            'hoof_trimming',
            'other',
            'massage',
            'dentist',
            'vet',
          ] as const,
          index,
        ),
        status: index % 5 === 0 ? 'completed' : 'planned',
        dateOffsetDays: -90 + index * 7,
        time: pickSeedValue(
          ['07:45', '09:00', '11:30', '13:45', '15:30'] as const,
          index,
        ),
        horseIndexes,
        description: `Generated recurring event ${index + 1} for recurrence list and timeline interaction checks.`,
        location: pickSeedValue(
          [
            'Main yard',
            'Indoor school',
            'Farrier bay',
            'Treatment area',
          ] as const,
          index,
        ),
        providerName: pickSeedValue(
          [
            'Mara Yard Manager',
            'Tom Carter',
            'North Downs Equine Physio',
            'Dr Priya Shah',
          ] as const,
          index,
        ),
        providerPhone: '+44 7700 900101',
        totalCost: 45 + index * 3,
        costPerHorse: 25 + index,
        notesAfterCompletion:
          index % 5 === 0
            ? `Generated recurring completion note ${index + 1}.`
            : undefined,
        recurrence,
        perHorseDetails: horseIndexes.map((horseIndex) => ({
          horseIndex,
          requestedServiceNotes: `Generated recurring request note ${index + 1}.`,
          completionNotes:
            index % 5 === 0
              ? `Recurring event ${index + 1} completed cleanly.`
              : undefined,
          costShare: 20 + index,
        })),
      }
    }),
  ]

  for (const event of eventInputs) {
    const selectedHorseIds = event.horseIndexes.map((index) => horseIds[index])
    const eventInput = parseSeed(
      eventInputSchema.safeParse({
        stableId,
        horseIds: selectedHorseIds,
        date: toDateKey(event.dateOffsetDays),
        endDate:
          event.endDateOffsetDays === undefined
            ? undefined
            : toDateKey(event.endDateOffsetDays),
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
      description:
        'Review heat before the next schooling session and update health notes.',
      category: 'vet' as const,
      dueDate: toDateKey(-1),
      priority: 'high' as const,
      status: 'pending' as const,
    },
    {
      stableId,
      horseId: horseIds[0],
      title: 'Medication check after Danilon course',
      description:
        'Confirm whether discomfort has settled and whether vet follow-up is needed.',
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
      description:
        'Confirm appointment timing after first assessment flags dental follow-up.',
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
      description:
        'Check policy numbers and update horse profiles if renewal details changed.',
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
    ...Array.from({ length: 20 }, (_, index) => {
      const category = pickSeedValue(
        [
          'vet',
          'farrier',
          'dentist',
          'medication',
          'nutrition',
          'weight',
          'deworming',
          'admin',
          'other',
        ] as const,
        index,
      )
      const status = pickSeedValue(
        ['pending', 'completed', 'dismissed'] as const,
        index,
      )
      const horseId =
        category === 'admin' || index % 7 === 0
          ? undefined
          : getSeedHorseId(horseIds, index)

      return {
        stableId,
        horseId,
        title: pickSeedValue(
          [
            'Generated vet callback',
            'Generated farrier booking',
            'Generated dental reminder',
            'Generated medication review',
            'Generated nutrition update',
            'Generated weight tape task',
            'Generated worm count task',
            'Generated admin review',
          ] as const,
          index,
        ),
        description: `Generated reminder ${index + 1} for reminder list density, category filters, priorities, and overdue states.`,
        category,
        dueDate: toDateKey(-18 + index * 4),
        priority: pickSeedValue(['low', 'medium', 'high'] as const, index),
        status,
      }
    }),
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
 * pnpm convex run devSeed:seedDemoStable '{"confirm":"seed-demo-data","ownerEmail":"you@example.com"}'
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
export const seedDemoStable = internalMutation({
  args: {
    confirm: v.literal(confirmSeed),
    ownerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (process.env.DEV_SEED_ENABLED !== 'true') {
      throw new ConvexError('Set DEV_SEED_ENABLED=true before running dev seed')
    }

    const user = await getSeedOwner(ctx, args.ownerEmail)
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
