import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from 'convex/react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
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
import { showAppErrorToast } from '#/components/ui/sonner'
import { api } from 'convex/_generated/api'

const stableBasicsSchema = z.object({
  name: z.string().trim().min(1, 'Add the stable name.'),
  location: z.string().trim().min(1, 'Add the stable location.'),
})

type StableBasicsValues = z.infer<typeof stableBasicsSchema>

export function StableBasicsStep({
  stable,
  onSaved,
}: {
  stable?: Doc<'stables'>
  onSaved: (stableId: Id<'stables'>) => void | Promise<void>
}) {
  const addStable = useMutation(api.stables.add)
  const updateStable = useMutation(api.stables.updateBasics)
  const form = useForm<StableBasicsValues>({
    resolver: zodResolver(stableBasicsSchema),
    mode: 'onTouched',
    defaultValues: {
      name: stable?.name ?? '',
      location: stable?.location ?? '',
    },
  })

  const onSubmit = async (values: StableBasicsValues) => {
    try {
      const stableId = stable?._id ?? (await addStable(values))
      if (stable) await updateStable({ id: stable._id, ...values })
      await onSaved(stableId)
    } catch {
      showAppErrorToast({ title: 'Could not create the stable' })
    }
  }

  return (
    <InlineForm onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGrid>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Stable name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="Cedar Ridge Barn"
                autoComplete="organization"
                aria-invalid={fieldState.invalid}
                disabled={form.formState.isSubmitting}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="location"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Location</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="Hudson Valley, NY"
                autoComplete="address-level2"
                aria-invalid={fieldState.invalid}
                disabled={form.formState.isSubmitting}
              />
              <FieldDescription>
                A town, region or address people will recognise.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGrid>

      <FormSubmitActions
        align="end"
        isSubmitting={form.formState.isSubmitting}
        submitLabel={stable ? 'Save stable details' : 'Create stable and continue'}
        submittingLabel={stable ? 'Saving...' : 'Creating stable...'}
      />
    </InlineForm>
  )
}
