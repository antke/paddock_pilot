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

const defaultMessages = {
  titleRequired: 'Enter a reminder title.',
  titleMax: 'Keep the title to 120 characters or fewer.',
  notesMax: 'Keep notes to 1,000 characters or fewer.',
  dueDate: 'Use a valid due date.',
  horseRequired: 'Select at least one horse.',
  textInvalid: 'Enter text.',
  choiceInvalid: 'Choose a valid option.',
  listInvalid: 'Choose horses from the list.',
} as const
export type CareReminderValidationKey = keyof typeof defaultMessages
export function createCareReminderSchemas(
  message: (key: CareReminderValidationKey) => string = (key) =>
    defaultMessages[key],
) {
  const careReminderCategorySchema = z.enum(careReminderCategories, {
    error: message('choiceInvalid'),
  })
  const careReminderPrioritySchema = z.enum(careReminderPriorities, {
    error: message('choiceInvalid'),
  })
  const careReminderStatusSchema = z.enum(careReminderStatuses, {
    error: message('choiceInvalid'),
  })
  const careReminderFormTargetTypeSchema = z.enum(careReminderFormTargetTypes, {
    error: message('choiceInvalid'),
  })

  const careReminderTitleSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .min(1, message('titleRequired'))
    .max(120, message('titleMax'))

  const careReminderDescriptionSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .max(1000, message('notesMax'))

  const careReminderDueDateSchema = z
    .string({ error: message('textInvalid') })
    .regex(/^\d{4}-\d{2}-\d{2}$/, message('dueDate'))

  const optionalText = <TSchema extends z.ZodString>(schema: TSchema) =>
    schema.optional().transform((val) => val || undefined)

  const optionalId = z
    .string({ error: message('textInvalid') })
    .trim()
    .optional()
    .transform((val) => val || undefined)

  const careReminderInputSchema = z.object({
    stableId: z.string({ error: message('textInvalid') }).min(1),
    horseId: optionalId,
    eventId: optionalId,
    title: careReminderTitleSchema,
    description: optionalText(careReminderDescriptionSchema),
    category: careReminderCategorySchema,
    dueDate: careReminderDueDateSchema,
    priority: careReminderPrioritySchema.optional(),
    status: careReminderStatusSchema.default('pending'),
  })

  const careReminderFormSchema = z
    .object({
      targetType: careReminderFormTargetTypeSchema,
      horseIds: z.array(z.string({ error: message('textInvalid') }), {
        error: message('listInvalid'),
      }),
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
          message: message('horseRequired'),
        })
      }
    })

  return {
    careReminderCategorySchema,
    careReminderPrioritySchema,
    careReminderStatusSchema,
    careReminderFormTargetTypeSchema,
    careReminderTitleSchema,
    careReminderDescriptionSchema,
    careReminderDueDateSchema,
    careReminderInputSchema,
    careReminderFormSchema,
  }
}
export const {
  careReminderCategorySchema,
  careReminderPrioritySchema,
  careReminderStatusSchema,
  careReminderFormTargetTypeSchema,
  careReminderTitleSchema,
  careReminderDescriptionSchema,
  careReminderDueDateSchema,
  careReminderInputSchema,
  careReminderFormSchema,
} = createCareReminderSchemas()

export type CareReminderCategory = (typeof careReminderCategories)[number]
export type CareReminderPriority = (typeof careReminderPriorities)[number]
export type CareReminderStatus = (typeof careReminderStatuses)[number]
export type CareReminderFormTargetType =
  (typeof careReminderFormTargetTypes)[number]
export type CareReminderFormSchema = z.infer<typeof careReminderFormSchema>
