import { useLocalizedValidation } from '#/i18n/useLocalizedValidation'
import { useT } from '#/i18n/LocaleProvider'
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
import { createStableSchemas } from 'shared/stables/stableSchema'
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
  cancelLabel,
  onDeferred,
  onSaved,
  onSave,
}: StableOperationsStepProps & {
  onSave: (values: StableOperationsFormSchema) => Promise<void>
}) {
  const t = useT()

  const formId = useId()
  const save = useOnboardingSave({
    onSave,
    onSaved,
    failureMessage: t('onboarding.stableSaveFailed'),
  })
  const form = useForm<StableOperationsFormSchema>({
    resolver: zodResolver(
      createStableSchemas((key) => t(`stableValidation.${key}`))
        .stableOperationsFormSchema,
    ),
    defaultValues: {
      contactName: stable.contactName ?? '',
      contactPhone: stable.contactPhone ?? '',
      emergencyPhone: stable.emergencyPhone ?? '',
      openingHours: stable.openingHours ?? '',
      yardRules: stable.yardRules ?? '',
    },
  })
  useLocalizedValidation(form)

  return (
    <InlineForm onSubmit={form.handleSubmit(save.run)}>
      <OnboardingSaveError message={save.error} />
      <OnboardingLaterNote>
        {t('onboarding.operationsLaterHelp')}
      </OnboardingLaterNote>

      <FieldGrid>
        <Controller
          name="contactName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${formId}-${field.name}`}>
                {t('onboarding.primaryContact')}
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
                placeholder={t('onboarding.yardManager')}
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
                {t('onboarding.contactPhone')}
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
                placeholder={t('onboarding.optional')}
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
                {t('onboarding.emergencyPhone')}
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
                placeholder={t('onboarding.optional')}
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
                {t('onboarding.openingHours')}
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
                placeholder={t('onboarding.hoursExample')}
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
              {t('onboarding.yardRules')}
            </FieldLabel>
            <Textarea
              {...field}
              id={`${formId}-${field.name}`}
              aria-invalid={fieldState.invalid}
              aria-describedby={
                fieldState.invalid ? `${formId}-${field.name}-error` : undefined
              }
              placeholder={t('onboarding.yardRulesPlaceholder')}
              minHeight="default"
              disabled={save.pending || save.acknowledged}
            />
            <FieldDescription>{t('onboarding.yardRulesHelp')}</FieldDescription>
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
        cancelLabel={cancelLabel ?? t('onboarding.later')}
        submitLabel={
          save.acknowledged
            ? t('onboarding.continueSaved')
            : t('onboarding.saveContinue')
        }
        submittingLabel={t('onboarding.saving')}
      />
    </InlineForm>
  )
}
