import { useRecordCreationAudience } from '#/components/sharing/useRecordCreationAudience'
import type { RecordCreationOptions } from '#/components/sharing/useRecordCreationAudience'
import { useTransientConfirmation } from '#/lib/useTransientConfirmation'
import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import { useLocalizedValidation } from '#/i18n/useLocalizedValidation'
import { useT } from '#/i18n/LocaleProvider'
import { InlineForm } from '#/components/forms/FormLayout'
import { FormSubmitActions } from '#/components/forms/FormSubmitActions'
import { FileUploadField } from '#/components/forms/FileUploadField'
import { Field, FieldError, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Select } from '#/components/ui/select'
import { Textarea } from '#/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Id } from 'convex/_generated/dataModel'
import { useEffect, useId, useRef, useState } from 'react'
import { FormSubmissionError } from '#/components/forms/FormSubmissionError'
import { Controller, useForm } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import {
  createStableDocumentSchemas,
  stableDocumentTypes,
} from 'shared/stables/stableDocumentSchema'
import type { StableDocumentFormSchema } from 'shared/stables/stableDocumentSchema'

export type DocumentUploadValues = Omit<StableDocumentFormSchema, 'horseId'> &
  RecordCreationOptions & {
    horseId?: string
  }

type HorseOption = {
  _id: Id<'horses'>
  name: string
}

type DocumentUploadFormProps = {
  enableSharing?: boolean
  horseOptions?: Array<HorseOption>
  fixedHorseId?: Id<'horses'>
  onSubmit: (values: DocumentUploadValues) => Promise<void>
  onPendingChange?: (pending: boolean) => void
}

export function DocumentUploadForm({
  enableSharing = false,
  horseOptions = [],
  fixedHorseId,
  onSubmit,
  onPendingChange,
}: DocumentUploadFormProps) {
  const t = useT()

  const { stableDocumentFormSchema } = createStableDocumentSchemas((key) =>
    t(`documents.validation.${key}`),
  )
  const formId = useId()
  const confirmation = useTransientConfirmation(formId)
  const pending = useRef(false)
  const mounted = useRef(false)
  const pendingCallback = useRef(onPendingChange)
  pendingCallback.current = onPendingChange
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      pendingCallback.current?.(false)
    }
  }, [])
  const [isPending, setIsPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const form = useForm<StableDocumentFormSchema>({
    resolver: zodResolver(stableDocumentFormSchema),
    mode: 'onTouched',
    defaultValues: {
      horseId: fixedHorseId ?? '',
      type: 'other',
      fileName: '',
      notes: '',
    },
  })
  const audience = useRecordCreationAudience(
    enableSharing
      ? ((fixedHorseId ?? (form.watch('horseId') || undefined)) as
          Id<'horses'> | undefined)
      : undefined,
  )
  useLocalizedValidation(form)
  const selectedFile = form.watch('file')?.item(0)
  const showHorseSelect = !fixedHorseId && horseOptions.length > 0

  useEffect(() => {
    if (!selectedFile || form.getValues('fileName')) return

    form.setValue('fileName', selectedFile.name, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }, [form, selectedFile])

  const submit = async (values: StableDocumentFormSchema) => {
    if (pending.current) return
    pending.current = true
    setIsPending(true)
    setFailed(false)
    confirmation.clear()
    onPendingChange?.(true)
    try {
      await onSubmit({
        ...values,
        ...(enableSharing ? audience.options : {}),
        horseId: (fixedHorseId ?? values.horseId) || undefined,
      })
      if (!mounted.current) return
      audience.reset()
      form.reset({
        horseId: fixedHorseId ?? '',
        type: values.type,
        file: undefined,
        fileName: '',
        notes: '',
      })
      confirmation.confirm()
    } catch {
      if (mounted.current) setFailed(true)
    } finally {
      pending.current = false
      if (mounted.current) {
        setIsPending(false)
        pendingCallback.current?.(false)
      }
    }
  }

  return (
    <InlineForm
      onChangeCapture={confirmation.clear}
      noValidate
      onSubmit={form.handleSubmit(submit)}
    >
      {audience.control}
      <FormSubmissionError
        message={failed ? t('documents.saveFailed') : undefined}
      />
      <DocumentFileField
        formId={formId}
        control={form.control}
        disabled={form.formState.isSubmitting || isPending}
      />

      <FieldGrid>
        <Controller
          name="fileName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${formId}-${field.name}`}>
                {t('documents.name')}
              </FieldLabel>
              <Input
                aria-required="true"
                {...field}
                id={`${formId}-${field.name}`}
                disabled={form.formState.isSubmitting || isPending}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid
                    ? `${formId}-${field.name}-error`
                    : undefined
                }
                placeholder={t('documents.nameExample')}
                autoComplete="off"
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

        <DocumentTypeField
          formId={formId}
          control={form.control}
          disabled={form.formState.isSubmitting || isPending}
        />
      </FieldGrid>

      {showHorseSelect && (
        <FieldGrid>
          <Controller
            name="horseId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${formId}-${field.name}`}>
                  {t('documents.horseOptional')}
                </FieldLabel>
                <Select
                  {...field}
                  id={`${formId}-${field.name}`}
                  disabled={form.formState.isSubmitting || isPending}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid
                      ? `${formId}-${field.name}-error`
                      : undefined
                  }
                >
                  <option value="">{t('documents.stableWideDocument')}</option>
                  {horseOptions.map((horse) => (
                    <option key={horse._id} value={horse._id}>
                      {getHorseDisplayName(horse)}
                    </option>
                  ))}
                </Select>
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
      )}

      <Controller
        name="notes"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`${formId}-${field.name}`}>
              {t('documents.notesOptional')}
            </FieldLabel>
            <Textarea
              {...field}
              id={`${formId}-${field.name}`}
              disabled={form.formState.isSubmitting || isPending}
              aria-invalid={fieldState.invalid}
              aria-describedby={
                fieldState.invalid ? `${formId}-${field.name}-error` : undefined
              }
              placeholder={t('documents.notesExample')}
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
        failed={failed}
        confirmed={confirmation.confirmed}
        confirmedLabel={t('common.saved')}
        isSubmitting={form.formState.isSubmitting || isPending}
        submitLabel={t('documents.add')}
        submittingLabel={t('documents.uploading')}
        sticky
      />
    </InlineForm>
  )
}

function DocumentTypeField({
  formId,
  control,
  disabled,
}: {
  formId: string
  control: Control<StableDocumentFormSchema>
  disabled: boolean
}) {
  const t = useT()
  return (
    <Controller
      name="type"
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={`${formId}-${field.name}`}>
            {t('documents.type')}
          </FieldLabel>
          <Select
            aria-required="true"
            {...field}
            id={`${formId}-${field.name}`}
            disabled={disabled}
            aria-invalid={fieldState.invalid}
            aria-describedby={
              fieldState.invalid ? `${formId}-${field.name}-error` : undefined
            }
          >
            {stableDocumentTypes.map((type) => (
              <option key={type} value={type}>
                {t(`documents.types.${type}`)}
              </option>
            ))}
          </Select>
          {fieldState.invalid && (
            <FieldError
              id={`${formId}-${field.name}-error`}
              errors={[fieldState.error]}
            />
          )}
        </Field>
      )}
    />
  )
}

function DocumentFileField({
  formId,
  control,
  disabled,
}: {
  formId: string
  control: Control<StableDocumentFormSchema>
  disabled: boolean
}) {
  const t = useT()
  return (
    <Controller
      name="file"
      control={control}
      render={({ field: { value, onChange, ref, ...field }, fieldState }) => (
        <FileUploadField
          {...field}
          id={`${formId}-${field.name}`}
          label={t('documents.fileRequired')}
          controlRef={ref}
          required
          disabled={disabled}
          errors={fieldState.invalid ? [fieldState.error] : undefined}
          files={value ?? null}
          onFilesChange={onChange}
        />
      )}
    />
  )
}
