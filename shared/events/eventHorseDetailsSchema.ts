import z from 'zod'

const eventHorseNotesSchema = z
  .string()
  .trim()
  .max(1000, 'Notes cannot be longer than 1000 characters.')

const optionalText = <TSchema extends z.ZodString>(schema: TSchema) =>
  schema.optional().transform((val) => val || undefined)

const optionalNumber = z
  .union([z.number(), z.nan(), z.undefined()])
  .transform((val) => (val === undefined || Number.isNaN(val) ? undefined : val))

export const eventHorseCostShareSchema = optionalNumber.pipe(
  z
    .number()
    .min(0, 'Cost share cannot be negative.')
    .max(100000, 'Cost share cannot be greater than 100000.')
    .optional(),
)

export const eventHorseDetailsInputSchema = z.object({
  requestedServiceNotes: optionalText(eventHorseNotesSchema),
  completionNotes: optionalText(eventHorseNotesSchema),
  costShare: eventHorseCostShareSchema,
})

export const eventHorseDetailsFormSchema = z.object({
  requestedServiceNotes: eventHorseNotesSchema,
  completionNotes: eventHorseNotesSchema,
  costShare: eventHorseCostShareSchema,
})

export type EventHorseDetailsFormSchema = z.infer<
  typeof eventHorseDetailsFormSchema
>
