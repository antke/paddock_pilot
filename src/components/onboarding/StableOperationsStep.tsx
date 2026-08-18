import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from 'convex/react'
import { Controller, useForm } from 'react-hook-form'
import type { Doc } from 'convex/_generated/dataModel'

import { InlineForm } from '#/components/forms/FormLayout'
import { FormSubmitActions } from '#/components/forms/FormSubmitActions'
import {
  Field,
  FieldDescription,
  FieldGrid,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { showAppErrorToast } from '#/components/ui/sonner'
import { Textarea } from '#/components/ui/textarea'
import { api } from 'convex/_generated/api'
import { stableOperationsFormSchema } from 'shared/stables/stableSchema'
import type { StableOperationsFormSchema } from 'shared/stables/stableSchema'
import { OnboardingLaterNote } from './OnboardingLayout'

export function StableOperationsStep({
  stable,
  cancelLabel = 'Do this later',
  onDeferred,
  onSaved,
}: {
  stable: Doc<'stables'>
  cancelLabel?: string
  onDeferred: () => void | Promise<void>
  onSaved: () => void | Promise<void>
}) {
  const updateStableOperations = useMutation(api.stables.updateOperations)
  const form = useForm<StableOperationsFormSchema>({
    resolver: zodResolver(stableOperationsFormSchema),
    defaultValues: {
      contactName: stable.contactName ?? '',
      contactPhone: stable.contactPhone ?? '',
      emergencyPhone: stable.emergencyPhone ?? '',
      openingHours: stable.openingHours ?? '',
      yardRules: stable.yardRules ?? '',
    },
  })

  const onSubmit = async (values: StableOperationsFormSchema) => {
    try {
      await updateStableOperations({
        id: stable._id,
        contactName: values.contactName || undefined,
        contactPhone: values.contactPhone || undefined,
        emergencyPhone: values.emergencyPhone || undefined,
        openingHours: values.openingHours || undefined,
        yardRules: values.yardRules || undefined,
      })
      await onSaved()
    } catch {
      showAppErrorToast({ title: 'Could not save the stable details' })
    }
  }

  return (
    <InlineForm onSubmit={form.handleSubmit(onSubmit)}>
      <OnboardingLaterNote>
        Add what the team needs from day one. Opening hours, yard rules and
        additional contact details can all be completed later in Stable
        settings.
      </OnboardingLaterNote>

      <FieldGrid>
        <Controller
          name="contactName"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Primary contact</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="Yard manager"
                disabled={form.formState.isSubmitting}
              />
            </Field>
          )}
        />
        <Controller
          name="contactPhone"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Contact phone</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="tel"
                placeholder="Optional"
                disabled={form.formState.isSubmitting}
              />
            </Field>
          )}
        />
      </FieldGrid>

      <FieldGrid>
        <Controller
          name="emergencyPhone"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Emergency phone</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="tel"
                placeholder="Optional"
                disabled={form.formState.isSubmitting}
              />
            </Field>
          )}
        />
        <Controller
          name="openingHours"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Opening hours</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="6:00 AM – 8:30 PM"
                disabled={form.formState.isSubmitting}
              />
            </Field>
          )}
        />
      </FieldGrid>

      <Controller
        name="yardRules"
        control={form.control}
        render={({ field }) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Yard rules</FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              placeholder="Share anything members should know when they arrive."
              minHeight="default"
              disabled={form.formState.isSubmitting}
            />
            <FieldDescription>
              Keep this short for now; it can grow with the stable.
            </FieldDescription>
          </Field>
        )}
      />

      <FormSubmitActions
        align="end"
        isSubmitting={form.formState.isSubmitting}
        onCancel={onDeferred}
        cancelLabel={cancelLabel}
        submitLabel="Save and continue"
        submittingLabel="Saving..."
      />
    </InlineForm>
  )
}
