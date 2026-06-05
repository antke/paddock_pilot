import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import type { Doc } from 'convex/_generated/dataModel'
import {
  careReminderCategoryLabels,
  careReminderPriorityLabels,
  careReminderStatusLabels,
} from 'shared/reminders/careReminderSchema'
import { CareReminderForm  } from './CareReminderForm'
import type {CareReminderSubmitData} from './CareReminderForm';

export type CareReminderListItem = {
  reminder: Doc<'careReminders'>
  horseName?: string
  canManage: boolean
}

type HorseOption = {
  id: string
  name: string
}

type CareRemindersCardProps = {
  title: string
  description: string
  reminders: Array<CareReminderListItem>
  canAddReminder: boolean
  horseOptions?: Array<HorseOption>
  fixedHorseId?: string
  emptyMessage: string
  onAdd: (data: CareReminderSubmitData) => Promise<void>
  onComplete: (reminder: Doc<'careReminders'>) => Promise<void>
  onDismiss: (reminder: Doc<'careReminders'>) => Promise<void>
  onRemove: (reminder: Doc<'careReminders'>) => Promise<void>
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const formatDueDate = (date: string) => dateFormatter.format(new Date(date))

const todayKey = () => new Date().toISOString().slice(0, 10)

const isOverdue = (reminder: Doc<'careReminders'>) => {
  return reminder.status === 'pending' && reminder.dueDate < todayKey()
}

export function CareRemindersCard({
  title,
  description,
  reminders,
  canAddReminder,
  horseOptions,
  fixedHorseId,
  emptyMessage,
  onAdd,
  onComplete,
  onDismiss,
  onRemove,
}: CareRemindersCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6">
        {canAddReminder && (
          <CareReminderForm
            horseOptions={horseOptions}
            fixedHorseId={fixedHorseId}
            onSubmit={onAdd}
          />
        )}

        <div className="grid gap-4">
          {reminders.length === 0 ? (
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          ) : (
            reminders.map((item) => (
              <ReminderRow
                key={item.reminder._id}
                item={item}
                onComplete={onComplete}
                onDismiss={onDismiss}
                onRemove={onRemove}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ReminderRow({
  item,
  onComplete,
  onDismiss,
  onRemove,
}: {
  item: CareReminderListItem
  onComplete: (reminder: Doc<'careReminders'>) => Promise<void>
  onDismiss: (reminder: Doc<'careReminders'>) => Promise<void>
  onRemove: (reminder: Doc<'careReminders'>) => Promise<void>
}) {
  const { reminder } = item
  const overdue = isOverdue(reminder)

  return (
    <div className="grid gap-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">{reminder.title}</h3>
            <Badge variant={overdue ? 'destructive' : 'secondary'}>
              {overdue ? 'Overdue' : careReminderStatusLabels[reminder.status]}
            </Badge>
            <Badge variant="outline">
              {careReminderCategoryLabels[reminder.category]}
            </Badge>
            {reminder.priority && (
              <Badge variant="outline">
                {careReminderPriorityLabels[reminder.priority]} priority
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Due {formatDueDate(reminder.dueDate)}
            {item.horseName ? ` · ${item.horseName}` : ''}
          </p>

          {reminder.description && (
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {reminder.description}
            </p>
          )}
        </div>

        {item.canManage && (
          <div className="flex flex-wrap gap-2">
            {reminder.status === 'pending' && (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onComplete(reminder)}
                >
                  Complete
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onDismiss(reminder)}
                >
                  Dismiss
                </Button>
              </>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onRemove(reminder)}
            >
              Remove
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
