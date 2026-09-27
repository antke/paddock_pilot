import { Field, FieldError, FieldLabel } from '#/components/ui/field'
import { Textarea } from '#/components/ui/textarea'
import { useState } from 'react'
import { useController } from 'react-hook-form'
import type { Control, FieldPath } from 'react-hook-form'
import type { HorseFormInput, HorseFormSchema } from './horseFormSchema'

type HorseStringListFieldProps = {
  control: Control<HorseFormInput, unknown, HorseFormSchema>
  name: FieldPath<HorseFormInput>
  label: string
  placeholder: string
  disabled?: boolean
}

const toTextareaValue = (items: unknown) =>
  Array.isArray(items) ? items.join('\n') : ''

const toStringList = (value: string) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)

export function HorseStringListField({
  control,
  name,
  label,
  placeholder,
  disabled = false,
}: HorseStringListFieldProps) {
  const { field, fieldState } = useController({ control, name })
  const canonicalText = toTextareaValue(field.value)
  const [draft, setDraft] = useState({
    text: canonicalText,
    canonicalText,
    formValue: field.value,
    pendingChange: false,
  })

  // RHF publishes a new array for changes and resets. Preserve the draft only
  // for the echo of our own change; a later reset must replace even equal text.
  if (draft.formValue !== field.value) {
    setDraft({
      text:
        draft.pendingChange && draft.canonicalText === canonicalText
          ? draft.text
          : canonicalText,
      canonicalText,
      formValue: field.value,
      pendingChange: false,
    })
  }

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>

      <Textarea
        id={field.name}
        name={field.name}
        ref={field.ref}
        value={draft.text}
        disabled={disabled}
        aria-invalid={fieldState.invalid}
        aria-describedby={
          fieldState.invalid ? `${field.name}-error` : undefined
        }
        placeholder={placeholder}
        autoComplete="off"
        onBlur={() => {
          setDraft({
            text: canonicalText,
            canonicalText,
            formValue: field.value,
            pendingChange: false,
          })
          field.onBlur()
        }}
        onChange={(event) => {
          const text = event.target.value
          const items = toStringList(text)
          setDraft({
            text,
            canonicalText: toTextareaValue(items),
            formValue: field.value,
            pendingChange: true,
          })
          field.onChange(items)
        }}
      />

      {fieldState.invalid && (
        <FieldError id={`${field.name}-error`} errors={[fieldState.error]} />
      )}
    </Field>
  )
}
