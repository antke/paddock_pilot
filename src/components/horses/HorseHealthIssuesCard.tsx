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
import { useCallback, useMemo, useState } from 'react'
import type { HealthIssueFormSchema } from 'shared/horses/healthIssueSchema'
import {
  HealthIssueSeverityBadge,
  HealthIssueStatusBadge,
} from './HorseCareBadges'
import { createHorseHealthIssueListFilterConfig } from './horseDetailListFilters'
import type { HorseDetailCreateActionChange } from './useHorseDetailCreateAction'
import { useHorseDetailCreateAction } from './useHorseDetailCreateAction'

type HorseHealthIssuesCardProps = {
  horse: Doc<'horses'>
  onCreateActionChange?: HorseDetailCreateActionChange
}

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

  const onAddIssue = useCallback(
    async (data: HealthIssueFormSchema) => {
      try {
        await addIssue({
          horseId: horse._id,
          title: data.title,
          description: data.description,
          severity: data.severity,
        })

        showAppSuccessToast({
          title: 'Health issue added',
          description: (
            <p>{data.title} is now visible on this horse profile.</p>
          ),
        })
        setIsCreateOpen(false)
      } catch (err) {
        showAppErrorToast()
        throw err
      }
    },
    [addIssue, horse._id],
  )

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
      showAppSuccessToast({
        title: 'Health issue resolved',
        description: <p>{issue.title} was marked as resolved.</p>,
      })
    } catch (err) {
      showAppErrorToast()
    } finally {
      setPendingIssueId(undefined)
    }
  }

  const onRemoveIssue = async (issue: Doc<'horseHealthIssues'>) => {
    try {
      setPendingIssueId(issue._id)
      await removeIssue({ id: issue._id })
      showAppSuccessToast({
        title: 'Health issue removed',
        description: <p>{issue.title} was removed.</p>,
      })
    } catch (err) {
      showAppErrorToast()
    } finally {
      setPendingIssueId(undefined)
    }
  }

  const issueList = (
    <FilteredDashboardItemList
      config={filterConfig}
      filtering={filtering}
      emptyMessage="No health issues have been added for this horse yet."
      filteredEmptyMessage="No health issues match these filters."
      renderItem={(issue) => (
        <IssueRow
          key={issue._id}
          issue={issue}
          canManage={canManage}
          pending={pendingIssueId === issue._id}
          onResolve={onResolveIssue}
          onRemove={onRemoveIssue}
        />
      )}
    />
  )

  const content = (
    <>
      {inlineCreateDialog}
      {issueList}
    </>
  )

  if (onCreateActionChange) return content

  return <DashboardSection chrome="cards">{content}</DashboardSection>
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
  return (
    <DashboardItemRecordCard
      chrome="cards"
      actionsPlacement="footer"
      actionsClassName="ml-auto"
      actionBadges={
        <>
          {issue.severity && (
            <HealthIssueSeverityBadge severity={issue.severity} />
          )}
          <HealthIssueStatusBadge status={issue.status} />
        </>
      }
      actions={
        canManage ? (
          <>
            {issue.status === 'active' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
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
              disabled={pending}
              onClick={() => onRemove(issue)}
            >
              Remove
            </Button>
          </>
        ) : undefined
      }
    >
      <DashboardItemRecordContent
        title={issue.title}
        meta={
          <>
            <span>Noted {formatMediumTimestampDate(issue.notedAt)}</span>
            {issue.resolvedAt && (
              <span>
                Resolved {formatMediumTimestampDate(issue.resolvedAt)}
              </span>
            )}
            <span>Updated {formatMediumTimestampDate(issue.updatedAt)}</span>
          </>
        }
        description={issue.description}
      />
    </DashboardItemRecordCard>
  )
}
