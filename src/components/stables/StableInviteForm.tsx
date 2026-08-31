import { InlineForm } from '#/components/forms/FormLayout'
import { FormSubmitButtons } from '#/components/forms/FormSubmitActions'
import { Field, FieldError, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { copyTextToClipboard } from '#/lib/clipboard'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { Controller, useForm } from 'react-hook-form'
import { stableInvitationSchema } from 'shared/stableInvitations/invitationSchema'
import type { StableInvitationInput } from 'shared/stableInvitations/invitationSchema'
import { getInvitationUrl } from 'shared/stableInvitations/invitationState'

type StableInviteFormProps = {
  stableId: Id<'stables'>
  onCreated?: () => void
}

export function StableInviteForm({
  stableId,
  onCreated,
}: StableInviteFormProps) {
  const createInvitation = useMutation(api.stableInvitations.create)
  const copyInvitation = async (token: string) => {
    try {
      await copyTextToClipboard(getInvitationUrl(window.location.origin, token))
      showAppSuccessToast({ title: 'Invitation link copied' })
    } catch {
      showAppErrorToast({ title: 'Could not copy invitation link' })
    }
  }
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
      const result = await createInvitation({
        stableId,
        email: values.email,
        role: values.role,
      })
      form.reset()
      onCreated?.()
      showAppSuccessToast({
        title: 'Invitation created',
        description: <p>The email is queued for {values.email}.</p>,
        action: {
          label: 'Copy link',
          onClick: () => copyInvitation(result.token),
        },
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
            <FieldLabel htmlFor={field.name}>Email address</FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="email"
              autoComplete="email"
              placeholder="member@example.com"
              disabled={form.formState.isSubmitting}
              aria-invalid={fieldState.invalid}
            />
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
