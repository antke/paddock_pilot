import z from 'zod'

const defaultMessages = {
  shortTextMax: 'Use a shorter value (max 100 characters).',
  phoneMax: 'Use a shorter phone number.',
  emergencyContactMax: 'Use a shorter emergency contact.',
} as const
export function createStableMemberSchemas(
  message: (key: keyof typeof defaultMessages) => string = (key) =>
    defaultMessages[key],
) {
  const memberShortTextSchema = z
    .string()
    .trim()
    .max(100, message('shortTextMax'))

  const memberPhoneSchema = z.string().trim().max(50, message('phoneMax'))

  const memberLongTextSchema = z
    .string()
    .trim()
    .max(500, message('emergencyContactMax'))

  const optionalText = <TSchema extends z.ZodString>(schema: TSchema) =>
    schema.optional().transform((value) => value || undefined)

  const stableMemberDetailsFormSchema = z.object({
    displayNameOverride: memberShortTextSchema,
    phone: memberPhoneSchema,
    emergencyContact: memberLongTextSchema,
  })

  const stableMemberDetailsInputSchema = z.object({
    displayNameOverride: optionalText(memberShortTextSchema),
    phone: optionalText(memberPhoneSchema),
    emergencyContact: optionalText(memberLongTextSchema),
  })

  return { stableMemberDetailsFormSchema, stableMemberDetailsInputSchema }
}
export const { stableMemberDetailsFormSchema, stableMemberDetailsInputSchema } =
  createStableMemberSchemas()

export type StableMemberDetailsFormSchema = z.infer<
  typeof stableMemberDetailsFormSchema
>
