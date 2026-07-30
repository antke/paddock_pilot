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
import { formatMediumDateKey } from '#/lib/dateDisplay'
import type { Doc } from 'convex/_generated/dataModel'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ElementType, ReactNode } from 'react'
import {
  CareReminderCategoryBadge,
  CareReminderPriorityBadge,
  CareReminderStatusBadge,
} from './CareReminderBadges'
import { CareReminderForm } from './CareReminderForm'
import type { CareReminderSubmitData } from './CareReminderForm'
import {
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
      <DashboardActions>
        {headerAction}
        {showHeader && inlineCreateDialog}
      </DashboardActions>
    ) : null

  const reminderList = (
    <DashboardItemList>
      {!showHeader && inlineCreateDialog}
      {listToolbar}
      {isLoading ? (
        <DashboardLoadingState label={loadingLabel} />
      ) : reminders.length === 0 ? (
        <DashboardEmptyState chrome={chrome}>
          {emptyMessage}
        </DashboardEmptyState>
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

  return (
    <DashboardItemRecordCard
      accent={getCareReminderRecordAccent(reminder)}
      chrome={chrome}
      actionsPlacement="footer"
      actionsClassName="ml-auto"
      actionBadges={
        <>
          {reminder.priority && (
            <CareReminderPriorityBadge priority={reminder.priority} />
          )}
          <CareReminderStatusBadge status={reminder.status} overdue={overdue} />
        </>
      }
      actions={
        item.canManage ? (
          <>
            {reminder.status === 'pending' && (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => onComplete(reminder)}
                >
                  Complete
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
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
              onClick={() => onRemove(reminder)}
            >
              Remove
            </Button>
          </>
        ) : undefined
      }
    >
      <DashboardItemRecordContent
        title={reminder.title}
        titleBadges={<CareReminderCategoryBadge category={reminder.category} />}
        meta={
          <>
            <span>Due {formatMediumDateKey(reminder.dueDate)}</span>
            {item.horseName && <span>{item.horseName}</span>}
          </>
        }
        description={reminder.description}
      />
    </DashboardItemRecordCard>
  )
}
