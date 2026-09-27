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
  stableDocumentFormSchema,
  stableDocumentTypeLabels,
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
    <InlineForm onSubmit={form.handleSubmit(submit)}>
      {failed && (
        <Alert variant="destructive">
          <AlertDescription>
            Could not add this document. Your file and details are still here.
            Please try again.
          </AlertDescription>
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
                Document name
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
                placeholder="Passport scan"
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
                  Horse (optional)
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
                  <option value="">Stable-wide document</option>
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
              Notes (optional)
            </FieldLabel>
            <Textarea
              {...field}
              id={`${formId}-${field.name}`}
              disabled={form.formState.isSubmitting || isPending}
              aria-invalid={fieldState.invalid}
              aria-describedby={
                fieldState.invalid ? `${formId}-${field.name}-error` : undefined
              }
              placeholder="Expiry dates, what the document proves, or when it was last checked"
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
        submitLabel="Add document"
        submittingLabel="Uploading…"
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
  return (
    <Controller
      name="type"
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={`${formId}-${field.name}`}>Type</FieldLabel>
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
                {stableDocumentTypeLabels[type]}
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
  return (
    <Controller
      name="file"
      control={control}
      render={({ field: { value, onChange, ref, ...field }, fieldState }) => (
        <FileUploadField
          {...field}
          id={`${formId}-${field.name}`}
          label="File (required)"
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
