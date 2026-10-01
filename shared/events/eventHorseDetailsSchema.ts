import z from 'zod'

const defaultMessages = {
  textInvalid: 'Enter text.',
  notesMax: 'Notes cannot be longer than 1000 characters.',
  costMin: 'Cost share cannot be negative.',
  costMax: 'Cost share cannot be greater than 100000.',
  numberInvalid: 'Enter a valid number.',
} as const
export type EventHorseDetailsValidationKey = keyof typeof defaultMessages
export function createEventHorseDetailsSchemas(
  message: (key: EventHorseDetailsValidationKey) => string = (key) =>
    defaultMessages[key],
) {
  const eventHorseNotesSchema = z
    .string({ error: message('textInvalid') })
    .trim()
    .max(1000, message('notesMax'))

  const optionalText = <TSchema extends z.ZodString>(schema: TSchema) =>
    schema.optional().transform((val) => val || undefined)

  const optionalNumber = z
    .union(
      [z.number({ error: message('numberInvalid') }), z.nan(), z.undefined()],
      { error: message('numberInvalid') },
    )
    .transform((val) =>
      val === undefined || Number.isNaN(val) ? undefined : val,
    )

  const eventHorseCostShareSchema = optionalNumber.pipe(
    z
      .number({ error: message('numberInvalid') })
      .min(0, message('costMin'))
      .max(100000, message('costMax'))
      .optional(),
  )

  const eventHorseDetailsInputSchema = z.object({
    requestedServiceNotes: optionalText(eventHorseNotesSchema),
    completionNotes: optionalText(eventHorseNotesSchema),
    costShare: eventHorseCostShareSchema,
  })

  const eventHorseDetailsFormSchema = z.object({
    requestedServiceNotes: eventHorseNotesSchema,
    completionNotes: eventHorseNotesSchema,
    costShare: eventHorseCostShareSchema,
  })

  return {
    eventHorseCostShareSchema,
    eventHorseDetailsInputSchema,
    eventHorseDetailsFormSchema,
  }
}
export const {
  eventHorseCostShareSchema,
  eventHorseDetailsInputSchema,
  eventHorseDetailsFormSchema,
} = createEventHorseDetailsSchemas()

export type EventHorseDetailsFormSchema = z.infer<
  typeof eventHorseDetailsFormSchema
>
export type EventHorseDetailsFormInput = z.input<
  typeof eventHorseDetailsFormSchema
>
