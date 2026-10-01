import { calculateHorseAge } from 'shared/horses/horseAge'
import { createHorseSchemas } from 'shared/horses/horseSchema'
import { localeInstances } from '#/i18n/resources'
import type { Locale } from 'shared/i18n/locale'
import z from 'zod'
import { matchHorseBreed } from './horseBreedSelection'

export const createHorseFormSchema = (
  existingBreed?: string,
  additionalBreeds: ReadonlyArray<string> = [],
  locale: Locale = 'en',
) => {
  const t = localeInstances[locale].t
  const {
    horseAgeSchema,
    horseBreedSchema,
    horseDateOfBirthSchema,
    horseFormSchema: horseBaseFormSchema,
  } = createHorseSchemas((key) => t(`horseValidation.${key}`))
  const optionalAgeSchema = z
    .literal('', { error: t('horseValidation.ageInvalid') })
    .or(horseAgeSchema)
  return horseBaseFormSchema
    .extend({
      breed: horseBreedSchema
        .transform(
          (value) =>
            matchHorseBreed(value, existingBreed, additionalBreeds, locale) ??
            value,
        )
        .refine(
          (value) =>
            matchHorseBreed(value, existingBreed, additionalBreeds, locale) !==
            undefined,
          t('horseValidation.breedKnown'),
        ),
      age: optionalAgeSchema,
      dateOfBirth: z
        .literal('', { error: t('horseValidation.birthInvalid') })
        .or(horseDateOfBirthSchema),
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
              message: t('horseValidation.imageType'),
            })
          } else if (file.size > 5 * 1024 * 1024) {
            context.addIssue({
              code: 'custom',
              message: t('horseValidation.imageSize'),
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
          message: t('horseValidation.birthOrAge'),
        })
        context.addIssue({
          code: 'custom',
          path: ['age'],
          message: t('horseValidation.ageOrBirth'),
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
            message: t('horseValidation.birthDateInvalid'),
          })
          return
        }

        if (age < 0) {
          context.addIssue({
            code: 'custom',
            path: ['dateOfBirth'],
            message: t('horseValidation.birthFuture'),
          })
        }

        if (age > 100) {
          context.addIssue({
            code: 'custom',
            path: ['dateOfBirth'],
            message: t('horseValidation.birthOld'),
          })
        }
      }
    })
}
export const horseFormSchema = createHorseFormSchema()

export type HorseFormSchema = z.infer<typeof horseFormSchema>
export type HorseFormInput = z.input<typeof horseFormSchema>
