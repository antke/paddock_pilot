import z from 'zod'

const defaultMessages = {
  noteMax: 'Please use a shorter note.',
  dateInvalid: 'Use a valid date.',
  summaryRequired: 'Summary is required.',
  summaryMax: 'Summary cannot be longer than 180 characters.',
  itemMin: 'List items cannot be empty.',
  itemMax: 'List items cannot be longer than 100 characters.',
  listMax: 'Use 30 items or fewer.',
  textInvalid: 'Enter text.',
  numberInvalid: 'Enter a valid number.',
  listInvalid: 'Enter a list.',
} as const
export type NutritionLogValidationKey = keyof typeof defaultMessages
export function createNutritionLogSchemas(
  message: (key: NutritionLogValidationKey) => string = (key) =>
    defaultMessages[key],
) {
  const nutritionLogSummarySchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .min(1, message('summaryRequired'))
    .max(180, message('summaryMax'))

  const nutritionLogLongTextSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .max(1000, message('noteMax'))

  const nutritionLogDateSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, message('dateInvalid'))

  const optionalText = <TSchema extends z.ZodString>(schema: TSchema) =>
    schema.optional().transform((value) => value || undefined)

  const optionalStringList = z
    .array(
      z
        .string({ error: message('textInvalid') })
        .trim()
        .min(1, message('itemMin'))
        .max(100, message('itemMax')),
      { error: message('listInvalid') },
    )
    .max(30, message('listMax'))
    .optional()
    .transform((items) => items?.filter(Boolean) ?? [])

  const nutritionLogAddSchema = z.object({
    horseId: z.string({ error: message('textInvalid') }).min(1),
    changedAt: z.number({ error: message('numberInvalid') }),
    summary: nutritionLogSummarySchema,
    feedingRoutineSnapshot: optionalText(nutritionLogLongTextSchema),
    recommendedSnapshot: optionalStringList,
    avoidSnapshot: optionalStringList,
    notes: optionalText(nutritionLogLongTextSchema),
  })

  const nutritionLogFormSchema = z.object({
    changedDate: nutritionLogDateSchema,
    summary: nutritionLogSummarySchema,
    feedingRoutineSnapshot: nutritionLogLongTextSchema,
    recommendedSnapshot: optionalStringList,
    avoidSnapshot: optionalStringList,
    notes: nutritionLogLongTextSchema,
  })

  return {
    nutritionLogSummarySchema,
    nutritionLogLongTextSchema,
    nutritionLogDateSchema,
    nutritionLogAddSchema,
    nutritionLogFormSchema,
  }
}
export const {
  nutritionLogSummarySchema,
  nutritionLogLongTextSchema,
  nutritionLogDateSchema,
  nutritionLogAddSchema,
  nutritionLogFormSchema,
} = createNutritionLogSchemas()

export type NutritionLogFormSchema = z.infer<typeof nutritionLogFormSchema>
export type NutritionLogFormInput = z.input<typeof nutritionLogFormSchema>
