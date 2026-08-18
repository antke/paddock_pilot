import { calculateHorseAge } from 'shared/horses/horseAge'
import {
  horseAgeSchema,
  horseDateOfBirthSchema,
  horseFormSchema as horseBaseFormSchema,
} from 'shared/horses/horseSchema'
import z from 'zod'

const optionalAgeSchema = z.literal('').or(horseAgeSchema)

export const horseFormSchema = horseBaseFormSchema
  .extend({
    age: optionalAgeSchema,
    dateOfBirth: z.literal('').or(horseDateOfBirthSchema),
    profileImage: z.custom<FileList>().optional(),
  })
  .superRefine((values, context) => {
    if (!values.dateOfBirth && values.age === '') {
      context.addIssue({
        code: 'custom',
        path: ['dateOfBirth'],
        message: 'Add a birth year or current age.',
      })
      context.addIssue({
        code: 'custom',
        path: ['age'],
        message: 'Add a current age or birth year.',
      })
      return
    }

    if (values.dateOfBirth) {
      const dateOfBirth = values.dateOfBirth
      const age = calculateHorseAge(dateOfBirth)

      if (age === undefined) {
        context.addIssue({
          code: 'custom',
          path: ['dateOfBirth'],
          message: 'Use a valid date of birth.',
        })
        return
      }

      if (age < 0) {
        context.addIssue({
          code: 'custom',
          path: ['dateOfBirth'],
          message: 'Date of birth cannot be in the future.',
        })
      }

      if (age > 100) {
        context.addIssue({
          code: 'custom',
          path: ['dateOfBirth'],
          message: 'Date of birth cannot be more than 100 years ago.',
        })
      }
    }
  })

export type HorseFormSchema = z.infer<typeof horseFormSchema>
export type HorseFormInput = z.input<typeof horseFormSchema>
