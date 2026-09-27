import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from 'convex/react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useId } from 'react'
import { useOnboardingSave, OnboardingSaveError } from './onboardingAsync'
import type { Doc, Id } from 'convex/_generated/dataModel'

import { FormSubmitActions } from '#/components/forms/FormSubmitActions'
import { InlineForm } from '#/components/forms/FormLayout'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { api } from 'convex/_generated/api'
import {
  calculateHorseAge,
  composeHorseBirthDate,
  splitHorseBirthDate,
} from 'shared/horses/horseAge'
import { OnboardingLaterNote } from './OnboardingLayout'

const optionalNumber = z
  .string()
  .trim()
  .refine((value) => !value || /^\d+$/.test(value), 'Use a whole number.')

const firstHorseSchema = z
  .object({
    name: z.string().trim().min(1, 'Add the horse name.'),
    birthYear: optionalNumber,
    birthMonth: optionalNumber,
    birthDay: optionalNumber,
    age: optionalNumber,
  })
  .superRefine((values, context) => {
    if (!values.birthYear && !values.age) {
      context.addIssue({
        code: 'custom',
        path: ['birthYear'],
        message: 'Add a birth year or current age.',
      })
      context.addIssue({
        code: 'custom',
        path: ['age'],
        message: 'Add a current age or birth year.',
      })
      return
    }
    if (values.birthMonth && !values.birthYear) {
      context.addIssue({
        code: 'custom',
        path: ['birthYear'],
        message: 'Add the birth year before the month.',
      })
    }
    if (values.birthDay && !values.birthMonth) {
      context.addIssue({
        code: 'custom',
        path: ['birthMonth'],
        message: 'Add the birth month before the day.',
      })
    }

    const dateOfBirth = composeHorseBirthDate({
      year: values.birthYear,
      month: values.birthMonth,
      day: values.birthDay,
    })
    const derivedAge = dateOfBirth
      ? calculateHorseAge(dateOfBirth)
      : Number(values.age)
    if (
      derivedAge === undefined ||
      !Number.isInteger(derivedAge) ||
      derivedAge < 0 ||
      derivedAge > 100
    ) {
      context.addIssue({
        code: 'custom',
        path: [dateOfBirth ? 'birthYear' : 'age'],
        message: 'Use a valid birth date or age from 0 to 100.',
      })
    }
  })

export type FirstHorseValues = z.infer<typeof firstHorseSchema>

type FirstHorseStepProps = {
  horse?: Doc<'horses'>
  stableId: Id<'stables'>
  onDeferred: () => void | Promise<void>
  onSaved: () => void | Promise<void>
  cancelLabel?: string
}
export type FirstHorseSaveValues = {
  name: string
  age: number
  dateOfBirth?: string
}
export function FirstHorseStep(props: FirstHorseStepProps) {
  const addHorse = useMutation(api.horses.add)
  const updateHorse = useMutation(api.horses.updateOnboardingBasics)
  return (
    <FirstHorseStepView
      {...props}
      onSave={async (values) => {
        if (props.horse) await updateHorse({ id: props.horse._id, ...values })
        else await addHorse({ stableId: props.stableId, ...values })
      }}
    />
  )
}
export function FirstHorseStepView({
  horse,
  onDeferred,
  onSaved,
  cancelLabel = 'Do this later',
  onSave,
}: FirstHorseStepProps & {
  onSave: (values: FirstHorseSaveValues) => Promise<void>
}) {
  const formId = useId()
  const save = useOnboardingSave({
    onSave: async (values: FirstHorseValues) => {
      const dateOfBirth = composeHorseBirthDate({
        year: values.birthYear,
        month: values.birthMonth,
        day: values.birthDay,
      })
      const age = dateOfBirth
        ? calculateHorseAge(dateOfBirth)
        : Number(values.age)
      if (age === undefined) throw new Error('Invalid horse age')
      await onSave({ name: values.name, dateOfBirth, age })
    },
    onSaved,
    failureMessage: horse
      ? 'Could not update the horse. Your entries are still here. Try again.'
      : 'Could not add the horse. Your entries are still here. Try again.',
  })
  const birthDate = splitHorseBirthDate(horse?.dateOfBirth)
  const form = useForm<FirstHorseValues>({
    resolver: zodResolver(firstHorseSchema),
    mode: 'onTouched',
    defaultValues: {
      name: horse?.name ?? '',
      birthYear: birthDate.year,
      birthMonth: birthDate.month,
      birthDay: birthDate.day,
      age: horse && !horse.dateOfBirth ? String(horse.age) : '',
    },
  })
  const birthYear = form.watch('birthYear')
  const birthMonth = form.watch('birthMonth')

  return (
    <InlineForm onSubmit={form.handleSubmit(save.run)}>
      <OnboardingSaveError message={save.error} />
      <OnboardingLaterNote>
        Start with the essentials. You can add care routines, health history,
        identification and documents from the horse’s profile whenever you’re
        ready.
      </OnboardingLaterNote>

      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`${formId}-${field.name}`}>
              Horse name
            </FieldLabel>
            <Input
              {...field}
              id={`${formId}-${field.name}`}
              placeholder="Maple"
              autoComplete="off"
              aria-invalid={fieldState.invalid}
              aria-describedby={
                fieldState.invalid ? `${formId}-${field.name}-error` : undefined
              }
              disabled={save.pending || save.acknowledged}
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

      <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(8rem,1fr)] lg:gap-y-2">
        <fieldset className="grid gap-3 lg:row-span-2 lg:grid-rows-subgrid">
          <FieldLegend>Birth date</FieldLegend>
          <div className="grid content-start gap-2">
            <div className="grid grid-cols-3 gap-2">
              <BirthPartField
                control={form.control}
                name="birthYear"
                label="Year"
                placeholder="2016"
                maxLength={4}
                disabled={save.pending || save.acknowledged}
              />
              <BirthPartField
                control={form.control}
                name="birthMonth"
                label="Month"
                placeholder="MM"
                maxLength={2}
                disabled={save.pending || save.acknowledged || !birthYear}
              />
              <BirthPartField
                control={form.control}
                name="birthDay"
                label="Day"
                placeholder="DD"
                maxLength={2}
                disabled={save.pending || save.acknowledged || !birthMonth}
              />
            </div>
            <FieldDescription>
              The year is required when using a birth date. Month and day are
              optional.
            </FieldDescription>
          </div>
        </fieldset>

        <Controller
          name="age"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              className="lg:col-start-2 lg:row-start-2"
              data-invalid={fieldState.invalid}
            >
              <FieldLabel htmlFor={`${formId}-${field.name}`} size="compact">
                Or current age
              </FieldLabel>
              <Input
                {...field}
                id={`${formId}-${field.name}`}
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                placeholder="10"
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid
                    ? `${formId}-${field.name}-error`
                    : undefined
                }
                disabled={save.pending || save.acknowledged}
              />
              <FieldDescription>
                If both are entered, the birth date is used.
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError
                  id={`${formId}-${field.name}-error`}
                  errors={[fieldState.error]}
                />
              )}
            </Field>
          )}
        />
      </div>

      <FormSubmitActions
        align="end"
        isSubmitting={save.pending}
        onCancel={onDeferred}
        cancelLabel={cancelLabel}
        submitLabel={
          save.acknowledged
            ? 'Continue without saving again'
            : horse
              ? 'Save horse details'
              : 'Add horse and continue'
        }
        submittingLabel="Saving..."
      />
    </InlineForm>
  )
}

function BirthPartField({
  control,
  name,
  label,
  placeholder,
  maxLength,
  disabled,
}: {
  control: ReturnType<typeof useForm<FirstHorseValues>>['control']
  name: 'birthYear' | 'birthMonth' | 'birthDay'
  label: string
  placeholder: string
  maxLength: number
  disabled: boolean
}) {
  const formId = useId()
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={`${formId}-${field.name}`} size="compact">
            {label}
          </FieldLabel>
          <Input
            {...field}
            id={`${formId}-${field.name}`}
            inputMode="numeric"
            maxLength={maxLength}
            placeholder={placeholder}
            aria-invalid={fieldState.invalid}
            aria-describedby={
              fieldState.invalid ? `${formId}-${field.name}-error` : undefined
            }
            disabled={disabled}
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
  )
}
