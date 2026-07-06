import { Button } from '#/components/ui/button'
import { ChoiceButtonGroup } from '#/components/ui/choice-button-group'
import { Field, FieldError, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { healthIssueFormSchema } from 'shared/horses/healthIssueSchema'
import type {
  HealthIssueFormSchema,
  HealthIssueSeverity,
} from 'shared/horses/healthIssueSchema'

type HealthIssueFormProps = {
  disabled?: boolean
  onSubmit: (data: HealthIssueFormSchema) => Promise<void>
}

const severityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
} satisfies Record<HealthIssueSeverity, string>

const severityOptions = Object.keys(
  severityLabels,
) as Array<HealthIssueSeverity>

const asSeverity = (value: string) => value as HealthIssueSeverity

const severityChoiceOptions = severityOptions.map((severity) => ({
  value: severity,
  label: severityLabels[severity],
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
    <form className="grid gap-5" onSubmit={form.handleSubmit(submitIssue)}>
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
              placeholder="Chipped hoof, food intolerance, sensitive back..."
              autoComplete="off"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

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

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={disabled || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Adding...' : 'Add issue'}
        </Button>
      </div>
    </form>
  )
}
