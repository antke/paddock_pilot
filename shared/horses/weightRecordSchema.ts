import z from 'zod'

export const weightUnits = ['kg', 'lb'] as const

const defaultMessages = {
  dateInvalid: 'Use a valid date.',
  weightMin: 'Weight must be greater than 0.',
  weightMax: 'Weight cannot be greater than 3000.',
  bcsMin: 'Body condition score must be at least 1.',
  bcsMax: 'Body condition score must be 9 or lower.',
  notesMax: 'Notes cannot be longer than 1000 characters.',
  textInvalid: 'Enter text.',
  numberInvalid: 'Enter a valid number.',
  choiceInvalid: 'Choose a valid option.',
} as const
export type WeightRecordValidationKey = keyof typeof defaultMessages
export function createWeightRecordSchemas(
  message: (key: WeightRecordValidationKey) => string = (key) =>
    defaultMessages[key],
) {
  const weightUnitSchema = z.enum(weightUnits, {
    error: message('choiceInvalid'),
  })

  const weightRecordWeightSchema = z
    .number({ error: message('numberInvalid') })
    .positive(message('weightMin'))
    .max(3000, message('weightMax'))

  const bodyConditionScoreSchema = z
    .number({ error: message('numberInvalid') })
    .min(1, message('bcsMin'))
    .max(9, message('bcsMax'))

  const weightRecordDateSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, message('dateInvalid'))

  const weightRecordNotesSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .max(1000, message('notesMax'))

  const optionalText = <TSchema extends z.ZodString>(schema: TSchema) =>
    schema.optional().transform((value) => value || undefined)

  const optionalNumber = <TSchema extends z.ZodNumber>(schema: TSchema) =>
    schema.optional().transform((value) => value || undefined)

  const weightRecordAddSchema = z.object({
    horseId: z.string({ error: message('textInvalid') }).min(1),
    weight: weightRecordWeightSchema,
    unit: weightUnitSchema,
    measuredAt: z.number({ error: message('numberInvalid') }),
    bodyConditionScore: optionalNumber(bodyConditionScoreSchema),
    notes: optionalText(weightRecordNotesSchema),
  })

  const weightRecordFormSchema = z.object({
    weight: weightRecordWeightSchema,
    unit: weightUnitSchema,
    measuredDate: weightRecordDateSchema,
    bodyConditionScore: optionalNumber(bodyConditionScoreSchema),
    notes: weightRecordNotesSchema,
  })

  return {
    weightUnitSchema,
    weightRecordWeightSchema,
    bodyConditionScoreSchema,
    weightRecordDateSchema,
    weightRecordNotesSchema,
    weightRecordAddSchema,
    weightRecordFormSchema,
  }
}
export const {
  weightUnitSchema,
  weightRecordWeightSchema,
  bodyConditionScoreSchema,
  weightRecordDateSchema,
  weightRecordNotesSchema,
  weightRecordAddSchema,
  weightRecordFormSchema,
} = createWeightRecordSchemas()

export type WeightRecordFormSchema = z.infer<typeof weightRecordFormSchema>
export type WeightRecordFormInput = z.input<typeof weightRecordFormSchema>
export type WeightUnit = (typeof weightUnits)[number]
