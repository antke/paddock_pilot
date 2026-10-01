import { useT, useLocale } from '#/i18n/LocaleProvider'
import { HealthIssueForm } from '#/components/horses/HealthIssueForm'
import { CreateRecordDialog } from '#/components/list-layout/CreateRecordDialog'
import { FilteredDashboardItemList } from '#/components/list-filtering/FilteredDashboardItemList'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'
import {
  DashboardItemRecordCard,
  DashboardItemRecordContent,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { Button } from '#/components/ui/button'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { formatMediumTimestampDate } from '#/lib/dateDisplay'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useCallback, useMemo, useRef, useState } from 'react'
import type { HealthIssueFormSchema } from 'shared/horses/healthIssueSchema'
import {
  HealthIssueSeverityBadge,
  HealthIssueStatusBadge,
} from './HorseCareBadges'
import { createHorseHealthIssueListFilterConfig } from './horseDetailListFilters'
import type { HorseDetailCreateActionChange } from './useHorseDetailCreateAction'
import { useHorseDetailCreateAction } from './useHorseDetailCreateAction'
import { HorseRecordRemoveAction } from './HorseRecordRemoveAction'

type HorseHealthIssuesCardProps = {
  horse: Doc<'horses'>
  onCreateActionChange?: HorseDetailCreateActionChange
}

export function HorseHealthIssuesCard({
  horse,
  onCreateActionChange,
}: HorseHealthIssuesCardProps) {
  const t = useT()

  const { data: issues } = useSuspenseQuery(
    convexQuery(api.horseHealthIssues.listForHorse, { horseId: horse._id }),
  )
  const { data: permissions } = useSuspenseQuery(
    convexQuery(api.horseHealthIssues.getPermissions, { horseId: horse._id }),
  )
  const addIssue = useMutation(api.horseHealthIssues.add)
  const resolveIssue = useMutation(api.horseHealthIssues.resolve)
  const removeIssue = useMutation(api.horseHealthIssues.remove)
  return (
    <HorseHealthIssuesCardView
      key={horse._id}
      horse={horse}
      issues={issues}
      canManage={permissions.canManage}
      onCreateActionChange={onCreateActionChange}
      onAdd={async (data) => {
        try {
          await addIssue({ horseId: horse._id, ...data })
          showAppSuccessToast({ title: t('careRecords.issueAdded') })
        } catch (error) {
          showAppErrorToast()
          throw error
        }
      }}
      onResolve={async (issue) => {
        try {
          await resolveIssue({ id: issue._id })
          showAppSuccessToast({ title: t('careRecords.issueResolved') })
        } catch (error) {
          showAppErrorToast()
          throw error
        }
      }}
      onRemove={async (issue) => {
        try {
          await removeIssue({ id: issue._id })
          showAppSuccessToast({ title: t('careRecords.issueRemoved') })
        } catch (error) {
          showAppErrorToast()
          throw error
        }
      }}
    />
  )
}

type HorseHealthIssuesCardViewProps = HorseHealthIssuesCardProps & {
  issues: Array<Doc<'horseHealthIssues'>>
  canManage: boolean
  onAdd: (data: HealthIssueFormSchema) => Promise<void>
  onResolve: (issue: Doc<'horseHealthIssues'>) => Promise<void>
  onRemove: (issue: Doc<'horseHealthIssues'>) => Promise<void>
}

export function HorseHealthIssuesCardView({
  horse,
  issues,
  canManage,
  onAdd,
  onResolve,
  onRemove,
  onCreateActionChange,
}: HorseHealthIssuesCardViewProps) {
  const t = useT()
  const { locale } = useLocale()

  const activeOperations = useRef(new Set<string>())
  const [operations, setOperations] = useState<
    Record<string, { pending: 'status' | 'remove' | null; failed: boolean }>
  >({})
  const runRecordAction = async (
    id: string,
    kind: 'status' | 'remove',
    callback: () => Promise<void>,
  ) => {
    if (activeOperations.current.has(id)) return
    activeOperations.current.add(id)
    setOperations((states) => ({
      ...states,
      [id]: { pending: kind, failed: false },
    }))
    let failed = false
    try {
      await callback()
    } catch (error) {
      failed = true
      if (kind === 'remove') throw error
    } finally {
      activeOperations.current.delete(id)
      setOperations((states) => ({
        ...states,
        [id]: { pending: null, failed },
      }))
    }
  }
  const [isCreating, setIsCreating] = useState(false)
  const listRegion = useRef<HTMLDivElement>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const filterConfig = useMemo(
    () => createHorseHealthIssueListFilterConfig(locale),
    [locale],
  )
  const filtering = useListFiltering({
    items: issues,
    config: filterConfig,
  })

  const onAddIssue = useCallback(
    async (data: HealthIssueFormSchema) => {
      await onAdd(data)
      setIsCreateOpen(false)
    },
    [onAdd],
  )

  const createDialog = useMemo(
    () =>
      canManage ? (
        <CreateRecordDialog
          open={isCreateOpen}
          isPending={isCreating}
          onOpenChange={setIsCreateOpen}
          triggerLabel={t('careRecords.addHealthIssue')}
          title={t('careRecords.createHealthIssue')}
          description={t('careRecords.createHealthHelp')}
        >
          <HealthIssueForm
            onSubmit={onAddIssue}
            onPendingChange={setIsCreating}
          />
        </CreateRecordDialog>
      ) : null,
    [canManage, isCreateOpen, isCreating, onAddIssue, t],
  )
  const inlineCreateDialog = onCreateActionChange ? null : createDialog

  useHorseDetailCreateAction(createDialog, onCreateActionChange)

  const issueList = (
    <FilteredDashboardItemList
      config={filterConfig}
      filtering={filtering}
      emptyMessage={t('careRecords.healthEmpty')}
      filteredEmptyMessage={t('careRecords.healthFilteredEmpty')}
      renderItem={(issue) => (
        <IssueRow
          key={issue._id}
          issue={issue}
          pending={operations[issue._id]?.pending ?? null}
          failed={operations[issue._id]?.failed ?? false}
          run={(kind, callback) => runRecordAction(issue._id, kind, callback)}
          canManage={canManage}
          removalFocusTarget={() => listRegion.current}
          onResolve={onResolve}
          onRemove={onRemove}
        />
      )}
    />
  )

  const content = (
    <div
      ref={listRegion}
      role="region"
      aria-label={t('careRecords.healthRegion', { name: horse.name })}
      tabIndex={-1}
      className="grid gap-5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {inlineCreateDialog}
      {issueList}
    </div>
  )

  if (onCreateActionChange) return content

  return <DashboardSection>{content}</DashboardSection>
}

function IssueRow({
  issue,
  canManage,
  pending,
  failed,
  run,
  removalFocusTarget,
  onResolve,
  onRemove,
}: {
  issue: Doc<'horseHealthIssues'>
  canManage: boolean
  pending: 'status' | 'remove' | null
  failed: boolean
  run: (
    kind: 'status' | 'remove',
    callback: () => Promise<void>,
  ) => Promise<void>
  removalFocusTarget: () => HTMLElement | null
  onResolve: (issue: Doc<'horseHealthIssues'>) => Promise<void>
  onRemove: (issue: Doc<'horseHealthIssues'>) => Promise<void>
}) {
  const t = useT()
  const { locale } = useLocale()

  const showSeverityBadge = issue.severity === 'high'
  const showStatusBadge = issue.status === 'resolved'

  return (
    <DashboardItemRecordCard
      chrome="flat"
      footer={
        failed ? (
          <p role="alert" className="text-sm text-destructive">
            {t('careRecords.updateFailed')}
          </p>
        ) : undefined
      }
      actionsPlacement="footer"
      actionsClassName="ml-auto"
      actionBadges={
        showSeverityBadge || showStatusBadge ? (
          <>
            {showSeverityBadge && <HealthIssueSeverityBadge severity="high" />}
            {showStatusBadge && (
              <HealthIssueStatusBadge status={issue.status} />
            )}
          </>
        ) : undefined
      }
      actions={
        canManage ? (
          <>
            {issue.status === 'active' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending !== null}
                aria-busy={pending === 'status' || undefined}
                aria-label={t('careRecords.resolveNamed', {
                  name: issue.title,
                })}
                onClick={() => void run('status', () => onResolve(issue))}
              >
                {pending === 'status'
                  ? t('careRecords.resolving')
                  : t('careRecords.resolve')}
              </Button>
            )}
            <HorseRecordRemoveAction
              disabled={pending !== null}
              title={t('careRecords.removeNamed', { name: issue.title })}
              description={t('careRecords.removeHealthHelp')}
              removalFocusTarget={removalFocusTarget}
              onConfirm={() => run('remove', () => onRemove(issue))}
            />
          </>
        ) : undefined
      }
    >
      <DashboardItemRecordContent
        title={issue.title}
        meta={
          <>
            <span>
              {t('careRecords.notedAt', {
                date: formatMediumTimestampDate(issue.notedAt, locale),
              })}
            </span>
            {issue.severity && issue.severity !== 'high' && (
              <span>{t(`careLabels.severity.${issue.severity}`)}</span>
            )}
            {issue.resolvedAt && (
              <span>
                {t('careRecords.resolvedAt', {
                  date: formatMediumTimestampDate(issue.resolvedAt, locale),
                })}
              </span>
            )}
            <span>
              {t('careRecords.updatedAt', {
                date: formatMediumTimestampDate(issue.updatedAt, locale),
              })}
            </span>
          </>
        }
        description={issue.description}
      />
    </DashboardItemRecordCard>
  )
}
