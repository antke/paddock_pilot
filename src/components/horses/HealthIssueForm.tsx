import { useLocalizedValidation } from '#/i18n/useLocalizedValidation'
import { useT } from '#/i18n/LocaleProvider'
import { useId, useRef, useState } from 'react'
import { InlineForm } from '#/components/forms/FormLayout'
import { FormSubmissionError } from '#/components/forms/FormSubmissionError'
import { FormSubmitActions } from '#/components/forms/FormSubmitActions'
import { ChoiceButtonGroup } from '#/components/ui/choice-button-group'
import { Field, FieldError, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { createHealthIssueSchemas } from 'shared/horses/healthIssueSchema'
import type {
  HealthIssueFormSchema,
  HealthIssueSeverity,
} from 'shared/horses/healthIssueSchema'
import { horseHealthIssueSeverityLabels } from './horseCareLabels'

type HealthIssueFormProps = {
  disabled?: boolean
  onPendingChange?: (pending: boolean) => void
  onSubmit: (data: HealthIssueFormSchema) => Promise<void>
}

const severityOptions = Object.keys(
  horseHealthIssueSeverityLabels,
) as Array<HealthIssueSeverity>

const asSeverity = (value: string) => value as HealthIssueSeverity

export function HealthIssueForm({
  disabled = false,
  onPendingChange,
  onSubmit,
}: HealthIssueFormProps) {
  const t = useT()

  const { healthIssueFormSchema } = createHealthIssueSchemas((key) =>
    t(`careValidation.${key}`),
  )
  const severityChoiceOptions = severityOptions.map((severity) => ({
    value: severity,
    label: t(`careLabels.severity.${severity}`),
  })) satisfies Array<{ value: HealthIssueSeverity; label: string }>
  const formId = useId()

  const submitting = useRef(false)
  const [failed, setFailed] = useState(false)
  const form = useForm<HealthIssueFormSchema>({
    resolver: zodResolver(healthIssueFormSchema),
    mode: 'onTouched',
    defaultValues: {
      title: '',
      description: '',
    },
  })

  useLocalizedValidation(form)

  const submitIssue = async (data: HealthIssueFormSchema) => {
    if (submitting.current) return
    submitting.current = true
    setFailed(false)
    onPendingChange?.(true)
    try {
      await onSubmit(data)
      form.reset()
    } catch {
      setFailed(true)
    } finally {
      submitting.current = false
      onPendingChange?.(false)
    }
  }

  return (
    <InlineForm noValidate onSubmit={form.handleSubmit(submitIssue)}>
      <FieldGrid>
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${formId}-${field.name}`}>
                {t('careRecords.issueTitle')}
              </FieldLabel>
              <Input
                aria-required={[
                  'title',
                  'medicationName',
                  'dosage',
                  'startDate',
                ].includes(field.name)}
                {...field}
                id={`${formId}-${field.name}`}
                disabled={disabled || form.formState.isSubmitting}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid
                    ? `${formId}-${field.name}-error`
                    : undefined
                }
                placeholder={t('careRecords.issueExample')}
                autoComplete="off"
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
          name="severity"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t('careRecords.severityOptional')}</FieldLabel>
              <ChoiceButtonGroup
                aria-label={t('careRecords.severityOptional')}
                value={field.value}
                options={severityChoiceOptions}
                onValueChange={(nextValue) =>
                  field.onChange(asSeverity(nextValue))
                }
                disabled={disabled || form.formState.isSubmitting}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid
                    ? `${formId}-${field.name}-error`
                    : undefined
                }
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
        name="description"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`${formId}-${field.name}`}>
              {t('careRecords.descriptionOptional')}
            </FieldLabel>
            <Textarea
              {...field}
              id={`${formId}-${field.name}`}
              disabled={disabled || form.formState.isSubmitting}
              aria-invalid={fieldState.invalid}
              aria-describedby={
                fieldState.invalid ? `${formId}-${field.name}-error` : undefined
              }
              placeholder={t('careRecords.issueDescription')}
              autoComplete="off"
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

      <FormSubmissionError
        message={failed ? t('careRecords.saveFailed') : undefined}
      />

      <FormSubmitActions
        isSubmitting={form.formState.isSubmitting}
        disabled={disabled}
        submitLabel={t('careRecords.addIssue')}
        submittingLabel={t('careRecords.adding')}
      />
    </InlineForm>
  )
}
