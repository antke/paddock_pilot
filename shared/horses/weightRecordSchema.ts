import z from 'zod'

export const weightUnits = ['kg', 'lb'] as const

export const weightUnitSchema = z.enum(weightUnits)

export const weightRecordWeightSchema = z
  .number()
  .positive('Weight must be greater than 0.')
  .max(3000, 'Weight cannot be greater than 3000.')

export const bodyConditionScoreSchema = z
  .number()
  .min(1, 'Body condition score must be at least 1.')
  .max(9, 'Body condition score must be 9 or lower.')

export const weightRecordDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date.')

export const weightRecordNotesSchema = z
  .string()
  .trim()
  .max(1000, 'Notes cannot be longer than 1000 characters.')

const optionalText = <TSchema extends z.ZodString>(schema: TSchema) =>
  schema.optional().transform((value) => value || undefined)

const optionalNumber = <TSchema extends z.ZodNumber>(schema: TSchema) =>
  schema.optional().transform((value) => value || undefined)

export const weightRecordAddSchema = z.object({
  horseId: z.string().min(1),
  weight: weightRecordWeightSchema,
  unit: weightUnitSchema,
  measuredAt: z.number(),
  bodyConditionScore: optionalNumber(bodyConditionScoreSchema),
  notes: optionalText(weightRecordNotesSchema),
})

export const weightRecordFormSchema = z.object({
  weight: weightRecordWeightSchema,
  unit: weightUnitSchema,
  measuredDate: weightRecordDateSchema,
  bodyConditionScore: optionalNumber(bodyConditionScoreSchema),
  notes: weightRecordNotesSchema,
})

export type WeightRecordFormSchema = z.infer<typeof weightRecordFormSchema>
export type WeightUnit = (typeof weightUnits)[number]
