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
import { useId, useRef, useState } from 'react'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Controller, useForm } from 'react-hook-form'
import { stableInvitationSchema } from 'shared/stableInvitations/invitationSchema'
import type { StableInvitationInput } from 'shared/stableInvitations/invitationSchema'
import { getInvitationUrl } from 'shared/stableInvitations/invitationState'

type StableInviteFormProps = {
  stableId: Id<'stables'>
  onCreated?: () => void
  onPendingChange?: (pending: boolean) => void
}

export function StableInviteForm({
  stableId,
  onCreated,
  onPendingChange,
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
  const onInvite = async (values: StableInvitationInput) => {
    try {
      const result = await createInvitation({ stableId, ...values })
      showAppSuccessToast({
        title: 'Invitation created',
        description: <p>The email is queued for {values.email}.</p>,
        action: {
          label: 'Copy link',
          onClick: () => copyInvitation(result.token),
        },
      })
      return true
    } catch {
      showAppErrorToast()
      return false
    }
  }
  return (
    <StableInviteFormView
      onInvite={onInvite}
      onCreated={onCreated}
      onPendingChange={onPendingChange}
    />
  )
}

export function StableInviteFormView({
  onInvite,
  onCreated,
  onPendingChange,
}: {
  onInvite: (values: StableInvitationInput) => Promise<boolean>
  onCreated?: () => void
  onPendingChange?: (pending: boolean) => void
}) {
  const formId = useId()
  const pendingRef = useRef(false)
  const [isPending, setIsPending] = useState(false)
  const [inviteError, setInviteError] = useState(false)
  const form = useForm<StableInvitationInput>({
    resolver: zodResolver(stableInvitationSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      role: 'member',
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    if (pendingRef.current) return
    pendingRef.current = true
    setIsPending(true)
    setInviteError(false)
    onPendingChange?.(true)
    try {
      if (await onInvite(values)) {
        form.reset()
        onCreated?.()
      } else setInviteError(true)
    } catch {
      setInviteError(true)
    } finally {
      pendingRef.current = false
      setIsPending(false)
      onPendingChange?.(false)
    }
  })

  return (
    <InlineForm
      gap="compact"
      layout="invite"
      className="sm:gap-y-2"
      onSubmit={onSubmit}
    >
      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field
            className="sm:row-span-3 sm:grid sm:grid-rows-subgrid"
            data-invalid={fieldState.invalid}
          >
            <FieldLabel htmlFor={`${formId}-${field.name}`}>
              Email address
            </FieldLabel>
            <Input
              {...field}
              id={`${formId}-${field.name}`}
              type="email"
              autoComplete="email"
              placeholder="member@example.com"
              disabled={form.formState.isSubmitting || isPending}
              aria-invalid={fieldState.invalid}
              aria-describedby={
                fieldState.invalid ? `${formId}-${field.name}-error` : undefined
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

      <div className="grid sm:col-start-2 sm:row-start-2">
        <FormSubmitButtons
          isSubmitting={form.formState.isSubmitting || isPending}
          submitLabel="Invite"
          submittingLabel="Inviting..."
        />
      </div>
      {inviteError && (
        <Alert variant="destructive" className="sm:col-span-2">
          <AlertDescription>
            Could not create the invitation. Check the email address and try
            again.
          </AlertDescription>
        </Alert>
      )}
    </InlineForm>
  )
}
