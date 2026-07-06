import {
  dashboardEmptyClassName,
  dashboardSectionClassName,
} from '#/components/dashboard/dashboardChrome'
import type { DashboardChrome } from '#/components/dashboard/dashboardChrome'
import {
  dashboardItemCardClassName,
  dashboardItemStateBadgesClassName,
} from '#/components/dashboard/DashboardItemCard'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { CreateRecordDialog } from '#/components/list-layout/CreateRecordDialog'
import type { Doc } from 'convex/_generated/dataModel'
import { CheckIcon, ClockIcon, WarningIcon, XIcon } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  careReminderCategoryLabels,
  careReminderPriorityLabels,
  careReminderStatusLabels,
} from 'shared/reminders/careReminderSchema'
import type {
  CareReminderPriority,
  CareReminderStatus,
} from 'shared/reminders/careReminderSchema'
import { cn } from '#/lib/utils'
import { CareReminderForm } from './CareReminderForm'
import type { CareReminderSubmitData } from './CareReminderForm'
import { isCareReminderOverdue } from './careReminderState'

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
  description?: string
  reminders: Array<CareReminderListItem>
  canAddReminder: boolean
  horseOptions?: Array<HorseOption>
  fixedHorseId?: string
  emptyMessage: string
  onAdd: (data: CareReminderSubmitData) => Promise<void>
  onComplete: (reminder: Doc<'careReminders'>) => Promise<void>
  onDismiss: (reminder: Doc<'careReminders'>) => Promise<void>
  onRemove: (reminder: Doc<'careReminders'>) => Promise<void>
  chrome?: DashboardChrome
  showHeader?: boolean
  headerAction?: ReactNode
  listToolbar?: ReactNode
  listFooter?: ReactNode
  onCreateActionChange?: (action: ReactNode | null) => void
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const formatDueDate = (date: string) => dateFormatter.format(new Date(date))

const priorityBadgeClassName = {
  low: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  medium:
    'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  high: 'border-destructive/30 bg-destructive/10 text-destructive',
} satisfies Record<CareReminderPriority, string>

const statusBadgeClassName = {
  pending: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  completed:
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  dismissed:
    'border-muted-foreground/25 bg-muted/50 text-muted-foreground dark:bg-muted/30',
} satisfies Record<CareReminderStatus, string>

const statusIcon = {
  pending: ClockIcon,
  completed: CheckIcon,
  dismissed: XIcon,
} satisfies Record<CareReminderStatus, Icon>

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
  chrome = 'cards',
  showHeader = true,
  headerAction,
  listToolbar,
  listFooter,
  onCreateActionChange,
}: CareRemindersCardProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const onAddFromDialog = useCallback(async (data: CareReminderSubmitData) => {
    await onAdd(data)
    setIsCreateOpen(false)
  }, [onAdd])

  const form = useMemo(
    () =>
      canAddReminder ? (
        <CareReminderForm
          horseOptions={horseOptions}
          fixedHorseId={fixedHorseId}
          onSubmit={onAddFromDialog}
          chrome={chrome}
          presentation="plain"
        />
      ) : null,
    [canAddReminder, chrome, fixedHorseId, horseOptions, onAddFromDialog],
  )
  const createDialog = useMemo(
    () =>
      form ? (
        <CreateRecordDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          triggerLabel="Add reminder"
          title="Create reminder"
          description="Add a care reminder without losing your place in the list."
        >
          {form}
        </CreateRecordDialog>
      ) : null,
    [form, isCreateOpen],
  )
  const inlineCreateDialog = onCreateActionChange ? null : createDialog

  useEffect(() => {
    if (!onCreateActionChange) return

    onCreateActionChange(createDialog)

    return () => onCreateActionChange(null)
  }, [createDialog, onCreateActionChange])

  const headerActions =
    headerAction || inlineCreateDialog ? (
      <div className="flex flex-wrap items-center justify-end gap-2">
        {headerAction}
        {showHeader && inlineCreateDialog}
      </div>
    ) : null

  const reminderList = (
    <div className="grid gap-3">
      {!showHeader && inlineCreateDialog}
      {listToolbar}
      {reminders.length === 0 ? (
        <p className={dashboardEmptyClassName(chrome)}>{emptyMessage}</p>
      ) : (
        reminders.map((item) => (
          <ReminderRow
            key={item.reminder._id}
            item={item}
            onComplete={onComplete}
            onDismiss={onDismiss}
            onRemove={onRemove}
            chrome={chrome}
          />
        ))
      )}
      {listFooter}
    </div>
  )

  const content = reminderList

  if (chrome === 'soft') {
    if (!showHeader) return reminderList

    return (
      <section
        className={dashboardSectionClassName(
          'soft',
          'grid gap-6',
        )}
      >
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="grid gap-1.5">
            <h2 className="text-2xl font-semibold leading-tight tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="text-base leading-6 text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {headerActions && <div className="sm:shrink-0">{headerActions}</div>}
        </header>

        {reminderList}
      </section>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="grid gap-1.5">
            <CardTitle className="text-2xl">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {headerActions && <div className="sm:shrink-0">{headerActions}</div>}
        </div>
      </CardHeader>

      <CardContent className="grid gap-6">{content}</CardContent>
    </Card>
  )
}

function ReminderRow({
  item,
  onComplete,
  onDismiss,
  onRemove,
  chrome,
}: {
  item: CareReminderListItem
  onComplete: (reminder: Doc<'careReminders'>) => Promise<void>
  onDismiss: (reminder: Doc<'careReminders'>) => Promise<void>
  onRemove: (reminder: Doc<'careReminders'>) => Promise<void>
  chrome: DashboardChrome
}) {
  const { reminder } = item
  const overdue = isCareReminderOverdue(reminder)

  return (
    <div
      className={dashboardItemCardClassName({
        interactive: true,
        chrome,
        className: 'grid gap-4 p-5',
      })}
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="grid min-w-0 gap-3">
          <div className="grid gap-2">
            <h3 className="text-lg font-semibold leading-snug tracking-[-0.01em] underline-offset-4 transition-colors group-hover/dashboard-item:text-primary group-hover/dashboard-item:underline">
              {reminder.title}
            </h3>
            <Badge
              variant="outline"
              className="min-h-5 w-fit px-2 text-[10px] font-medium leading-none text-muted-foreground shadow-none"
            >
              {careReminderCategoryLabels[reminder.category]}
            </Badge>
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

        <div className={dashboardItemStateBadgesClassName}>
          {reminder.priority && (
            <Badge
              variant="outline"
              className={cn(
                'min-h-5 px-2 text-[10px] font-medium leading-none shadow-none',
                priorityBadgeClassName[reminder.priority],
              )}
            >
              {careReminderPriorityLabels[reminder.priority]}
            </Badge>
          )}
          <ReminderStatusBadge status={reminder.status} overdue={overdue} />
        </div>
      </div>

      {item.canManage && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {reminder.status === 'pending' && (
            <>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="shadow-none"
                onClick={() => onComplete(reminder)}
              >
                Complete
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="shadow-none"
                onClick={() => onDismiss(reminder)}
              >
                Dismiss
              </Button>
            </>
          )}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="shadow-none"
            onClick={() => onRemove(reminder)}
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  )
}

function ReminderStatusBadge({
  status,
  overdue,
}: {
  status: CareReminderStatus
  overdue: boolean
}) {
  const StatusIcon = overdue ? WarningIcon : statusIcon[status]

  return (
    <Badge
      variant="outline"
      className={cn(
        'min-h-5 gap-1 px-2 text-[10px] font-medium leading-none shadow-none',
        overdue
          ? 'border-destructive/30 bg-destructive/10 text-destructive'
          : statusBadgeClassName[status],
      )}
    >
      <StatusIcon className="size-3" weight="bold" />
      {overdue ? 'Overdue' : careReminderStatusLabels[status]}
    </Badge>
  )
}
