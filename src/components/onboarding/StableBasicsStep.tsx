import { useLocalizedValidation } from '#/i18n/useLocalizedValidation'
import { useT } from '#/i18n/LocaleProvider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from 'convex/react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useId } from 'react'
import { createStableSchemas } from 'shared/stables/stableSchema'
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

function createStableBasicsSchema(t: ReturnType<typeof useT>) {
  const { stableNameSchema, stableLocationSchema } = createStableSchemas(
    (key) => t(`stableValidation.${key}`),
  )
  return z.object({ name: stableNameSchema, location: stableLocationSchema })
}

export type StableBasicsValues = z.infer<
  ReturnType<typeof createStableBasicsSchema>
>

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
  const t = useT()

  const formId = useId()
  const save = useOnboardingSave({
    onSave,
    onSaved,
    failureMessage: stable
      ? t('onboarding.stableSaveFailed')
      : t('onboarding.stableCreateFailed'),
  })
  const form = useForm<StableBasicsValues>({
    resolver: zodResolver(createStableBasicsSchema(t)),
    mode: 'onTouched',
    defaultValues: {
      name: stable?.name ?? '',
      location: stable?.location ?? '',
    },
  })
  useLocalizedValidation(form)

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
                {t('onboarding.stableName')}
              </FieldLabel>
              <Input
                {...field}
                id={`${formId}-${field.name}`}
                placeholder={t('onboarding.stableExample')}
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
                {t('onboarding.location')}
              </FieldLabel>
              <Input
                {...field}
                id={`${formId}-${field.name}`}
                placeholder={t('onboarding.locationExample')}
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
                {t('onboarding.locationHelp')}
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
            ? t('onboarding.continueSaved')
            : stable
              ? t('onboarding.saveStable')
              : t('onboarding.createContinue')
        }
        submittingLabel={
          stable ? t('onboarding.saving') : t('onboarding.creating')
        }
      />
    </InlineForm>
  )
}
