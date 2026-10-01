import z from 'zod'

export const healthIssueStatuses = ['active', 'resolved'] as const
export const healthIssueSeverities = ['low', 'medium', 'high'] as const

const defaultMessages = {
  titleMin: 'Title must have minimum 1 character.',
  titleMax: 'Title cannot be longer than 120 characters.',
  descriptionMax: 'Description cannot be longer than 1000 characters.',
  textInvalid: 'Enter text.',
  choiceInvalid: 'Choose a valid option.',
} as const
export type HealthIssueValidationKey = keyof typeof defaultMessages
export function createHealthIssueSchemas(
  message: (key: HealthIssueValidationKey) => string = (key) =>
    defaultMessages[key],
) {
  const healthIssueStatusSchema = z.enum(healthIssueStatuses, {
    error: message('choiceInvalid'),
  })
  const healthIssueSeveritySchema = z.enum(healthIssueSeverities, {
    error: message('choiceInvalid'),
  })

  const healthIssueTitleSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .min(1, message('titleMin'))
    .max(120, message('titleMax'))

  const healthIssueDescriptionSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .max(1000, message('descriptionMax'))

  const optionalText = <TSchema extends z.ZodString>(schema: TSchema) =>
    schema.optional().transform((value) => value || undefined)

  const healthIssueAddSchema = z.object({
    horseId: z.string({ error: message('textInvalid') }).min(1),
    title: healthIssueTitleSchema,
    description: optionalText(healthIssueDescriptionSchema),
    severity: healthIssueSeveritySchema.optional(),
  })

  const healthIssueUpdateSchema = z.object({
    title: healthIssueTitleSchema.optional(),
    description: optionalText(healthIssueDescriptionSchema),
    status: healthIssueStatusSchema.optional(),
    severity: healthIssueSeveritySchema.optional(),
  })

  const healthIssueFormSchema = z.object({
    title: healthIssueTitleSchema,
    description: healthIssueDescriptionSchema,
    severity: healthIssueSeveritySchema.optional(),
  })

  return {
    healthIssueStatusSchema,
    healthIssueSeveritySchema,
    healthIssueTitleSchema,
    healthIssueDescriptionSchema,
    healthIssueAddSchema,
    healthIssueUpdateSchema,
    healthIssueFormSchema,
  }
}
export const {
  healthIssueStatusSchema,
  healthIssueSeveritySchema,
  healthIssueTitleSchema,
  healthIssueDescriptionSchema,
  healthIssueAddSchema,
  healthIssueUpdateSchema,
  healthIssueFormSchema,
} = createHealthIssueSchemas()

export type HealthIssueFormSchema = z.infer<typeof healthIssueFormSchema>
export type HealthIssueSeverity = (typeof healthIssueSeverities)[number]
export type HealthIssueStatus = (typeof healthIssueStatuses)[number]
