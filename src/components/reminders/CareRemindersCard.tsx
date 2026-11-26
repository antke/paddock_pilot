import { WorkspaceRecordAudience } from '#/components/sharing/RecordAudienceLabel'
import { MotionList } from '#/components/motion/MotionList'
import { MotionNotice } from '#/components/motion/MotionNotice'
import { ConfirmedCheck } from '#/components/motion/StateFeedback'
import { useT, useLocale } from '#/i18n/LocaleProvider'
import { useActionErrorText } from '#/lib/actionError'
import { dashboardRecordDetailsContentClassName } from '#/components/dashboard/DashboardRecordDetails'
import {
  DisclosureChevron,
  DisclosureTitleButton,
  disclosureTitleClassName,
} from '#/components/ui/disclosure-chevron'
import { DashboardMetaList } from '#/components/dashboard/DashboardMetaList'
import type { DashboardChrome } from '#/components/dashboard/dashboardChrome'
import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardLoadingState } from '#/components/dashboard/DashboardLoadingState'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import {
  DashboardItemList,
  DashboardItemRecordCard,
  dashboardItemLargeTitleClassName,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { Button } from '#/components/ui/button'
import { CreateRecordDialog } from '#/components/list-layout/CreateRecordDialog'
import {
  RecordRemoveAction,
  RecordRemoveMenuItem,
} from '#/components/list-layout/RecordRemoveAction'
import { EditRecordDialog } from '#/components/list-layout/EditRecordDialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '#/components/ui/dropdown-menu'
import { Input } from '#/components/ui/input'
import { Field, FieldDescription, FieldLabel } from '#/components/ui/field'
import { careReminderDueDateSchema } from 'shared/reminders/careReminderSchema'
import { DotsThreeVerticalIcon } from '@phosphor-icons/react'
import type { Doc } from 'convex/_generated/dataModel'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { ElementType, ReactNode } from 'react'
import { CareReminderForm } from './CareReminderForm'
import type {
  AssigneeOptions,
  CareReminderSubmitData,
} from './CareReminderForm'
import { getCareReminderDueLabel } from './careReminderDisplay'
import { EventDateBadge } from '#/components/events/EventDateBadge'
import { cn } from '#/lib/utils'
import {
  getCareReminderRecordAccent,
  isCareReminderOverdue,
} from './careReminderState'

export type CareReminderListItem = {
  reminder: Doc<'careReminders'>
  horseName?: string
  canManage: boolean
  canComplete?: boolean
  canReopen?: boolean
  assigneeName?: string
  completedByName?: string
}

type HorseOption = {
  id: string
  name: string
}

type CareRemindersCardProps = {
  enableSharing?: boolean
  title?: string
  as?: ElementType
  description?: string
  /** Complete scope count only; omit for paginated or filtered server results. */
  outstandingCount?: number
  reminders: Array<CareReminderListItem>
  canAddReminder: boolean
  horseOptions?: Array<HorseOption>
  assigneeOptions?: AssigneeOptions
  fixedHorseId?: string
  emptyMessage: ReactNode
  onAdd: (data: CareReminderSubmitData) => Promise<void>
  onComplete: (
    reminder: Doc<'careReminders'>,
    nextDueDate?: string,
  ) => Promise<void>
  onEdit?: (
    reminder: Doc<'careReminders'>,
    data: CareReminderSubmitData,
  ) => Promise<void>
  onReopen?: (reminder: Doc<'careReminders'>) => Promise<void>
  onDismiss: (reminder: Doc<'careReminders'>) => Promise<void>
  onRemove: (reminder: Doc<'careReminders'>) => Promise<void>
  chrome?: DashboardChrome
  showHeader?: boolean
  recordHeadingLevel?: 2 | 3
  headerAction?: ReactNode
  isLoading?: boolean
  listToolbar?: ReactNode
  listFooter?: ReactNode
  loadingLabel?: ReactNode
  onCreateActionChange?: (action: ReactNode | null) => void
}

export function CareRemindersCard({
  enableSharing,
  title,
  as,
  description,
  reminders,
  outstandingCount,
  canAddReminder,
  horseOptions,
  assigneeOptions,
  fixedHorseId,
  emptyMessage,
  onAdd,
  onComplete,
  onEdit,
  onReopen,
  onDismiss,
  onRemove,
  chrome = 'soft',
  showHeader = true,
  recordHeadingLevel = showHeader ? 3 : 2,
  headerAction,
  isLoading = false,
  listToolbar,
  listFooter,
  loadingLabel,
  onCreateActionChange,
}: CareRemindersCardProps) {
  const t = useT()

  const [receipt, setReceipt] = useState<{
    id: string
    title: string
    final: boolean
  } | null>(null)
  const receiptObserved = useRef<string | null>(null)
  useEffect(() => {
    if (!receipt) {
      receiptObserved.current = null
      return
    }
    const pendingAgain = reminders.some(
      (item) =>
        item.reminder._id === receipt.id && item.reminder.status === 'pending',
    )
    if (!pendingAgain) receiptObserved.current = receipt.id
    else if (receiptObserved.current === receipt.id) setReceipt(null)
  }, [reminders, receipt])
  const mounted = useRef(false)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  useEffect(() => {
    if (!receipt) return
    // Presentation only. No mutation, focus, removal or next action waits for this timer.
    const timer = window.setTimeout(() => setReceipt(null), 4000)
    return () => window.clearTimeout(timer)
  }, [receipt])
  const completeWithReceipt = async (
    record: Doc<'careReminders'>,
    nextDueDate?: string,
  ) => {
    const final = outstandingCount === 1 && !nextDueDate
    await onComplete(record, nextDueDate)
    if (mounted.current)
      setReceipt({ id: record._id, title: record.title, final })
  }

  const listRef = useRef<HTMLDivElement>(null)
  const removalFocusTarget = useCallback(() => listRef.current, [])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const onAddFromDialog = useCallback(
    async (data: CareReminderSubmitData) => {
      setIsCreating(true)
      try {
        await onAdd(data)
        setIsCreateOpen(false)
      } finally {
        setIsCreating(false)
      }
    },
    [onAdd],
  )

  const form = useMemo(
    () =>
      canAddReminder ? (
        <CareReminderForm
          enableSharing={enableSharing}
          horseOptions={horseOptions}
          assigneeOptions={assigneeOptions}
          fixedHorseId={fixedHorseId}
          onSubmit={onAddFromDialog}
          chrome={chrome}
          presentation="plain"
        />
      ) : null,
    [
      canAddReminder,
      enableSharing,
      chrome,
      fixedHorseId,
      horseOptions,
      assigneeOptions,
      onAddFromDialog,
    ],
  )
  const createDialog = useMemo(
    () =>
      form ? (
        <CreateRecordDialog
          actionId="reminder"
          open={isCreateOpen}
          isPending={isCreating}
          onOpenChange={(open) => {
            if (!isCreating) setIsCreateOpen(open)
          }}
          triggerLabel={t('reminders.add')}
          title={t('reminders.addCare')}
          description={t('reminders.addHelp')}
        >
          {form}
        </CreateRecordDialog>
      ) : null,
    [form, isCreateOpen, isCreating, t],
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
    <DashboardItemList
      ref={listRef}
      tabIndex={-1}
      role="group"
      aria-label={t('reminders.careReminders')}
      gap="loose"
    >
      {!showHeader && inlineCreateDialog}
      {listToolbar}
      {!isLoading && (
        <p
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {t('reminders.shown', { count: reminders.length })}
        </p>
      )}
      <MotionNotice show={Boolean(receipt)}>
        {receipt && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-row bg-primary/8 px-3 py-3 text-sm text-primary"
            data-slot="care-confirmation"
            data-final={(receipt.final && outstandingCount === 0) || undefined}
          >
            <ConfirmedCheck
              key={receipt.id}
              final={receipt.final && outstandingCount === 0}
            />
            <span>
              <span className="font-semibold">{t('reminders.completed')}</span>{' '}
              · {receipt.title}
            </span>
          </div>
        )}
      </MotionNotice>
      {isLoading ? (
        <DashboardLoadingState label={loadingLabel ?? t('reminders.loading')} />
      ) : (
        <MotionList
          className="gap-3"
          items={reminders}
          getKey={(item) => item.reminder._id}
          focusTarget={removalFocusTarget}
          empty={
            <DashboardEmptyState chrome={chrome}>
              {emptyMessage}
            </DashboardEmptyState>
          }
          renderItem={(item) => (
            <ReminderRow
              item={item}
              onComplete={completeWithReceipt}
              onEdit={onEdit}
              onReopen={
                onReopen
                  ? async (record) => {
                      await onReopen(record)
                      if (mounted.current) setReceipt(null)
                    }
                  : undefined
              }
              assigneeOptions={assigneeOptions}
              onDismiss={onDismiss}
              onRemove={onRemove}
              chrome={chrome}
              headingLevel={recordHeadingLevel}
              showHorse={!fixedHorseId}
              removalFocusTarget={removalFocusTarget}
            />
          )}
        />
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
  showHorse,
  removalFocusTarget,
  headingLevel,
  item,
  onComplete,
  onEdit,
  onReopen,
  assigneeOptions,
  onDismiss,
  onRemove,
  chrome,
}: {
  showHorse: boolean
  removalFocusTarget: () => HTMLElement | null
  headingLevel: 2 | 3
  item: CareReminderListItem
  assigneeOptions?: AssigneeOptions
  onComplete: (
    reminder: Doc<'careReminders'>,
    nextDueDate?: string,
  ) => Promise<void>
  onEdit?: (
    reminder: Doc<'careReminders'>,
    data: CareReminderSubmitData,
  ) => Promise<void>
  onReopen?: (reminder: Doc<'careReminders'>) => Promise<void>
  onDismiss: (reminder: Doc<'careReminders'>) => Promise<void>
  onRemove: (reminder: Doc<'careReminders'>) => Promise<void>
  chrome: DashboardChrome
}) {
  const t = useT()
  const describe = useActionErrorText()
  const { locale } = useLocale()
  const { reminder } = item
  const overdue = isCareReminderOverdue(reminder)
  // The tile carries urgency: red when overdue, amber when high priority, muted once closed.
  const tileTone =
    reminder.status !== 'pending'
      ? 'text-muted-foreground'
      : overdue
        ? 'border-destructive/40 bg-destructive/8 text-destructive'
        : reminder.priority === 'high'
          ? 'border-status-warning/40 bg-status-warning-surface text-status-warning'
          : undefined
  const Heading = `h${headingLevel}` as const
  // Listed first in the row's overflow menu. Opens the next-date editor only; nothing is
  // completed until it is saved.
  const canScheduleNext =
    item.canManage &&
    reminder.status === 'pending' &&
    !reminder.followUpReminderId
  const [pendingAction, setPendingAction] = useState<
    'complete' | 'dismiss' | 'reopen' | 'edit' | null
  >(null)
  const [editor, setEditor] = useState<'edit' | 'next' | null>(null)
  const [nextDueDate, setNextDueDate] = useState('')
  const [dateError, setDateError] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const mounted = useRef(false)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  useEffect(() => {
    setConfirmed(false)
  }, [reminder.status])
  const pendingRef = useRef(false)
  const isUpdating = pendingAction !== null
  const [actionError, setActionError] = useState<unknown>(null)
  const [removeOpen, setRemoveOpen] = useState(false)
  const menuTrigger = useRef<HTMLButtonElement>(null)
  const removeNamed = t('reminders.removeRecordNamed', { name: reminder.title })
  const [detailsOpen, setDetailsOpen] = useState(false)
  const detailsId = useId()
  const canComplete =
    reminder.status === 'pending' && (item.canComplete ?? item.canManage)
  const canReopen = Boolean(onReopen) && (item.canReopen ?? item.canManage)
  // Closed rows name their state in the meta line; there is no check to show it.
  const showStatus = reminder.status !== 'pending'
  const canEdit = item.canManage && Boolean(onEdit)
  const canDismiss = item.canManage && reminder.status === 'pending'
  const reopenInMenu = reminder.status !== 'pending' && canReopen
  const hasMenu =
    canComplete ||
    canScheduleNext ||
    canEdit ||
    canDismiss ||
    reopenInMenu ||
    item.canManage

  const runStatusAction = async (
    action: 'complete' | 'dismiss' | 'reopen' | 'edit',
    callback: (careReminder: Doc<'careReminders'>) => Promise<void>,
  ) => {
    if (pendingRef.current) return
    pendingRef.current = true

    try {
      setActionError(null)
      setPendingAction(action)
      await callback(reminder)
      if (!mounted.current) return
      setConfirmed(action === 'complete')
      setEditor(null)
    } catch (error) {
      if (mounted.current) setActionError(error ?? new Error('Update failed'))
    } finally {
      pendingRef.current = false
      if (mounted.current) setPendingAction(null)
    }
  }

  return (
    <>
      <DashboardItemRecordCard
        data-care-completed={
          reminder.status === 'completed' || confirmed || undefined
        }
        accent={getCareReminderRecordAccent(reminder)}
        chrome={chrome}
        interactive={false}
        density="compact"
        // Date tile, one-line title and meta, then one outlined "…": the same shape as a horse row.
        className="grid-cols-[auto_minmax(0,1fr)_auto] gap-x-3 gap-y-0.5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-x-4"
        footer={
          actionError != null && (
            <p
              role="alert"
              className="col-span-2 col-start-2 mt-2 text-sm text-destructive"
            >
              {`${t('reminders.updateFailed')} ${describe(actionError)}`}
            </p>
          )
        }
        // Every action, Complete first, sits in one outlined menu at the row end, as in a detail page's phone header.
        actionColumnClassName="col-start-3 row-span-2 row-start-1 self-center justify-items-end"
        actions={
          hasMenu ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      ref={menuTrigger}
                      type="button"
                      variant="outline"
                      size="icon-row"
                      disabled={isUpdating}
                      aria-label={t('reminders.actionsNamed', {
                        name: reminder.title,
                      })}
                    />
                  }
                >
                  <DotsThreeVerticalIcon weight="bold" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  // The width of a detail page's phone menu, so no action wraps.
                  className="w-64 max-w-[calc(100vw-2rem)] p-2"
                >
                  {canComplete && (
                    <DropdownMenuItem
                      onClick={() =>
                        void runStatusAction('complete', onComplete)
                      }
                    >
                      {t('reminders.complete')}
                    </DropdownMenuItem>
                  )}
                  {/* A closed reminder's first action takes Complete's place. */}
                  {reopenInMenu && onReopen && (
                    <DropdownMenuItem
                      onClick={() => void runStatusAction('reopen', onReopen)}
                    >
                      {t('reminders.reopen')}
                    </DropdownMenuItem>
                  )}
                  {canScheduleNext && (
                    <DropdownMenuItem
                      onClick={() => {
                        setActionError(null)
                        setEditor('next')
                      }}
                    >
                      {t('reminders.completeAndSchedule')}
                    </DropdownMenuItem>
                  )}
                  {canEdit && (
                    <DropdownMenuItem
                      aria-label={t('reminders.editNamed', {
                        name: reminder.title,
                      })}
                      onClick={() => {
                        setActionError(null)
                        setEditor('edit')
                      }}
                    >
                      {t('common.edit')}
                    </DropdownMenuItem>
                  )}
                  {canDismiss && (
                    <DropdownMenuItem
                      onClick={() => void runStatusAction('dismiss', onDismiss)}
                    >
                      {t('reminders.dismiss')}
                    </DropdownMenuItem>
                  )}
                  {item.canManage && (
                    <RecordRemoveMenuItem
                      ariaLabel={removeNamed}
                      disabled={isUpdating}
                      onOpen={() => setRemoveOpen(true)}
                    />
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              {item.canManage && (
                <RecordRemoveAction
                  triggerAriaLabel={removeNamed}
                  title={t('reminders.removeNamed', { name: reminder.title })}
                  description={t('reminders.removeHelp')}
                  confirmLabel={t('reminders.remove')}
                  disabled={isUpdating}
                  onConfirm={() => onRemove(reminder)}
                  removalFocusTarget={removalFocusTarget}
                  open={removeOpen}
                  onOpenChange={setRemoveOpen}
                  externalTrigger={menuTrigger}
                />
              )}
            </>
          ) : undefined
        }
      >
        <EventDateBadge
          date={reminder.dueDate}
          // Centred on the title and meta lines, like the horse thumbnail; opened details sit below.
          className={cn(
            'col-start-1 row-span-2 row-start-1 self-center',
            tileTone,
          )}
        />
        <div className="relative col-start-2 row-start-1 flex min-w-0 items-center gap-1 self-end">
          {/* The title opens everything beyond the row's one line of facts. */}
          <DisclosureTitleButton
            open={detailsOpen}
            controls={detailsId}
            onToggle={() => setDetailsOpen((open) => !open)}
            label={reminder.title}
          />
          <Heading
            className={cn(
              dashboardItemLargeTitleClassName,
              disclosureTitleClassName,
              'min-w-0',
              detailsOpen ? 'wrap-anywhere' : 'truncate',
            )}
          >
            {reminder.title}
          </Heading>
          <DisclosureChevron open={detailsOpen} />
          {/* The tile's colour, for screen readers. */}
          {(overdue || reminder.priority === 'high') && (
            <span className="sr-only">
              {[
                overdue && t('careLabels.overdue'),
                reminder.priority === 'high' &&
                  `${t('reminders.priority')}: ${t('careLabels.priority.high')}`,
              ]
                .filter(Boolean)
                .join(', ')}
            </span>
          )}
        </div>
        <DashboardMetaList
          separator="dot"
          gap="compact"
          className="col-start-2 row-start-2 flex-nowrap self-start overflow-hidden whitespace-nowrap"
        >
          {showStatus && (
            <span>{t(`careLabels.reminderStatus.${reminder.status}`)}</span>
          )}
          <span>
            <span className="sr-only">{t('reminders.category')}: </span>
            {t(`careLabels.category.${reminder.category}`)}
          </span>
          {showHorse && item.horseName && (
            <span>
              <span className="sr-only">{t('reminders.horse')}: </span>
              {item.horseName}
            </span>
          )}
        </DashboardMetaList>
        <div
          id={detailsId}
          hidden={!detailsOpen}
          className="col-span-2 col-start-2 mt-3 grid min-w-0 gap-3"
        >
          <DashboardMetaList separator="dot" gap="compact">
            <span>{getCareReminderDueLabel(reminder, undefined, locale)}</span>
            {reminder.priority && (
              <span>
                {t('reminders.priority')}:{' '}
                {t(`careLabels.priority.${reminder.priority}`)}
              </span>
            )}
            <span>
              {t('reminders.responsible')}:{' '}
              {item.assigneeName || t('reminders.unassigned')}
            </span>
          </DashboardMetaList>
          {reminder.description && (
            <div className={dashboardRecordDetailsContentClassName}>
              {reminder.description}
            </div>
          )}
          {reminder.status === 'completed' && reminder.completedAt && (
            <p className="text-sm text-muted-foreground">
              {t(
                item.completedByName
                  ? 'reminders.completedByOn'
                  : 'reminders.completedOn',
                {
                  name: item.completedByName ?? '',
                  date: new Intl.DateTimeFormat(locale, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(reminder.completedAt),
                },
              )}
            </p>
          )}
          {reminder.followUpReminderId && (
            <p className="text-sm text-muted-foreground">
              {t('reminders.followUpScheduled')}
            </p>
          )}
          {reminder.horseId && (
            <div className="empty:hidden">
              <WorkspaceRecordAudience
                horseId={reminder.horseId}
                recordId={reminder._id}
              />
            </div>
          )}
        </div>
      </DashboardItemRecordCard>
      <EditRecordDialog
        open={editor !== null}
        onOpenChange={(open) => {
          if (!open) setEditor(null)
        }}
        isPending={isUpdating}
        title={t(
          editor === 'next'
            ? 'reminders.completeAndSchedule'
            : 'reminders.edit',
        )}
      >
        {editor === 'edit' && onEdit && (
          <CareReminderForm
            fixedHorseId={reminder.horseId}
            reminderId={reminder._id}
            assigneeOptions={assigneeOptions}
            initialValues={{
              title: reminder.title,
              description: reminder.description ?? '',
              category: reminder.category,
              dueDate: reminder.dueDate,
              priority: reminder.priority,
              assignedTo: reminder.assignedTo,
            }}
            presentation="plain"
            onSubmit={async (data) => {
              setPendingAction('edit')
              try {
                await onEdit(reminder, data)
                setEditor(null)
              } finally {
                if (mounted.current) setPendingAction(null)
              }
            }}
          />
        )}
        {editor === 'next' && (
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              if (
                !careReminderDueDateSchema.safeParse(nextDueDate).success ||
                nextDueDate <= reminder.dueDate
              ) {
                setDateError(true)
                return
              }
              setDateError(false)
              void runStatusAction('complete', (record) =>
                onComplete(record, nextDueDate),
              )
            }}
          >
            <Field>
              <FieldLabel htmlFor={`next-${reminder._id}`}>
                {t('reminders.nextDue')}
              </FieldLabel>
              <Input
                id={`next-${reminder._id}`}
                type="date"
                value={nextDueDate}
                disabled={isUpdating}
                aria-invalid={dateError}
                aria-describedby={
                  dateError
                    ? `next-help-${reminder._id} next-error-${reminder._id}`
                    : `next-help-${reminder._id}`
                }
                onChange={(event) => setNextDueDate(event.target.value)}
              />
              <FieldDescription id={`next-help-${reminder._id}`}>
                {t('reminders.completeAndScheduleHelp')}
              </FieldDescription>
            </Field>
            {dateError && (
              <p
                id={`next-error-${reminder._id}`}
                role="alert"
                className="text-sm text-destructive"
              >
                {t('reminders.nextDueInvalid')}
              </p>
            )}
            {actionError != null && (
              <p role="alert" className="text-sm text-destructive">
                {`${t('reminders.updateFailed')} ${describe(actionError)}`}
              </p>
            )}
            <Button type="submit" disabled={isUpdating}>
              {t('reminders.completeAndSchedule')}
            </Button>
          </form>
        )}
      </EditRecordDialog>
    </>
  )
}
