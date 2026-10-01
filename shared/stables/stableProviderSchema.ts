import { z } from 'zod'

export const stableProviderTypes = [
  'trainer',
  'vet',
  'farrier',
  'dentist',
  'physio',
  'saddler',
  'other',
] as const

export const stableProviderTypeLabels = {
  trainer: 'Trainer',
  vet: 'Vet',
  farrier: 'Farrier',
  dentist: 'Dentist',
  physio: 'Physio',
  saddler: 'Saddler',
  other: 'Other',
} satisfies Record<(typeof stableProviderTypes)[number], string>

const optionalText = (schema: z.ZodString) =>
  z
    .union([schema, z.literal(''), z.undefined()])
    .transform((value) => (value ? value : undefined))

const defaultMessages = {
  nameRequired: 'Provider name is required.',
  nameMax: 'Name cannot be longer than 100 characters.',
  shortTextMax: 'Use no more than 100 characters.',
  notesMax: 'Use no more than 1000 characters.',
  email: 'Enter a valid email address.',
  providerType: 'Choose a provider type.',
} as const
export function createStableProviderSchemas(
  message: (key: keyof typeof defaultMessages) => string = (key) =>
    defaultMessages[key],
) {
  const stableProviderTypeSchema = z.enum(stableProviderTypes, {
    error: message('providerType'),
  })
  const providerNameSchema = z
    .string()
    .trim()
    .min(1, message('nameRequired'))
    .max(100, message('nameMax'))
  const providerShortTextSchema = z
    .string()
    .trim()
    .max(100, message('shortTextMax'))
  const providerNotesSchema = z.string().trim().max(1000, message('notesMax'))

  const stableProviderInputSchema = z.object({
    stableId: z.string().min(1),
    type: stableProviderTypeSchema,
    name: providerNameSchema,
    phone: optionalText(providerShortTextSchema),
    email: optionalText(providerShortTextSchema.email(message('email'))),
    notes: optionalText(providerNotesSchema),
  })

  const stableProviderFormSchema = z.object({
    type: stableProviderTypeSchema,
    name: providerNameSchema,
    phone: providerShortTextSchema,
    email: z.union([
      z.literal('', { error: message('email') }),
      providerShortTextSchema.email(message('email')),
    ]),
    notes: providerNotesSchema,
  })

  return {
    stableProviderTypeSchema,
    stableProviderInputSchema,
    stableProviderFormSchema,
  }
}
export const {
  stableProviderTypeSchema,
  stableProviderInputSchema,
  stableProviderFormSchema,
} = createStableProviderSchemas()

export type StableProviderFormSchema = z.infer<typeof stableProviderFormSchema>
export type StableProviderType = z.infer<typeof stableProviderTypeSchema>
