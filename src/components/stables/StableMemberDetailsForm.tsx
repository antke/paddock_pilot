import { Button } from '#/components/ui/button'
import { Field, FieldError, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { Controller, useForm } from 'react-hook-form'
import {
  stableMemberDetailsFormSchema
  
} from 'shared/stables/stableMemberSchema'
import type {StableMemberDetailsFormSchema} from 'shared/stables/stableMemberSchema';
import { toast } from 'sonner'

type StableMemberDetailsFormProps = {
  member: Doc<'stableMembers'>
  onCancel: () => void
  onSaved: () => void
}

export function StableMemberDetailsForm({
  member,
  onCancel,
  onSaved,
}: StableMemberDetailsFormProps) {
  const updateDetails = useMutation(api.stableMembers.updateDetails)
  const form = useForm<StableMemberDetailsFormSchema>({
    resolver: zodResolver(stableMemberDetailsFormSchema),
    mode: 'onTouched',
    defaultValues: {
      displayNameOverride: member.displayNameOverride ?? '',
      phone: member.phone ?? '',
      emergencyContact: member.emergencyContact ?? '',
    },
  })

  const onSubmit = async (data: StableMemberDetailsFormSchema) => {
    try {
      await updateDetails({
        id: member._id,
        displayNameOverride: data.displayNameOverride,
        phone: data.phone,
        emergencyContact: data.emergencyContact,
      })

      toast.success('Member details updated', { position: 'top-right' })
      onSaved()
    } catch (err) {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
      <div className="grid gap-3 md:grid-cols-2">
        <Controller
          name="displayNameOverride"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Yard display name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                disabled={form.formState.isSubmitting}
                aria-invalid={fieldState.invalid}
                placeholder="Name used around the yard"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Phone</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="tel"
                disabled={form.formState.isSubmitting}
                aria-invalid={fieldState.invalid}
                placeholder="Member phone number"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <Controller
        name="emergencyContact"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Emergency contact</FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              disabled={form.formState.isSubmitting}
              aria-invalid={fieldState.invalid}
              placeholder="Who should be contacted in an emergency?"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={form.formState.isSubmitting}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : 'Save details'}
        </Button>
      </div>
    </form>
  )
}
