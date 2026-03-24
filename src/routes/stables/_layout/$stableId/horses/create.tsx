import { useMutation } from 'convex/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import {
  horseFormSchema,
  type HorseFormSchema,
} from 'shared/horses/horseSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { Id } from 'convex/_generated/dataModel'
import { toast } from 'sonner'
import { HorseFormFields } from '#/components/forms/horse/HorseFormFields'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/horses/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const addHorse = useMutation(api.horses.add)

  const nav = useNavigate()
  const { stableId } = Route.useParams()

  const form = useForm<HorseFormSchema>({
    resolver: zodResolver(horseFormSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      breed: '',
    },
  })

  const onSubmit = async (data: HorseFormSchema) => {
    try {
      const newHorseId = await addHorse({
        name: data.name,
        age: data.age,
        breed: data.breed,
        stableId: stableId as Id<'stables'>,
      })

      toast.success('Horse added', {
        description: <p>{data.name} is ready.</p>,
        position: 'top-right',
      })

      nav({
        to: '/stables/$stableId/horses/$horseId',
        params: { stableId, horseId: newHorseId },
      })
    } catch (err) {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
    }
  }

  return (
    <div className="max-w-md p-4">
      <form id="horse-form" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <HorseFormFields
            control={form.control}
            disabled={form.formState.isSubmitting}
          />

          <div className="flex gap-4 w-full align-middle justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={form.formState.isSubmitting}
              onClick={() => form.reset()}
            >
              Reset
            </Button>

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Adding...' : 'Add Horse'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
