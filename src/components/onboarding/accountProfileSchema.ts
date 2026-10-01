import { localeInstances } from '#/i18n/resources'
import type { TFunction } from 'i18next'
import { z } from 'zod'

export const createAccountProfileSchema = (t: TFunction<'app'>) =>
  z.object({
    preferredName: z.string().trim().min(1, t('profileForm.nameRequired')),
    phone: z.string().trim().optional(),
    profileImage: z
      .custom<FileList>()
      .optional()
      .superRefine((files, ctx) => {
        if (!files?.length) return
        const file = files.item(0)
        if (!file?.type.startsWith('image/'))
          ctx.addIssue({
            code: 'custom',
            message: t('profileForm.imageRequired'),
          })
        else if (file.size > 5 * 1024 * 1024)
          ctx.addIssue({
            code: 'custom',
            message: t('profileForm.imageTooLarge'),
          })
      }),
  })
export const accountProfileSchema = createAccountProfileSchema(
  localeInstances.en.getFixedT('en', 'app'),
)
export type AccountProfileValues = z.infer<typeof accountProfileSchema>
