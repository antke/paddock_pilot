import z from 'zod'

export const stableDocumentTypes = [
  'passport',
  'vaccination',
  'insurance',
  'vet_report',
  'farrier',
  'dental',
  'other',
] as const

export const stableDocumentTypeLabels = {
  passport: 'Passport',
  vaccination: 'Vaccination',
  insurance: 'Insurance',
  vet_report: 'Vet report',
  farrier: 'Farrier',
  dental: 'Dental',
  other: 'Other',
} satisfies Record<StableDocumentType, string>

export const stableDocumentTypeSchema = z.enum(stableDocumentTypes)

const documentFileNameSchema = z
  .string()
  .trim()
  .min(1, 'Document name is required.')
  .max(180, 'Document name cannot be longer than 180 characters.')

const documentContentTypeSchema = z
  .string()
  .trim()
  .max(100, 'Content type cannot be longer than 100 characters.')

const documentNotesSchema = z
  .string()
  .trim()
  .max(1000, 'Notes cannot be longer than 1000 characters.')

const optionalText = <TSchema extends z.ZodString>(schema: TSchema) =>
  schema.optional().transform((val) => val || undefined)

const optionalNumber = z
  .union([z.number(), z.nan(), z.undefined()])
  .transform((val) => (val === undefined || Number.isNaN(val) ? undefined : val))

const optionalId = z
  .string()
  .trim()
  .optional()
  .transform((val) => val || undefined)

export const stableDocumentInputSchema = z.object({
  stableId: z.string().min(1),
  horseId: optionalId,
  eventId: optionalId,
  storageId: optionalId,
  type: stableDocumentTypeSchema,
  fileName: documentFileNameSchema,
  contentType: optionalText(documentContentTypeSchema),
  size: optionalNumber.pipe(
    z.number().int().min(0, 'File size cannot be negative.').optional(),
  ),
  notes: optionalText(documentNotesSchema),
})

export const stableDocumentFormSchema = z.object({
  horseId: z.string(),
  type: stableDocumentTypeSchema,
  file: z
    .custom<{
      item: (index: number) => { name: string; type: string; size: number } | null
    }>()
    .optional(),
  fileName: documentFileNameSchema,
  notes: documentNotesSchema,
})

export type StableDocumentFormSchema = z.infer<typeof stableDocumentFormSchema>
export type StableDocumentType = (typeof stableDocumentTypes)[number]
