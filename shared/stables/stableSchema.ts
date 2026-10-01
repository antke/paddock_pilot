import z from 'zod'

const stableNamePattern = /^[\p{L}\p{M}\p{N} .,'’#&/\p{Pd}]+$/u
const stableLocationPattern = /^[\p{L}\p{M}\p{N} .,'’#&/\p{Pd}]+$/u

const defaultMessages = {
  nameMin: 'Name must have at least 3 characters.',
  nameMax: 'Name cannot be longer than 50 characters.',
  nameCharacters: 'Name contains unsupported characters.',
  locationMin: 'Location must have at least 3 characters.',
  locationMax: 'Location cannot be longer than 50 characters.',
  locationCharacters: 'Location contains unsupported characters.',
  descriptionMax: 'Please use a shorter description',
  shortTextMax: 'Please use a shorter value.',
  phoneMax: 'Please use a shorter phone number.',
  noteMax: 'Please use a shorter note.',
  emergencyContactMax: 'Please use a shorter emergency contact.',
} as const
export type StableValidationKey = keyof typeof defaultMessages
export function createStableSchemas(
  message: (key: StableValidationKey) => string = (key) => defaultMessages[key],
) {
  const stableNameSchema = z
    .string()
    .trim()
    .min(3, message('nameMin'))
    .max(50, message('nameMax'))
    .regex(stableNamePattern, message('nameCharacters'))

  const stableLocationSchema = z
    .string()
    .trim()
    .min(3, message('locationMin'))
    .max(50, message('locationMax'))
    .regex(stableLocationPattern, message('locationCharacters'))

  const stableDescriptionSchema = z
    .string()
    .trim()
    .max(256, message('descriptionMax'))

  const stableShortTextSchema = z
    .string()
    .trim()
    .max(100, message('shortTextMax'))

  const stablePhoneSchema = z.string().trim().max(50, message('phoneMax'))

  const stableLongTextSchema = z.string().trim().max(1000, message('noteMax'))

  const optionalText = <TSchema extends z.ZodString>(schema: TSchema) =>
    schema.optional().transform((value) => value || undefined)

  const stableFormSchema = z.object({
    name: stableNameSchema,
    location: stableLocationSchema,
    description: stableDescriptionSchema,
    contactName: stableShortTextSchema,
    contactPhone: stablePhoneSchema,
    emergencyPhone: stablePhoneSchema,
    addressLine1: stableShortTextSchema,
    addressLine2: stableShortTextSchema,
    postcode: stableShortTextSchema,
    country: stableShortTextSchema,
    yardRules: stableLongTextSchema,
    openingHours: stableLongTextSchema,
  })

  const stableInputSchema = z.object({
    name: stableNameSchema,
    location: stableLocationSchema,
    description: optionalText(stableDescriptionSchema),
    contactName: optionalText(stableShortTextSchema),
    contactPhone: optionalText(stablePhoneSchema),
    emergencyPhone: optionalText(stablePhoneSchema),
    addressLine1: optionalText(stableShortTextSchema),
    addressLine2: optionalText(stableShortTextSchema),
    postcode: optionalText(stableShortTextSchema),
    country: optionalText(stableShortTextSchema),
    yardRules: optionalText(stableLongTextSchema),
    openingHours: optionalText(stableLongTextSchema),
  })

  const stableOperationsShape = {
    contactName: true,
    contactPhone: true,
    emergencyPhone: true,
    openingHours: true,
    yardRules: true,
  } as const

  const stableOperationsFormSchema = stableFormSchema.pick(
    stableOperationsShape,
  )

  const stableOperationsInputSchema = stableInputSchema.pick(
    stableOperationsShape,
  )

  return {
    stableNameSchema,
    stableLocationSchema,
    stableDescriptionSchema,
    stableFormSchema,
    stableInputSchema,
    stableOperationsFormSchema,
    stableOperationsInputSchema,
  }
}
export const {
  stableNameSchema,
  stableLocationSchema,
  stableDescriptionSchema,
  stableFormSchema,
  stableInputSchema,
  stableOperationsFormSchema,
  stableOperationsInputSchema,
} = createStableSchemas()

export type StableFormSchema = z.infer<typeof stableFormSchema>
export type StableInput = z.infer<typeof stableInputSchema>
export type StableOperationsFormSchema = z.infer<
  typeof stableOperationsFormSchema
>
