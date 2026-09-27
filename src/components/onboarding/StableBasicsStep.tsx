import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from 'convex/react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useId } from 'react'
import {
  stableNameSchema,
  stableLocationSchema,
} from 'shared/stables/stableSchema'
import { useOnboardingSave, OnboardingSaveError } from './onboardingAsync'
import type { Doc, Id } from 'convex/_generated/dataModel'

import { FormSubmitActions } from '#/components/forms/FormSubmitActions'
import { InlineForm } from '#/components/forms/FormLayout'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGrid,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { api } from 'convex/_generated/api'

const stableBasicsSchema = z.object({
  name: stableNameSchema,
  location: stableLocationSchema,
})

export type StableBasicsValues = z.infer<typeof stableBasicsSchema>

type StableBasicsStepProps = {
  stable?: Doc<'stables'>
  onSaved: (stableId: Id<'stables'>) => void | Promise<void>
}

export function StableBasicsStep(props: StableBasicsStepProps) {
  const addStable = useMutation(api.stables.add)
  const updateStable = useMutation(api.stables.updateBasics)
  return (
    <StableBasicsStepView
      {...props}
      onSave={async (values) => {
        if (props.stable) {
          await updateStable({ id: props.stable._id, ...values })
          return props.stable._id
        }
        return addStable(values)
      }}
    />
  )
}

export function StableBasicsStepView({
  stable,
  onSaved,
  onSave,
}: StableBasicsStepProps & {
  onSave: (values: StableBasicsValues) => Promise<Id<'stables'>>
}) {
  const formId = useId()
  const save = useOnboardingSave({
    onSave,
    onSaved,
    failureMessage: stable
      ? 'Could not save stable details. Your entries are still here. Try again.'
      : 'Could not create the stable. Your entries are still here. Try again.',
  })
  const form = useForm<StableBasicsValues>({
    resolver: zodResolver(stableBasicsSchema),
    mode: 'onTouched',
    defaultValues: {
      name: stable?.name ?? '',
      location: stable?.location ?? '',
    },
  })

  return (
    <InlineForm onSubmit={form.handleSubmit(save.run)}>
      <OnboardingSaveError message={save.error} />
      <FieldGrid>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${formId}-${field.name}`}>
                Stable name
              </FieldLabel>
              <Input
                {...field}
                id={`${formId}-${field.name}`}
                placeholder="Cedar Ridge Barn"
                autoComplete="organization"
                aria-invalid={fieldState.invalid}
                aria-required="true"
                aria-describedby={
                  fieldState.invalid
                    ? `${formId}-${field.name}-error`
                    : undefined
                }
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
          name="location"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${formId}-${field.name}`}>
                Location
              </FieldLabel>
              <Input
                {...field}
                id={`${formId}-${field.name}`}
                placeholder="Hudson Valley, NY"
                autoComplete="address-level2"
                aria-invalid={fieldState.invalid}
                aria-required="true"
                aria-describedby={
                  fieldState.invalid
                    ? `${formId}-${field.name}-error`
                    : undefined
                }
                disabled={save.pending || save.acknowledged}
              />
              <FieldDescription>
                A town, region or address people will recognise.
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
      </FieldGrid>

      <FormSubmitActions
        align="end"
        isSubmitting={save.pending}
        submitLabel={
          save.acknowledged
            ? 'Continue without saving again'
            : stable
              ? 'Save stable details'
              : 'Create stable and continue'
        }
        submittingLabel={stable ? 'Saving...' : 'Creating stable...'}
      />
    </InlineForm>
  )
}
