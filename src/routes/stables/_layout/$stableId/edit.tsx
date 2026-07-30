import { StableFormFields } from '#/components/forms/stable/StableFormFields'
import { stableFormSchema } from '#/components/forms/stable/stableFormSchema'
import type { StableFormSchema } from '#/components/forms/stable/stableFormSchema'
import {
  RouteFormActions,
  RouteFormCard,
} from '#/components/forms/RouteFormCard'
import { RouteEntityNotFoundAlert } from '#/components/layout/RouteStatusAlert'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { convexQuery } from '@convex-dev/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useForm } from 'react-hook-form'

export const Route = createFileRoute('/stables/_layout/$stableId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()

  const { data: stable } = useSuspenseQuery(
    convexQuery(api.stables.get, { id: stableId as Id<'stables'> }),
  )

  if (!stable) {
    return <RouteEntityNotFoundAlert entity="stable" />
  }

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
      contactName: stable.contactName ?? '',
      contactPhone: stable.contactPhone ?? '',
      emergencyPhone: stable.emergencyPhone ?? '',
      addressLine1: stable.addressLine1 ?? '',
      addressLine2: stable.addressLine2 ?? '',
      postcode: stable.postcode ?? '',
      country: stable.country ?? '',
      yardRules: stable.yardRules ?? '',
      openingHours: stable.openingHours ?? '',
    },
  })

  const onSubmit = async (data: StableFormSchema) => {
    try {
      await updateStable({
        ...data,
        id: stable._id,
      })

      showAppSuccessToast({
        title: 'Stable updated',
        description: <p>{data.name} has been updated.</p>,
      })

      nav({ to: '/stables/$stableId', params: { stableId: stable._id } })
    } catch (err) {
      showAppErrorToast()
    }
  }

  return (
    <RouteFormCard
      formId="stable-form"
      title="Edit stable"
      onSubmit={form.handleSubmit(onSubmit)}
      actions={
        <RouteFormActions
          isSubmitting={form.formState.isSubmitting}
          onReset={() => form.reset()}
          submitLabel="Update Stable"
          submittingLabel="Saving..."
        />
      }
    >
      <StableFormFields
        control={form.control}
        disabled={form.formState.isSubmitting}
      />
    </RouteFormCard>
  )
}
