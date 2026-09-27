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
  trainingActivityLabels,
  trainingFormats,
  trainingFormatLabels,
} from 'shared/training/trainingSchema'
import { TrainingActivityDot } from './TrainingBadges'

export function TrainingFormFields({
  control,
  disabled,
}: {
  control: Control<EventFormInput, unknown, EventFormSchema>
  disabled: boolean
}) {
  const id = useId()
  return (
    <>
      <Controller
        control={control}
        name="training.activities"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Type of work</FieldLabel>
            <ToggleGroup
              multiple
              variant="outline"
              aria-label="Type of work"
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
                  {trainingActivityLabels[activity]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <FieldDescription id={`${id}-activities-help`}>
              Select all activities practised in this session.
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
            <FieldLabel>Session format</FieldLabel>
            <ChoiceButtonGroup
              aria-label="Session format"
              value={field.value ?? 'regular'}
              options={trainingFormats.map((value) => ({
                value,
                label: trainingFormatLabels[value],
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
                Duration (minutes)
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
              <FieldLabel htmlFor={`${id}-rider`}>Rider / handler</FieldLabel>
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
            <FieldLabel htmlFor={`${id}-focus`}>Exercises / focus</FieldLabel>
            <Textarea
              {...field}
              id={`${id}-focus`}
              value={field.value ?? ''}
              placeholder="For example: transitions, rhythm, pole work"
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
              Focus next time (optional)
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
