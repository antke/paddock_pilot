import { StableFormFields } from '#/components/forms/stable/StableFormFields'
import { stableFormSchema } from '#/components/forms/stable/stableFormSchema'
import type { StableFormSchema } from '#/components/forms/stable/stableFormSchema'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { useMutation } from 'convex/react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export const Route = createFileRoute('/stables/_layout/create')({
  component: RouteComponent,
})

function RouteComponent() {
  const addStable = useMutation(api.stables.add)
  const nav = useNavigate()

  const form = useForm<StableFormSchema>({
    resolver: zodResolver(stableFormSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      location: '',
      description: '',
      contactName: '',
      contactPhone: '',
      emergencyPhone: '',
      addressLine1: '',
      addressLine2: '',
      postcode: '',
      country: '',
      yardRules: '',
      openingHours: '',
    },
  })

  const onSubmit = async (data: StableFormSchema) => {
    try {
      const newStableId = await addStable({
        name: data.name,
        location: data.location,
        description: data.description,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        emergencyPhone: data.emergencyPhone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        postcode: data.postcode,
        country: data.country,
        yardRules: data.yardRules,
        openingHours: data.openingHours,
      })

      toast.success('Stable created', {
        description: <p>{data.name} is ready.</p>,
        position: 'top-right',
      })

      nav({ to: '/stables/$stableId', params: { stableId: newStableId } })
    } catch (err) {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
    }
  }

  return (
    <form id="stable-form" onSubmit={form.handleSubmit(onSubmit)}>
      <Card className="w-full bg-card/80">
        <CardHeader>
          <CardTitle className="text-xl tracking-tight">
            Create stable
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <StableFormFields
            control={form.control}
            disabled={form.formState.isSubmitting}
          />
        </CardContent>

        <CardFooter className="justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={form.formState.isSubmitting}
            onClick={() => form.reset()}
          >
            Reset
          </Button>

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Creating...' : 'Create Stable'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
