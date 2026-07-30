import { InlineForm } from '#/components/forms/FormLayout'
import { FormSubmitButtons } from '#/components/forms/FormSubmitActions'
import { Field, FieldError, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Select } from '#/components/ui/select'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { Controller, useForm } from 'react-hook-form'
import {
  stableInvitationRoleLabels,
  stableInvitationRoles,
  stableInvitationSchema,
} from 'shared/stableInvitations/invitationSchema'
import type { StableInvitationInput } from 'shared/stableInvitations/invitationSchema'

type StableInviteFormProps = {
  stableId: Id<'stables'>
  onCreated?: () => void
}

export function StableInviteForm({
  stableId,
  onCreated,
}: StableInviteFormProps) {
  const createInvitation = useMutation(api.stableInvitations.create)
  const form = useForm<StableInvitationInput>({
    resolver: zodResolver(stableInvitationSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      role: 'member',
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createInvitation({
        stableId,
        email: values.email,
        role: values.role,
      })
      form.reset()
      onCreated?.()
      showAppSuccessToast({
        title: 'Invitation sent',
        description: <p>{values.email} has been invited.</p>,
      })
    } catch {
      showAppErrorToast()
    }
  })

  return (
    <InlineForm gap="compact" layout="invite" onSubmit={onSubmit}>
      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel className="sr-only" htmlFor={field.name}>
              Email address
            </FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="email"
              placeholder="member@example.com"
              disabled={form.formState.isSubmitting}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="role"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel className="sr-only" htmlFor={field.name}>
              Role
            </FieldLabel>
            <Select
              {...field}
              id={field.name}
              disabled={form.formState.isSubmitting}
              aria-invalid={fieldState.invalid}
            >
              {stableInvitationRoles.map((roleOption) => (
                <option key={roleOption} value={roleOption}>
                  {stableInvitationRoleLabels[roleOption]}
                </option>
              ))}
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <FormSubmitButtons
        isSubmitting={form.formState.isSubmitting}
        submitLabel="Invite"
        submittingLabel="Inviting..."
      />
    </InlineForm>
  )
}
