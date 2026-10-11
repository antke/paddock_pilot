import type { PersonNameSuggestion } from '#/components/forms/PersonNameAutocomplete'
import { useT } from '#/i18n/LocaleProvider'
import { useId } from 'react'
import { Controller, useWatch } from 'react-hook-form'
import { PersonNameField } from '#/components/forms/PersonNameField'
import type { Control } from 'react-hook-form'
import type {
  EventFormInput,
  EventFormSchema,
} from '../forms/event/eventFormSchema'
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'
import { ChoiceButtonGroup } from '#/components/ui/choice-button-group'
import {
  trainingActivities,
  trainingFormats,
} from 'shared/training/trainingSchema'
import { TrainingActivityDot } from './TrainingBadges'

export function TrainingFormFields({
  control,
  disabled,
  fields = 'all',
  horseIds: selectedHorseIds,
  riderSuggestions,
}: {
  control: Control<EventFormInput, unknown, EventFormSchema>
  disabled: boolean
  fields?: 'all' | 'essential' | 'optional' | 'adjustments' | 'duration'
  horseIds?: ReadonlyArray<string>
  riderSuggestions?: ReadonlyArray<PersonNameSuggestion>
}) {
  const t = useT()
  const stableId = useWatch({ control, name: 'stableId' })
  const horseIds = useWatch({ control, name: 'horseIds' })

  const id = useId()
  return (
    <>
      {(fields === 'all' ||
        fields === 'essential' ||
        fields === 'adjustments') && (
        <Controller
          control={control}
          name="training.activities"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t('eventForm.workType')}</FieldLabel>
              <ToggleGroup
                multiple
                variant="outline"
                aria-label={t('eventForm.workType')}
                aria-invalid={fieldState.invalid}
                aria-describedby={`${id}-activities-help${fieldState.invalid ? ` ${id}-activities-error` : ''}`}
                value={field.value ?? []}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                disabled={disabled}
                wrap
                className="w-full gap-2"
              >
                {trainingActivities.map((activity) => (
                  <ToggleGroupItem
                    key={activity}
                    value={activity}
                    className="gap-2 px-4"
                  >
                    <TrainingActivityDot activity={activity} />
                    {t(`training.activities.${activity}`)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <FieldDescription id={`${id}-activities-help`}>
                {t('eventForm.activitiesHelp')}
              </FieldDescription>
              <FieldError
                id={`${id}-activities-error`}
                errors={[fieldState.error]}
              />
            </Field>
          )}
        />
      )}
      {(fields === 'all' ||
        fields === 'essential' ||
        fields === 'duration') && (
        <Controller
          control={control}
          name="training.durationMinutes"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={`${id}-duration`}>
                {t('eventForm.duration')}
              </FieldLabel>
              <Input
                ref={field.ref}
                id={`${id}-duration`}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid ? `${id}-duration-error` : undefined
                }
                type="number"
                min={1}
                max={1440}
                value={field.value ?? ''}
                onBlur={field.onBlur}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === '' ? undefined : Number(e.target.value),
                  )
                }
                disabled={disabled}
              />
              <FieldError
                id={`${id}-duration-error`}
                errors={[fieldState.error]}
              />
            </Field>
          )}
        />
      )}
      {(fields === 'all' ||
        fields === 'optional' ||
        fields === 'adjustments') && (
        <>
          <Controller
            control={control}
            name="training.format"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>{t('eventForm.sessionFormat')}</FieldLabel>
                <ChoiceButtonGroup
                  aria-label={t('eventForm.sessionFormat')}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid ? `${id}-format-error` : undefined
                  }
                  value={field.value ?? 'regular'}
                  options={trainingFormats.map((value) => ({
                    value,
                    label: t(`training.formats.${value}`),
                  }))}
                  onValueChange={field.onChange}
                  disabled={disabled}
                />
                <FieldError
                  id={`${id}-format-error`}
                  errors={[fieldState.error]}
                />
              </Field>
            )}
          />
          <Controller
            control={control}
            name="training.rider"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={`${id}-rider`}>
                  {t('eventForm.rider')}
                </FieldLabel>
                <PersonNameField
                  aria-label={t('eventForm.rider')}
                  inputRef={field.ref}
                  name={field.name}
                  onBlur={field.onBlur}
                  onValueChange={field.onChange}
                  scope={{ stableId, horseIds: selectedHorseIds ?? horseIds }}
                  suggestions={riderSuggestions}
                  id={`${id}-rider`}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid ? `${id}-rider-error` : undefined
                  }
                  value={field.value ?? ''}
                  maxLength={100}
                  disabled={disabled}
                />
                <FieldError
                  id={`${id}-rider-error`}
                  errors={[fieldState.error]}
                />
              </Field>
            )}
          />
          <Controller
            control={control}
            name="training.focus"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={`${id}-focus`}>
                  {t('eventForm.focus')}
                </FieldLabel>
                <Textarea
                  {...field}
                  id={`${id}-focus`}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid ? `${id}-focus-error` : undefined
                  }
                  value={field.value ?? ''}
                  placeholder={t('eventForm.focusExample')}
                  maxLength={500}
                  disabled={disabled}
                />
                <FieldError
                  id={`${id}-focus-error`}
                  errors={[fieldState.error]}
                />
              </Field>
            )}
          />
          <Controller
            control={control}
            name="training.nextFocus"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={`${id}-next-focus`}>
                  {t('eventForm.nextFocus')}
                </FieldLabel>
                <Textarea
                  {...field}
                  id={`${id}-next-focus`}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid ? `${id}-next-focus-error` : undefined
                  }
                  value={field.value ?? ''}
                  maxLength={500}
                  disabled={disabled}
                />
                <FieldError
                  id={`${id}-next-focus-error`}
                  errors={[fieldState.error]}
                />
              </Field>
            )}
          />
        </>
      )}
    </>
  )
}
