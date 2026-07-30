import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

/**
 * GENERIC
 */
export const dayOfWeekNumber = v.union(
  v.literal(0),
  v.literal(1),
  v.literal(2),
  v.literal(3),
  v.literal(4),
  v.literal(5),
  v.literal(6),
)

/**
 * USERS
 */

export const userFields = {
  clerkId: v.string(),
  firstName: v.string(),
  lastName: v.optional(v.string()),
  email: v.string(),
  photoUrl: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
}

const userSchema = defineTable({ ...userFields })
  .index('by_clerk_id', ['clerkId'])
  .index('by_email', ['email'])

/**
 * STABLES
 */
export const stableFields = {
  name: v.string(),
  location: v.string(),
  description: v.optional(v.string()),
  contactName: v.optional(v.string()),
  contactPhone: v.optional(v.string()),
  emergencyPhone: v.optional(v.string()),
  addressLine1: v.optional(v.string()),
  addressLine2: v.optional(v.string()),
  postcode: v.optional(v.string()),
  country: v.optional(v.string()),
  yardRules: v.optional(v.string()),
  openingHours: v.optional(v.string()),
  ownerId: v.id('users'),
}

const stablesSchema = defineTable({ ...stableFields }).index('by_owner_id', [
  'ownerId',
])

/**
 * STABLE MEMBERS
 */
export const stableMembersFields = {
  stableId: v.id('stables'),
  userId: v.id('users'),
  role: v.union(v.literal('owner'), v.literal('member'), v.literal('guest')),
  displayNameOverride: v.optional(v.string()),
  phone: v.optional(v.string()),
  emergencyContact: v.optional(v.string()),
}

const stableMembersSchema = defineTable({ ...stableMembersFields })
  .index('by_stable_id', ['stableId'])
  .index('by_user_id', ['userId'])
  .index('by_stable_id_user_id', ['stableId', 'userId'])

/**
 * STABLE PROVIDERS
 */
export const stableProviderType = v.union(
  v.literal('vet'),
  v.literal('farrier'),
  v.literal('dentist'),
  v.literal('physio'),
  v.literal('saddler'),
  v.literal('other'),
)

export const stableProvidersFields = {
  stableId: v.id('stables'),
  type: stableProviderType,
  name: v.string(),
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
  notes: v.optional(v.string()),
  createdBy: v.id('users'),
  createdAt: v.number(),
  updatedAt: v.number(),
}

const stableProvidersSchema = defineTable({ ...stableProvidersFields })
  .index('by_stable_id', ['stableId'])
  .index('by_stable_id_type', ['stableId', 'type'])

/**
 * STABLE DOCUMENTS
 */
export const stableDocumentType = v.union(
  v.literal('passport'),
  v.literal('vaccination'),
  v.literal('insurance'),
  v.literal('vet_report'),
  v.literal('farrier'),
  v.literal('dental'),
  v.literal('other'),
)

export const stableDocumentsFields = {
  stableId: v.id('stables'),
  horseId: v.optional(v.id('horses')),
  eventId: v.optional(v.id('events')),
  storageId: v.optional(v.id('_storage')),
  type: stableDocumentType,
  fileName: v.string(),
  contentType: v.optional(v.string()),
  size: v.optional(v.number()),
  notes: v.optional(v.string()),
  createdBy: v.id('users'),
  createdAt: v.number(),
}

const stableDocumentsSchema = defineTable({ ...stableDocumentsFields })
  .index('by_stable_id', ['stableId'])
  .index('by_horse_id', ['horseId'])
  .index('by_event_id', ['eventId'])

/**
 * STABLE INVITATIONS
 */
export const stableInvitationRole = v.union(v.literal('member'), v.literal('guest'))

export const stableInvitationStatus = v.union(
  v.literal('pending'),
  v.literal('accepted_pending_subscription'),
  v.literal('accepted'),
  v.literal('revoked'),
  v.literal('expired'),
)

export const stableInvitationsFields = {
  stableId: v.id('stables'),
  email: v.string(),
  role: stableInvitationRole,
  status: stableInvitationStatus,
  token: v.string(),
  invitedBy: v.id('users'),
  acceptedBy: v.optional(v.id('users')),
  createdAt: v.number(),
  updatedAt: v.number(),
  expiresAt: v.number(),
  acceptedAt: v.optional(v.number()),
}

const stableInvitationsSchema = defineTable({ ...stableInvitationsFields })
  .index('by_stable_id', ['stableId'])
  .index('by_email_status', ['email', 'status'])
  .index('by_token', ['token'])
  .index('by_accepted_by_status', ['acceptedBy', 'status'])

/**
 * USER SUBSCRIPTIONS
 */
export const userSubscriptionPlan = v.union(
  v.literal('free'),
  v.literal('personal_plus'),
  v.literal('personal_pro'),
)

export const userSubscriptionStatus = v.union(
  v.literal('active'),
  v.literal('past_due'),
  v.literal('canceled'),
  v.literal('incomplete'),
)

export const userSubscriptionsFields = {
  userId: v.id('users'),
  clerkSubscriptionId: v.optional(v.string()),
  plan: userSubscriptionPlan,
  status: userSubscriptionStatus,
  currentPeriodEnd: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
}

const userSubscriptionsSchema = defineTable({ ...userSubscriptionsFields })
  .index('by_user_id', ['userId'])
  .index('by_user_id_plan', ['userId', 'plan'])

/**
 * HORSES
 */
export const horsesFields = {
  stableId: v.id('stables'),
  ownerId: v.id('users'),
  name: v.string(),
  ownerName: v.optional(v.string()),
  age: v.number(),
  breed: v.optional(v.string()),
  sex: v.optional(v.union(v.literal('mare'), v.literal('gelding'), v.literal('stallion'))),
  color: v.optional(v.string()),
  height: v.optional(v.string()),
  dateOfBirth: v.optional(v.string()),
  passportNumber: v.optional(v.string()),
  microchipNumber: v.optional(v.string()),
  insuranceProvider: v.optional(v.string()),
  insurancePolicyNumber: v.optional(v.string()),
  sire: v.optional(v.string()),
  dam: v.optional(v.string()),
  discipline: v.optional(v.string()),
  shoeingStatus: v.optional(
    v.union(v.literal('barefoot'), v.literal('front_shoes'), v.literal('full_set')),
  ),
  dewormingNotes: v.optional(v.string()),
  allergies: v.optional(v.array(v.string())),
  emergencyNotes: v.optional(v.string()),
  vetName: v.optional(v.string()),
  vetPhone: v.optional(v.string()),
  farrierName: v.optional(v.string()),
  farrierPhone: v.optional(v.string()),
  nutritionNotes: v.optional(v.string()),
  nutritionRecommended: v.optional(v.array(v.string())),
  nutritionAvoid: v.optional(v.array(v.string())),
  feedingRoutine: v.optional(v.string()),
  profileImageId: v.optional(v.id('_storage')),
}

const horsesSchema = defineTable({ ...horsesFields })
  .index('by_stable_id', ['stableId'])
  .index('by_owner_id', ['ownerId'])

/**
 * HORSE HEALTH ISSUES
 */
export const horseHealthIssueStatus = v.union(
  v.literal('active'),
  v.literal('resolved'),
)

export const horseHealthIssueSeverity = v.union(
  v.literal('low'),
  v.literal('medium'),
  v.literal('high'),
)

export const horseHealthIssuesFields = {
  horseId: v.id('horses'),
  stableId: v.id('stables'),
  title: v.string(),
  description: v.optional(v.string()),
  status: horseHealthIssueStatus,
  severity: v.optional(horseHealthIssueSeverity),
  notedAt: v.number(),
  resolvedAt: v.optional(v.number()),
  createdBy: v.id('users'),
  createdAt: v.number(),
  updatedAt: v.number(),
}

const horseHealthIssuesSchema = defineTable({ ...horseHealthIssuesFields })
  .index('by_horse_id', ['horseId'])
  .index('by_stable_id', ['stableId'])
  .index('by_horse_id_status', ['horseId', 'status'])

/**
 * HORSE WEIGHT RECORDS
 */
export const horseWeightUnit = v.union(v.literal('kg'), v.literal('lb'))

export const horseWeightRecordsFields = {
  horseId: v.id('horses'),
  stableId: v.id('stables'),
  weight: v.number(),
  unit: horseWeightUnit,
  measuredAt: v.number(),
  bodyConditionScore: v.optional(v.number()),
  notes: v.optional(v.string()),
  createdBy: v.id('users'),
  createdAt: v.number(),
}

const horseWeightRecordsSchema = defineTable({ ...horseWeightRecordsFields })
  .index('by_horse_id', ['horseId'])
  .index('by_stable_id', ['stableId'])
  .index('by_horse_id_measured_at', ['horseId', 'measuredAt'])

/**
 * HORSE MEDICATION RECORDS
 */
export const horseMedicationRecordStatus = v.union(
  v.literal('active'),
  v.literal('completed'),
)

export const horseMedicationRecordsFields = {
  horseId: v.id('horses'),
  stableId: v.id('stables'),
  medicationName: v.string(),
  dosage: v.string(),
  frequency: v.optional(v.string()),
  startDate: v.string(),
  endDate: v.optional(v.string()),
  prescribedBy: v.optional(v.string()),
  reason: v.optional(v.string()),
  notes: v.optional(v.string()),
  status: horseMedicationRecordStatus,
  createdBy: v.id('users'),
  createdAt: v.number(),
  updatedAt: v.number(),
}

const horseMedicationRecordsSchema = defineTable({
  ...horseMedicationRecordsFields,
})
  .index('by_horse_id', ['horseId'])
  .index('by_stable_id', ['stableId'])
  .index('by_horse_id_status', ['horseId', 'status'])

/**
 * HORSE NUTRITION LOGS
 */
export const horseNutritionLogsFields = {
  horseId: v.id('horses'),
  stableId: v.id('stables'),
  changedAt: v.number(),
  summary: v.string(),
  feedingRoutineSnapshot: v.optional(v.string()),
  recommendedSnapshot: v.optional(v.array(v.string())),
  avoidSnapshot: v.optional(v.array(v.string())),
  notes: v.optional(v.string()),
  createdBy: v.id('users'),
  createdAt: v.number(),
}

const horseNutritionLogsSchema = defineTable({ ...horseNutritionLogsFields })
  .index('by_horse_id', ['horseId'])
  .index('by_stable_id', ['stableId'])
  .index('by_horse_id_changed_at', ['horseId', 'changedAt'])

/**
 * EVENTS
 */
export const eventType = v.union(
  v.literal('vet'),
  v.literal('training'),
  v.literal('dentist'),
  v.literal('hoof_trimming'),
  v.literal('massage'),
  v.literal('other'),
)

export const eventStatus = v.union(
  v.literal('planned'),
  v.literal('completed'),
  v.literal('cancelled'),
)

export const recurrenceEndRule = v.union(
  v.object({
    type: v.literal('never'),
  }),
  v.object({
    type: v.literal('on_date'),
    date: v.string(),
  }),
  v.object({
    type: v.literal('after_occurrences'),
    count: v.number(),
  }),
)

export const eventRecurrenceSetup = v.object({
  frequency: v.union(
    v.literal('daily'),
    v.literal('weekly'),
    v.literal('monthly'),
  ),
  interval: v.number(),
  daysOfWeek: v.optional(v.array(dayOfWeekNumber)),
  monthlyMode: v.optional(
    v.union(v.literal('dayOfMonth'), v.literal('weekdayPattern')),
  ),
  dayOfMonth: v.optional(v.number()),
  ordinal: v.optional(
    v.union(
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal('last'),
    ),
  ),
  weekday: v.optional(dayOfWeekNumber),
  missingDateStrategy: v.optional(
    v.union(v.literal('lastDayOfMonth'), v.literal('skip')),
  ),
  end: v.optional(recurrenceEndRule),
})

export const eventFields = {
  horseIds: v.array(v.id('horses')),
  createdBy: v.id('users'),
  stableId: v.id('stables'),
  type: eventType,
  title: v.string(),
  description: v.optional(v.string()),
  location: v.optional(v.string()),
  providerName: v.optional(v.string()),
  providerPhone: v.optional(v.string()),
  totalCost: v.optional(v.number()),
  costPerHorse: v.optional(v.number()),
  status: v.optional(eventStatus),
  notesAfterCompletion: v.optional(v.string()),
  date: v.string(),
  endDate: v.optional(v.string()),
  time: v.string(),
  recurrence: v.optional(eventRecurrenceSetup),
}

const eventsSchema = defineTable({ ...eventFields })
  .index('by_stable_id', ['stableId'])
  .index('by_stable_id_date', ['stableId', 'date'])
  .index('by_created_by', ['createdBy'])
  .index('by_type', ['type'])

export const eventHorsesFields = {
  eventId: v.id('events'),
  horseId: v.id('horses'),
  requestedServiceNotes: v.optional(v.string()),
  completionNotes: v.optional(v.string()),
  costShare: v.optional(v.number()),
  status: v.optional(
    v.union(
      v.literal('confirmed'),
      v.literal('invited'),
      v.literal('declined'),
    ),
  ),
  invitedBy: v.optional(v.id('users')),
  approvedBy: v.optional(v.id('users')),
  invitedAt: v.optional(v.number()),
  approvedAt: v.optional(v.number()),
  declinedAt: v.optional(v.number()),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
}

const eventHorsesSchema = defineTable({ ...eventHorsesFields })
  .index('by_event_id', ['eventId'])
  .index('by_horse_id', ['horseId'])
  .index('by_horse_id_event_id', ['horseId', 'eventId'])
  .index('by_event_id_status', ['eventId', 'status'])

/**
 * CARE REMINDERS
 */
export const careReminderCategory = v.union(
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

export const careReminderPriority = v.union(
  v.literal('low'),
  v.literal('medium'),
  v.literal('high'),
)

export const careReminderStatus = v.union(
  v.literal('pending'),
  v.literal('completed'),
  v.literal('dismissed'),
)

export const careRemindersFields = {
  stableId: v.id('stables'),
  horseId: v.optional(v.id('horses')),
  eventId: v.optional(v.id('events')),
  title: v.string(),
  description: v.optional(v.string()),
  category: careReminderCategory,
  dueDate: v.string(),
  priority: v.optional(careReminderPriority),
  status: careReminderStatus,
  completedAt: v.optional(v.number()),
  createdBy: v.id('users'),
  createdAt: v.number(),
  updatedAt: v.number(),
}

const careRemindersSchema = defineTable({ ...careRemindersFields })
  .index('by_stable_id_due_date', ['stableId', 'dueDate'])
  .index('by_stable_id_status_due_date', ['stableId', 'status', 'dueDate'])
  .index('by_stable_id_category_due_date', [
    'stableId',
    'category',
    'dueDate',
  ])
  .index('by_stable_id_horse_id_due_date', [
    'stableId',
    'horseId',
    'dueDate',
  ])
  .index('by_horse_id_due_date', ['horseId', 'dueDate'])
  .searchIndex('search_title', {
    searchField: 'title',
    filterFields: ['stableId', 'status', 'category'],
  })

export default defineSchema({
  users: userSchema,
  stables: stablesSchema,
  stableMembers: stableMembersSchema,
  stableProviders: stableProvidersSchema,
  stableDocuments: stableDocumentsSchema,
  stableInvitations: stableInvitationsSchema,
  userSubscriptions: userSubscriptionsSchema,
  horses: horsesSchema,
  horseHealthIssues: horseHealthIssuesSchema,
  horseWeightRecords: horseWeightRecordsSchema,
  horseMedicationRecords: horseMedicationRecordsSchema,
  horseNutritionLogs: horseNutritionLogsSchema,
  events: eventsSchema,
  eventsHorses: eventHorsesSchema,
  careReminders: careRemindersSchema,
})
