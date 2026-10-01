import { useLocalizedValidation } from '#/i18n/useLocalizedValidation'
import { useT } from '#/i18n/LocaleProvider'
import { InlineForm } from '#/components/forms/FormLayout'
import { FormSubmitActions } from '#/components/forms/FormSubmitActions'
import { Field, FieldError, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { Textarea } from '#/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useId, useRef, useState } from 'react'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Controller, useForm } from 'react-hook-form'
import { createStableMemberSchemas } from 'shared/stables/stableMemberSchema'
import type { StableMemberDetailsFormSchema } from 'shared/stables/stableMemberSchema'

type StableMemberDetailsFormProps = {
  member: Doc<'stableMembers'>
  onCancel: () => void
  cancelLabel?: string
  onSaved: () => void
  onPendingChange?: (pending: boolean) => void
}

export function StableMemberDetailsForm({
  member,
  onCancel,
  cancelLabel,
  onSaved,
  onPendingChange,
}: StableMemberDetailsFormProps) {
  const t = useT()

  const updateDetails = useMutation(api.stableMembers.updateDetails)
  const onSave = async (data: StableMemberDetailsFormSchema) => {
    try {
      await updateDetails({ id: member._id, ...data })
      showAppSuccessToast({ title: t('onboarding.memberUpdated') })
      return true
    } catch {
      showAppErrorToast({ title: t('onboarding.memberSaveFailed') })
      return false
    }
  }

  return (
    <StableMemberDetailsFormView
      member={member}
      onSave={onSave}
      onCancel={onCancel}
      cancelLabel={cancelLabel}
      onSaved={onSaved}
      onPendingChange={onPendingChange}
    />
  )
}

type StableMemberDetailsFormViewProps = StableMemberDetailsFormProps & {
  onSave: (values: StableMemberDetailsFormSchema) => Promise<boolean>
}

// Identity-bound defaults prevent edits from carrying across members.
export function StableMemberDetailsFormView(
  props: StableMemberDetailsFormViewProps,
) {
  return <MemberDetailsFields key={props.member._id} {...props} />
}

function MemberDetailsFields({
  member,
  onSave,
  onCancel,
  cancelLabel,
  onSaved,
  onPendingChange,
}: StableMemberDetailsFormViewProps) {
  const t = useT()

  const formId = useId()
  const pendingRef = useRef(false)
  const [isPending, setIsPending] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const form = useForm<StableMemberDetailsFormSchema>({
    resolver: zodResolver(
      createStableMemberSchemas((key) => t(`stableValidation.${key}`))
        .stableMemberDetailsFormSchema,
    ),
    mode: 'onTouched',
    defaultValues: {
      displayNameOverride: member.displayNameOverride ?? '',
      phone: member.phone ?? '',
      emergencyContact: member.emergencyContact ?? '',
    },
  })
  useLocalizedValidation(form)

  const onSubmit = async (data: StableMemberDetailsFormSchema) => {
    if (pendingRef.current) return
    pendingRef.current = true
    setIsPending(true)
    setSaveError(false)
    onPendingChange?.(true)
    try {
      if (await onSave(data)) onSaved()
      else setSaveError(true)
    } catch {
      setSaveError(true)
    } finally {
      pendingRef.current = false
      setIsPending(false)
      onPendingChange?.(false)
    }
  }

  return (
    <InlineForm gap="tight" onSubmit={form.handleSubmit(onSubmit)}>
      {saveError && (
        <Alert variant="destructive">
          <AlertDescription>
            {t('onboarding.memberSaveFailed')}
          </AlertDescription>
        </Alert>
      )}
      <FieldGrid gap="compact">
        <Controller
          name="displayNameOverride"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${formId}-${field.name}`}>
                {t('onboarding.yardDisplayName')}
              </FieldLabel>
              <Input
                {...field}
                id={`${formId}-${field.name}`}
                disabled={form.formState.isSubmitting || isPending}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid
                    ? `${formId}-${field.name}-error`
                    : undefined
                }
                placeholder={t('onboarding.yardNamePlaceholder')}
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
                {t('onboarding.phone')}
              </FieldLabel>
              <Input
                {...field}
                id={`${formId}-${field.name}`}
                type="tel"
                disabled={form.formState.isSubmitting || isPending}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid
                    ? `${formId}-${field.name}-error`
                    : undefined
                }
                placeholder={t('onboarding.memberPhonePlaceholder')}
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
      </FieldGrid>

      <Controller
        name="emergencyContact"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`${formId}-${field.name}`}>
              {t('onboarding.emergencyContact')}
            </FieldLabel>
            <Textarea
              {...field}
              id={`${formId}-${field.name}`}
              disabled={form.formState.isSubmitting || isPending}
              aria-invalid={fieldState.invalid}
              aria-describedby={
                fieldState.invalid ? `${formId}-${field.name}-error` : undefined
              }
              placeholder={t('onboarding.emergencyContactPlaceholder')}
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

      <FormSubmitActions
        isSubmitting={form.formState.isSubmitting || isPending}
        onCancel={onCancel}
        cancelLabel={cancelLabel}
        submitLabel={t('onboarding.saveDetails')}
        submittingLabel={t('onboarding.saving')}
      />
    </InlineForm>
  )
}
