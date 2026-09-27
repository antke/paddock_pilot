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
import { useCallback, useMemo, useRef, useState } from 'react'
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
      } catch (err) {
        showAppErrorToast()
        throw err
      }
    },
    [addNutritionLog, horse._id, horse.name],
  )

  const onRemoveNutritionLog = async (log: Doc<'horseNutritionLogs'>) => {
    try {
      await removeNutritionLog({ id: log._id })
      showAppSuccessToast({
        title: 'Nutrition log removed',
        description: <p>{log.summary} was removed.</p>,
      })
    } catch (err) {
      showAppErrorToast()
      throw err
    }
  }

  return (
    <HorseNutritionLogsView
      key={horse._id}
      horse={horse}
      logs={logs}
      canManage={permissions.canManage}
      onAdd={onAddNutritionLog}
      onRemove={onRemoveNutritionLog}
      onCreateActionChange={onCreateActionChange}
    />
  )
}

export function HorseNutritionLogsView({
  horse,
  logs,
  canManage,
  onAdd,
  onRemove,
  onCreateActionChange,
}: HorseNutritionLogsCardProps & {
  logs: Array<Doc<'horseNutritionLogs'>>
  canManage: boolean
  onAdd: (values: NutritionLogFormSchema) => Promise<void>
  onRemove: (log: Doc<'horseNutritionLogs'>) => Promise<void>
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const creating = useRef(false)
  const region = useRef<HTMLElement>(null)
  const onPendingChange = useCallback((pending: boolean) => {
    creating.current = pending
    setIsCreating(pending)
  }, [])
  const addAndClose = useCallback(
    async (values: NutritionLogFormSchema) => {
      await onAdd(values)
      setIsCreateOpen(false)
    },
    [onAdd],
  )
  const filterConfig = useMemo(createHorseNutritionLogListFilterConfig, [])
  const filtering = useListFiltering({ items: logs, config: filterConfig })
  const createDialog = useMemo(
    () =>
      canManage ? (
        <CreateRecordDialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            if (!creating.current) setIsCreateOpen(open)
          }}
          isPending={isCreating}
          triggerLabel="Add nutrition log"
          title="Add nutrition log"
          description="Keep a dated record of feeding changes."
        >
          <NutritionLogForm
            horse={horse}
            onSubmit={addAndClose}
            onPendingChange={onPendingChange}
          />
        </CreateRecordDialog>
      ) : null,
    [canManage, horse, isCreateOpen, isCreating, addAndClose, onPendingChange],
  )
  const inlineCreateDialog = onCreateActionChange ? null : createDialog

  useHorseDetailCreateAction(createDialog, onCreateActionChange)

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
          onRemove={onRemove}
          removalFocusTarget={() => region.current}
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

  if (onCreateActionChange)
    return (
      <div
        ref={(element) => {
          region.current = element
        }}
        role="group"
        aria-label="Nutrition history"
        tabIndex={-1}
        className="grid gap-6"
      >
        {content}
      </div>
    )

  return (
    <DashboardSection
      ref={(element) => {
        region.current = element
      }}
      role="group"
      aria-label="Nutrition history"
      tabIndex={-1}
    >
      {content}
    </DashboardSection>
  )
}

function NutritionLogRow({
  log,
  canManage,
  removalFocusTarget,
  onRemove,
}: {
  log: Doc<'horseNutritionLogs'>
  canManage: boolean
  removalFocusTarget: () => HTMLElement | null
  onRemove: (log: Doc<'horseNutritionLogs'>) => Promise<void>
}) {
  return (
    <DashboardItemRecordCard
      interactive={false}
      chrome="flat"
      actionsPlacement="footer"
      actionsClassName="ml-auto"
      actions={
        canManage ? (
          <HorseRecordRemoveAction
            removalFocusTarget={removalFocusTarget}
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
