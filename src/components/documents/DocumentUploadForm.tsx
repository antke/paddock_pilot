import { Button } from '#/components/ui/button'
import { Field, FieldError, FieldLabel } from '#/components/ui/field'
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

export type DocumentUploadValues = StableDocumentFormSchema & {
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
    <form className="grid gap-5" onSubmit={form.handleSubmit(submit)}>
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
              placeholder="Passport scan"
              autoComplete="off"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {showHorseSelect ? (
        <div className="grid gap-4 md:grid-cols-2">
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

          <DocumentTypeField
            control={form.control}
            disabled={form.formState.isSubmitting}
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <DocumentTypeField
            control={form.control}
            disabled={form.formState.isSubmitting}
          />

          <DocumentFileField
            control={form.control}
            disabled={form.formState.isSubmitting}
          />
        </div>
      )}

      {showHorseSelect && (
        <DocumentFileField
          control={form.control}
          disabled={form.formState.isSubmitting}
        />
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
              placeholder="Expiry dates, what the document proves, or when it was last checked"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : 'Add document'}
        </Button>
      </div>
    </form>
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
          <Select {...field} id={field.name} disabled={disabled}>
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
      render={({
        field: { value: _value, onChange, ...field },
        fieldState,
      }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>File</FieldLabel>
          <Input
            {...field}
            id={field.name}
            type="file"
            disabled={disabled}
            onChange={(event) => onChange(event.target.files)}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
