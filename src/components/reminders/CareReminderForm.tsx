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
  careReminderCategoryLabels,
  careReminderFormSchema,
  careReminderFormTargetTypes,
  careReminderPriorities,
  careReminderPriorityLabels,
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

const targetOptions = careReminderFormTargetTypes.map((targetType) => ({
  value: targetType,
  label: targetType === 'stable' ? 'Stable-wide' : 'Specific horses',
})) satisfies Array<{ value: CareReminderFormTargetType; label: string }>

const priorityOptions = careReminderPriorities.map((priority) => ({
  value: priority,
  label: careReminderPriorityLabels[priority],
})) satisfies Array<{ value: CareReminderPriority; label: string }>

export function CareReminderForm({
  horseOptions = [],
  fixedHorseId,
  onSubmit,
  chrome = 'cards',
  heading,
  presentation = 'panel',
}: CareReminderFormProps) {
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
  const targetType = form.watch('targetType')
  const selectedHorseIds = form.watch('horseIds')
  const selectedHorseCount = selectedHorseIds.length
  const submitLabel =
    !fixedHorseId && targetType === 'horses' && selectedHorseCount !== 1
      ? 'Add reminders'
      : 'Add reminder'

  const handleSubmit = form.handleSubmit(async (values) => {
    const reminder = {
      title: values.title,
      description: values.description,
      category: values.category,
      dueDate: values.dueDate,
      priority: values.priority,
    } satisfies CareReminderSubmitBaseData

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
  })

  return (
    <DashboardInlineForm
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
              <FieldLabel>Applies to</FieldLabel>
              <ChoiceButtonGroup
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
              />
              <FieldDescription>
                Horse reminders appear in the selected horses’ care sections.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      )}

      {!fixedHorseId && horseOptions.length > 0 && targetType === 'horses' && (
        <Controller
          name="horseIds"
          control={control}
          render={({ field, fieldState }) => (
            <FieldSet data-invalid={fieldState.invalid}>
              <FieldHeader>
                <FieldHeaderContent>
                  <FieldLegend>Horses</FieldLegend>
                  <FieldDescription>
                    Create one reminder for each selected horse.
                  </FieldDescription>
                </FieldHeaderContent>
                <DashboardValueBadge variant="neutral">
                  {field.value.length} selected
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
                  Select all
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={isSubmitting || field.value.length === 0}
                  onClick={() => field.onChange([])}
                >
                  Clear
                </Button>
              </DashboardActions>

              <ScrollableList
                itemCount={horseOptions.length}
                visibleItemLimit={3}
                estimatedItemHeightRem={5.5}
                className="p-0.5"
              >
                {horseOptions.map((horse) => {
                  const inputId = `care-reminder-horse-${horse.id}`
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

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldSet>
          )}
        />
      )}

      <Field data-invalid={!!errors.title}>
        <FieldLabel htmlFor="title">Title</FieldLabel>
        <Input
          id="title"
          placeholder="Book next farrier visit"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.title)}
          {...register('title')}
        />
        <FieldError errors={[errors.title]} />
      </Field>

      <FieldGrid>
        <Field data-invalid={!!errors.dueDate}>
          <FieldLabel htmlFor="dueDate">Due date</FieldLabel>
          <Input
            id="dueDate"
            type="date"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.dueDate)}
            {...register('dueDate')}
          />
          <FieldError errors={[errors.dueDate]} />
        </Field>

        <Field data-invalid={!!errors.category}>
          <FieldLabel htmlFor="category">Category</FieldLabel>
          <Select
            id="category"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.category)}
            {...register('category')}
          >
            {careReminderCategories.map((category) => (
              <option key={category} value={category}>
                {careReminderCategoryLabels[category]}
              </option>
            ))}
          </Select>
          <FieldError errors={[errors.category]} />
        </Field>
      </FieldGrid>

      <Controller
        name="priority"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Priority</FieldLabel>
            <ChoiceButtonGroup
              value={field.value}
              options={priorityOptions}
              onValueChange={(nextValue) =>
                field.onChange(asPriority(nextValue))
              }
              disabled={isSubmitting}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Field data-invalid={!!errors.description}>
        <FieldLabel htmlFor="description">Notes (optional)</FieldLabel>
        <Textarea
          id="description"
          placeholder="What should be remembered or checked?"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.description)}
          {...register('description')}
        />
        <FieldError errors={[errors.description]} />
      </Field>

      <FormSubmitActions
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
        submittingLabel="Adding..."
        sticky={presentation === 'plain'}
      />
    </DashboardInlineForm>
  )
}
