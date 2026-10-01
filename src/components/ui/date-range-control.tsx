import { useId } from 'react'
import { Field, FieldLabel } from './field'
import { Input } from './input'
import { Select } from './select'

/** Controlled date range; validation and range policy belong to the caller. */
export function DateRangeControl({
  start,
  end,
  onChange,
  preset,
  presets,
  onPresetChange,
  labels,
  invalid,
}: {
  start: string
  end: string
  onChange: (range: { start: string; end: string }) => void
  preset: string
  presets: Array<{ value: string; label: string }>
  onPresetChange: (value: string) => void
  labels: { period: string; start: string; end: string; error: string }
  invalid?: boolean
}) {
  const id = useId()
  return (
    <div className="grid min-w-0 gap-3 sm:grid-cols-3">
      <Field>
        <FieldLabel htmlFor={`${id}-preset`}>{labels.period}</FieldLabel>
        <Select
          id={`${id}-preset`}
          value={preset}
          onChange={(event) => onPresetChange(event.target.value)}
        >
          {presets.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${id}-start`}>{labels.start}</FieldLabel>
        <Input
          id={`${id}-start`}
          type="date"
          value={start}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-error` : undefined}
          onChange={(event) => onChange({ start: event.target.value, end })}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${id}-end`}>{labels.end}</FieldLabel>
        <Input
          id={`${id}-end`}
          type="date"
          value={end}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-error` : undefined}
          onChange={(event) => onChange({ start, end: event.target.value })}
        />
      </Field>
      {invalid && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-sm text-destructive sm:col-span-3"
        >
          {labels.error}
        </p>
      )}
    </div>
  )
}
