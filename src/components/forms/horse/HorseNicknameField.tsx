import { useId } from 'react'
import type { Ref } from 'react'
import type { FieldError as FormFieldError } from 'react-hook-form'
import { Checkbox } from '#/components/ui/checkbox'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { useT } from '#/i18n/LocaleProvider'

export function HorseNicknameField({
  value,
  onValueChange,
  onBlur,
  inputRef,
  error,
  checked,
  onCheckedChange,
  disabled,
}: {
  value?: string
  onValueChange: (value: string) => void
  onBlur?: () => void
  inputRef?: Ref<HTMLInputElement>
  error?: FormFieldError
  checked?: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}) {
  const t = useT()
  const id = useId()
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id} required={checked}>
        {t('horseForm.nickname')}
      </FieldLabel>
      <div className="flex items-center gap-4">
        <Input
          aria-required={checked || undefined}
          id={id}
          name="nickname"
          ref={inputRef}
          value={value ?? ''}
          onChange={(event) => onValueChange(event.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          maxLength={100}
          autoComplete="off"
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`}
          className="min-w-0 flex-1"
        />
        <div className="flex shrink-0 items-center gap-2">
          <Checkbox
            id={`${id}-use`}
            name="useNickname"
            aria-describedby={`${id}-help`}
            checked={checked ?? false}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
          />
          <FieldLabel
            id={`${id}-use-label`}
            htmlFor={`${id}-use`}
            className="cursor-pointer text-sm"
          >
            {t('horseForm.useNickname')}
          </FieldLabel>
        </div>
      </div>
      <FieldDescription id={`${id}-help`}>
        {t('horseForm.nicknameHelp')}
      </FieldDescription>
      {error && <FieldError id={`${id}-error`} errors={[error]} />}
    </Field>
  )
}
