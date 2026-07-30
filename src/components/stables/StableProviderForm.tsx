import { InlineForm } from '#/components/forms/FormLayout'
import { FormSubmitActions } from '#/components/forms/FormSubmitActions'
import { ChoiceButtonGroup } from '#/components/ui/choice-button-group'
import { Field, FieldError, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Doc } from 'convex/_generated/dataModel'
import { Controller, useForm } from 'react-hook-form'
import {
  stableProviderFormSchema,
  stableProviderTypeLabels,
  stableProviderTypes,
} from 'shared/stables/stableProviderSchema'
import type {
  StableProviderFormSchema,
  StableProviderType,
} from 'shared/stables/stableProviderSchema'

type StableProviderFormProps = {
  provider?: Doc<'stableProviders'>
  onSubmit: (values: StableProviderFormSchema) => Promise<void>
  onCancel?: () => void
}

const asProviderType = (value: string) => value as StableProviderType
const providerTypeOptions = stableProviderTypes.map((type) => ({
  value: type,
  label: stableProviderTypeLabels[type],
}))

export function StableProviderForm({
  provider,
  onSubmit,
  onCancel,
}: StableProviderFormProps) {
  const form = useForm<StableProviderFormSchema>({
    resolver: zodResolver(stableProviderFormSchema),
    mode: 'onTouched',
    defaultValues: {
      type: provider?.type ?? 'vet',
      name: provider?.name ?? '',
      phone: provider?.phone ?? '',
      email: provider?.email ?? '',
      notes: provider?.notes ?? '',
    },
  })

  const submit = async (values: StableProviderFormSchema) => {
    await onSubmit(values)
    if (!provider) form.reset()
  }

  return (
    <InlineForm onSubmit={form.handleSubmit(submit)}>
      <Controller
        name="type"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Provider type</FieldLabel>
            <ChoiceButtonGroup
              value={field.value}
              options={providerTypeOptions}
              disabled={form.formState.isSubmitting}
              aria-invalid={fieldState.invalid}
              onValueChange={(value) => field.onChange(asProviderType(value))}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <FieldGrid>
        <Field data-invalid={Boolean(form.formState.errors.name)}>
          <FieldLabel htmlFor="provider-name">Name</FieldLabel>
          <Input
            id="provider-name"
            type="text"
            autoComplete="off"
            placeholder="Provider name"
            disabled={form.formState.isSubmitting}
            aria-invalid={Boolean(form.formState.errors.name)}
            {...form.register('name')}
          />
          {form.formState.errors.name && (
            <FieldError errors={[form.formState.errors.name]} />
          )}
        </Field>

        <Field data-invalid={Boolean(form.formState.errors.phone)}>
          <FieldLabel htmlFor="provider-phone">Phone</FieldLabel>
          <Input
            id="provider-phone"
            type="tel"
            autoComplete="off"
            placeholder="Contact number"
            disabled={form.formState.isSubmitting}
            aria-invalid={Boolean(form.formState.errors.phone)}
            {...form.register('phone')}
          />
          {form.formState.errors.phone && (
            <FieldError errors={[form.formState.errors.phone]} />
          )}
        </Field>
      </FieldGrid>

      <Field data-invalid={Boolean(form.formState.errors.email)}>
        <FieldLabel htmlFor="provider-email">Email</FieldLabel>
        <Input
          id="provider-email"
          type="email"
          autoComplete="off"
          placeholder="Optional email"
          disabled={form.formState.isSubmitting}
          aria-invalid={Boolean(form.formState.errors.email)}
          {...form.register('email')}
        />
        {form.formState.errors.email && (
          <FieldError errors={[form.formState.errors.email]} />
        )}
      </Field>

      <Field data-invalid={Boolean(form.formState.errors.notes)}>
        <FieldLabel htmlFor="provider-notes">Notes</FieldLabel>
        <Textarea
          id="provider-notes"
          autoComplete="off"
          placeholder="Specialisms, preferred booking details, or reminders"
          disabled={form.formState.isSubmitting}
          aria-invalid={Boolean(form.formState.errors.notes)}
          {...form.register('notes')}
        />
        {form.formState.errors.notes && (
          <FieldError errors={[form.formState.errors.notes]} />
        )}
      </Field>

      <FormSubmitActions
        isSubmitting={form.formState.isSubmitting}
        onCancel={onCancel}
        submitLabel="Save provider"
        submittingLabel="Saving..."
      />
    </InlineForm>
  )
}
