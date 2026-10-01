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
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Controller, useForm } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import {
  createStableDocumentSchemas,
  stableDocumentTypes,
} from 'shared/stables/stableDocumentSchema'
import type { StableDocumentFormSchema } from 'shared/stables/stableDocumentSchema'

export type DocumentUploadValues = Omit<StableDocumentFormSchema, 'horseId'> & {
  horseId?: string
}

type HorseOption = {
  _id: Id<'horses'>
  name: string
}

type DocumentUploadFormProps = {
  horseOptions?: Array<HorseOption>
  fixedHorseId?: Id<'horses'>
  onSubmit: (values: DocumentUploadValues) => Promise<void>
  onPendingChange?: (pending: boolean) => void
}

export function DocumentUploadForm({
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
  const pending = useRef(false)
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
    onPendingChange?.(true)
    try {
      await onSubmit({
        ...values,
        horseId: (fixedHorseId ?? values.horseId) || undefined,
      })
      form.reset({
        horseId: fixedHorseId ?? '',
        type: values.type,
        file: undefined,
        fileName: '',
        notes: '',
      })
    } catch {
      setFailed(true)
    } finally {
      pending.current = false
      setIsPending(false)
      onPendingChange?.(false)
    }
  }

  return (
    <InlineForm noValidate onSubmit={form.handleSubmit(submit)}>
      {failed && (
        <Alert variant="destructive">
          <AlertDescription>{t('documents.saveFailed')}</AlertDescription>
        </Alert>
      )}
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
                      {horse.name}
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
