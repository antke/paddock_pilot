import { useLocalizedValidation } from '#/i18n/useLocalizedValidation'
import { useT } from '#/i18n/LocaleProvider'
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

function createFirstHorseSchema(t: ReturnType<typeof useT>) {
  const optionalNumber = z
    .string()
    .trim()
    .refine(
      (value) => !value || /^\d+$/.test(value),
      t('onboarding.wholeNumber'),
    )

  return z
    .object({
      name: z.string().trim().min(1, t('onboarding.horseNameRequired')),
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
          message: t('onboarding.birthYearOrAge'),
        })
        context.addIssue({
          code: 'custom',
          path: ['age'],
          message: t('onboarding.ageOrBirthYear'),
        })
        return
      }
      if (values.birthMonth && !values.birthYear) {
        context.addIssue({
          code: 'custom',
          path: ['birthYear'],
          message: t('onboarding.yearBeforeMonth'),
        })
      }
      if (values.birthDay && !values.birthMonth) {
        context.addIssue({
          code: 'custom',
          path: ['birthMonth'],
          message: t('onboarding.monthBeforeDay'),
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
          message: t('onboarding.validAge'),
        })
      }
    })
}

export type FirstHorseValues = z.infer<
  ReturnType<typeof createFirstHorseSchema>
>

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
  cancelLabel,
  onSave,
}: FirstHorseStepProps & {
  onSave: (values: FirstHorseSaveValues) => Promise<void>
}) {
  const t = useT()

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
      ? t('onboarding.horseUpdateFailed')
      : t('onboarding.horseAddFailed'),
  })
  const birthDate = splitHorseBirthDate(horse?.dateOfBirth)
  const form = useForm<FirstHorseValues>({
    resolver: zodResolver(createFirstHorseSchema(t)),
    mode: 'onTouched',
    defaultValues: {
      name: horse?.name ?? '',
      birthYear: birthDate.year,
      birthMonth: birthDate.month,
      birthDay: birthDate.day,
      age: horse && !horse.dateOfBirth ? String(horse.age) : '',
    },
  })
  useLocalizedValidation(form)
  const birthYear = form.watch('birthYear')
  const birthMonth = form.watch('birthMonth')

  return (
    <InlineForm noValidate onSubmit={form.handleSubmit(save.run)}>
      <OnboardingSaveError message={save.error} />
      <OnboardingLaterNote>
        {t('onboarding.horseLaterHelp')}
      </OnboardingLaterNote>

      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`${formId}-${field.name}`}>
              {t('onboarding.horseName')}
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
          <FieldLegend>{t('onboarding.birthDate')}</FieldLegend>
          <div className="grid content-start gap-2">
            <div className="grid grid-cols-3 gap-2">
              <BirthPartField
                control={form.control}
                name="birthYear"
                label={t('onboarding.year')}
                placeholder="2016"
                maxLength={4}
                disabled={save.pending || save.acknowledged}
              />
              <BirthPartField
                control={form.control}
                name="birthMonth"
                label={t('onboarding.month')}
                placeholder="MM"
                maxLength={2}
                disabled={save.pending || save.acknowledged || !birthYear}
              />
              <BirthPartField
                control={form.control}
                name="birthDay"
                label={t('onboarding.day')}
                placeholder="DD"
                maxLength={2}
                disabled={save.pending || save.acknowledged || !birthMonth}
              />
            </div>
            <FieldDescription>{t('onboarding.birthDateHelp')}</FieldDescription>
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
                {t('onboarding.orAge')}
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
                {t('onboarding.birthDatePriority')}
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
        cancelLabel={cancelLabel ?? t('onboarding.later')}
        submitLabel={
          save.acknowledged
            ? t('onboarding.continueSaved')
            : horse
              ? t('onboarding.saveHorse')
              : t('onboarding.addHorseContinue')
        }
        submittingLabel={t('onboarding.saving')}
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
