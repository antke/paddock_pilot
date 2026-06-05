import z from 'zod'

export const nutritionLogSummarySchema = z
  .string()
  .trim()
  .min(1, 'Summary is required.')
  .max(180, 'Summary cannot be longer than 180 characters.')

export const nutritionLogLongTextSchema = z
  .string()
  .trim()
  .max(1000, 'Please use a shorter note.')

export const nutritionLogDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date.')

const optionalText = <TSchema extends z.ZodString>(schema: TSchema) =>
  schema.optional().transform((value) => value || undefined)

const optionalStringList = z
  .array(
    z
      .string()
      .trim()
      .min(1, 'List items cannot be empty.')
      .max(100, 'List items cannot be longer than 100 characters.'),
  )
  .max(30, 'Use 30 items or fewer.')
  .optional()
  .transform((items) => items?.filter(Boolean) ?? [])

export const nutritionLogAddSchema = z.object({
  horseId: z.string().min(1),
  changedAt: z.number(),
  summary: nutritionLogSummarySchema,
  feedingRoutineSnapshot: optionalText(nutritionLogLongTextSchema),
  recommendedSnapshot: optionalStringList,
  avoidSnapshot: optionalStringList,
  notes: optionalText(nutritionLogLongTextSchema),
})

export const nutritionLogFormSchema = z.object({
  changedDate: nutritionLogDateSchema,
  summary: nutritionLogSummarySchema,
  feedingRoutineSnapshot: nutritionLogLongTextSchema,
  recommendedSnapshot: optionalStringList,
  avoidSnapshot: optionalStringList,
  notes: nutritionLogLongTextSchema,
})

export type NutritionLogFormSchema = z.infer<typeof nutritionLogFormSchema>
