import z from 'zod'

const stableNamePattern = /^[a-zA-Z0-9 .,'#&/-]+$/
const stableLocationPattern = /^[a-zA-Z0-9 .,'#&/-]+$/

export const stableNameSchema = z
  .string()
  .trim()
  .min(3, 'Name must have at least 3 characters.')
  .max(50, 'Name cannot be longer than 50 characters.')
  .regex(stableNamePattern, 'Name contains unsupported characters.')

export const stableLocationSchema = z
  .string()
  .trim()
  .min(3, 'Address must have at least 3 characters.')
  .max(50, 'Address cannot be longer than 50 characters.')
  .regex(stableLocationPattern, 'Address contains unsupported characters.')

export const stableDescriptionSchema = z
  .string()
  .trim()
  .max(256, 'Please use a shorter description')

const stableShortTextSchema = z
  .string()
  .trim()
  .max(100, 'Please use a shorter value.')

const stablePhoneSchema = z
  .string()
  .trim()
  .max(50, 'Please use a shorter phone number.')

const stableLongTextSchema = z
  .string()
  .trim()
  .max(1000, 'Please use a shorter note.')

const optionalText = <TSchema extends z.ZodString>(schema: TSchema) =>
  schema.optional().transform((value) => value || undefined)

export const stableFormSchema = z.object({
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

export const stableInputSchema = z.object({
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

export type StableFormSchema = z.infer<typeof stableFormSchema>
export type StableInput = z.infer<typeof stableInputSchema>
