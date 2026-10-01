import z from 'zod'

export const medicationRecordStatuses = ['active', 'completed'] as const

const defaultMessages = {
  medicationRequired: 'Medication name is required.',
  medicationMax: 'Medication name cannot be longer than 100 characters.',
  dosageRequired: 'Dosage is required.',
  dosageMax: 'Dosage cannot be longer than 100 characters.',
  shortMax: 'Please use 100 characters or fewer.',
  noteMax: 'Please use a shorter note.',
  dateInvalid: 'Use a valid date.',
  dateOrder: 'End date cannot be before the start date.',
  textInvalid: 'Enter text.',
  choiceInvalid: 'Choose a valid option.',
} as const
export type MedicationRecordValidationKey = keyof typeof defaultMessages
export function createMedicationRecordSchemas(
  message: (key: MedicationRecordValidationKey) => string = (key) =>
    defaultMessages[key],
) {
  const medicationRecordStatusSchema = z.enum(medicationRecordStatuses, {
    error: message('choiceInvalid'),
  })

  const medicationNameSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .min(1, message('medicationRequired'))
    .max(100, message('medicationMax'))

  const medicationDosageSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .min(1, message('dosageRequired'))
    .max(100, message('dosageMax'))

  const medicationShortTextSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .max(100, message('shortMax'))

  const medicationLongTextSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .max(1000, message('noteMax'))

  const medicationDateSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, message('dateInvalid'))

  const optionalText = <TSchema extends z.ZodString>(schema: TSchema) =>
    schema.optional().transform((value) => value || undefined)

  const optionalDate = z
    .string({ error: message('textInvalid') })
    .trim()
    .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      message: message('dateInvalid'),
    })
    .optional()
    .transform((value) => value || undefined)

  const hasValidDateOrder = (value: { startDate: string; endDate?: string }) =>
    !value.endDate || value.endDate >= value.startDate
  const dateOrderError = {
    message: message('dateOrder'),
    path: ['endDate'],
  }

  const medicationRecordAddSchema = z
    .object({
      horseId: z.string({ error: message('textInvalid') }).min(1),
      medicationName: medicationNameSchema,
      dosage: medicationDosageSchema,
      frequency: optionalText(medicationShortTextSchema),
      startDate: medicationDateSchema,
      endDate: optionalDate,
      prescribedBy: optionalText(medicationShortTextSchema),
      reason: optionalText(medicationLongTextSchema),
      notes: optionalText(medicationLongTextSchema),
      status: medicationRecordStatusSchema,
    })
    .refine(hasValidDateOrder, dateOrderError)

  const medicationRecordFormSchema = z
    .object({
      medicationName: medicationNameSchema,
      dosage: medicationDosageSchema,
      frequency: medicationShortTextSchema,
      startDate: medicationDateSchema,
      endDate: optionalDate,
      prescribedBy: medicationShortTextSchema,
      reason: medicationLongTextSchema,
      notes: medicationLongTextSchema,
      status: medicationRecordStatusSchema,
    })
    .refine(hasValidDateOrder, dateOrderError)

  return {
    medicationRecordStatusSchema,
    medicationNameSchema,
    medicationDosageSchema,
    medicationShortTextSchema,
    medicationLongTextSchema,
    medicationDateSchema,
    medicationRecordAddSchema,
    medicationRecordFormSchema,
  }
}
export const {
  medicationRecordStatusSchema,
  medicationNameSchema,
  medicationDosageSchema,
  medicationShortTextSchema,
  medicationLongTextSchema,
  medicationDateSchema,
  medicationRecordAddSchema,
  medicationRecordFormSchema,
} = createMedicationRecordSchemas()

export type MedicationRecordFormSchema = z.infer<
  typeof medicationRecordFormSchema
>
export type MedicationRecordFormInput = z.input<
  typeof medicationRecordFormSchema
>
export type MedicationRecordStatus = (typeof medicationRecordStatuses)[number]
