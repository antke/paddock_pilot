import { StableFormFields } from '#/components/forms/stable/StableFormFields'
import {
  stableFormSchema,
  type StableFormSchema,
} from '#/components/forms/stable/stableFormSchema'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { convexQuery } from '@convex-dev/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export const Route = createFileRoute('/stables/_layout/$stableId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()

  const { data: stable } = useSuspenseQuery(
    convexQuery(api.stables.get, { id: stableId as Id<'stables'> }),
  )

  if (!stable) return <div>Stable not found</div>

  return <EditStableForm key={stable._id} stable={stable} />
}

type EditStableFormProps = {
  stable: Doc<'stables'>
}

function EditStableForm({ stable }: EditStableFormProps) {
  const nav = useNavigate()
  const updateStable = useMutation(api.stables.update)

  const form = useForm<StableFormSchema>({
    resolver: zodResolver(stableFormSchema),
    mode: 'onTouched',
    defaultValues: {
      name: stable.name,
      location: stable.location,
      description: stable.description ?? '',
    },
  })

  const onSubmit = async (data: StableFormSchema) => {
    try {
      await updateStable({
        ...data,
        id: stable._id,
      })

      toast.success('Stable updated', {
        description: <p>{data.name} has been updated.</p>,
        position: 'top-right',
      })

      nav({ to: '/stables/$stableId', params: { stableId: stable._id } })
    } catch (err) {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
    }
  }

  return (
    <form id="stable-form" onSubmit={form.handleSubmit(onSubmit)}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Edit stable</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <StableFormFields
            control={form.control}
            disabled={form.formState.isSubmitting}
          />
        </CardContent>

        <CardFooter className="gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={form.formState.isSubmitting}
            onClick={() => form.reset()}
          >
            Reset
          </Button>

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : 'Update Stable'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
