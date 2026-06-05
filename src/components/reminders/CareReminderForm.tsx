import { Button } from '#/components/ui/button'
import { Field, FieldError, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  careReminderCategories,
  careReminderCategoryLabels,
  careReminderFormSchema,
  careReminderPriorities,
  careReminderPriorityLabels
  
} from 'shared/reminders/careReminderSchema'
import type {CareReminderFormSchema} from 'shared/reminders/careReminderSchema';

export type CareReminderSubmitData = Omit<CareReminderFormSchema, 'horseId'> & {
  horseId?: string
}

type HorseOption = {
  id: string
  name: string
}

type CareReminderFormProps = {
  horseOptions?: Array<HorseOption>
  fixedHorseId?: string
  onSubmit: (data: CareReminderSubmitData) => Promise<void>
}

const todayKey = () => new Date().toISOString().slice(0, 10)

export function CareReminderForm({
  horseOptions = [],
  fixedHorseId,
  onSubmit,
}: CareReminderFormProps) {
  const form = useForm<CareReminderFormSchema>({
    resolver: zodResolver(careReminderFormSchema),
    defaultValues: {
      horseId: fixedHorseId ?? '',
      title: '',
      description: '',
      category: 'other',
      dueDate: todayKey(),
      priority: 'medium',
    },
  })
  const {
    formState: { errors, isSubmitting },
    register,
  } = form

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      horseId: (fixedHorseId ?? values.horseId) || undefined,
    })

    form.reset({
      horseId: fixedHorseId ?? '',
      title: '',
      description: '',
      category: values.category,
      dueDate: todayKey(),
      priority: values.priority,
    })
  })

  return (
    <form className="grid gap-4 rounded-lg border p-4" onSubmit={handleSubmit}>
      {!fixedHorseId && horseOptions.length > 0 && (
        <Field data-invalid={!!errors.horseId}>
          <FieldLabel htmlFor="horseId">Horse</FieldLabel>
          <select
            id="horseId"
            className="h-9 rounded-md border bg-background px-3 text-sm"
            {...register('horseId')}
          >
            <option value="">Stable-wide reminder</option>
            {horseOptions.map((horse) => (
              <option key={horse.id} value={horse.id}>
                {horse.name}
              </option>
            ))}
          </select>
          <FieldError errors={[errors.horseId]} />
        </Field>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input
            id="title"
            placeholder="Book next farrier visit"
            {...register('title')}
          />
          <FieldError errors={[errors.title]} />
        </Field>

        <Field data-invalid={!!errors.dueDate}>
          <FieldLabel htmlFor="dueDate">Due date</FieldLabel>
          <Input id="dueDate" type="date" {...register('dueDate')} />
          <FieldError errors={[errors.dueDate]} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field data-invalid={!!errors.category}>
          <FieldLabel htmlFor="category">Category</FieldLabel>
          <select
            id="category"
            className="h-9 rounded-md border bg-background px-3 text-sm"
            {...register('category')}
          >
            {careReminderCategories.map((category) => (
              <option key={category} value={category}>
                {careReminderCategoryLabels[category]}
              </option>
            ))}
          </select>
          <FieldError errors={[errors.category]} />
        </Field>

        <Field data-invalid={!!errors.priority}>
          <FieldLabel htmlFor="priority">Priority</FieldLabel>
          <select
            id="priority"
            className="h-9 rounded-md border bg-background px-3 text-sm"
            {...register('priority')}
          >
            {careReminderPriorities.map((priority) => (
              <option key={priority} value={priority}>
                {careReminderPriorityLabels[priority]}
              </option>
            ))}
          </select>
          <FieldError errors={[errors.priority]} />
        </Field>
      </div>

      <Field data-invalid={!!errors.description}>
        <FieldLabel htmlFor="description">Notes</FieldLabel>
        <Textarea
          id="description"
          placeholder="What should be remembered or checked?"
          {...register('description')}
        />
        <FieldError errors={[errors.description]} />
      </Field>

      <Button type="submit" className="w-fit" disabled={isSubmitting}>
        Add reminder
      </Button>
    </form>
  )
}
