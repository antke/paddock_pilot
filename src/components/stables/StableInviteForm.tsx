import { Select } from '#/components/ui/select'
import { useLocale, useT } from '#/i18n/LocaleProvider'
import { useLocalizedValidation } from '#/i18n/useLocalizedValidation'
import { isLocale } from '../../../shared/i18n/locale'
import type { Locale } from '../../../shared/i18n/locale'
import { InlineForm } from '#/components/forms/FormLayout'
import { FormSubmitButtons } from '#/components/forms/FormSubmitActions'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '#/components/ui/field'
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
import { createStableInvitationSchema } from 'shared/stableInvitations/invitationSchema'
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
  const t = useT()
  const createInvitation = useMutation(api.stableInvitations.create)
  const copyInvitation = async (token: string) => {
    try {
      await copyTextToClipboard(getInvitationUrl(window.location.origin, token))
      showAppSuccessToast({ title: t('invitations.linkCopied') })
    } catch {
      showAppErrorToast({ title: t('invitations.copyFailed') })
    }
  }
  const onInvite = async (
    values: StableInvitationInput & { locale?: Locale },
  ) => {
    try {
      const result = await createInvitation({ stableId, ...values })
      showAppSuccessToast({
        title: t('invitations.created'),
        description: <p>{t('invitations.queued', { email: values.email })}</p>,
        action: {
          label: t('invitations.copy'),
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
  onInvite: (
    values: StableInvitationInput & { locale?: Locale },
  ) => Promise<boolean>
  onCreated?: () => void
  onPendingChange?: (pending: boolean) => void
}) {
  const t = useT()
  const { locale } = useLocale()
  const [invitationLocale, setInvitationLocale] = useState<Locale>()
  const formId = useId()
  const pendingRef = useRef(false)
  const [isPending, setIsPending] = useState(false)
  const [inviteError, setInviteError] = useState(false)
  const form = useForm<StableInvitationInput>({
    resolver: zodResolver(
      createStableInvitationSchema(t('invitations.invalidEmail')),
    ),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      role: 'member',
    },
  })

  useLocalizedValidation(form)
  const onSubmit = form.handleSubmit(async (values) => {
    if (pendingRef.current) return
    pendingRef.current = true
    setIsPending(true)
    setInviteError(false)
    onPendingChange?.(true)
    try {
      if (await onInvite({ ...values, locale: invitationLocale ?? locale })) {
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
              {t('invitations.email')}
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

      <Field className="sm:col-span-2">
        <FieldLabel htmlFor={`${formId}-locale`}>
          {t('invitations.language')}
        </FieldLabel>
        <Select
          id={`${formId}-locale`}
          value={invitationLocale ?? locale}
          onChange={(event) => {
            if (isLocale(event.target.value))
              setInvitationLocale(event.target.value)
          }}
          disabled={isPending}
          aria-describedby={`${formId}-locale-help`}
        >
          <option value="en" lang="en">
            English
          </option>
          <option value="pl" lang="pl">
            Polski
          </option>
        </Select>
        <FieldDescription id={`${formId}-locale-help`}>
          {t('invitations.languageHelp')}
        </FieldDescription>
      </Field>

      <div className="grid sm:col-start-2 sm:row-start-2">
        <FormSubmitButtons
          isSubmitting={form.formState.isSubmitting || isPending}
          submitLabel={t('invitations.invite')}
          submittingLabel={t('invitations.inviting')}
        />
      </div>
      {inviteError && (
        <Alert variant="destructive" className="sm:col-span-2">
          <AlertDescription>{t('invitations.failed')}</AlertDescription>
        </Alert>
      )}
    </InlineForm>
  )
}
