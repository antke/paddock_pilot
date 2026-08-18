import { StableFormFields } from '#/components/forms/stable/StableFormFields'
import { stableFormSchema } from '#/components/forms/stable/stableFormSchema'
import type { StableFormSchema } from '#/components/forms/stable/stableFormSchema'
import {
  RouteFormActions,
  RouteFormCard,
} from '#/components/forms/RouteFormCard'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { useMutation } from 'convex/react'
import { useForm } from 'react-hook-form'

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

      showAppSuccessToast({
        title: 'Stable created',
        description: <p>{data.name} is ready.</p>,
      })

      nav({
        to: '/onboarding',
        search: { stableId: newStableId },
      })
    } catch (err) {
      showAppErrorToast()
    }
  }

  return (
    <RouteFormCard
      formId="stable-form"
      title="Create stable"
      onSubmit={form.handleSubmit(onSubmit)}
      actions={
        <RouteFormActions
          isSubmitting={form.formState.isSubmitting}
          onReset={() => form.reset()}
          submitLabel="Create Stable"
          submittingLabel="Creating..."
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
