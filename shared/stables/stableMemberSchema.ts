import z from 'zod'

const memberShortTextSchema = z
  .string()
  .trim()
  .max(100, 'Please use a shorter value.')

const memberPhoneSchema = z
  .string()
  .trim()
  .max(50, 'Please use a shorter phone number.')

const memberLongTextSchema = z
  .string()
  .trim()
  .max(500, 'Please use a shorter emergency contact.')

const optionalText = <TSchema extends z.ZodString>(schema: TSchema) =>
  schema.optional().transform((value) => value || undefined)

export const stableMemberDetailsFormSchema = z.object({
  displayNameOverride: memberShortTextSchema,
  phone: memberPhoneSchema,
  emergencyContact: memberLongTextSchema,
})

export const stableMemberDetailsInputSchema = z.object({
  displayNameOverride: optionalText(memberShortTextSchema),
  phone: optionalText(memberPhoneSchema),
  emergencyContact: optionalText(memberLongTextSchema),
})

export type StableMemberDetailsFormSchema = z.infer<
  typeof stableMemberDetailsFormSchema
>
