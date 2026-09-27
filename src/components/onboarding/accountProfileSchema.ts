import { z } from 'zod'

export const accountProfileSchema = z.object({
  preferredName: z.string().trim().min(1, 'Add the name people should use.'),
  phone: z.string().trim().optional(),
  profileImage: z
    .custom<FileList>()
    .optional()
    .superRefine((files, ctx) => {
      if (!files?.length) return
      const file = files.item(0)
      if (!file?.type.startsWith('image/'))
        ctx.addIssue({ code: 'custom', message: 'Choose an image file.' })
      else if (file.size > 5 * 1024 * 1024)
        ctx.addIssue({
          code: 'custom',
          message: 'Choose an image no larger than 5 MB.',
        })
    }),
})
export type AccountProfileValues = z.infer<typeof accountProfileSchema>
