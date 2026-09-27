import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from 'convex/react'
import { useId } from 'react'
import { useOnboardingSave, OnboardingSaveError } from './onboardingAsync'
import { Controller, useForm } from 'react-hook-form'
import type { Doc } from 'convex/_generated/dataModel'

import { InlineForm } from '#/components/forms/FormLayout'
import { FormSubmitActions } from '#/components/forms/FormSubmitActions'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGrid,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { api } from 'convex/_generated/api'
import { stableOperationsFormSchema } from 'shared/stables/stableSchema'
import type { StableOperationsFormSchema } from 'shared/stables/stableSchema'
import { OnboardingLaterNote } from './OnboardingLayout'

type StableOperationsStepProps = {
  stable: Doc<'stables'>
  cancelLabel?: string
  onDeferred: () => void | Promise<void>
  onSaved: () => void | Promise<void>
}
export function StableOperationsStep(props: StableOperationsStepProps) {
  const update = useMutation(api.stables.updateOperations)
  return (
    <StableOperationsStepView
      {...props}
      onSave={async (values) => {
        await update({
          id: props.stable._id,
          contactName: values.contactName || undefined,
          contactPhone: values.contactPhone || undefined,
          emergencyPhone: values.emergencyPhone || undefined,
          openingHours: values.openingHours || undefined,
          yardRules: values.yardRules || undefined,
        })
      }}
    />
  )
}
export function StableOperationsStepView({
  stable,
  cancelLabel = 'Do this later',
  onDeferred,
  onSaved,
  onSave,
}: StableOperationsStepProps & {
  onSave: (values: StableOperationsFormSchema) => Promise<void>
}) {
  const formId = useId()
  const save = useOnboardingSave({
    onSave,
    onSaved,
    failureMessage:
      'Could not save stable details. Your entries are still here. Try again.',
  })
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

  return (
    <InlineForm onSubmit={form.handleSubmit(save.run)}>
      <OnboardingSaveError message={save.error} />
      <OnboardingLaterNote>
        Add what the team needs from day one. Opening hours, yard rules and
        additional contact details can all be completed later in Stable
        settings.
      </OnboardingLaterNote>

      <FieldGrid>
        <Controller
          name="contactName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${formId}-${field.name}`}>
                Primary contact
              </FieldLabel>
              <Input
                {...field}
                id={`${formId}-${field.name}`}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid
                    ? `${formId}-${field.name}-error`
                    : undefined
                }
                placeholder="Yard manager"
                disabled={save.pending || save.acknowledged}
              />
              {fieldState.invalid && (
                <FieldError
                  id={`${formId}-${field.name}-error`}
                  errors={[fieldState.error]}
                />
              )}
            </Field>
          )}
        />
        <Controller
          name="contactPhone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${formId}-${field.name}`}>
                Contact phone
              </FieldLabel>
              <Input
                {...field}
                id={`${formId}-${field.name}`}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid
                    ? `${formId}-${field.name}-error`
                    : undefined
                }
                type="tel"
                placeholder="Optional"
                disabled={save.pending || save.acknowledged}
              />
              {fieldState.invalid && (
                <FieldError
                  id={`${formId}-${field.name}-error`}
                  errors={[fieldState.error]}
                />
              )}
            </Field>
          )}
        />
      </FieldGrid>

      <FieldGrid>
        <Controller
          name="emergencyPhone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${formId}-${field.name}`}>
                Emergency phone
              </FieldLabel>
              <Input
                {...field}
                id={`${formId}-${field.name}`}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid
                    ? `${formId}-${field.name}-error`
                    : undefined
                }
                type="tel"
                placeholder="Optional"
                disabled={save.pending || save.acknowledged}
              />
              {fieldState.invalid && (
                <FieldError
                  id={`${formId}-${field.name}-error`}
                  errors={[fieldState.error]}
                />
              )}
            </Field>
          )}
        />
        <Controller
          name="openingHours"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${formId}-${field.name}`}>
                Opening hours
              </FieldLabel>
              <Input
                {...field}
                id={`${formId}-${field.name}`}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid
                    ? `${formId}-${field.name}-error`
                    : undefined
                }
                placeholder="6:00 AM – 8:30 PM"
                disabled={save.pending || save.acknowledged}
              />
              {fieldState.invalid && (
                <FieldError
                  id={`${formId}-${field.name}-error`}
                  errors={[fieldState.error]}
                />
              )}
            </Field>
          )}
        />
      </FieldGrid>

      <Controller
        name="yardRules"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`${formId}-${field.name}`}>
              Yard rules
            </FieldLabel>
            <Textarea
              {...field}
              id={`${formId}-${field.name}`}
              aria-invalid={fieldState.invalid}
              aria-describedby={
                fieldState.invalid ? `${formId}-${field.name}-error` : undefined
              }
              placeholder="Share anything members should know when they arrive."
              minHeight="default"
              disabled={save.pending || save.acknowledged}
            />
            <FieldDescription>
              Keep this short for now; it can grow with the stable.
            </FieldDescription>
            {fieldState.invalid && (
              <FieldError
                id={`${formId}-${field.name}-error`}
                errors={[fieldState.error]}
              />
            )}
          </Field>
        )}
      />

      <FormSubmitActions
        align="end"
        isSubmitting={save.pending}
        onCancel={onDeferred}
        cancelLabel={cancelLabel}
        submitLabel={
          save.acknowledged
            ? 'Continue without saving again'
            : 'Save and continue'
        }
        submittingLabel="Saving..."
      />
    </InlineForm>
  )
}
