import { Button } from '#/components/ui/button'
import {
  Field,
  FieldError,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Doc } from 'convex/_generated/dataModel'
import { useForm } from 'react-hook-form'
import {
  stableProviderFormSchema,
  stableProviderTypeLabels,
  stableProviderTypes
  
  
} from 'shared/stables/stableProviderSchema'
import type {StableProviderFormSchema, StableProviderType} from 'shared/stables/stableProviderSchema';

type StableProviderFormProps = {
  provider?: Doc<'stableProviders'>
  onSubmit: (values: StableProviderFormSchema) => Promise<void>
  onCancel?: () => void
}

const asProviderType = (value: string) => value as StableProviderType

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
    <form className="grid gap-5" onSubmit={form.handleSubmit(submit)}>
      <Field data-invalid={Boolean(form.formState.errors.type)}>
        <FieldLabel>Provider type</FieldLabel>
        <ToggleGroup
          value={[form.watch('type')]}
          onValueChange={(values) => {
            const nextValue = values.at(-1)
            if (nextValue) {
              form.setValue('type', asProviderType(nextValue), {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          }}
          variant="outline"
          className="flex-wrap"
        >
          {stableProviderTypes.map((type) => (
            <ToggleGroupItem key={type} value={type}>
              {stableProviderTypeLabels[type]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {form.formState.errors.type && (
          <FieldError errors={[form.formState.errors.type]} />
        )}
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field data-invalid={Boolean(form.formState.errors.name)}>
          <FieldLabel htmlFor="provider-name">Name</FieldLabel>
          <Input
            id="provider-name"
            type="text"
            autoComplete="off"
            placeholder="Provider name"
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
            {...form.register('phone')}
          />
          {form.formState.errors.phone && (
            <FieldError errors={[form.formState.errors.phone]} />
          )}
        </Field>
      </div>

      <Field data-invalid={Boolean(form.formState.errors.email)}>
        <FieldLabel htmlFor="provider-email">Email</FieldLabel>
        <Input
          id="provider-email"
          type="email"
          autoComplete="off"
          placeholder="Optional email"
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
          {...form.register('notes')}
        />
        {form.formState.errors.notes && (
          <FieldError errors={[form.formState.errors.notes]} />
        )}
      </Field>

      <div className="flex flex-wrap justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : 'Save provider'}
        </Button>
      </div>
    </form>
  )
}
