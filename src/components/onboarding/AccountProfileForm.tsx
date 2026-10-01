import { useLocalizedValidation } from '#/i18n/useLocalizedValidation'
import { useT } from '#/i18n/LocaleProvider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from 'convex/react'
import { Controller, useForm } from 'react-hook-form'
import { useId, useRef, useState } from 'react'
import { createAccountProfileSchema } from './accountProfileSchema'
import type { AccountProfileValues } from './accountProfileSchema'
import { FormSubmissionError } from '#/components/forms/FormSubmissionError'
import type { Id } from 'convex/_generated/dataModel'

import { FileUploadField } from '#/components/forms/FileUploadField'
import { InlineForm } from '#/components/forms/FormLayout'
import { FormSubmitActions } from '#/components/forms/FormSubmitActions'
import { UserAvatar } from '#/components/users/UserAvatar'
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

export type { AccountProfileValues } from './accountProfileSchema'

type AccountProfileFormProps = {
  initialValues: {
    displayName: string
    phone?: string
    profileImageUrl?: string
  }
  onSaved: () => void | Promise<void>
  submitLabel?: string
  onPendingChange?: (pending: boolean) => void
}

export function AccountProfileForm(props: AccountProfileFormProps) {
  const t = useT()
  const updateProfile = useMutation(api.onboarding.updateAccountProfile)
  const generateUploadUrl = useMutation(
    api.onboarding.generateProfileImageUploadUrl,
  )

  const uploadProfileImage = async (file?: File) => {
    if (!file) return undefined

    const { uploadUrl, uploadToken } = await generateUploadUrl()
    const result = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    })

    if (!result.ok) throw new Error('Failed to upload profile image')

    const { storageId } = (await result.json()) as {
      storageId: Id<'_storage'>
    }

    return { storageId, uploadToken }
  }

  const onSave = async (values: AccountProfileValues) => {
    try {
      const profileImageUpload = await uploadProfileImage(
        values.profileImage?.item(0) ?? undefined,
      )
      await updateProfile({
        preferredName: values.preferredName,
        phone: values.phone || undefined,
        profileImageId: profileImageUpload?.storageId,
        profileUploadToken: profileImageUpload?.uploadToken,
      })
      return true
    } catch {
      showAppErrorToast({ title: t('profileForm.saveFailedTitle') })
      return false
    }
  }
  return <AccountProfileFormView {...props} onSave={onSave} />
}

export function AccountProfileFormView({
  initialValues,
  onSaved,
  onSave,
  onPendingChange,
  submitLabel,
}: AccountProfileFormProps & {
  onSave: (values: AccountProfileValues) => Promise<void | boolean>
}) {
  const t = useT()
  const formId = useId()
  const pending = useRef(false)
  const [isPending, setIsPending] = useState(false)
  const [continuationFailed, setContinuationFailed] = useState(false)
  const [error, setError] = useState<
    'profileForm.saveFailed' | 'profileForm.continueFailed'
  >()
  const form = useForm<AccountProfileValues>({
    resolver: zodResolver(createAccountProfileSchema(t)),
    mode: 'onTouched',
    defaultValues: {
      preferredName: initialValues.displayName,
      phone: initialValues.phone ?? '',
      profileImage: undefined,
    },
  })
  useLocalizedValidation(form)
  const onSubmit = async (values: AccountProfileValues) => {
    if (pending.current) return
    pending.current = true
    setIsPending(true)
    onPendingChange?.(true)
    setError(undefined)
    try {
      if (!continuationFailed) {
        try {
          const acknowledged = await onSave(values)
          if (acknowledged === false)
            throw new Error('Profile not acknowledged')
        } catch {
          setError('profileForm.saveFailed')
          return
        }
        form.reset({
          preferredName: values.preferredName,
          phone: values.phone ?? '',
          profileImage: undefined,
        })
      }
      try {
        await onSaved()
        setContinuationFailed(false)
      } catch {
        setContinuationFailed(true)
        setError('profileForm.continueFailed')
      }
    } finally {
      pending.current = false
      setIsPending(false)
      onPendingChange?.(false)
    }
  }
  const fieldsDisabled = isPending || continuationFailed

  return (
    <InlineForm
      data-slot="account-profile-form"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="grid gap-4 border-b border-border-subtle pb-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
        <UserAvatar
          name={form.watch('preferredName') || initialValues.displayName}
          photoUrl={initialValues.profileImageUrl}
        />
        <div className="grid gap-1">
          <p className="font-semibold">
            {form.watch('preferredName') || initialValues.displayName}
          </p>
          <FieldDescription>{t('profileForm.shared')}</FieldDescription>
        </div>
      </div>

      <FieldGrid>
        <Controller
          name="preferredName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${formId}-${field.name}`}>
                {t('profileForm.preferredName')}
              </FieldLabel>
              <Input
                {...field}
                id={`${formId}-${field.name}`}
                autoComplete="name"
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid
                    ? `${formId}-${field.name}-error`
                    : undefined
                }
                disabled={fieldsDisabled}
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

        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${formId}-${field.name}`}>
                {t('profileForm.phone')}
              </FieldLabel>
              <Input
                {...field}
                id={`${formId}-${field.name}`}
                type="tel"
                autoComplete="tel"
                placeholder={t('profileForm.optional')}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid
                    ? `${formId}-${field.name}-error`
                    : undefined
                }
                disabled={fieldsDisabled}
              />
            </Field>
          )}
        />
      </FieldGrid>

      <Controller
        name="profileImage"
        control={form.control}
        render={({ field, fieldState }) => (
          <FileUploadField
            id={`${formId}-${field.name}`}
            kind="image"
            accept="image/*"
            label={t('profileForm.imageLabel')}
            uploadLabel={t('profileForm.imageUpload')}
            uploadDescription={t('profileForm.imageDescription')}
            help={t('profileForm.imageHelp')}
            errors={fieldState.error ? [fieldState.error] : undefined}
            files={field.value ?? null}
            onFilesChange={(files) => field.onChange(files ?? undefined)}
            controlRef={field.ref}
            disabled={fieldsDisabled}
            width="full"
          />
        )}
      />

      <FormSubmissionError message={error ? t(error) : undefined} />
      <FormSubmitActions
        align="end"
        isSubmitting={isPending}
        submitLabel={
          continuationFailed
            ? t('profileForm.retryContinue')
            : (submitLabel ?? t('profileForm.continue'))
        }
        submittingLabel={t('profileForm.saving')}
      />
    </InlineForm>
  )
}
