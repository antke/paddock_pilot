import { StableFormFields } from '#/components/forms/stable/StableFormFields'
import { stableFormSchema } from '#/components/forms/stable/stableFormSchema'
import type { StableFormSchema } from '#/components/forms/stable/stableFormSchema'
import {
  RouteFormActions,
  RouteFormCard,
} from '#/components/forms/RouteFormCard'
import {
  RouteEntityNotFoundAlert,
  RouteQueryErrorAlert,
  RouteStatusAlert,
} from '#/components/layout/RouteStatusAlert'
import { ButtonLink } from '#/components/ui/button'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { convexQuery } from '@convex-dev/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useForm } from 'react-hook-form'

export const Route = createFileRoute('/stables/_layout/$stableId/edit')({
  component: RouteComponent,
  errorComponent: EditStableError,
})

function RouteComponent() {
  const { stableId } = Route.useParams()

  const id = stableId as Id<'stables'>
  const { data: stable } = useSuspenseQuery(
    convexQuery(api.stables.get, { id }),
  )
  const { data: access } = useSuspenseQuery(
    convexQuery(api.stables.getAccess, { id }),
  )

  if (!stable) {
    return <RouteEntityNotFoundAlert entity="stable" />
  }
  if (!access.capabilities.canManageStable) {
    return (
      <RouteStatusAlert
        tone="warning"
        title="Stable details are read-only for you"
        description="Only the stable owner can update shared stable details and rules."
        actions={
          <ButtonLink to="/stables/$stableId" params={{ stableId }}>
            Return to stable
          </ButtonLink>
        }
      />
    )
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
      sectionTitle="Stable details"
      stickyActions
      onSubmit={form.handleSubmit(onSubmit)}
      actions={
        <RouteFormActions
          isSubmitting={form.formState.isSubmitting}
          disabled={!form.formState.isDirty}
          onReset={() => form.reset()}
          resetLabel="Discard changes"
          resetConfirmation={{
            title: 'Discard your changes?',
            description:
              'The form will return to the last saved stable details.',
            confirmLabel: 'Discard changes',
          }}
          submitLabel="Update stable"
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

function EditStableError({ reset }: ErrorComponentProps) {
  return (
    <RouteQueryErrorAlert
      reset={reset}
      title="The stable form couldn’t load"
      description="Check your connection, then try again. Stable details have not been changed."
    />
  )
}
