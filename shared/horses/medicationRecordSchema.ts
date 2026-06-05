import z from 'zod'

export const medicationRecordStatuses = ['active', 'completed'] as const

export const medicationRecordStatusSchema = z.enum(medicationRecordStatuses)

export const medicationNameSchema = z
  .string()
  .trim()
  .min(1, 'Medication name is required.')
  .max(100, 'Medication name cannot be longer than 100 characters.')

export const medicationDosageSchema = z
  .string()
  .trim()
  .min(1, 'Dosage is required.')
  .max(100, 'Dosage cannot be longer than 100 characters.')

export const medicationShortTextSchema = z
  .string()
  .trim()
  .max(100, 'Please use 100 characters or fewer.')

export const medicationLongTextSchema = z
  .string()
  .trim()
  .max(1000, 'Please use a shorter note.')

export const medicationDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date.')

const optionalText = <TSchema extends z.ZodString>(schema: TSchema) =>
  schema.optional().transform((value) => value || undefined)

const optionalDate = z
  .string()
  .trim()
  .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: 'Use a valid date.',
  })
  .optional()
  .transform((value) => value || undefined)

export const medicationRecordAddSchema = z.object({
  horseId: z.string().min(1),
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

export const medicationRecordFormSchema = z.object({
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

export type MedicationRecordFormSchema = z.infer<typeof medicationRecordFormSchema>
export type MedicationRecordStatus = (typeof medicationRecordStatuses)[number]
