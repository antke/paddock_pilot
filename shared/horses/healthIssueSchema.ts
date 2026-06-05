import z from 'zod'

export const healthIssueStatuses = ['active', 'resolved'] as const
export const healthIssueSeverities = ['low', 'medium', 'high'] as const

export const healthIssueStatusSchema = z.enum(healthIssueStatuses)
export const healthIssueSeveritySchema = z.enum(healthIssueSeverities)

export const healthIssueTitleSchema = z
  .string()
  .trim()
  .min(1, 'Title must have minimum 1 character.')
  .max(120, 'Title cannot be longer than 120 characters.')

export const healthIssueDescriptionSchema = z
  .string()
  .trim()
  .max(1000, 'Description cannot be longer than 1000 characters.')

const optionalText = <TSchema extends z.ZodString>(schema: TSchema) =>
  schema.optional().transform((value) => value || undefined)

export const healthIssueAddSchema = z.object({
  horseId: z.string().min(1),
  title: healthIssueTitleSchema,
  description: optionalText(healthIssueDescriptionSchema),
  severity: healthIssueSeveritySchema.optional(),
})

export const healthIssueUpdateSchema = z.object({
  title: healthIssueTitleSchema.optional(),
  description: optionalText(healthIssueDescriptionSchema),
  status: healthIssueStatusSchema.optional(),
  severity: healthIssueSeveritySchema.optional(),
})

export const healthIssueFormSchema = z.object({
  title: healthIssueTitleSchema,
  description: healthIssueDescriptionSchema,
  severity: healthIssueSeveritySchema.optional(),
})

export type HealthIssueFormSchema = z.infer<typeof healthIssueFormSchema>
export type HealthIssueSeverity = (typeof healthIssueSeverities)[number]
export type HealthIssueStatus = (typeof healthIssueStatuses)[number]
