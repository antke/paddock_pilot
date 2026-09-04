import type { DashboardChrome } from '#/components/dashboard/dashboardChrome'
import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardLoadingState } from '#/components/dashboard/DashboardLoadingState'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import {
  DashboardItemList,
  DashboardItemRecordCard,
  DashboardItemRecordContent,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { Button } from '#/components/ui/button'
import { CreateRecordDialog } from '#/components/list-layout/CreateRecordDialog'
import { RecordRemoveAction } from '#/components/list-layout/RecordRemoveAction'
import { Spinner } from '#/components/ui/spinner'
import { formatCountLabel } from '#/lib/numberDisplay'
import { CheckIcon, XIcon } from '@phosphor-icons/react'
import type { Doc } from 'convex/_generated/dataModel'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ElementType, ReactNode } from 'react'
import { careReminderCategoryLabels } from 'shared/reminders/careReminderSchema'
import {
  CareReminderPriorityBadge,
  CareReminderStatusBadge,
} from './CareReminderBadges'
import { CareReminderForm } from './CareReminderForm'
import type { CareReminderSubmitData } from './CareReminderForm'
import { getCareReminderDueLabel } from './careReminderDisplay'
import {
  getCareReminderDueState,
  getCareReminderRecordAccent,
  isCareReminderOverdue,
} from './careReminderState'

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
  title?: string
  as?: ElementType
  description?: string
  reminders: Array<CareReminderListItem>
  canAddReminder: boolean
  horseOptions?: Array<HorseOption>
  fixedHorseId?: string
  emptyMessage: ReactNode
  onAdd: (data: CareReminderSubmitData) => Promise<void>
  onComplete: (reminder: Doc<'careReminders'>) => Promise<void>
  onDismiss: (reminder: Doc<'careReminders'>) => Promise<void>
  onRemove: (reminder: Doc<'careReminders'>) => Promise<void>
  chrome?: DashboardChrome
  showHeader?: boolean
  headerAction?: ReactNode
  isLoading?: boolean
  listToolbar?: ReactNode
  listFooter?: ReactNode
  loadingLabel?: ReactNode
  onCreateActionChange?: (action: ReactNode | null) => void
}

export function CareRemindersCard({
  title,
  as,
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
  isLoading = false,
  listToolbar,
  listFooter,
  loadingLabel = 'Loading reminders...',
  onCreateActionChange,
}: CareRemindersCardProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const onAddFromDialog = useCallback(
    async (data: CareReminderSubmitData) => {
      await onAdd(data)
      setIsCreateOpen(false)
    },
    [onAdd],
  )

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
          title="Add care reminder"
          description="Choose who it applies to, what needs doing, and when."
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
      <DashboardActions>
        {headerAction}
        {showHeader && inlineCreateDialog}
      </DashboardActions>
    ) : null

  const reminderList = (
    <DashboardItemList gap="loose">
      {!showHeader && inlineCreateDialog}
      {listToolbar}
      {!isLoading && (
        <p
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {formatCountLabel(reminders.length, 'reminder')} shown
        </p>
      )}
      {isLoading ? (
        <DashboardLoadingState label={loadingLabel} />
      ) : reminders.length === 0 ? (
        <DashboardEmptyState chrome={chrome}>
          {emptyMessage}
        </DashboardEmptyState>
      ) : (
        <DashboardItemList role="list">
          {reminders.map((item) => (
            <div key={item.reminder._id} role="listitem" className="min-w-0">
              <ReminderRow
                item={item}
                onComplete={onComplete}
                onDismiss={onDismiss}
                onRemove={onRemove}
                chrome={chrome}
              />
            </div>
          ))}
        </DashboardItemList>
      )}
      {listFooter}
    </DashboardItemList>
  )

  const content = reminderList

  if (!showHeader) return content

  if (chrome === 'soft') {
    return (
      <DashboardSection
        chrome="soft"
        as={as}
        title={title}
        description={description}
        actions={headerActions}
      >
        {reminderList}
      </DashboardSection>
    )
  }

  return (
    <DashboardSectionCard
      as={as}
      title={title}
      description={description}
      actions={headerActions}
      contentGap="loose"
    >
      {content}
    </DashboardSectionCard>
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
  const dueState = getCareReminderDueState(reminder)
  const showPriorityBadge = reminder.priority === 'high'
  const showStatusBadge = overdue || reminder.status !== 'pending'
  const [pendingAction, setPendingAction] = useState<
    'complete' | 'dismiss' | null
  >(null)
  const isUpdating = pendingAction !== null

  const runStatusAction = async (
    action: 'complete' | 'dismiss',
    callback: (careReminder: Doc<'careReminders'>) => Promise<void>,
  ) => {
    if (isUpdating) return

    try {
      setPendingAction(action)
      await callback(reminder)
    } catch {
      // The mutation owner reports the error.
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <DashboardItemRecordCard
      accent={getCareReminderRecordAccent(reminder)}
      chrome={chrome}
      interactive={false}
      actionsPlacement="footer"
      actionsClassName="ml-auto"
      actionBadges={
        showPriorityBadge || showStatusBadge ? (
          <>
            {showPriorityBadge && <CareReminderPriorityBadge priority="high" />}
            {showStatusBadge && (
              <CareReminderStatusBadge
                status={reminder.status}
                overdue={overdue}
              />
            )}
          </>
        ) : undefined
      }
      actions={
        item.canManage ? (
          <>
            {reminder.status === 'pending' && (
              <>
                <Button
                  type="button"
                  size="sm"
                  disabled={isUpdating}
                  aria-busy={pendingAction === 'complete' || undefined}
                  onClick={() => void runStatusAction('complete', onComplete)}
                >
                  {pendingAction === 'complete' ? (
                    <Spinner aria-hidden={true} />
                  ) : (
                    <CheckIcon data-icon="inline-start" weight="bold" />
                  )}
                  {pendingAction === 'complete' ? 'Completing…' : 'Complete'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={isUpdating}
                  aria-busy={pendingAction === 'dismiss' || undefined}
                  onClick={() => void runStatusAction('dismiss', onDismiss)}
                >
                  {pendingAction === 'dismiss' ? (
                    <Spinner aria-hidden={true} />
                  ) : (
                    <XIcon data-icon="inline-start" weight="bold" />
                  )}
                  {pendingAction === 'dismiss' ? 'Dismissing…' : 'Dismiss'}
                </Button>
              </>
            )}
            <RecordRemoveAction
              title={`Remove “${reminder.title}”?`}
              description="This permanently removes the reminder and cannot be undone."
              confirmLabel="Remove reminder"
              disabled={isUpdating}
              onConfirm={() => onRemove(reminder)}
            />
          </>
        ) : undefined
      }
    >
      <DashboardItemRecordContent
        title={reminder.title}
        meta={
          <>
            <span
              className={
                dueState === 'overdue'
                  ? 'font-semibold text-destructive'
                  : dueState === 'today' || dueState === 'soon'
                    ? 'font-semibold text-foreground'
                    : undefined
              }
            >
              {getCareReminderDueLabel(reminder)}
            </span>
            {item.horseName && <span>{item.horseName}</span>}
            <span>{careReminderCategoryLabels[reminder.category]}</span>
          </>
        }
        description={reminder.description}
        descriptionClassName="max-w-3xl text-foreground"
      />
    </DashboardItemRecordCard>
  )
}
