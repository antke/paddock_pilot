import { horseFormSchema as horseBaseFormSchema } from 'shared/horses/horseSchema'
import z from 'zod'

export const horseFormSchema = horseBaseFormSchema.extend({
  profileImage: z.custom<FileList>().optional(),
})

export type HorseFormSchema = z.infer<typeof horseFormSchema>
