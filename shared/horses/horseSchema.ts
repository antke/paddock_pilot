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

export const horseFormSchema = z.object({
  name: horseNameSchema,
  age: horseAgeSchema,
  breed: horseBreedSchema,
})

export const horseInputSchema = z.object({
  name: horseNameSchema,
  age: horseAgeSchema,
  breed: horseBreedSchema.optional().transform((val) => val || undefined),
})

export type HorseFormSchema = z.infer<typeof horseFormSchema>
export type HorseInput = z.infer<typeof horseInputSchema>
