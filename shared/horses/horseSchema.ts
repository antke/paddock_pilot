import z from 'zod'

const defaultMessages = {
  nameMin: 'Name must have minimum 1 character.',
  nameMax: 'Name cannot be longer than 100 characters.',
  ageMin: 'Age cannot be negative.',
  ageMax: "That's probably not true.",
  breedMax: 'Breed name cannot be longer than 100 characters',
  ownerMin: 'Owner name must have minimum 1 character.',
  ownerMax: 'Owner name cannot be longer than 100 characters.',
  itemMin: 'List items cannot be empty.',
  itemMax: 'List items cannot be longer than 100 characters.',
  listMax: 'Use 30 items or fewer.',
  noteMax: 'Please use a shorter note.',
  shortMax: 'Please use 100 characters or fewer.',
  phoneMax: 'Please use 50 characters or fewer.',
  birthInvalid: 'Use a valid birth date.',
  textInvalid: 'Enter text.',
  ageInvalid: 'Enter a valid age.',
  sexInvalid: 'Choose a valid sex.',
  shoeingInvalid: 'Choose a valid shoeing status.',
} as const
export type HorseValidationKey = keyof typeof defaultMessages
export function createHorseSchemas(
  message: (key: HorseValidationKey) => string = (key) => defaultMessages[key],
) {
  const horseNameSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .min(1, message('nameMin'))
    .max(100, message('nameMax'))

  const horseAgeSchema = z
    .number({ error: message('ageInvalid') })
    .min(0, message('ageMin'))
    .max(100, message('ageMax'))

  const horseBreedSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .max(100, message('breedMax'))

  const horseOwnerNameSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .min(1, message('ownerMin'))
    .max(100, message('ownerMax'))

  const horseProfileImageIdSchema = z
    .string({ error: message('textInvalid') })
    .trim()

  const optionalText = <TSchema extends z.ZodString>(schema: TSchema) =>
    schema.optional().transform((val) => val || undefined)

  const optionalStringList = z
    .array(
      z
        .string({ error: message('textInvalid') })
        .trim()
        .min(1, message('itemMin'))
        .max(100, message('itemMax')),
    )
    .max(30, message('listMax'))
    .optional()
    .transform((items) => items?.filter(Boolean) ?? [])

  const horseSexSchema = z.enum(['mare', 'gelding', 'stallion'], {
    error: message('sexInvalid'),
  })
  const horseShoeingStatusSchema = z.enum(
    ['barefoot', 'front_shoes', 'full_set'],
    { error: message('shoeingInvalid') },
  )

  const horseOptionalTextSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .max(1000, message('noteMax'))

  const horseShortTextSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .max(100, message('shortMax'))

  const horsePhoneSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .max(50, message('phoneMax'))

  const horseDateOfBirthSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .regex(/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/, message('birthInvalid'))

  const horseFormSchema = z.object({
    name: horseNameSchema,
    ownerName: horseOwnerNameSchema,
    age: horseAgeSchema,
    breed: horseBreedSchema,
    sex: horseSexSchema.optional(),
    color: horseShortTextSchema,
    height: horseShortTextSchema,
    dateOfBirth: z
      .literal('', { error: message('birthInvalid') })
      .or(horseDateOfBirthSchema),
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

  const horseInputSchema = z.object({
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

  return {
    horseNameSchema,
    horseAgeSchema,
    horseBreedSchema,
    horseOwnerNameSchema,
    horseProfileImageIdSchema,
    horseSexSchema,
    horseShoeingStatusSchema,
    horseOptionalTextSchema,
    horseShortTextSchema,
    horsePhoneSchema,
    horseDateOfBirthSchema,
    horseFormSchema,
    horseInputSchema,
  }
}
export const {
  horseNameSchema,
  horseAgeSchema,
  horseBreedSchema,
  horseOwnerNameSchema,
  horseProfileImageIdSchema,
  horseSexSchema,
  horseShoeingStatusSchema,
  horseOptionalTextSchema,
  horseShortTextSchema,
  horsePhoneSchema,
  horseDateOfBirthSchema,
  horseFormSchema,
  horseInputSchema,
} = createHorseSchemas()

export type HorseFormSchema = z.infer<typeof horseFormSchema>
export type HorseInput = z.infer<typeof horseInputSchema>
