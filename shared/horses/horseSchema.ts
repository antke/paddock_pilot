import z from 'zod'

export const horseNameSchema = z
  .string()
  .trim()
  .min(1, 'Name must have minimum 1 character.')
  .max(100, 'Name cannot be longer than 100 characters.')

export const horseAgeSchema = z
  .number()
  .min(0, 'Age cannot be negative.')
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

const optionalText = <TSchema extends z.ZodString>(schema: TSchema) =>
  schema.optional().transform((val) => val || undefined)

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

export const horseSexSchema = z.enum(['mare', 'gelding', 'stallion'])
export const horseShoeingStatusSchema = z.enum([
  'barefoot',
  'front_shoes',
  'full_set',
])

export const horseOptionalTextSchema = z
  .string()
  .trim()
  .max(1000, 'Please use a shorter note.')

export const horseShortTextSchema = z
  .string()
  .trim()
  .max(100, 'Please use 100 characters or fewer.')

export const horsePhoneSchema = z
  .string()
  .trim()
  .max(50, 'Please use 50 characters or fewer.')

export const horseDateOfBirthSchema = z
  .string()
  .trim()
  .regex(/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/, 'Use a valid birth date.')

export const horseFormSchema = z.object({
  name: horseNameSchema,
  ownerName: horseOwnerNameSchema,
  age: horseAgeSchema,
  breed: horseBreedSchema,
  sex: horseSexSchema.optional(),
  color: horseShortTextSchema,
  height: horseShortTextSchema,
  dateOfBirth: z.literal('').or(horseDateOfBirthSchema),
  passportNumber: horseShortTextSchema,
  microchipNumber: horseShortTextSchema,
  insuranceProvider: horseShortTextSchema,
  insurancePolicyNumber: horseShortTextSchema,
  sire: horseShortTextSchema,
  dam: horseShortTextSchema,
  discipline: horseShortTextSchema,
  shoeingStatus: horseShoeingStatusSchema.optional(),
  dewormingNotes: horseOptionalTextSchema,
  allergies: optionalStringList,
  emergencyNotes: horseOptionalTextSchema,
  vetName: horseShortTextSchema,
  vetPhone: horsePhoneSchema,
  farrierName: horseShortTextSchema,
  farrierPhone: horsePhoneSchema,
  nutritionNotes: horseOptionalTextSchema,
  nutritionRecommended: optionalStringList,
  nutritionAvoid: optionalStringList,
  feedingRoutine: horseOptionalTextSchema,
})

export const horseInputSchema = z.object({
  name: horseNameSchema,
  ownerName: horseOwnerNameSchema,
  age: horseAgeSchema,
  breed: horseBreedSchema.optional().transform((val) => val || undefined),
  sex: horseSexSchema.optional(),
  color: optionalText(horseShortTextSchema),
  height: optionalText(horseShortTextSchema),
  dateOfBirth: horseDateOfBirthSchema
    .optional()
    .transform((val) => val || undefined),
  passportNumber: optionalText(horseShortTextSchema),
  microchipNumber: optionalText(horseShortTextSchema),
  insuranceProvider: optionalText(horseShortTextSchema),
  insurancePolicyNumber: optionalText(horseShortTextSchema),
  sire: optionalText(horseShortTextSchema),
  dam: optionalText(horseShortTextSchema),
  discipline: optionalText(horseShortTextSchema),
  shoeingStatus: horseShoeingStatusSchema.optional(),
  dewormingNotes: optionalText(horseOptionalTextSchema),
  allergies: optionalStringList,
  emergencyNotes: optionalText(horseOptionalTextSchema),
  vetName: optionalText(horseShortTextSchema),
  vetPhone: optionalText(horsePhoneSchema),
  farrierName: optionalText(horseShortTextSchema),
  farrierPhone: optionalText(horsePhoneSchema),
  nutritionNotes: optionalText(horseOptionalTextSchema),
  nutritionRecommended: optionalStringList,
  nutritionAvoid: optionalStringList,
  feedingRoutine: optionalText(horseOptionalTextSchema),
  profileImageId: horseProfileImageIdSchema
    .optional()
    .transform((val) => val || undefined),
})

export type HorseFormSchema = z.infer<typeof horseFormSchema>
export type HorseInput = z.infer<typeof horseInputSchema>
