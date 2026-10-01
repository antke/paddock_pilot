import { useT } from '#/i18n/LocaleProvider'
import { useId } from 'react'
import { Controller } from 'react-hook-form'
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
  FieldGrid,
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
}: {
  control: Control<EventFormInput, unknown, EventFormSchema>
  disabled: boolean
}) {
  const t = useT()

  const id = useId()
  return (
    <>
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
              aria-describedby={`${id}-activities-help`}
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
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      <Controller
        control={control}
        name="training.format"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>{t('eventForm.sessionFormat')}</FieldLabel>
            <ChoiceButtonGroup
              aria-label={t('eventForm.sessionFormat')}
              value={field.value ?? 'regular'}
              options={trainingFormats.map((value) => ({
                value,
                label: t(`training.formats.${value}`),
              }))}
              onValueChange={field.onChange}
              disabled={disabled}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      <FieldGrid columns={2}>
        <Controller
          control={control}
          name="training.durationMinutes"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={`${id}-duration`}>
                {t('eventForm.duration')}
              </FieldLabel>
              <Input
                id={`${id}-duration`}
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
              <FieldError errors={[fieldState.error]} />
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
              <Input
                {...field}
                id={`${id}-rider`}
                value={field.value ?? ''}
                maxLength={100}
                disabled={disabled}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGrid>
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
              value={field.value ?? ''}
              placeholder={t('eventForm.focusExample')}
              maxLength={500}
              disabled={disabled}
            />
            <FieldError errors={[fieldState.error]} />
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
              value={field.value ?? ''}
              maxLength={500}
              disabled={disabled}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
    </>
  )
}
