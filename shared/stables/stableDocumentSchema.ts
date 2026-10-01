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

const defaultMessages = {
  nameRequired: 'Document name is required.',
  nameMax: 'Document name cannot be longer than 180 characters.',
  contentMax: 'Content type cannot be longer than 100 characters.',
  notesMax: 'Notes cannot be longer than 1000 characters.',
  sizeMin: 'File size cannot be negative.',
  fileRequired: 'Choose a file to upload.',
  textInvalid: 'Enter text.',
  typeInvalid: 'Choose a document type.',
} as const
export type DocumentValidationKey = keyof typeof defaultMessages
export function createStableDocumentSchemas(
  message: (key: DocumentValidationKey) => string = (key) =>
    defaultMessages[key],
) {
  const stableDocumentTypeSchema = z.enum(stableDocumentTypes, {
    error: message('typeInvalid'),
  })

  const documentFileNameSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .min(1, message('nameRequired'))
    .max(180, message('nameMax'))

  const documentContentTypeSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .max(100, message('contentMax'))

  const documentNotesSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .max(1000, message('notesMax'))

  const optionalText = <TSchema extends z.ZodString>(schema: TSchema) =>
    schema.optional().transform((val) => val || undefined)

  const optionalNumber = z
    .union([z.number(), z.nan(), z.undefined()])
    .transform((val) =>
      val === undefined || Number.isNaN(val) ? undefined : val,
    )

  const optionalId = z
    .string({ error: message('textInvalid') })
    .trim()
    .optional()
    .transform((val) => val || undefined)

  const stableDocumentInputSchema = z.object({
    stableId: z.string({ error: message('textInvalid') }).min(1),
    horseId: optionalId,
    eventId: optionalId,
    storageId: optionalId,
    type: stableDocumentTypeSchema,
    fileName: documentFileNameSchema,
    contentType: optionalText(documentContentTypeSchema),
    size: optionalNumber.pipe(
      z.number().int().min(0, message('sizeMin')).optional(),
    ),
    notes: optionalText(documentNotesSchema),
  })

  const stableDocumentFormSchema = z.object({
    horseId: z.string({ error: message('textInvalid') }),
    type: stableDocumentTypeSchema,
    file: z
      .custom<FileList>()
      .refine((files) => files?.length > 0, message('fileRequired')),
    fileName: documentFileNameSchema,
    notes: documentNotesSchema,
  })

  return {
    stableDocumentTypeSchema,
    stableDocumentInputSchema,
    stableDocumentFormSchema,
  }
}
export const {
  stableDocumentTypeSchema,
  stableDocumentInputSchema,
  stableDocumentFormSchema,
} = createStableDocumentSchemas()

export type StableDocumentFormSchema = z.infer<typeof stableDocumentFormSchema>
export type StableDocumentType = (typeof stableDocumentTypes)[number]
export type StableDocumentFileState =
  'available' | 'unavailable' | 'metadata-only'
