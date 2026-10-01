import { useLocalizedValidation } from '#/i18n/useLocalizedValidation'
import { useT } from '#/i18n/LocaleProvider'
import { useId, useState } from 'react'
import { DashboardActions } from '#/components/dashboard/DashboardActions'
import type { DashboardChrome } from '#/components/dashboard/dashboardChrome'
import { DashboardValueBadge } from '#/components/dashboard/DashboardBadges'
import { DashboardInlineForm } from '#/components/dashboard/DashboardInlineForm'
import { DashboardInlineHeader } from '#/components/dashboard/DashboardInlineHeader'
import { FormSubmitActions } from '#/components/forms/FormSubmitActions'
import { HorseSelectionCard } from '#/components/horses/HorseCard'
import { Button } from '#/components/ui/button'
import { ChoiceButtonGroup } from '#/components/ui/choice-button-group'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGrid,
  FieldHeader,
  FieldHeaderContent,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { ScrollableList } from '#/components/ui/scrollable-list'
import { Select } from '#/components/ui/select'
import { Textarea } from '#/components/ui/textarea'
import { getTodayDateKey } from '#/lib/dateDisplay'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import {
  careReminderCategories,
  createCareReminderSchemas,
  careReminderFormTargetTypes,
  careReminderPriorities,
} from 'shared/reminders/careReminderSchema'
import type {
  CareReminderFormSchema,
  CareReminderFormTargetType,
  CareReminderPriority,
} from 'shared/reminders/careReminderSchema'

type CareReminderSubmitBaseData = Omit<
  CareReminderFormSchema,
  'targetType' | 'horseIds'
>

export type CareReminderSubmitData = CareReminderSubmitBaseData &
  (
    | {
        targetType: 'stable'
        horseId?: undefined
        horseIds?: undefined
      }
    | {
        targetType: 'horse'
        horseId: string
        horseIds?: undefined
      }
    | {
        targetType: 'horses'
        horseIds: Array<string>
        horseId?: undefined
      }
  )

type HorseOption = {
  id: string
  name: string
}

type CareReminderFormProps = {
  horseOptions?: Array<HorseOption>
  fixedHorseId?: string
  onSubmit: (data: CareReminderSubmitData) => Promise<void>
  chrome?: DashboardChrome
  heading?: string
  presentation?: 'panel' | 'plain'
}

const asTargetType = (value: string) => value as CareReminderFormTargetType

const asPriority = (value: string) => value as CareReminderPriority

export function CareReminderForm({
  horseOptions = [],
  fixedHorseId,
  onSubmit,
  chrome = 'cards',
  heading,
  presentation = 'panel',
}: CareReminderFormProps) {
  const t = useT()

  const targetOptions = careReminderFormTargetTypes.map((targetType) => ({
    value: targetType,
    label:
      targetType === 'stable'
        ? t('reminders.stableWide')
        : t('reminders.specificHorses'),
  })) satisfies Array<{ value: CareReminderFormTargetType; label: string }>

  const priorityOptions = careReminderPriorities.map((priority) => ({
    value: priority,
    label: t(`careLabels.priority.${priority}`),
  })) satisfies Array<{ value: CareReminderPriority; label: string }>

  const [failed, setFailed] = useState(false)
  const { careReminderFormSchema } = createCareReminderSchemas((key) =>
    t(`reminders.validation.${key}`),
  )
  const formId = useId()
  const form = useForm<CareReminderFormSchema>({
    resolver: zodResolver(careReminderFormSchema),
    mode: 'onTouched',
    defaultValues: {
      targetType: fixedHorseId ? 'horses' : 'stable',
      horseIds: fixedHorseId ? [fixedHorseId] : [],
      title: '',
      description: '',
      category: 'other',
      dueDate: getTodayDateKey(),
      priority: 'medium',
    },
  })
  const {
    formState: { errors, isSubmitting },
    control,
    register,
  } = form
  useLocalizedValidation(form)
  const targetType = form.watch('targetType')
  const selectedHorseIds = form.watch('horseIds')
  const selectedHorseCount = selectedHorseIds.length
  const submitLabel =
    !fixedHorseId && targetType === 'horses' && selectedHorseCount !== 1
      ? t('reminders.addMany')
      : t('reminders.add')

  const handleSubmit = form.handleSubmit(async (values) => {
    setFailed(false)
    const reminder = {
      title: values.title,
      description: values.description,
      category: values.category,
      dueDate: values.dueDate,
      priority: values.priority,
    } satisfies CareReminderSubmitBaseData

    try {
      if (fixedHorseId) {
        await onSubmit({
          ...reminder,
          targetType: 'horse',
          horseId: fixedHorseId,
        })
      } else if (values.targetType === 'horses') {
        await onSubmit({
          ...reminder,
          targetType: 'horses',
          horseIds: values.horseIds,
        })
      } else {
        await onSubmit({
          ...reminder,
          targetType: 'stable',
        })
      }

      form.reset({
        targetType: fixedHorseId ? 'horses' : 'stable',
        horseIds: fixedHorseId ? [fixedHorseId] : [],
        title: '',
        description: '',
        category: values.category,
        dueDate: getTodayDateKey(),
        priority: values.priority,
      })
    } catch {
      setFailed(true)
    }
  })

  return (
    <DashboardInlineForm
      noValidate
      chrome={chrome}
      presentation={presentation}
      onSubmit={handleSubmit}
    >
      {heading && (
        <DashboardInlineHeader
          as="h3"
          title={heading}
          titleSize="lg"
          titleWeight="semibold"
        />
      )}

      {!fixedHorseId && horseOptions.length > 0 && (
        <Controller
          name="targetType"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t('reminders.appliesTo')}</FieldLabel>
              <ChoiceButtonGroup
                aria-label={t('reminders.appliesTo')}
                value={field.value}
                options={targetOptions}
                onValueChange={(nextValue) => {
                  const target = asTargetType(nextValue)
                  field.onChange(target)

                  if (target === 'stable') {
                    form.setValue('horseIds', [], {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                }}
                disabled={isSubmitting}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid
                    ? `${formId}-${field.name}-error`
                    : undefined
                }
              />
              <FieldDescription>{t('reminders.targetHelp')}</FieldDescription>
              {fieldState.invalid && (
                <FieldError
                  id={`${formId}-${field.name}-error`}
                  errors={[fieldState.error]}
                />
              )}
            </Field>
          )}
        />
      )}

      {!fixedHorseId && horseOptions.length > 0 && targetType === 'horses' && (
        <Controller
          name="horseIds"
          control={control}
          render={({ field, fieldState }) => (
            <FieldSet
              data-invalid={fieldState.invalid}
              aria-describedby={
                fieldState.invalid ? `${formId}-${field.name}-error` : undefined
              }
            >
              <FieldLegend>{t('reminders.horses')}</FieldLegend>
              <FieldHeader>
                <FieldHeaderContent>
                  <FieldDescription>{t('reminders.oneEach')}</FieldDescription>
                </FieldHeaderContent>
                <DashboardValueBadge variant="neutral">
                  {t('reminders.selected', { count: field.value.length })}
                </DashboardValueBadge>
              </FieldHeader>

              <DashboardActions align="start">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={
                    isSubmitting || field.value.length === horseOptions.length
                  }
                  onClick={() =>
                    field.onChange(horseOptions.map((horse) => horse.id))
                  }
                >
                  {t('reminders.selectAll')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={isSubmitting || field.value.length === 0}
                  onClick={() => field.onChange([])}
                >
                  {t('reminders.clear')}
                </Button>
              </DashboardActions>

              <ScrollableList
                ariaLabel={t('reminders.availableHorses')}
                itemCount={horseOptions.length}
                visibleItemLimit={3}
                estimatedItemHeightRem={5.5}
                className="p-0.5"
              >
                {horseOptions.map((horse) => {
                  const inputId = `${formId}-care-reminder-horse-${horse.id}`
                  const checked = field.value.includes(horse.id)
                  const setHorseChecked = (isChecked: boolean) => {
                    field.onChange(
                      isChecked
                        ? [...field.value, horse.id]
                        : field.value.filter((id) => id !== horse.id),
                    )
                  }

                  return (
                    <HorseSelectionCard
                      key={horse.id}
                      id={inputId}
                      name={field.name}
                      value={horse.id}
                      horse={horse}
                      checked={checked}
                      disabled={isSubmitting}
                      invalid={fieldState.invalid}
                      onCheckedChange={setHorseChecked}
                    />
                  )
                })}
              </ScrollableList>

              {fieldState.invalid && (
                <FieldError
                  id={`${formId}-${field.name}-error`}
                  errors={[fieldState.error]}
                />
              )}
            </FieldSet>
          )}
        />
      )}

      <Field data-invalid={!!errors.title}>
        <FieldLabel htmlFor={`${formId}-title`}>
          {t('reminders.title')}
        </FieldLabel>
        <Input
          id={`${formId}-title`}
          aria-required="true"
          placeholder={t('reminders.titleExample')}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? `${formId}-title-error` : undefined}
          {...register('title')}
        />
        <FieldError id={`${formId}-title-error`} errors={[errors.title]} />
      </Field>

      <FieldGrid>
        <Field data-invalid={!!errors.dueDate}>
          <FieldLabel htmlFor={`${formId}-dueDate`}>
            {t('reminders.dueDate')}
          </FieldLabel>
          <Input
            id={`${formId}-dueDate`}
            aria-required="true"
            type="date"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.dueDate)}
            aria-describedby={
              errors.dueDate ? `${formId}-dueDate-error` : undefined
            }
            {...register('dueDate')}
          />
          <FieldError
            id={`${formId}-dueDate-error`}
            errors={[errors.dueDate]}
          />
        </Field>

        <Field data-invalid={!!errors.category}>
          <FieldLabel htmlFor={`${formId}-category`}>
            {t('reminders.category')}
          </FieldLabel>
          <Select
            id={`${formId}-category`}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.category)}
            aria-describedby={
              errors.category ? `${formId}-category-error` : undefined
            }
            {...register('category')}
          >
            {careReminderCategories.map((category) => (
              <option key={category} value={category}>
                {t(`careLabels.category.${category}`)}
              </option>
            ))}
          </Select>
          <FieldError
            id={`${formId}-category-error`}
            errors={[errors.category]}
          />
        </Field>
      </FieldGrid>

      <Controller
        name="priority"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>{t('reminders.priority')}</FieldLabel>
            <ChoiceButtonGroup
              aria-label={t('reminders.priority')}
              value={field.value}
              options={priorityOptions}
              onValueChange={(nextValue) =>
                field.onChange(asPriority(nextValue))
              }
              disabled={isSubmitting}
              aria-invalid={fieldState.invalid}
              aria-describedby={
                fieldState.invalid ? `${formId}-${field.name}-error` : undefined
              }
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

      <Field data-invalid={!!errors.description}>
        <FieldLabel htmlFor={`${formId}-description`}>
          {t('reminders.notesOptional')}
        </FieldLabel>
        <Textarea
          id={`${formId}-description`}
          placeholder={t('reminders.notesExample')}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description ? `${formId}-description-error` : undefined
          }
          {...register('description')}
        />
        <FieldError
          id={`${formId}-description-error`}
          errors={[errors.description]}
        />
      </Field>

      {failed ? (
        <FieldError errors={[{ message: t('reminders.saveFailed') }]} />
      ) : null}
      <FormSubmitActions
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
        submittingLabel={t('reminders.adding')}
        sticky={presentation === 'plain'}
      />
    </DashboardInlineForm>
  )
}
