import { useId } from 'react'
import { Controller, useWatch } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import type { PersonNameSuggestion } from '#/components/forms/PersonNameAutocomplete'
import { PersonNameField } from '#/components/forms/PersonNameField'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '#/components/ui/field'
import { useT } from '#/i18n/LocaleProvider'
import type { EventFormInput, EventFormSchema } from './eventFormSchema'

/**
 * The one person running a training session: a member of the stable picked from
 * suggestions, or any name typed in (a guest trainer). It stores a name only;
 * the form ties a matching member to the "taking part" list separately.
 */
export function LeaderField({
  control,
  disabled,
  suggestions,
}: {
  control: Control<EventFormInput, unknown, EventFormSchema>
  disabled: boolean
  /** Members to offer. Without them the field looks suggestions up itself. */
  suggestions?: ReadonlyArray<PersonNameSuggestion>
}) {
  const t = useT()
  const id = useId()
  const stableId = useWatch({ control, name: 'stableId' })
  const horseIds = useWatch({ control, name: 'horseIds' })
  return (
    <Controller
      control={control}
      name="training.rider"
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={`${id}-leader`}>
            {t('eventForm.rider')}
          </FieldLabel>
          <PersonNameField
            id={`${id}-leader`}
            aria-label={t('eventForm.rider')}
            inputRef={field.ref}
            name={field.name}
            onBlur={field.onBlur}
            onValueChange={field.onChange}
            scope={{ stableId, horseIds }}
            suggestions={suggestions}
            placeholder={t('eventForm.leaderPlaceholder')}
            aria-invalid={fieldState.invalid}
            aria-describedby={
              fieldState.invalid ? `${id}-leader-error` : `${id}-leader-help`
            }
            value={field.value ?? ''}
            maxLength={100}
            disabled={disabled}
          />
          <FieldDescription id={`${id}-leader-help`}>
            {t('eventForm.leaderHelp')}
          </FieldDescription>
          <FieldError id={`${id}-leader-error`} errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}
