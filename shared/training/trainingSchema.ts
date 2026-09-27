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
export const trainingDetailsSchema = z.object({
  activities: z
    .array(z.enum(trainingActivities))
    .min(1, 'Choose at least one activity.')
    .max(6),
  format: z.enum(trainingFormats),
  durationMinutes: z.number().int().min(1).max(1440).optional(),
  rider: z.string().trim().max(100).optional(),
  focus: z.string().trim().max(500).optional(),
  nextFocus: z.string().trim().max(500).optional(),
})
export const trainingRecordStatuses = [
  'planned',
  'completed',
  'cancelled',
  'skipped',
] as const
export const trainingRecordSchema = trainingDetailsSchema.extend({
  status: z.enum(trainingRecordStatuses),
  outcome: z.string().trim().max(1000).optional(),
})
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
