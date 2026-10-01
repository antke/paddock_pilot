import z from 'zod'
import { createTrainingSchemas } from '../training/trainingSchema'
import type { TrainingValidationKey } from '../training/trainingSchema'

export const eventTypes = [
  'competition',
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
  competition: 'Competition',
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

const defaultMessages = {
  dateInvalid: 'Use a valid date.',
  timeInvalid: 'Use a valid time.',
  titleMin: 'Title must have minimum 1 character.',
  titleMax: 'Title cannot be longer than 120 characters.',
  descriptionMax: 'Description cannot be longer than 1000 characters.',
  locationMax: 'Location cannot be longer than 200 characters.',
  providerMax: 'Provider name cannot be longer than 100 characters.',
  phoneMax: 'Provider phone cannot be longer than 50 characters.',
  completionMax: 'Completion notes cannot be longer than 1000 characters.',
  costMin: 'Cost cannot be negative.',
  costMax: 'Cost is too high.',
  horseRequired: 'Select at least one horse.',
  horseUnique: 'Select each horse only once.',
  occurrenceInteger: 'Occurrence count must be a whole number.',
  occurrenceMin: 'Occurrence count must be at least 1.',
  intervalInteger: 'Interval must be a whole number.',
  intervalMin: 'Interval must be at least 1.',
  dayInteger: 'Day of month must be a whole number.',
  dayMin: 'Day of month must be at least 1.',
  dayMax: 'Day of month cannot be greater than 31.',
  weeklyDays: 'Select at least one day for weekly recurrence.',
  monthlyMode: 'Choose how this monthly event repeats.',
  monthlyDay: 'Choose a day of the month.',
  missingDate: 'Choose what happens when a month does not have this date.',
  monthWeek: 'Choose which week of the month.',
  weekday: 'Choose a weekday.',
  dateOrder: 'End date cannot be before the start date.',
  recurrence: 'Choose recurrence details.',
  textInvalid: 'Enter text.',
  numberInvalid: 'Enter a valid number.',
  choiceInvalid: 'Choose a valid option.',
  listInvalid: 'Choose items from the list.',
  booleanInvalid: 'Choose whether the event repeats.',
} as const
export type EventValidationKey = keyof typeof defaultMessages
export function createEventSchemas(
  message: (key: EventValidationKey) => string = (key) => defaultMessages[key],
  trainingMessage?: (key: TrainingValidationKey) => string,
) {
  const { trainingDetailsSchema } = createTrainingSchemas(trainingMessage)
  const eventDateSchema = z
    .string({ error: message('textInvalid') })
    .regex(/^\d{4}-\d{2}-\d{2}$/, message('dateInvalid'))

  const eventOptionalDateSchema = z
    .union([eventDateSchema, z.literal('')], { error: message('dateInvalid') })
    .optional()
    .transform((val) => val || undefined)

  const eventTimeSchema = z
    .string({ error: message('textInvalid') })
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, message('timeInvalid'))

  const eventTypeSchema = z.enum(eventTypes, {
    error: message('choiceInvalid'),
  })

  const eventTitleSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .min(1, message('titleMin'))
    .max(120, message('titleMax'))

  const eventDescriptionSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .max(1000, message('descriptionMax'))

  const eventLocationSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .max(200, message('locationMax'))

  const eventProviderNameSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .max(100, message('providerMax'))

  const eventProviderPhoneSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .max(50, message('phoneMax'))

  const eventNotesAfterCompletionSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .max(1000, message('completionMax'))

  const eventCostSchema = z
    .union(
      [z.number({ error: message('numberInvalid') }), z.nan(), z.undefined()],
      { error: message('numberInvalid') },
    )
    .transform((val) =>
      val === undefined || Number.isNaN(val) ? undefined : val,
    )
    .pipe(
      z
        .number({ error: message('numberInvalid') })
        .min(0, message('costMin'))
        .max(100000, message('costMax'))
        .optional(),
    )

  const eventStatusSchema = z.enum(eventStatuses, {
    error: message('choiceInvalid'),
  })

  const eventHorseIdsSchema = z
    .array(z.string({ error: message('textInvalid') }).min(1), {
      error: message('listInvalid'),
    })
    .min(1, message('horseRequired'))
    .refine(
      (horseIds) => new Set(horseIds).size === horseIds.length,
      message('horseUnique'),
    )

  const eventDayOfWeekSchema = z.union(
    [
      z.literal(0),
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
      z.literal(6),
    ],
    { error: message('choiceInvalid') },
  )

  const recurrenceEndSchema = z.discriminatedUnion(
    'type',
    [
      z.object({ type: z.literal('never') }),
      z.object({ type: z.literal('on_date'), date: eventDateSchema }),
      z.object({
        type: z.literal('after_occurrences'),
        count: z
          .number({ error: message('numberInvalid') })
          .int(message('occurrenceInteger'))
          .min(1, message('occurrenceMin')),
      }),
    ],
    { error: message('choiceInvalid') },
  )

  const recurrenceMonthlyModeSchema = z.enum(recurrenceMonthlyModes, {
    error: message('choiceInvalid'),
  })

  const recurrenceOrdinalSchema = z.union(
    [z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal('last')],
    { error: message('choiceInvalid') },
  )

  const recurrenceMissingDateStrategySchema = z.enum(
    recurrenceMissingDateStrategies,
    { error: message('choiceInvalid') },
  )

  const eventRecurrenceSchema = z
    .object({
      frequency: z.enum(recurrenceFrequencies, {
        error: message('choiceInvalid'),
      }),
      interval: z
        .number({ error: message('numberInvalid') })
        .int(message('intervalInteger'))
        .min(1, message('intervalMin')),
      daysOfWeek: z
        .array(eventDayOfWeekSchema, { error: message('listInvalid') })
        .optional(),
      monthlyMode: recurrenceMonthlyModeSchema.optional(),
      dayOfMonth: z
        .number({ error: message('numberInvalid') })
        .int(message('dayInteger'))
        .min(1, message('dayMin'))
        .max(31, message('dayMax'))
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
          message: message('weeklyDays'),
          path: ['daysOfWeek'],
        })
      }

      if (recurrence.frequency !== 'monthly') return

      if (!recurrence.monthlyMode) {
        ctx.addIssue({
          code: 'custom',
          message: message('monthlyMode'),
          path: ['monthlyMode'],
        })
        return
      }

      if (recurrence.monthlyMode === 'dayOfMonth') {
        if (!recurrence.dayOfMonth) {
          ctx.addIssue({
            code: 'custom',
            message: message('monthlyDay'),
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
            message: message('missingDate'),
            path: ['missingDateStrategy'],
          })
        }
      }

      if (recurrence.monthlyMode === 'weekdayPattern') {
        if (!recurrence.ordinal) {
          ctx.addIssue({
            code: 'custom',
            message: message('monthWeek'),
            path: ['ordinal'],
          })
        }

        if (recurrence.weekday === undefined) {
          ctx.addIssue({
            code: 'custom',
            message: message('weekday'),
            path: ['weekday'],
          })
        }
      }
    })

  const optionalText = <TSchema extends z.ZodString>(schema: TSchema) =>
    schema.optional().transform((val) => val || undefined)

  const eventInputFieldsSchema = z.object({
    stableId: z.string({ error: message('textInvalid') }).min(1),
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
    training: trainingDetailsSchema.optional(),
  })

  function validateEventDateRange(
    event: z.infer<typeof eventInputFieldsSchema>,
    ctx: z.RefinementCtx,
  ) {
    if (event.endDate && event.endDate < event.date) {
      ctx.addIssue({
        code: 'custom',
        message: message('dateOrder'),
        path: ['endDate'],
      })
    }
  }

  const eventInputSchema = eventInputFieldsSchema.superRefine(
    validateEventDateRange,
  )

  const eventFormSchema = eventInputFieldsSchema
    .extend({
      recurring: z.boolean({ error: message('booleanInvalid') }),
    })
    .superRefine((event, ctx) => {
      validateEventDateRange(event, ctx)

      if (event.recurring && !event.recurrence) {
        ctx.addIssue({
          code: 'custom',
          message: message('recurrence'),
          path: ['recurrence'],
        })
      }
    })

  return {
    eventDateSchema,
    eventOptionalDateSchema,
    eventTimeSchema,
    eventTypeSchema,
    eventTitleSchema,
    eventDescriptionSchema,
    eventLocationSchema,
    eventProviderNameSchema,
    eventProviderPhoneSchema,
    eventNotesAfterCompletionSchema,
    eventCostSchema,
    eventStatusSchema,
    eventHorseIdsSchema,
    eventDayOfWeekSchema,
    recurrenceEndSchema,
    recurrenceMonthlyModeSchema,
    recurrenceOrdinalSchema,
    recurrenceMissingDateStrategySchema,
    eventRecurrenceSchema,
    eventInputSchema,
    eventFormSchema,
  }
}
export const {
  eventDateSchema,
  eventOptionalDateSchema,
  eventTimeSchema,
  eventTypeSchema,
  eventTitleSchema,
  eventDescriptionSchema,
  eventLocationSchema,
  eventProviderNameSchema,
  eventProviderPhoneSchema,
  eventNotesAfterCompletionSchema,
  eventCostSchema,
  eventStatusSchema,
  eventHorseIdsSchema,
  eventDayOfWeekSchema,
  recurrenceEndSchema,
  recurrenceMonthlyModeSchema,
  recurrenceOrdinalSchema,
  recurrenceMissingDateStrategySchema,
  eventRecurrenceSchema,
  eventInputSchema,
  eventFormSchema,
} = createEventSchemas()
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
