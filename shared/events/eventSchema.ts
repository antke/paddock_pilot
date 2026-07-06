import z from 'zod'

export const eventTypes = [
  'vet',
  'training',
  'dentist',
  'hoof_trimming',
  'massage',
  'other',
] as const

export const eventStatuses = ['planned', 'completed', 'cancelled'] as const

export const recurrenceFrequencies = ['daily', 'weekly', 'monthly'] as const

export const recurrenceMonthlyModes = ['dayOfMonth', 'weekdayPattern'] as const

export const recurrenceOrdinals = [1, 2, 3, 4, 'last'] as const

export const recurrenceMissingDateStrategies = [
  'lastDayOfMonth',
  'skip',
] as const

export const daysOfWeek = [0, 1, 2, 3, 4, 5, 6] as const

export const eventTypeLabels = {
  vet: 'Vet',
  training: 'Training',
  dentist: 'Dentist',
  hoof_trimming: 'Hoof trimming',
  massage: 'Massage',
  other: 'Other',
} satisfies Record<EventType, string>

export const eventStatusLabels = {
  planned: 'Planned',
  completed: 'Completed',
  cancelled: 'Cancelled',
} satisfies Record<EventStatus, string>

export const dayOfWeekLabels = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
} satisfies Record<DayOfWeek, string>

export const eventDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date.')

export const eventOptionalDateSchema = z
  .union([eventDateSchema, z.literal('')])
  .optional()
  .transform((val) => val || undefined)

export const eventTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use a valid time.')

export const eventTypeSchema = z.enum(eventTypes)

export const eventTitleSchema = z
  .string()
  .trim()
  .min(1, 'Title must have minimum 1 character.')
  .max(120, 'Title cannot be longer than 120 characters.')

export const eventDescriptionSchema = z
  .string()
  .trim()
  .max(1000, 'Description cannot be longer than 1000 characters.')

export const eventLocationSchema = z
  .string()
  .trim()
  .max(200, 'Location cannot be longer than 200 characters.')

export const eventProviderNameSchema = z
  .string()
  .trim()
  .max(100, 'Provider name cannot be longer than 100 characters.')

export const eventProviderPhoneSchema = z
  .string()
  .trim()
  .max(50, 'Provider phone cannot be longer than 50 characters.')

export const eventNotesAfterCompletionSchema = z
  .string()
  .trim()
  .max(1000, 'Completion notes cannot be longer than 1000 characters.')

export const eventCostSchema = z
  .union([z.number(), z.nan(), z.undefined()])
  .transform((val) => (val === undefined || Number.isNaN(val) ? undefined : val))
  .pipe(z.number().min(0, 'Cost cannot be negative.').max(100000, 'Cost is too high.').optional())

export const eventStatusSchema = z.enum(eventStatuses)

export const eventHorseIdsSchema = z
  .array(z.string().min(1))
  .min(1, 'Select at least one horse.')
  .refine(
    (horseIds) => new Set(horseIds).size === horseIds.length,
    'Select each horse only once.',
  )

export const eventDayOfWeekSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
])

export const recurrenceEndSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('never') }),
  z.object({ type: z.literal('on_date'), date: eventDateSchema }),
  z.object({
    type: z.literal('after_occurrences'),
    count: z
      .number()
      .int('Occurrence count must be a whole number.')
      .min(1, 'Occurrence count must be at least 1.'),
  }),
])

export const recurrenceMonthlyModeSchema = z.enum(recurrenceMonthlyModes)

export const recurrenceOrdinalSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal('last'),
])

export const recurrenceMissingDateStrategySchema = z.enum(
  recurrenceMissingDateStrategies,
)

export const eventRecurrenceSchema = z
  .object({
    frequency: z.enum(recurrenceFrequencies),
    interval: z
      .number()
      .int('Interval must be a whole number.')
      .min(1, 'Interval must be at least 1.'),
    daysOfWeek: z.array(eventDayOfWeekSchema).optional(),
    monthlyMode: recurrenceMonthlyModeSchema.optional(),
    dayOfMonth: z
      .number()
      .int('Day of month must be a whole number.')
      .min(1, 'Day of month must be at least 1.')
      .max(31, 'Day of month cannot be greater than 31.')
      .optional(),
    ordinal: recurrenceOrdinalSchema.optional(),
    weekday: eventDayOfWeekSchema.optional(),
    missingDateStrategy: recurrenceMissingDateStrategySchema.optional(),
    end: recurrenceEndSchema.optional(),
  })
  .superRefine((recurrence, ctx) => {
    if (
      recurrence.frequency === 'weekly' &&
      (!recurrence.daysOfWeek || recurrence.daysOfWeek.length === 0)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Select at least one day for weekly recurrence.',
        path: ['daysOfWeek'],
      })
    }

    if (recurrence.frequency !== 'monthly') return

    if (!recurrence.monthlyMode) {
      ctx.addIssue({
        code: 'custom',
        message: 'Choose how this monthly event repeats.',
        path: ['monthlyMode'],
      })
      return
    }

    if (recurrence.monthlyMode === 'dayOfMonth') {
      if (!recurrence.dayOfMonth) {
        ctx.addIssue({
          code: 'custom',
          message: 'Choose a day of the month.',
          path: ['dayOfMonth'],
        })
      }

      if (
        recurrence.dayOfMonth &&
        recurrence.dayOfMonth >= 29 &&
        !recurrence.missingDateStrategy
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'Choose what happens when a month does not have this date.',
          path: ['missingDateStrategy'],
        })
      }
    }

    if (recurrence.monthlyMode === 'weekdayPattern') {
      if (!recurrence.ordinal) {
        ctx.addIssue({
          code: 'custom',
          message: 'Choose which week of the month.',
          path: ['ordinal'],
        })
      }

      if (recurrence.weekday === undefined) {
        ctx.addIssue({
          code: 'custom',
          message: 'Choose a weekday.',
          path: ['weekday'],
        })
      }
    }
  })

const optionalText = <TSchema extends z.ZodString>(schema: TSchema) =>
  schema.optional().transform((val) => val || undefined)

const eventInputFieldsSchema = z.object({
  stableId: z.string().min(1),
  horseIds: eventHorseIdsSchema,
  date: eventDateSchema,
  endDate: eventOptionalDateSchema,
  time: eventTimeSchema,
  type: eventTypeSchema,
  title: eventTitleSchema,
  description: optionalText(eventDescriptionSchema),
  location: optionalText(eventLocationSchema),
  providerName: optionalText(eventProviderNameSchema),
  providerPhone: optionalText(eventProviderPhoneSchema),
  totalCost: eventCostSchema,
  costPerHorse: eventCostSchema,
  status: eventStatusSchema.optional(),
  notesAfterCompletion: optionalText(eventNotesAfterCompletionSchema),
  recurrence: eventRecurrenceSchema.optional(),
})

function validateEventDateRange(
  event: z.infer<typeof eventInputFieldsSchema>,
  ctx: z.RefinementCtx,
) {
  if (event.endDate && event.endDate < event.date) {
    ctx.addIssue({
      code: 'custom',
      message: 'End date cannot be before the start date.',
      path: ['endDate'],
    })
  }
}

export const eventInputSchema = eventInputFieldsSchema.superRefine(
  validateEventDateRange,
)

export const eventFormSchema = eventInputFieldsSchema
  .extend({
    recurring: z.boolean(),
  })
  .superRefine((event, ctx) => {
    validateEventDateRange(event, ctx)

    if (event.recurring && !event.recurrence) {
      ctx.addIssue({
        code: 'custom',
        message: 'Choose recurrence details.',
        path: ['recurrence'],
      })
    }
  })

export type EventType = (typeof eventTypes)[number]
export type EventStatus = (typeof eventStatuses)[number]
export type RecurrenceFrequency = (typeof recurrenceFrequencies)[number]
export type RecurrenceMonthlyMode = (typeof recurrenceMonthlyModes)[number]
export type RecurrenceOrdinal = (typeof recurrenceOrdinals)[number]
export type RecurrenceMissingDateStrategy =
  (typeof recurrenceMissingDateStrategies)[number]
export type DayOfWeek = (typeof daysOfWeek)[number]
export type EventRecurrence = z.infer<typeof eventRecurrenceSchema>
export type EventInput = z.infer<typeof eventInputSchema>
export type EventFormInput = z.input<typeof eventFormSchema>
export type EventFormSchema = z.infer<typeof eventFormSchema>
