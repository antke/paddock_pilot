import { dashboardInlinePanelClassName } from '#/components/dashboard/dashboardChrome'
import type { DashboardChrome } from '#/components/dashboard/dashboardChrome'
import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { ChoiceButtonGroup } from '#/components/ui/choice-button-group'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { ScrollableList } from '#/components/ui/scrollable-list'
import { Select } from '#/components/ui/select'
import { Textarea } from '#/components/ui/textarea'
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

const todayKey = () => new Date().toISOString().slice(0, 10)

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
    defaultValues: {
      targetType: fixedHorseId ? 'horses' : 'stable',
      horseIds: fixedHorseId ? [fixedHorseId] : [],
      title: '',
      description: '',
      category: 'other',
      dueDate: todayKey(),
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
      dueDate: todayKey(),
      priority: values.priority,
    })
  })

  return (
    <form
      className={
        presentation === 'plain'
          ? 'grid gap-5'
          : dashboardInlinePanelClassName(chrome, 'grid gap-5 p-5')
      }
      onSubmit={handleSubmit}
    >
      {heading && (
        <h3 className="text-lg font-semibold leading-snug tracking-tight">
          {heading}
        </h3>
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
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <FieldLegend>Horses</FieldLegend>
                  <FieldDescription>
                    Create one reminder for each selected horse.
                  </FieldDescription>
                </div>
                <span className="rounded-row bg-background/55 px-3 py-1 text-xs font-medium text-muted-foreground">
                  {field.value.length} selected
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="shadow-none"
                  disabled={isSubmitting || field.value.length === horseOptions.length}
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
                  className="shadow-none"
                  disabled={isSubmitting || field.value.length === 0}
                  onClick={() => field.onChange([])}
                >
                  Clear
                </Button>
              </div>

              <ScrollableList
                itemCount={horseOptions.length}
                visibleItemLimit={3}
                estimatedItemHeightRem={3.25}
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
                    <Field
                      key={horse.id}
                      orientation="horizontal"
                      className={cn(
                        'cursor-pointer items-center rounded-row bg-background/55 p-3 transition-colors hover:bg-muted/60',
                        checked && 'bg-primary/5 text-foreground',
                        isSubmitting && 'cursor-not-allowed',
                      )}
                      onClick={() => {
                        if (!isSubmitting) {
                          setHorseChecked(!checked)
                        }
                      }}
                    >
                      <Checkbox
                        id={inputId}
                        checked={checked}
                        disabled={isSubmitting}
                        aria-invalid={fieldState.invalid}
                        onClick={(event) => event.stopPropagation()}
                        onCheckedChange={(isChecked) => {
                          setHorseChecked(isChecked)
                        }}
                      />
                      <FieldLabel
                        htmlFor={inputId}
                        className="w-full cursor-pointer"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {horse.name}
                      </FieldLabel>
                    </Field>
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
          {...register('title')}
        />
        <FieldError errors={[errors.title]} />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field data-invalid={!!errors.dueDate}>
          <FieldLabel htmlFor="dueDate">Due date</FieldLabel>
          <Input id="dueDate" type="date" {...register('dueDate')} />
          <FieldError errors={[errors.dueDate]} />
        </Field>

        <Field data-invalid={!!errors.category}>
          <FieldLabel htmlFor="category">Category</FieldLabel>
          <Select id="category" {...register('category')}>
            {careReminderCategories.map((category) => (
              <option key={category} value={category}>
                {careReminderCategoryLabels[category]}
              </option>
            ))}
          </Select>
          <FieldError errors={[errors.category]} />
        </Field>
      </div>

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
        <FieldLabel htmlFor="description">Notes</FieldLabel>
        <Textarea
          id="description"
          placeholder="What should be remembered or checked?"
          {...register('description')}
        />
        <FieldError errors={[errors.description]} />
      </Field>

      <Button type="submit" className="ml-auto w-fit" disabled={isSubmitting}>
        {!fixedHorseId && targetType === 'horses' && selectedHorseCount !== 1
          ? 'Add reminders'
          : 'Add reminder'}
      </Button>
    </form>
  )
}
