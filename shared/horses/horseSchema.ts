import z from 'zod'

export const horseNameSchema = z
  .string()
  .trim()
  .min(1, 'Name must have minimum 1 character.')
  .max(100, 'Name cannot be longer than 100 characters.')

export const horseAgeSchema = z
  .number()
  .min(1, 'Minimum age is 1.')
  .max(100, "That's probably not true.")

export const horseBreedSchema = z
  .string()
  .trim()
  .max(100, 'Breed name cannot be longer than 100 characters')

export const horseOwnerNameSchema = z
  .string()
  .trim()
  .min(1, 'Owner name must have minimum 1 character.')
  .max(100, 'Owner name cannot be longer than 100 characters.')

export const horseProfileImageIdSchema = z.string().trim()

export const horseFormSchema = z.object({
  name: horseNameSchema,
  ownerName: horseOwnerNameSchema,
  age: horseAgeSchema,
  breed: horseBreedSchema,
})

export const horseInputSchema = z.object({
  name: horseNameSchema,
  ownerName: horseOwnerNameSchema,
  age: horseAgeSchema,
  breed: horseBreedSchema.optional().transform((val) => val || undefined),
  profileImageId: horseProfileImageIdSchema
    .optional()
    .transform((val) => val || undefined),
})

export type HorseFormSchema = z.infer<typeof horseFormSchema>
export type HorseInput = z.infer<typeof horseInputSchema>
