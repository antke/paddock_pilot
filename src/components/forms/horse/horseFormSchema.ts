import { calculateHorseAge } from 'shared/horses/horseAge'
import {
  horseAgeSchema,
  horseBreedSchema,
  horseDateOfBirthSchema,
  horseFormSchema as horseBaseFormSchema,
} from 'shared/horses/horseSchema'
import z from 'zod'
import { matchHorseBreed } from './horseBreedSelection'

const optionalAgeSchema = z.literal('').or(horseAgeSchema)

export const createHorseFormSchema = (existingBreed?: string) =>
  horseBaseFormSchema
    .extend({
      breed: horseBreedSchema
        .transform((value) => matchHorseBreed(value, existingBreed) ?? value)
        .refine(
          (value) => matchHorseBreed(value, existingBreed) !== undefined,
          'Choose a breed from the list, or clear this field.',
        ),
      age: optionalAgeSchema,
      dateOfBirth: z.literal('').or(horseDateOfBirthSchema),
      profileImage: z
        .custom<FileList>()
        .nullish()
        .superRefine((files, context) => {
          if (files == null || files.length === 0) return
          const file = typeof files.item === 'function' ? files.item(0) : null
          if (
            typeof file?.type !== 'string' ||
            !file.type.startsWith('image/')
          ) {
            context.addIssue({
              code: 'custom',
              message: 'Choose an image file.',
            })
          } else if (file.size > 5 * 1024 * 1024) {
            context.addIssue({
              code: 'custom',
              message: 'Choose an image no larger than 5 MB.',
            })
          }
        })
        .transform((files) => files ?? undefined),
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

export const horseFormSchema = createHorseFormSchema()

export type HorseFormSchema = z.infer<typeof horseFormSchema>
export type HorseFormInput = z.input<typeof horseFormSchema>
