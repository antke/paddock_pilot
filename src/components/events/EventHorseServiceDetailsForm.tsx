import { InlineForm } from '#/components/forms/FormLayout'
import { FormSubmitActions } from '#/components/forms/FormSubmitActions'
import { Field, FieldError, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { eventHorseDetailsFormSchema } from 'shared/events/eventHorseDetailsSchema'
import type {
  EventHorseDetailsFormInput,
  EventHorseDetailsFormSchema,
} from 'shared/events/eventHorseDetailsSchema'

type EventHorseServiceDetailsFormProps = {
  defaultValues: EventHorseDetailsFormSchema
  onSubmit: (values: EventHorseDetailsFormSchema) => Promise<void>
  onCancel: () => void
}

export function EventHorseServiceDetailsForm({
  defaultValues,
  onSubmit,
  onCancel,
}: EventHorseServiceDetailsFormProps) {
  const form = useForm<
    EventHorseDetailsFormInput,
    unknown,
    EventHorseDetailsFormSchema
  >({
    resolver: zodResolver(eventHorseDetailsFormSchema),
    mode: 'onTouched',
    defaultValues,
  })

  return (
    <InlineForm gap="compact" onSubmit={form.handleSubmit(onSubmit)}>
      <Field
        data-invalid={Boolean(form.formState.errors.requestedServiceNotes)}
      >
        <FieldLabel htmlFor="requestedServiceNotes">Requested notes</FieldLabel>
        <Textarea
          id="requestedServiceNotes"
          {...form.register('requestedServiceNotes')}
          disabled={form.formState.isSubmitting}
          aria-invalid={Boolean(form.formState.errors.requestedServiceNotes)}
          placeholder="What should the provider check or do for this horse?"
        />
        <FieldError errors={[form.formState.errors.requestedServiceNotes]} />
      </Field>

      <Field data-invalid={Boolean(form.formState.errors.completionNotes)}>
        <FieldLabel htmlFor="completionNotes">Outcome notes</FieldLabel>
        <Textarea
          id="completionNotes"
          {...form.register('completionNotes')}
          disabled={form.formState.isSubmitting}
          aria-invalid={Boolean(form.formState.errors.completionNotes)}
          placeholder="What happened for this horse? Any aftercare or follow-up?"
        />
        <FieldError errors={[form.formState.errors.completionNotes]} />
      </Field>

      <FieldGrid>
        <Field data-invalid={Boolean(form.formState.errors.costShare)}>
          <FieldLabel htmlFor="costShare">Cost share</FieldLabel>
          <Input
            id="costShare"
            type="number"
            min={0}
            step="0.01"
            disabled={form.formState.isSubmitting}
            aria-invalid={Boolean(form.formState.errors.costShare)}
            placeholder="Optional amount for this horse"
            {...form.register('costShare', { valueAsNumber: true })}
          />
          <FieldError errors={[form.formState.errors.costShare]} />
        </Field>
      </FieldGrid>

      <FormSubmitActions
        isSubmitting={form.formState.isSubmitting}
        onCancel={onCancel}
        submitLabel="Save details"
        submittingLabel="Saving..."
      />
    </InlineForm>
  )
}
