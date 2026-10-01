import { z } from 'zod'

export const trainingActivities = [
  'flatwork',
  'jumping',
  'groundwork',
  'hacking',
  'lunging',
  'other',
] as const
export const trainingActivityLabels = {
  flatwork: 'Flatwork',
  jumping: 'Jumping',
  groundwork: 'Groundwork',
  hacking: 'Hacking',
  lunging: 'Lunging',
  other: 'Other training',
} satisfies Record<TrainingActivity, string>
export type TrainingActivity = (typeof trainingActivities)[number]
export const trainingFormats = ['regular', 'lesson', 'workshop'] as const
export const trainingFormatLabels = {
  regular: 'Regular session',
  lesson: 'Trainer lesson',
  workshop: 'Workshop / clinic',
}
export const trainingRecordStatuses = [
  'planned',
  'completed',
  'cancelled',
  'skipped',
] as const

const defaultMessages = {
  activitiesMin: 'Choose at least one activity.',
  activitiesMax: 'Choose no more than 6 activities.',
  choiceInvalid: 'Choose a valid option.',
  durationInteger: 'Duration must be a whole number of minutes.',
  durationMin: 'Duration must be at least 1 minute.',
  durationMax: 'Duration cannot exceed 1440 minutes.',
  riderMax: 'Rider or handler name cannot exceed 100 characters.',
  focusMax: 'Use 500 characters or fewer.',
  outcomeMax: 'Use 1000 characters or fewer.',
  textInvalid: 'Enter text.',
  numberInvalid: 'Enter a valid number.',
  listInvalid: 'Choose activities from the list.',
} as const
export type TrainingValidationKey = keyof typeof defaultMessages
export function createTrainingSchemas(
  message: (key: TrainingValidationKey) => string = (key) =>
    defaultMessages[key],
) {
  const trainingDetailsSchema = z.object({
    activities: z
      .array(z.enum(trainingActivities, { error: message('choiceInvalid') }), {
        error: message('listInvalid'),
      })
      .min(1, message('activitiesMin'))
      .max(6, message('activitiesMax')),
    format: z.enum(trainingFormats, { error: message('choiceInvalid') }),
    durationMinutes: z
      .number({ error: message('numberInvalid') })
      .int(message('durationInteger'))
      .min(1, message('durationMin'))
      .max(1440, message('durationMax'))
      .optional(),
    rider: z
      .string({ error: message('textInvalid') })
      .trim()
      .max(100, message('riderMax'))
      .optional(),
    focus: z
      .string({ error: message('textInvalid') })
      .trim()
      .max(500, message('focusMax'))
      .optional(),
    nextFocus: z
      .string({ error: message('textInvalid') })
      .trim()
      .max(500, message('focusMax'))
      .optional(),
  })
  const trainingRecordSchema = trainingDetailsSchema.extend({
    status: z.enum(trainingRecordStatuses, { error: message('choiceInvalid') }),
    outcome: z
      .string({ error: message('textInvalid') })
      .trim()
      .max(1000, message('outcomeMax'))
      .optional(),
  })
  return { trainingDetailsSchema, trainingRecordSchema }
}
export const { trainingDetailsSchema, trainingRecordSchema } =
  createTrainingSchemas()
export type TrainingDetails = z.infer<typeof trainingDetailsSchema>
export const defaultTrainingDetails: TrainingDetails = {
  activities: ['other'],
  format: 'regular',
}
export const trainingStatusLabels = {
  planned: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
  skipped: 'Skipped',
  unconfirmed: 'Needs confirmation',
}
export type TrainingDisplayStatus = keyof typeof trainingStatusLabels

/** Legacy recurring completion applies to a series, not to any individual session. */
export function getTrainingStatus(
  event: {
    status?: 'planned' | 'completed' | 'cancelled'
    recurrence?: unknown
    training?: unknown
  },
  date: string,
  today: string,
  record?: { status: (typeof trainingRecordStatuses)[number] },
): TrainingDisplayStatus {
  const status =
    record?.status ??
    (event.status === 'cancelled'
      ? 'cancelled'
      : !event.recurrence && event.status === 'completed'
        ? 'completed'
        : 'planned')
  return status === 'planned' && date < today ? 'unconfirmed' : status
}

export function isDateKey(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(`${value}T00:00:00Z`)) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value
  )
}
