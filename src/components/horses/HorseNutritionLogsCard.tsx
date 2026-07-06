import { NutritionLogForm } from '#/components/horses/NutritionLogForm'
import { CreateRecordDialog } from '#/components/list-layout/CreateRecordDialog'
import { ListFilterBar } from '#/components/list-filtering/ListFilterBar'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'
import {
  dashboardEmptyClassName,
  dashboardSectionClassName,
} from '#/components/dashboard/dashboardChrome'
import {
  dashboardItemActionButtonsClassName,
  dashboardItemActionColumnClassName,
  dashboardItemActionGridClassName,
  dashboardItemCardClassName,
} from '#/components/dashboard/DashboardItemCard'
import { Button } from '#/components/ui/button'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { NutritionLogFormSchema } from 'shared/horses/nutritionLogSchema'
import { createHorseNutritionLogListFilterConfig } from './horseDetailListFilters'
import type { HorseDetailCreateActionChange } from './useHorseDetailCreateAction'
import { useHorseDetailCreateAction } from './useHorseDetailCreateAction'

type HorseNutritionLogsCardProps = {
  horse: Doc<'horses'>
  onCreateActionChange?: HorseDetailCreateActionChange
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const formatChangedAt = (timestamp: number) =>
  dateFormatter.format(new Date(timestamp))

const changedDateToTimestamp = (date: string) =>
  new Date(`${date}T00:00:00`).getTime()

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
  const listToolbar =
    logs.length > 0 ? (
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

  const onAddNutritionLog = useCallback(async (data: NutritionLogFormSchema) => {
    try {
      await addNutritionLog({
        horseId: horse._id,
        changedAt: changedDateToTimestamp(data.changedDate),
        summary: data.summary,
        feedingRoutineSnapshot: data.feedingRoutineSnapshot,
        recommendedSnapshot: data.recommendedSnapshot,
        avoidSnapshot: data.avoidSnapshot,
        notes: data.notes,
      })

      toast.success('Nutrition log added', {
        description: <p>{horse.name}'s nutrition history was updated.</p>,
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
  }, [addNutritionLog, horse._id, horse.name])

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
      toast.success('Nutrition log removed', {
        description: <p>{log.summary} was removed.</p>,
        position: 'top-right',
      })
    } catch (err) {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
    } finally {
      setPendingLogId(undefined)
    }
  }

  const logList = (
    <div className="grid gap-4">
      {listToolbar}
      {logs.length === 0 ? (
        <div className={dashboardEmptyClassName('soft')}>
          <p>No nutrition changes have been logged for this horse yet.</p>
        </div>
      ) : filtering.items.length === 0 ? (
        <div className={dashboardEmptyClassName('soft')}>
          <p>No nutrition logs match this search.</p>
        </div>
      ) : (
        filtering.items.map((log) => (
          <NutritionLogRow
            key={log._id}
            log={log}
            canManage={canManage}
            pending={pendingLogId === log._id}
            onRemove={onRemoveNutritionLog}
          />
        ))
      )}
    </div>
  )

  const content = (
    <>
      {inlineCreateDialog}
      {logList}
    </>
  )

  if (onCreateActionChange) return content

  return (
    <section className={dashboardSectionClassName('soft', 'grid gap-6')}>
      {content}
    </section>
  )
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
    <div
      className={dashboardItemCardClassName({
        interactive: true,
        chrome: 'soft',
        className: dashboardItemActionGridClassName,
      })}
    >
      <div className="grid min-w-0 gap-3">
        <div className="grid gap-2">
          <h3 className="font-medium">{log.summary}</h3>
          <p className="text-sm text-muted-foreground">
            Logged {formatChangedAt(log.changedAt)}
          </p>
          {log.notes && (
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {log.notes}
            </p>
          )}
        </div>

        {log.feedingRoutineSnapshot && (
          <div className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Routine snapshot</span>
            <p className="whitespace-pre-wrap">{log.feedingRoutineSnapshot}</p>
          </div>
        )}

        {Boolean(
          log.recommendedSnapshot?.length || log.avoidSnapshot?.length,
        ) && (
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            {Boolean(log.recommendedSnapshot?.length) && (
              <SnapshotList
                title="Recommended"
                items={log.recommendedSnapshot ?? []}
              />
            )}
            {Boolean(log.avoidSnapshot?.length) && (
              <SnapshotList title="Avoid" items={log.avoidSnapshot ?? []} />
            )}
          </div>
        )}
      </div>

      {canManage && (
        <div className={dashboardItemActionColumnClassName}>
          <div className={dashboardItemActionButtonsClassName}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shadow-none"
              disabled={pending}
              onClick={() => onRemove(log)}
            >
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function SnapshotList({
  title,
  items,
}: {
  title: string
  items: Array<string>
}) {
  return (
    <div className="grid gap-1">
      <span className="text-muted-foreground">{title}</span>
      <ul className="list-inside list-disc">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
