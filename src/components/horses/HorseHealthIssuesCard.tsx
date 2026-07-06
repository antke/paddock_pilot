import { HealthIssueForm } from '#/components/horses/HealthIssueForm'
import { CreateRecordDialog } from '#/components/list-layout/CreateRecordDialog'
import { ListFilterBar } from '#/components/list-filtering/ListFilterBar'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'
import {
  dashboardItemActionButtonsClassName,
  dashboardItemActionColumnClassName,
  dashboardItemActionGridClassName,
  dashboardItemCardClassName,
  dashboardItemStateBadgesClassName,
} from '#/components/dashboard/DashboardItemCard'
import {
  dashboardEmptyClassName,
  dashboardSectionClassName,
} from '#/components/dashboard/dashboardChrome'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { CheckIcon, ClockIcon } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '#/lib/utils'
import type {
  HealthIssueFormSchema,
  HealthIssueSeverity,
  HealthIssueStatus,
} from 'shared/horses/healthIssueSchema'
import {
  createHorseHealthIssueListFilterConfig,
  horseHealthIssueSeverityLabels,
  horseHealthIssueStatusLabels,
} from './horseDetailListFilters'
import type { HorseDetailCreateActionChange } from './useHorseDetailCreateAction'
import { useHorseDetailCreateAction } from './useHorseDetailCreateAction'

type HorseHealthIssuesCardProps = {
  horse: Doc<'horses'>
  onCreateActionChange?: HorseDetailCreateActionChange
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const formatTimestamp = (timestamp: number) =>
  dateFormatter.format(new Date(timestamp))

const severityBadgeClassName = {
  low: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  medium:
    'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  high: 'border-destructive/30 bg-destructive/10 text-destructive',
} satisfies Record<HealthIssueSeverity, string>

const statusBadgeClassName = {
  active: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  resolved:
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
} satisfies Record<HealthIssueStatus, string>

const statusIcon = {
  active: ClockIcon,
  resolved: CheckIcon,
} satisfies Record<HealthIssueStatus, Icon>

const carePanelClassName = 'grid gap-6'

export function HorseHealthIssuesCard({
  horse,
  onCreateActionChange,
}: HorseHealthIssuesCardProps) {
  const { data: issues } = useSuspenseQuery(
    convexQuery(api.horseHealthIssues.listForHorse, { horseId: horse._id }),
  )
  const { data: permissions } = useSuspenseQuery(
    convexQuery(api.horseHealthIssues.getPermissions, { horseId: horse._id }),
  )
  const addIssue = useMutation(api.horseHealthIssues.add)
  const resolveIssue = useMutation(api.horseHealthIssues.resolve)
  const removeIssue = useMutation(api.horseHealthIssues.remove)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [pendingIssueId, setPendingIssueId] = useState<string>()
  const canManage = permissions.canManage
  const filterConfig = useMemo(createHorseHealthIssueListFilterConfig, [])
  const filtering = useListFiltering({
    items: issues,
    config: filterConfig,
  })
  const listToolbar =
    issues.length > 0 ? (
      <ListFilterBar
        config={filterConfig}
        query={filtering.query}
        onQueryChange={filtering.setQuery}
        selectedFacets={filtering.selectedFacets}
        onFacetChange={filtering.setFacetValue}
        onReset={filtering.resetFilters}
        isFiltering={filtering.isFiltering}
      />
    ) : undefined

  const onAddIssue = useCallback(async (data: HealthIssueFormSchema) => {
    try {
      await addIssue({
        horseId: horse._id,
        title: data.title,
        description: data.description,
        severity: data.severity,
      })

      toast.success('Health issue added', {
        description: <p>{data.title} is now visible on this horse profile.</p>,
        position: 'top-right',
      })
      setIsCreateOpen(false)
    } catch (err) {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
      throw err
    }
  }, [addIssue, horse._id])

  const createDialog = useMemo(
    () =>
      canManage ? (
        <CreateRecordDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          triggerLabel="Add health issue"
          title="Create health issue"
          description="Record a health note without losing your place in the list."
        >
          <HealthIssueForm onSubmit={onAddIssue} />
        </CreateRecordDialog>
      ) : null,
    [canManage, isCreateOpen, onAddIssue],
  )
  const inlineCreateDialog = onCreateActionChange ? null : createDialog

  useHorseDetailCreateAction(createDialog, onCreateActionChange)

  const onResolveIssue = async (issue: Doc<'horseHealthIssues'>) => {
    try {
      setPendingIssueId(issue._id)
      await resolveIssue({ id: issue._id })
      toast.success('Health issue resolved', {
        description: <p>{issue.title} was marked as resolved.</p>,
        position: 'top-right',
      })
    } catch (err) {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
    } finally {
      setPendingIssueId(undefined)
    }
  }

  const onRemoveIssue = async (issue: Doc<'horseHealthIssues'>) => {
    try {
      setPendingIssueId(issue._id)
      await removeIssue({ id: issue._id })
      toast.success('Health issue removed', {
        description: <p>{issue.title} was removed.</p>,
        position: 'top-right',
      })
    } catch (err) {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
    } finally {
      setPendingIssueId(undefined)
    }
  }

  const issueList = (
    <div className="grid gap-4">
      {listToolbar}
      {issues.length === 0 ? (
        <div className={dashboardEmptyClassName('soft')}>
          <p>No health issues have been added for this horse yet.</p>
        </div>
      ) : filtering.items.length === 0 ? (
        <div className={dashboardEmptyClassName('soft')}>
          <p>No health issues match these filters.</p>
        </div>
      ) : (
        filtering.items.map((issue) => (
          <IssueRow
            key={issue._id}
            issue={issue}
            canManage={canManage}
            pending={pendingIssueId === issue._id}
            onResolve={onResolveIssue}
            onRemove={onRemoveIssue}
          />
        ))
      )}
    </div>
  )

  const content = (
    <>
      {inlineCreateDialog}
      {issueList}
    </>
  )

  if (onCreateActionChange) return content

  return (
    <section className={dashboardSectionClassName('soft', carePanelClassName)}>
      {content}
    </section>
  )
}

function IssueRow({
  issue,
  canManage,
  pending,
  onResolve,
  onRemove,
}: {
  issue: Doc<'horseHealthIssues'>
  canManage: boolean
  pending: boolean
  onResolve: (issue: Doc<'horseHealthIssues'>) => Promise<void>
  onRemove: (issue: Doc<'horseHealthIssues'>) => Promise<void>
}) {
  const metadata = [
    `Noted ${formatTimestamp(issue.notedAt)}`,
    issue.resolvedAt
      ? `Resolved ${formatTimestamp(issue.resolvedAt)}`
      : undefined,
    `Updated ${formatTimestamp(issue.updatedAt)}`,
  ].filter(Boolean)

  return (
    <div
      className={dashboardItemCardClassName({
        interactive: true,
        chrome: 'soft',
        className: dashboardItemActionGridClassName,
      })}
    >
      <div className="grid min-w-0 gap-3">
        <h3 className="text-lg font-semibold leading-snug tracking-[-0.01em] underline-offset-4 transition-colors group-hover/dashboard-item:text-primary group-hover/dashboard-item:underline">
          {issue.title}
        </h3>

        <p className="text-sm text-muted-foreground">{metadata.join(' · ')}</p>

        {issue.description && (
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {issue.description}
          </p>
        )}
      </div>

      <div className={dashboardItemActionColumnClassName}>
        <div className={dashboardItemStateBadgesClassName}>
          {issue.severity && <SeverityBadge severity={issue.severity} />}
          <IssueStatusBadge status={issue.status} />
        </div>

        {canManage && (
          <div className={dashboardItemActionButtonsClassName}>
            {issue.status === 'active' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shadow-none"
                disabled={pending}
                onClick={() => onResolve(issue)}
              >
                Resolve
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shadow-none"
              disabled={pending}
              onClick={() => onRemove(issue)}
            >
              Remove
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function SeverityBadge({ severity }: { severity: HealthIssueSeverity }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'min-h-5 px-2 text-[10px] font-medium leading-none shadow-none',
        severityBadgeClassName[severity],
      )}
    >
      {horseHealthIssueSeverityLabels[severity]}
    </Badge>
  )
}

function IssueStatusBadge({ status }: { status: HealthIssueStatus }) {
  const StatusIcon = statusIcon[status]

  return (
    <Badge
      variant="outline"
      className={cn(
        'min-h-5 gap-1 px-2 text-[10px] font-medium leading-none shadow-none',
        statusBadgeClassName[status],
      )}
    >
      <StatusIcon className="size-3" weight="bold" />
      {horseHealthIssueStatusLabels[status]}
    </Badge>
  )
}
