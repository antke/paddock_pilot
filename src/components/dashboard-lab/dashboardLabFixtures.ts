import { formatDateKey } from '#/lib/dateDisplay'
import type { Id } from 'convex/_generated/dataModel'
import { createDashboardLabData } from './dashboardLabData'
import type {
  DashboardLabData,
  DashboardLabEvent,
  DashboardLabHorse,
  DashboardLabOverview,
  DashboardLabStable,
} from './dashboardLabTypes'

const createdAt = Date.UTC(2026, 0, 15)
const userId = 'lab-user-stable-office' as Id<'users'>
const stableId = 'lab-stable-field-office' as Id<'stables'>
const annexStableId = 'lab-stable-north-pasture' as Id<'stables'>
const juniperId = 'lab-horse-juniper' as Id<'horses'>
const atlasId = 'lab-horse-atlas' as Id<'horses'>
const meadowId = 'lab-horse-meadow' as Id<'horses'>

export function createDashboardLabFixtureData(
  activeStableId: Id<'stables'> = stableId,
): DashboardLabData {
  const stables = createFixtureStables()
  const stable =
    stables.find((candidate) => candidate._id === activeStableId) ?? stables[0]
  const horses = createFixtureHorses().filter(
    (horse) => horse.stableId === stable._id,
  )
  const events = createFixtureEvents().filter(
    (event) => event.stableId === stable._id,
  )
  const overview = createFixtureOverview({
    activeStableId: stable._id,
    events,
    horseCount: horses.length,
  })

  return createDashboardLabData({
    stable,
    stables,
    events,
    horses,
    overview,
  })
}

function createFixtureStables(): Array<DashboardLabStable> {
  return [
    {
      _id: stableId,
      _creationTime: createdAt,
      name: 'Cedar Ridge Barn',
      location: 'Hudson Valley, NY',
      description: 'Warm field office fixture for local visual review.',
      contactName: 'Mae Turner',
      contactPhone: '(555) 014-2210',
      emergencyPhone: '(555) 014-7784',
      addressLine1: '142 Bridle Lane',
      postcode: '12572',
      country: 'United States',
      yardRules: 'Quiet hours after evening feed. Record all medication notes.',
      openingHours: '6:00 AM - 8:30 PM',
      ownerId: userId,
    },
    {
      _id: annexStableId,
      _creationTime: createdAt + 1200,
      name: 'North Pasture Annex',
      location: 'Rhinebeck, NY',
      description: 'Secondary stable for list and selector states.',
      ownerId: userId,
    },
  ]
}

function createFixtureHorses(): Array<DashboardLabHorse> {
  return [
    createFixtureHorse({
      id: juniperId,
      name: 'Juniper',
      age: 9,
      breed: 'Dutch Warmblood',
      sex: 'mare',
      color: 'Bay',
      height: '16.1hh',
      discipline: 'Dressage',
      ownerName: 'Mae Turner',
      emergencyNotes: 'Sensitive to deep footing after hard work.',
      nutritionNotes: 'Low-starch ration with soaked beet pulp.',
      nutritionRecommended: ['Electrolytes after travel', 'Joint supplement'],
      nutritionAvoid: ['High molasses mixes'],
      feedingRoutine: 'AM hay, noon balancer, PM hay and mash.',
      vetName: 'Dr. Halley Morse',
      vetPhone: '(555) 014-3300',
      farrierName: 'Ben Carter',
      farrierPhone: '(555) 014-1902',
      passportNumber: 'GBR-PP-4412',
      microchipNumber: '985141000441200',
      shoeingStatus: 'front_shoes',
    }),
    createFixtureHorse({
      id: atlasId,
      name: 'Atlas',
      age: 14,
      breed: 'Quarter Horse',
      sex: 'gelding',
      color: 'Chestnut',
      height: '15.2hh',
      discipline: 'Trail',
      ownerName: 'Rae Monroe',
      emergencyNotes: 'Prefers slow transitions into new paddocks.',
      nutritionNotes: 'Senior feed split across three meals.',
      feedingRoutine: 'Small breakfast, turnout hay, evening senior feed.',
      shoeingStatus: 'barefoot',
    }),
    createFixtureHorse({
      id: meadowId,
      name: 'Meadow',
      age: 6,
      breed: 'Connemara',
      sex: 'mare',
      color: 'Grey',
      height: '14.3hh',
      discipline: 'Eventing',
      ownerName: 'June Hale',
      allergies: ['Dusty hay'],
      nutritionNotes: 'Soaked hay during dry weeks.',
      shoeingStatus: 'full_set',
    }),
  ]
}

function createFixtureHorse(
  input: Partial<DashboardLabHorse> & {
    id: Id<'horses'>
    name: string
    age: number
  },
): DashboardLabHorse {
  return {
    _id: input.id,
    _creationTime: createdAt,
    stableId,
    ownerId: userId,
    name: input.name,
    age: input.age,
    ownerName: input.ownerName,
    breed: input.breed,
    sex: input.sex,
    color: input.color,
    height: input.height,
    dateOfBirth: input.dateOfBirth,
    passportNumber: input.passportNumber,
    microchipNumber: input.microchipNumber,
    insuranceProvider: input.insuranceProvider,
    insurancePolicyNumber: input.insurancePolicyNumber,
    sire: input.sire,
    dam: input.dam,
    discipline: input.discipline,
    shoeingStatus: input.shoeingStatus,
    dewormingNotes: input.dewormingNotes,
    allergies: input.allergies,
    emergencyNotes: input.emergencyNotes,
    vetName: input.vetName,
    vetPhone: input.vetPhone,
    farrierName: input.farrierName,
    farrierPhone: input.farrierPhone,
    nutritionNotes: input.nutritionNotes,
    nutritionRecommended: input.nutritionRecommended,
    nutritionAvoid: input.nutritionAvoid,
    feedingRoutine: input.feedingRoutine,
    profileImageId: input.profileImageId,
    profileImageUrl: input.profileImageUrl,
  }
}

function createFixtureEvents(): Array<DashboardLabEvent> {
  return [
    createFixtureEvent({
      id: 'lab-event-vet-check',
      title: 'Lameness recheck and trot-up',
      type: 'vet',
      dateOffset: 0,
      time: '10:30',
      horseIds: [juniperId],
      providerName: 'Dr. Halley Morse',
      providerPhone: '(555) 014-3300',
      location: 'Main aisle',
      totalCost: 180,
      description: 'Follow-up after turnout change and new shoeing cycle.',
      status: 'planned',
    }),
    createFixtureEvent({
      id: 'lab-event-farrier',
      title: 'Farrier reset',
      type: 'hoof_trimming',
      dateOffset: 3,
      time: '08:15',
      horseIds: [juniperId, atlasId],
      providerName: 'Ben Carter',
      providerPhone: '(555) 014-1902',
      location: 'Wash bay',
      costPerHorse: 95,
      status: 'planned',
    }),
    createFixtureEvent({
      id: 'lab-event-training',
      title: 'Cavaletti schooling block',
      type: 'training',
      dateOffset: 5,
      time: '15:45',
      horseIds: [meadowId],
      location: 'Outdoor ring',
      description: 'Light gymnastic work with notes after completion.',
      status: 'planned',
    }),
    createFixtureEvent({
      id: 'lab-event-dental',
      title: 'Dental float',
      type: 'dentist',
      dateOffset: -9,
      time: '11:00',
      horseIds: [atlasId],
      providerName: 'North County Equine Dental',
      notesAfterCompletion: 'Mild hooks corrected. Recheck in twelve months.',
      status: 'completed',
    }),
  ]
}

function createFixtureEvent({
  id,
  title,
  type,
  dateOffset,
  time,
  horseIds,
  ...event
}: Partial<DashboardLabEvent> & {
  id: string
  title: string
  type: DashboardLabEvent['type']
  dateOffset: number
  time: string
  horseIds: Array<Id<'horses'>>
}): DashboardLabEvent {
  return {
    _id: id as Id<'events'>,
    _creationTime: createdAt,
    stableId,
    createdBy: userId,
    title,
    type,
    date: dateKeyFromOffset(dateOffset),
    time,
    horseIds,
    ...event,
  }
}

function createFixtureOverview({
  activeStableId,
  events,
  horseCount,
}: {
  activeStableId: Id<'stables'>
  events: Array<DashboardLabEvent>
  horseCount: number
}): DashboardLabOverview {
  const dueReminders: DashboardLabOverview['dueReminders'] = [
    {
      id: 'lab-reminder-lameness' as Id<'careReminders'>,
      stableId,
      stableName: 'Cedar Ridge Barn',
      horseId: juniperId,
      horseName: 'Juniper',
      title: 'Recheck lameness notes after turnout',
      dueDate: dateKeyFromOffset(-1),
      category: 'vet',
      priority: 'high',
      overdue: true,
    },
    {
      id: 'lab-reminder-supplements' as Id<'careReminders'>,
      stableId,
      stableName: 'Cedar Ridge Barn',
      horseId: atlasId,
      horseName: 'Atlas',
      title: 'Order senior supplement refill',
      dueDate: dateKeyFromOffset(2),
      category: 'nutrition',
      priority: 'medium',
      overdue: false,
    },
  ].filter((reminder) => reminder.stableId === activeStableId)
  const upcomingEvents = events
    .filter((event) => (event.status ?? 'planned') === 'planned')
    .map((event) => ({
      id: event._id,
      stableId: event.stableId,
      stableName: 'Cedar Ridge Barn',
      title: event.title,
      date: event.date,
      time: event.time,
      type: event.type,
      horseCount: event.horseIds.length,
    }))

  const attentionHorses: DashboardLabOverview['attentionHorses'] = [
    {
      horseId: juniperId,
      horseName: 'Juniper',
      ownerName: 'Mae Turner',
      breed: 'Dutch Warmblood',
      profileImageUrl: undefined,
      stableId,
      stableName: 'Cedar Ridge Barn',
      activeIssueCount: 1,
      highIssueCount: 1,
      activeMedicationCount: 0,
      overdueReminderCount: 1,
    },
    {
      horseId: atlasId,
      horseName: 'Atlas',
      ownerName: 'Mae Turner',
      breed: 'Irish Sport Horse',
      profileImageUrl: undefined,
      stableId,
      stableName: 'Cedar Ridge Barn',
      activeIssueCount: 0,
      highIssueCount: 0,
      activeMedicationCount: 1,
      overdueReminderCount: 0,
    },
  ].filter((horse) => horse.stableId === activeStableId)

  return {
    summary: {
      stableCount: 2,
      horseCount,
      upcomingEventCount: upcomingEvents.length,
      dueReminderCount: dueReminders.length,
      overdueReminderCount: dueReminders.filter((reminder) => reminder.overdue)
        .length,
      highSeverityIssueCount: attentionHorses.reduce(
        (count, horse) => count + horse.highIssueCount,
        0,
      ),
      activeMedicationCount: attentionHorses.reduce(
        (count, horse) => count + horse.activeMedicationCount,
        0,
      ),
    },
    stableSummaries: [
      {
        stableId,
        stableName: 'Cedar Ridge Barn',
        location: 'Hudson Valley, NY',
        horseCount: 3,
        upcomingEventCount: upcomingEvents.length,
        dueReminderCount: dueReminders.length,
        overdueReminderCount: 1,
        highSeverityIssueCount: 1,
        activeMedicationCount: 1,
      },
      {
        stableId: annexStableId,
        stableName: 'North Pasture Annex',
        location: 'Rhinebeck, NY',
        horseCount: 0,
        upcomingEventCount: 0,
        dueReminderCount: 0,
        overdueReminderCount: 0,
        highSeverityIssueCount: 0,
        activeMedicationCount: 0,
      },
    ],
    dueReminders,
    upcomingEvents,
    attentionHorses,
  }
}

function dateKeyFromOffset(offsetDays: number) {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  return formatDateKey(date)
}
