import { calculateHorseAge } from 'shared/horses/horseAge'
import {
  horseDateOfBirthSchema,
  horseFormSchema as horseBaseFormSchema,
} from 'shared/horses/horseSchema'
import z from 'zod'

const requiredDateOfBirthSchema = horseDateOfBirthSchema.superRefine(
  (dateOfBirth, context) => {
    const age = calculateHorseAge(dateOfBirth)

    if (age === undefined) {
      context.addIssue({
        code: 'custom',
        message: 'Use a valid date of birth.',
      })
      return
    }

    if (age < 0) {
      context.addIssue({
        code: 'custom',
        message: 'Date of birth cannot be in the future.',
      })
    }

    if (age > 100) {
      context.addIssue({
        code: 'custom',
        message: 'Date of birth cannot be more than 100 years ago.',
      })
    }
  },
)

export const horseFormSchema = horseBaseFormSchema.omit({ age: true }).extend({
  dateOfBirth: requiredDateOfBirthSchema,
  profileImage: z.custom<FileList>().optional(),
})

export type HorseFormSchema = z.infer<typeof horseFormSchema>
export type HorseFormInput = z.input<typeof horseFormSchema>
