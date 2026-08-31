import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from 'convex/react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import type { Doc, Id } from 'convex/_generated/dataModel'

import { FormSubmitActions } from '#/components/forms/FormSubmitActions'
import { InlineForm } from '#/components/forms/FormLayout'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGrid,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { showAppErrorToast } from '#/components/ui/sonner'
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

type FirstHorseValues = z.infer<typeof firstHorseSchema>

export function FirstHorseStep({
  horse,
  stableId,
  onDeferred,
  onSaved,
  cancelLabel = 'Do this later',
}: {
  horse?: Doc<'horses'>
  stableId: Id<'stables'>
  onDeferred: () => void | Promise<void>
  onSaved: () => void | Promise<void>
  cancelLabel?: string
}) {
  const addHorse = useMutation(api.horses.add)
  const updateHorse = useMutation(api.horses.updateOnboardingBasics)
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

  const onSubmit = async (values: FirstHorseValues) => {
    try {
      const dateOfBirth = composeHorseBirthDate({
        year: values.birthYear,
        month: values.birthMonth,
        day: values.birthDay,
      })
      const age = dateOfBirth
        ? calculateHorseAge(dateOfBirth)
        : Number(values.age)
      if (age === undefined) throw new Error('Invalid horse age')

      if (horse) {
        await updateHorse({ id: horse._id, name: values.name, dateOfBirth, age })
      } else {
        await addHorse({ stableId, name: values.name, dateOfBirth, age })
      }
      await onSaved()
    } catch {
      showAppErrorToast({
        title: horse ? 'Could not update the horse' : 'Could not add the horse',
      })
    }
  }

  return (
    <InlineForm onSubmit={form.handleSubmit(onSubmit)}>
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
            <FieldLabel htmlFor={field.name}>Horse name</FieldLabel>
            <Input
              {...field}
              id={field.name}
              placeholder="Maple"
              autoComplete="off"
              aria-invalid={fieldState.invalid}
              disabled={form.formState.isSubmitting}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(8rem,1fr)] lg:items-start">
        <Field>
          <FieldLabel>Birth date</FieldLabel>
          <div className="grid grid-cols-3 gap-2">
            <BirthPartField
              control={form.control}
              name="birthYear"
              label="Year"
              placeholder="2016"
              maxLength={4}
              disabled={form.formState.isSubmitting}
            />
            <BirthPartField
              control={form.control}
              name="birthMonth"
              label="Month"
              placeholder="MM"
              maxLength={2}
              disabled={form.formState.isSubmitting || !birthYear}
            />
            <BirthPartField
              control={form.control}
              name="birthDay"
              label="Day"
              placeholder="DD"
              maxLength={2}
              disabled={form.formState.isSubmitting || !birthMonth}
            />
          </div>
          <FieldDescription>
            The year is required when using a birth date. Month and day are
            optional.
          </FieldDescription>
        </Field>

        <Controller
          name="age"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Or current age</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                placeholder="10"
                aria-invalid={fieldState.invalid}
                disabled={form.formState.isSubmitting}
              />
              <FieldDescription>
                If both are entered, the birth date is used.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <FormSubmitActions
        align="end"
        isSubmitting={form.formState.isSubmitting}
        onCancel={onDeferred}
        cancelLabel={cancelLabel}
        submitLabel={horse ? 'Save horse details' : 'Add horse and continue'}
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
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name} size="compact">
            {label}
          </FieldLabel>
          <Input
            {...field}
            id={field.name}
            inputMode="numeric"
            maxLength={maxLength}
            placeholder={placeholder}
            aria-invalid={fieldState.invalid}
            disabled={disabled}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
