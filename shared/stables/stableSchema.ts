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

export const stableFormSchema = z.object({
  name: stableNameSchema,
  location: stableLocationSchema,
  description: stableDescriptionSchema,
})

export const stableInputSchema = z.object({
  name: stableNameSchema,
  location: stableLocationSchema,
  description: stableDescriptionSchema
    .optional()
    .transform((value) => value || undefined),
})

export type StableFormSchema = z.infer<typeof stableFormSchema>
export type StableInput = z.infer<typeof stableInputSchema>
