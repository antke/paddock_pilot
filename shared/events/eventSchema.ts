import z from 'zod'

export const eventTypes = [
  'vet',
  'training',
  'dentist',
  'hoof_trimming',
  'massage',
  'other',
] as const

export const recurrenceFrequencies = ['weekly', 'monthly'] as const

export const daysOfWeek = [0, 1, 2, 3, 4, 5, 6] as const

export const eventTypeLabels = {
  vet: 'Vet',
  training: 'Training',
  dentist: 'Dentist',
  hoof_trimming: 'Hoof trimming',
  massage: 'Massage',
  other: 'Other',
} satisfies Record<EventType, string>

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
])

export const eventRecurrenceSchema = z
  .object({
    frequency: z.enum(recurrenceFrequencies),
    interval: z
      .number()
      .int('Interval must be a whole number.')
      .min(1, 'Interval must be at least 1.'),
    daysOfWeek: z.array(eventDayOfWeekSchema).optional(),
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
  })

const optionalText = <TSchema extends z.ZodString>(schema: TSchema) =>
  schema.optional().transform((val) => val || undefined)

export const eventInputSchema = z.object({
  stableId: z.string().min(1),
  horseIds: eventHorseIdsSchema,
  date: eventDateSchema,
  time: eventTimeSchema,
  type: eventTypeSchema,
  title: eventTitleSchema,
  description: optionalText(eventDescriptionSchema),
  location: optionalText(eventLocationSchema),
  recurrence: eventRecurrenceSchema.optional(),
})

export const eventFormSchema = eventInputSchema
  .extend({
    recurring: z.boolean(),
  })
  .superRefine((event, ctx) => {
    if (event.recurring && !event.recurrence) {
      ctx.addIssue({
        code: 'custom',
        message: 'Choose recurrence details.',
        path: ['recurrence'],
      })
    }
  })

export type EventType = (typeof eventTypes)[number]
export type RecurrenceFrequency = (typeof recurrenceFrequencies)[number]
export type DayOfWeek = (typeof daysOfWeek)[number]
export type EventInput = z.infer<typeof eventInputSchema>
export type EventFormSchema = z.infer<typeof eventFormSchema>
