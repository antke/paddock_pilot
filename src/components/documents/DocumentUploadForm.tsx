import { InlineForm } from '#/components/forms/FormLayout'
import { FormSubmitActions } from '#/components/forms/FormSubmitActions'
import { FileUploadField } from '#/components/forms/FileUploadField'
import { Field, FieldError, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Select } from '#/components/ui/select'
import { Textarea } from '#/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Id } from 'convex/_generated/dataModel'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import {
  stableDocumentFormSchema,
  stableDocumentTypeLabels,
  stableDocumentTypes,
} from 'shared/stables/stableDocumentSchema'
import type { StableDocumentFormSchema } from 'shared/stables/stableDocumentSchema'

export type DocumentUploadValues = Omit<
  StableDocumentFormSchema,
  'horseId'
> & {
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
}

export function DocumentUploadForm({
  horseOptions = [],
  fixedHorseId,
  onSubmit,
}: DocumentUploadFormProps) {
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
    await onSubmit({
      ...values,
      horseId: (fixedHorseId ?? values.horseId) || undefined,
    })
    form.reset({
      horseId: fixedHorseId ?? '',
      type: values.type,
      fileName: '',
      notes: '',
    })
  }

  return (
    <InlineForm onSubmit={form.handleSubmit(submit)}>
      <DocumentFileField
        control={form.control}
        disabled={form.formState.isSubmitting}
      />

      <FieldGrid>
        <Controller
          name="fileName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Document name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                disabled={form.formState.isSubmitting}
                aria-invalid={fieldState.invalid}
                placeholder="Passport scan"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <DocumentTypeField
          control={form.control}
          disabled={form.formState.isSubmitting}
        />
      </FieldGrid>

      {showHorseSelect && (
        <FieldGrid>
          <Controller
            name="horseId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Horse</FieldLabel>
                <Select
                  {...field}
                  id={field.name}
                  disabled={form.formState.isSubmitting}
                  aria-invalid={fieldState.invalid}
                >
                  <option value="">Stable-wide document</option>
                  {horseOptions.map((horse) => (
                    <option key={horse._id} value={horse._id}>
                      {horse.name}
                    </option>
                  ))}
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
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
            <FieldLabel htmlFor={field.name}>Notes</FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              disabled={form.formState.isSubmitting}
              aria-invalid={fieldState.invalid}
              placeholder="Expiry dates, what the document proves, or when it was last checked"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <FormSubmitActions
        isSubmitting={form.formState.isSubmitting}
        submitLabel="Add document"
        submittingLabel="Saving..."
      />
    </InlineForm>
  )
}

function DocumentTypeField({
  control,
  disabled,
}: {
  control: Control<StableDocumentFormSchema>
  disabled: boolean
}) {
  return (
    <Controller
      name="type"
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>Type</FieldLabel>
          <Select
            {...field}
            id={field.name}
            disabled={disabled}
            aria-invalid={fieldState.invalid}
          >
            {stableDocumentTypes.map((type) => (
              <option key={type} value={type}>
                {stableDocumentTypeLabels[type]}
              </option>
            ))}
          </Select>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

function DocumentFileField({
  control,
  disabled,
}: {
  control: Control<StableDocumentFormSchema>
  disabled: boolean
}) {
  return (
    <Controller
      name="file"
      control={control}
      render={({ field: { value, onChange, ...field }, fieldState }) => (
        <FileUploadField
          {...field}
          id={field.name}
          label="File"
          disabled={disabled}
          errors={fieldState.invalid ? [fieldState.error] : undefined}
          files={value ?? null}
          onFilesChange={onChange}
        />
      )}
    />
  )
}
