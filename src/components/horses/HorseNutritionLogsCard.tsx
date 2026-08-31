import { NutritionLogForm } from '#/components/horses/NutritionLogForm'
import { CreateRecordDialog } from '#/components/list-layout/CreateRecordDialog'
import { FilteredDashboardItemList } from '#/components/list-filtering/FilteredDashboardItemList'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'
import {
  DetailListBlock,
  DetailListGrid,
  DetailTextBlock,
} from '#/components/dashboard/DetailBlocks'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import {
  DashboardItemRecordCard,
  DashboardItemRecordContent,
} from '#/components/dashboard/DashboardItemCard'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import {
  dateKeyToTimestamp,
  formatMediumTimestampDate,
} from '#/lib/dateDisplay'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useCallback, useMemo, useState } from 'react'
import type { NutritionLogFormSchema } from 'shared/horses/nutritionLogSchema'
import { createHorseNutritionLogListFilterConfig } from './horseDetailListFilters'
import type { HorseDetailCreateActionChange } from './useHorseDetailCreateAction'
import { useHorseDetailCreateAction } from './useHorseDetailCreateAction'
import { HorseRecordRemoveAction } from './HorseRecordRemoveAction'

type HorseNutritionLogsCardProps = {
  horse: Doc<'horses'>
  onCreateActionChange?: HorseDetailCreateActionChange
}

export function HorseNutritionLogsCard({
  horse,
  onCreateActionChange,
}: HorseNutritionLogsCardProps) {
  const { data: logs } = useSuspenseQuery(
    convexQuery(api.horseNutritionLogs.listForHorse, { horseId: horse._id }),
  )
  const { data: permissions } = useSuspenseQuery(
    convexQuery(api.horseNutritionLogs.getPermissions, { horseId: horse._id }),
  )
  const addNutritionLog = useMutation(api.horseNutritionLogs.add)
  const removeNutritionLog = useMutation(api.horseNutritionLogs.remove)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [pendingLogId, setPendingLogId] = useState<string>()
  const canManage = permissions.canManage
  const filterConfig = useMemo(createHorseNutritionLogListFilterConfig, [])
  const filtering = useListFiltering({
    items: logs,
    config: filterConfig,
  })

  const onAddNutritionLog = useCallback(
    async (data: NutritionLogFormSchema) => {
      try {
        await addNutritionLog({
          horseId: horse._id,
          changedAt: dateKeyToTimestamp(data.changedDate),
          summary: data.summary,
          feedingRoutineSnapshot: data.feedingRoutineSnapshot,
          recommendedSnapshot: data.recommendedSnapshot,
          avoidSnapshot: data.avoidSnapshot,
          notes: data.notes,
        })

        showAppSuccessToast({
          title: 'Nutrition log added',
          description: <p>{horse.name}'s nutrition history was updated.</p>,
        })
        setIsCreateOpen(false)
      } catch (err) {
        showAppErrorToast()
        throw err
      }
    },
    [addNutritionLog, horse._id, horse.name],
  )

  const createDialog = useMemo(
    () =>
      canManage ? (
        <CreateRecordDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          triggerLabel="Add nutrition log"
          title="Add nutrition log"
          description="Record a nutrition change without losing your place in the list."
        >
          <NutritionLogForm horse={horse} onSubmit={onAddNutritionLog} />
        </CreateRecordDialog>
      ) : null,
    [canManage, horse, isCreateOpen, onAddNutritionLog],
  )
  const inlineCreateDialog = onCreateActionChange ? null : createDialog

  useHorseDetailCreateAction(createDialog, onCreateActionChange)

  const onRemoveNutritionLog = async (log: Doc<'horseNutritionLogs'>) => {
    try {
      setPendingLogId(log._id)
      await removeNutritionLog({ id: log._id })
      showAppSuccessToast({
        title: 'Nutrition log removed',
        description: <p>{log.summary} was removed.</p>,
      })
    } catch (err) {
      showAppErrorToast()
      throw err
    } finally {
      setPendingLogId(undefined)
    }
  }

  const logList = (
    <FilteredDashboardItemList
      config={filterConfig}
      filtering={filtering}
      emptyMessage="No nutrition changes have been logged for this horse yet."
      filteredEmptyMessage="No nutrition logs match this search."
      renderItem={(log) => (
        <NutritionLogRow
          key={log._id}
          log={log}
          canManage={canManage}
          pending={pendingLogId === log._id}
          onRemove={onRemoveNutritionLog}
        />
      )}
    />
  )

  const content = (
    <>
      {inlineCreateDialog}
      {logList}
    </>
  )

  if (onCreateActionChange) return content

  return <DashboardSection chrome="cards">{content}</DashboardSection>
}

function NutritionLogRow({
  log,
  canManage,
  pending,
  onRemove,
}: {
  log: Doc<'horseNutritionLogs'>
  canManage: boolean
  pending: boolean
  onRemove: (log: Doc<'horseNutritionLogs'>) => Promise<void>
}) {
  return (
    <DashboardItemRecordCard
      chrome="cards"
      actionsPlacement="footer"
      actionsClassName="ml-auto"
      actions={
        canManage ? (
          <HorseRecordRemoveAction
            disabled={pending}
            title={`Remove ${log.summary}?`}
            description="This nutrition change will be removed from the horse history permanently. This cannot be undone."
            onConfirm={() => onRemove(log)}
          />
        ) : undefined
      }
    >
      <DashboardItemRecordContent
        title={log.summary}
        titleSize="dense"
        meta={<span>Logged {formatMediumTimestampDate(log.changedAt)}</span>}
        description={log.notes}
      >
        {log.feedingRoutineSnapshot && (
          <DetailTextBlock label="Routine snapshot">
            {log.feedingRoutineSnapshot}
          </DetailTextBlock>
        )}

        {Boolean(
          log.recommendedSnapshot?.length || log.avoidSnapshot?.length,
        ) && (
          <DetailListGrid>
            {Boolean(log.recommendedSnapshot?.length) && (
              <DetailListBlock
                label="Recommended"
                items={log.recommendedSnapshot ?? []}
              />
            )}
            {Boolean(log.avoidSnapshot?.length) && (
              <DetailListBlock label="Avoid" items={log.avoidSnapshot ?? []} />
            )}
          </DetailListGrid>
        )}
      </DashboardItemRecordContent>
    </DashboardItemRecordCard>
  )
}
