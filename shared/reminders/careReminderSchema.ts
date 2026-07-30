import z from 'zod'

export const careReminderCategories = [
  'vet',
  'farrier',
  'dentist',
  'medication',
  'nutrition',
  'weight',
  'deworming',
  'admin',
  'other',
] as const

export const careReminderPriorities = ['low', 'medium', 'high'] as const

export const careReminderStatuses = [
  'pending',
  'completed',
  'dismissed',
] as const

export const careReminderFormTargetTypes = ['stable', 'horses'] as const

export const careReminderCategoryLabels = {
  vet: 'Vet',
  farrier: 'Farrier',
  dentist: 'Dentist',
  medication: 'Medication',
  nutrition: 'Nutrition',
  weight: 'Weight',
  deworming: 'Deworming',
  admin: 'Admin',
  other: 'Other',
} satisfies Record<CareReminderCategory, string>

export const careReminderPriorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
} satisfies Record<CareReminderPriority, string>

export const careReminderStatusLabels = {
  pending: 'Pending',
  completed: 'Completed',
  dismissed: 'Dismissed',
} satisfies Record<CareReminderStatus, string>

export const careReminderCategorySchema = z.enum(careReminderCategories)
export const careReminderPrioritySchema = z.enum(careReminderPriorities)
export const careReminderStatusSchema = z.enum(careReminderStatuses)
export const careReminderFormTargetTypeSchema = z.enum(
  careReminderFormTargetTypes,
)

export const careReminderTitleSchema = z
  .string()
  .trim()
  .min(1, 'Title must have minimum 1 character.')
  .max(120, 'Title cannot be longer than 120 characters.')

export const careReminderDescriptionSchema = z
  .string()
  .trim()
  .max(1000, 'Description cannot be longer than 1000 characters.')

export const careReminderDueDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid due date.')

const optionalText = <TSchema extends z.ZodString>(schema: TSchema) =>
  schema.optional().transform((val) => val || undefined)

const optionalId = z
  .string()
  .trim()
  .optional()
  .transform((val) => val || undefined)

export const careReminderInputSchema = z.object({
  stableId: z.string().min(1),
  horseId: optionalId,
  eventId: optionalId,
  title: careReminderTitleSchema,
  description: optionalText(careReminderDescriptionSchema),
  category: careReminderCategorySchema,
  dueDate: careReminderDueDateSchema,
  priority: careReminderPrioritySchema.optional(),
  status: careReminderStatusSchema.default('pending'),
})

export const careReminderFormSchema = z
  .object({
    targetType: careReminderFormTargetTypeSchema,
    horseIds: z.array(z.string()),
    title: careReminderTitleSchema,
    description: careReminderDescriptionSchema,
    category: careReminderCategorySchema,
    dueDate: careReminderDueDateSchema,
    priority: careReminderPrioritySchema.optional(),
  })
  .superRefine((value, context) => {
    if (value.targetType === 'horses' && value.horseIds.length === 0) {
      context.addIssue({
        code: 'custom',
        path: ['horseIds'],
        message: 'Select at least one horse.',
      })
    }
  })

export type CareReminderCategory = (typeof careReminderCategories)[number]
export type CareReminderPriority = (typeof careReminderPriorities)[number]
export type CareReminderStatus = (typeof careReminderStatuses)[number]
export type CareReminderFormTargetType =
  (typeof careReminderFormTargetTypes)[number]
export type CareReminderFormSchema = z.infer<typeof careReminderFormSchema>
