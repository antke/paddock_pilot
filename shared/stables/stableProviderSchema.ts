import { z } from 'zod'

export const stableProviderTypes = [
  'vet',
  'farrier',
  'dentist',
  'physio',
  'saddler',
  'other',
] as const

export const stableProviderTypeLabels = {
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

export const stableProviderTypeSchema = z.enum(stableProviderTypes)
const providerNameSchema = z
  .string()
  .trim()
  .min(1, 'Provider name is required.')
  .max(100)
const providerShortTextSchema = z.string().trim().max(100)
const providerNotesSchema = z.string().trim().max(1000)

export const stableProviderInputSchema = z.object({
  stableId: z.string().min(1),
  type: stableProviderTypeSchema,
  name: providerNameSchema,
  phone: optionalText(providerShortTextSchema),
  email: optionalText(
    providerShortTextSchema.email('Enter a valid email address.'),
  ),
  notes: optionalText(providerNotesSchema),
})

export const stableProviderFormSchema = z.object({
  type: stableProviderTypeSchema,
  name: providerNameSchema,
  phone: providerShortTextSchema,
  email: z.union([
    z.literal(''),
    providerShortTextSchema.email('Enter a valid email address.'),
  ]),
  notes: providerNotesSchema,
})

export type StableProviderFormSchema = z.infer<typeof stableProviderFormSchema>
export type StableProviderType = z.infer<typeof stableProviderTypeSchema>
