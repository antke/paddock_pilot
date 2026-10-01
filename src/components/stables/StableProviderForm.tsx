import { useLocalizedValidation } from '#/i18n/useLocalizedValidation'
import { useT } from '#/i18n/LocaleProvider'
import { useId, useRef, useState } from 'react'
import { RouteStatusAlert } from '#/components/layout/RouteStatusAlert'
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
  createStableProviderSchemas,
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

export function StableProviderForm({
  provider,
  onSubmit,
  onCancel,
}: StableProviderFormProps) {
  const t = useT()
  const providerTypeOptions = stableProviderTypes.map((type) => ({
    value: type,
    label: t(`stables.providerTypes.${type}`),
  }))

  const formId = useId()
  const submitting = useRef(false)
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState(false)
  const form = useForm<StableProviderFormSchema>({
    resolver: zodResolver(
      createStableProviderSchemas((key) =>
        t(`stables.providerValidation.${key}`),
      ).stableProviderFormSchema,
    ),
    mode: 'onTouched',
    defaultValues: {
      type: provider?.type ?? 'vet',
      name: provider?.name ?? '',
      phone: provider?.phone ?? '',
      email: provider?.email ?? '',
      notes: provider?.notes ?? '',
    },
  })

  useLocalizedValidation(form)

  const submit = async (values: StableProviderFormSchema) => {
    if (submitting.current) return
    submitting.current = true
    setSaving(true)
    setFailed(false)
    try {
      await onSubmit(values)
      if (!provider) form.reset()
    } catch {
      setFailed(true)
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  return (
    <InlineForm noValidate onSubmit={form.handleSubmit(submit)}>
      {failed && (
        <RouteStatusAlert
          tone="danger"
          title={t('stables.providerSaveFailed')}
          description={t('stables.providerSaveFailedHelp')}
        />
      )}
      <Controller
        name="type"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>{t('stables.providerType')}</FieldLabel>
            <ChoiceButtonGroup
              value={field.value}
              options={providerTypeOptions}
              disabled={saving || form.formState.isSubmitting}
              aria-label={t('stables.providerType')}
              aria-describedby={
                fieldState.invalid ? `${formId}-type-error` : undefined
              }
              aria-invalid={fieldState.invalid}
              onValueChange={(value) => field.onChange(asProviderType(value))}
            />
            {fieldState.invalid && (
              <FieldError
                id={`${formId}-type-error`}
                errors={[fieldState.error]}
              />
            )}
          </Field>
        )}
      />

      <FieldGrid>
        <Field data-invalid={Boolean(form.formState.errors.name)}>
          <FieldLabel htmlFor={`${formId}-name`}>
            {t('stables.personName')}
          </FieldLabel>
          <Input
            id={`${formId}-name`}
            autoFocus
            type="text"
            autoComplete="off"
            placeholder={t('stables.providerName')}
            disabled={saving || form.formState.isSubmitting}
            aria-invalid={Boolean(form.formState.errors.name)}
            aria-describedby={
              form.formState.errors.name ? `${formId}-name-error` : undefined
            }
            {...form.register('name')}
          />
          {form.formState.errors.name && (
            <FieldError
              id={`${formId}-name-error`}
              errors={[form.formState.errors.name]}
            />
          )}
        </Field>

        <Field data-invalid={Boolean(form.formState.errors.phone)}>
          <FieldLabel htmlFor={`${formId}-phone`}>
            {t('stables.phone')}
          </FieldLabel>
          <Input
            id={`${formId}-phone`}
            type="tel"
            autoComplete="off"
            placeholder={t('stables.contactNumber')}
            disabled={saving || form.formState.isSubmitting}
            aria-invalid={Boolean(form.formState.errors.phone)}
            aria-describedby={
              form.formState.errors.phone ? `${formId}-phone-error` : undefined
            }
            {...form.register('phone')}
          />
          {form.formState.errors.phone && (
            <FieldError
              id={`${formId}-phone-error`}
              errors={[form.formState.errors.phone]}
            />
          )}
        </Field>
      </FieldGrid>

      <Field data-invalid={Boolean(form.formState.errors.email)}>
        <FieldLabel htmlFor={`${formId}-email`}>
          {t('stables.email')}
        </FieldLabel>
        <Input
          id={`${formId}-email`}
          type="email"
          autoComplete="off"
          placeholder={t('stables.optionalEmail')}
          disabled={saving || form.formState.isSubmitting}
          aria-invalid={Boolean(form.formState.errors.email)}
          aria-describedby={
            form.formState.errors.email ? `${formId}-email-error` : undefined
          }
          {...form.register('email')}
        />
        {form.formState.errors.email && (
          <FieldError
            id={`${formId}-email-error`}
            errors={[form.formState.errors.email]}
          />
        )}
      </Field>

      <Field data-invalid={Boolean(form.formState.errors.notes)}>
        <FieldLabel htmlFor={`${formId}-notes`}>
          {t('stables.notes')}
        </FieldLabel>
        <Textarea
          id={`${formId}-notes`}
          autoComplete="off"
          placeholder={t('stables.providerNotesPlaceholder')}
          disabled={saving || form.formState.isSubmitting}
          aria-invalid={Boolean(form.formState.errors.notes)}
          aria-describedby={
            form.formState.errors.notes ? `${formId}-notes-error` : undefined
          }
          {...form.register('notes')}
        />
        {form.formState.errors.notes && (
          <FieldError
            id={`${formId}-notes-error`}
            errors={[form.formState.errors.notes]}
          />
        )}
      </Field>

      <FormSubmitActions
        isSubmitting={saving || form.formState.isSubmitting}
        onCancel={onCancel}
        submitLabel={t('stables.saveProvider')}
        submittingLabel={t('stables.savingDots')}
      />
    </InlineForm>
  )
}
