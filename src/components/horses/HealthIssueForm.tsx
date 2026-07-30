import { InlineForm } from '#/components/forms/FormLayout'
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
  onSubmit,
}: HealthIssueFormProps) {
  const form = useForm<HealthIssueFormSchema>({
    resolver: zodResolver(healthIssueFormSchema),
    mode: 'onTouched',
    defaultValues: {
      title: '',
      description: '',
    },
  })

  const submitIssue = async (data: HealthIssueFormSchema) => {
    await onSubmit(data)
    form.reset()
  }

  return (
    <InlineForm onSubmit={form.handleSubmit(submitIssue)}>
      <FieldGrid>
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Issue title</FieldLabel>
              <Input
                {...field}
                id={field.name}
                disabled={disabled || form.formState.isSubmitting}
                aria-invalid={fieldState.invalid}
                placeholder="Chipped hoof, food intolerance..."
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="severity"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Severity</FieldLabel>
              <ChoiceButtonGroup
                value={field.value}
                options={severityChoiceOptions}
                onValueChange={(nextValue) =>
                  field.onChange(asSeverity(nextValue))
                }
                disabled={disabled || form.formState.isSubmitting}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGrid>

      <Controller
        name="description"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Description</FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              disabled={disabled || form.formState.isSubmitting}
              aria-invalid={fieldState.invalid}
              placeholder="What should other owners, stable admins, vets, or farriers know?"
              autoComplete="off"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <FormSubmitActions
        isSubmitting={form.formState.isSubmitting}
        disabled={disabled}
        submitLabel="Add issue"
        submittingLabel="Adding..."
      />
    </InlineForm>
  )
}
