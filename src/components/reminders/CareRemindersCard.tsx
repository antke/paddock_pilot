import { WorkspaceRecordAudience } from '#/components/sharing/RecordAudienceLabel'
import { MotionList } from '#/components/motion/MotionList'
import { MotionNotice } from '#/components/motion/MotionNotice'
import { ConfirmedCheck } from '#/components/motion/StateFeedback'
import { ActionFeedback } from '#/components/ui/action-feedback'
import { useT, useLocale } from '#/i18n/LocaleProvider'
import {
  DashboardRecordDetails,
  dashboardRecordDetailsContentClassName,
  dashboardRecordDetailsTriggerClassName,
} from '#/components/dashboard/DashboardRecordDetails'
import { DisclosureChevron } from '#/components/ui/disclosure-chevron'
import { DashboardMetaList } from '#/components/dashboard/DashboardMetaList'
import { DashboardBadgeList } from '#/components/dashboard/DashboardBadgeList'
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
import { EditActionButton } from '#/components/ui/edit-action'
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
import { CheckIcon, DotsThreeIcon } from '@phosphor-icons/react'
import type { Doc } from 'convex/_generated/dataModel'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { ElementType, ReactNode } from 'react'
import { cn } from '#/lib/utils'
import {
  CareReminderDueText,
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
  assigneeOptions?: Array<HorseOption>
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
  assigneeOptions?: Array<HorseOption>
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
  const { locale } = useLocale()
  const { reminder } = item
  const overdue = isCareReminderOverdue(reminder)
  const dueState = getCareReminderDueState(reminder)
  const showPriorityBadge = reminder.priority === 'high'
  // Overdue is carried by the due line; the badge only marks closed reminders.
  const showStatusBadge = reminder.status !== 'pending'
  const Heading = `h${headingLevel}` as const
  // Listed first in the row's overflow menu. Opens the next-date editor only; nothing is
  // completed until it is saved.
  const canScheduleNext =
    item.canManage &&
    reminder.status === 'pending' &&
    !reminder.followUpReminderId
  const hasActions =
    item.canManage ||
    (reminder.status === 'pending' && (item.canComplete ?? item.canManage)) ||
    (reminder.status !== 'pending' &&
      (item.canReopen ?? item.canManage) &&
      Boolean(onReopen))
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
  const [actionError, setActionError] = useState(false)
  // Pending rows already have a "…" menu, so Remove goes last inside it.
  const removeInMenu = item.canManage && reminder.status === 'pending'
  const [removeOpen, setRemoveOpen] = useState(false)
  const menuTrigger = useRef<HTMLButtonElement>(null)
  const removeNamed = t('reminders.removeRecordNamed', { name: reminder.title })
  // Phones put the Details trigger at the start of the action row; its notes open below it.
  const phoneDetails = Boolean(reminder.description) && hasActions
  const [detailsOpen, setDetailsOpen] = useState(false)
  const detailsId = useId()

  const runStatusAction = async (
    action: 'complete' | 'dismiss' | 'reopen' | 'edit',
    callback: (careReminder: Doc<'careReminders'>) => Promise<void>,
  ) => {
    if (pendingRef.current) return
    pendingRef.current = true

    try {
      setActionError(false)
      setPendingAction(action)
      await callback(reminder)
      if (!mounted.current) return
      setConfirmed(action === 'complete')
      setEditor(null)
    } catch {
      if (mounted.current) setActionError(true)
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
        footer={
          <>
            {phoneDetails && (
              <div
                id={detailsId}
                hidden={!detailsOpen}
                className={cn(
                  dashboardRecordDetailsContentClassName,
                  'sm:hidden',
                )}
              >
                {reminder.description}
              </div>
            )}
            {actionError && (
              <p
                role="alert"
                className="text-sm text-destructive sm:col-span-2"
              >
                {t('reminders.updateFailed')}
              </p>
            )}
          </>
        }
        // Like document rows: an inline right-hand action column from `sm`,
        // a full-width row under the text on phones.
        actionColumnClassName="sm:col-start-2 sm:row-start-1"
        actionsClassName="max-sm:w-full"
        actions={
          hasActions ? (
            <>
              {phoneDetails && (
                <Button
                  type="button"
                  variant="link"
                  // Own slot, so the phone action row's button padding skips it and the text sits on the title edge.
                  data-slot="record-details-trigger"
                  aria-expanded={detailsOpen}
                  aria-controls={detailsId}
                  onClick={() => setDetailsOpen((open) => !open)}
                  className={cn(
                    dashboardRecordDetailsTriggerClassName,
                    'h-auto px-0 sm:hidden',
                  )}
                >
                  {t('reminders.details')}
                  <span className="sr-only">
                    {t('reminders.forPrefix')}
                    {reminder.title}
                  </span>
                  <DisclosureChevron open={detailsOpen} />
                </Button>
              )}
              {reminder.status === 'pending' &&
                (item.canComplete ?? item.canManage) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUpdating || confirmed}
                    aria-busy={pendingAction === 'complete' || undefined}
                    aria-label={t('reminders.completeNamed', {
                      name: reminder.title,
                    })}
                    onClick={() => void runStatusAction('complete', onComplete)}
                  >
                    <ActionFeedback
                      label={t('reminders.complete')}
                      pendingLabel={t('reminders.completing')}
                      confirmedLabel={t('careLabels.reminderStatus.completed')}
                      pending={pendingAction === 'complete'}
                      confirmed={confirmed}
                      icon={
                        <CheckIcon data-icon="inline-start" weight="bold" />
                      }
                    />
                  </Button>
                )}
              {reminder.status !== 'pending' &&
                (item.canReopen ?? item.canManage) &&
                onReopen && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isUpdating}
                    onClick={() => void runStatusAction('reopen', onReopen)}
                  >
                    {t('reminders.reopen')}
                  </Button>
                )}
              {item.canManage && onEdit && (
                <EditActionButton
                  label={t('reminders.editNamed', { name: reminder.title })}
                  disabled={isUpdating}
                  onClick={() => {
                    setActionError(false)
                    setEditor('edit')
                  }}
                />
              )}
              {removeInMenu && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        ref={menuTrigger}
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={isUpdating}
                        aria-label={t('reminders.actionsNamed', {
                          name: reminder.title,
                        })}
                      />
                    }
                  >
                    <DotsThreeIcon weight="bold" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canScheduleNext && (
                      <DropdownMenuItem
                        disabled={confirmed}
                        onClick={() => {
                          setActionError(false)
                          setEditor('next')
                        }}
                      >
                        {t('reminders.completeAndSchedule')}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => void runStatusAction('dismiss', onDismiss)}
                    >
                      {t('reminders.dismiss')}
                    </DropdownMenuItem>
                    <RecordRemoveMenuItem
                      ariaLabel={removeNamed}
                      disabled={isUpdating}
                      onOpen={() => setRemoveOpen(true)}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {item.canManage && (
                <RecordRemoveAction
                  triggerAriaLabel={removeNamed}
                  title={t('reminders.removeNamed', { name: reminder.title })}
                  description={t('reminders.removeHelp')}
                  confirmLabel={t('reminders.remove')}
                  disabled={isUpdating}
                  onConfirm={() => onRemove(reminder)}
                  removalFocusTarget={removalFocusTarget}
                  {...(removeInMenu && {
                    open: removeOpen,
                    onOpenChange: setRemoveOpen,
                    externalTrigger: menuTrigger,
                  })}
                />
              )}
            </>
          ) : undefined
        }
      >
        <div className="grid min-w-0 gap-3">
          <header className="grid min-w-0 gap-1">
            {/* Inline flow, so the chips follow the title's last word as it wraps;
                the one space between them carries the gap and vanishes at a line start. */}
            <div className="min-w-0 [word-spacing:0.5rem]">
              <Heading
                className={`${dashboardItemLargeTitleClassName} inline [word-spacing:normal] wrap-anywhere`}
              >
                {reminder.title}
              </Heading>{' '}
              {(showPriorityBadge || showStatusBadge) && (
                <DashboardBadgeList
                  gap="compact"
                  className="inline-flex align-middle [word-spacing:normal]"
                >
                  {showPriorityBadge && (
                    <CareReminderPriorityBadge priority="high" />
                  )}
                  {showStatusBadge && (
                    <CareReminderStatusBadge
                      status={reminder.status}
                      overdue={false}
                    />
                  )}
                </DashboardBadgeList>
              )}
            </div>
            {/* Details shares the meta line when it fits and opens onto its own line. */}
            <div className="flex min-w-0 flex-wrap items-center gap-x-4">
              <DashboardMetaList separator="dot" gap="compact">
                <CareReminderDueText
                  dueDate={reminder.dueDate}
                  overdue={overdue}
                  className={
                    dueState === 'today' || dueState === 'soon'
                      ? 'font-semibold text-foreground'
                      : undefined
                  }
                >
                  {getCareReminderDueLabel(reminder, undefined, locale)}
                </CareReminderDueText>
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
                <span>
                  <span className="sr-only">
                    {t('reminders.responsible')}:{' '}
                  </span>
                  {item.assigneeName || t('reminders.unassigned')}
                </span>
              </DashboardMetaList>
              {reminder.description && (
                <DashboardRecordDetails
                  recordTitle={reminder.title}
                  open={detailsOpen}
                  onToggle={(event) => setDetailsOpen(event.currentTarget.open)}
                  className={cn(
                    'open:basis-full md:[&>summary]:py-0.5',
                    phoneDetails && 'max-sm:hidden',
                  )}
                >
                  {reminder.description}
                </DashboardRecordDetails>
              )}
            </div>
          </header>
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
        </div>
        {reminder.horseId && (
          <div className="empty:hidden sm:col-span-2">
            <WorkspaceRecordAudience
              horseId={reminder.horseId}
              recordId={reminder._id}
            />
          </div>
        )}
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
            {actionError && (
              <p role="alert" className="text-sm text-destructive">
                {t('reminders.updateFailed')}
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
