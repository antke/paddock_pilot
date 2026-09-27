import { useId, useRef } from 'react'
import { InlineForm } from '#/components/forms/FormLayout'
import { FormSubmissionError } from '#/components/forms/FormSubmissionError'
import { FormSubmitActions } from '#/components/forms/FormSubmitActions'
import { ChoiceButtonGroup } from '#/components/ui/choice-button-group'
import { Field, FieldError, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { healthIssueFormSchema } from 'shared/horses/healthIssueSchema'
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

const severityChoiceOptions = severityOptions.map((severity) => ({
  value: severity,
  label: horseHealthIssueSeverityLabels[severity],
})) satisfies Array<{ value: HealthIssueSeverity; label: string }>

export function HealthIssueForm({
  disabled = false,
  onPendingChange,
  onSubmit,
}: HealthIssueFormProps) {
  const formId = useId()
  const submitting = useRef(false)
  const form = useForm<HealthIssueFormSchema>({
    resolver: zodResolver(healthIssueFormSchema),
    mode: 'onTouched',
    defaultValues: {
      title: '',
      description: '',
    },
  })

  const submitIssue = async (data: HealthIssueFormSchema) => {
    if (submitting.current) return
    submitting.current = true
    form.clearErrors('root')
    onPendingChange?.(true)
    try {
      await onSubmit(data)
      form.reset()
    } catch {
      form.setError('root', {
        message:
          'Could not save this record. Your entries are still here; please try again.',
      })
    } finally {
      submitting.current = false
      onPendingChange?.(false)
    }
  }

  return (
    <InlineForm onSubmit={form.handleSubmit(submitIssue)}>
      <FieldGrid>
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${formId}-${field.name}`}>
                Issue title
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
                placeholder="Chipped hoof, food intolerance..."
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
              <FieldLabel>Severity (optional)</FieldLabel>
              <ChoiceButtonGroup
                aria-label="Severity (optional)"
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
              Description (optional)
            </FieldLabel>
            <Textarea
              {...field}
              id={`${formId}-${field.name}`}
              disabled={disabled || form.formState.isSubmitting}
              aria-invalid={fieldState.invalid}
              aria-describedby={
                fieldState.invalid ? `${formId}-${field.name}-error` : undefined
              }
              placeholder="What should other owners, stable admins, vets, or farriers know?"
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

      <FormSubmissionError message={form.formState.errors.root?.message} />

      <FormSubmitActions
        isSubmitting={form.formState.isSubmitting}
        disabled={disabled}
        submitLabel="Add issue"
        submittingLabel="Adding..."
      />
    </InlineForm>
  )
}
