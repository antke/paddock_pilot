import { WeightRecordForm } from '#/components/horses/WeightRecordForm'
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
import type { WeightRecordFormSchema } from 'shared/horses/weightRecordSchema'
import { createHorseWeightRecordListFilterConfig } from './horseDetailListFilters'
import type { HorseDetailCreateActionChange } from './useHorseDetailCreateAction'
import { useHorseDetailCreateAction } from './useHorseDetailCreateAction'

type HorseWeightRecordsCardProps = {
  horse: Doc<'horses'>
  onCreateActionChange?: HorseDetailCreateActionChange
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const formatMeasuredAt = (timestamp: number) =>
  dateFormatter.format(new Date(timestamp))

const measuredDateToTimestamp = (date: string) =>
  new Date(`${date}T00:00:00`).getTime()

export function HorseWeightRecordsCard({
  horse,
  onCreateActionChange,
}: HorseWeightRecordsCardProps) {
  const { data: records } = useSuspenseQuery(
    convexQuery(api.horseWeightRecords.listForHorse, { horseId: horse._id }),
  )
  const { data: permissions } = useSuspenseQuery(
    convexQuery(api.horseWeightRecords.getPermissions, { horseId: horse._id }),
  )
  const addWeightRecord = useMutation(api.horseWeightRecords.add)
  const removeWeightRecord = useMutation(api.horseWeightRecords.remove)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [pendingRecordId, setPendingRecordId] = useState<string>()
  const canManage = permissions.canManage
  const latestRecord = records[0]
  const filterConfig = useMemo(createHorseWeightRecordListFilterConfig, [])
  const filtering = useListFiltering({
    items: records,
    config: filterConfig,
  })
  const listToolbar =
    records.length > 0 ? (
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

  const onAddWeightRecord = useCallback(async (data: WeightRecordFormSchema) => {
    try {
      await addWeightRecord({
        horseId: horse._id,
        weight: data.weight,
        unit: data.unit,
        measuredAt: measuredDateToTimestamp(data.measuredDate),
        bodyConditionScore: data.bodyConditionScore,
        notes: data.notes,
      })

      toast.success('Weight record added', {
        description: <p>{horse.name}'s weight history was updated.</p>,
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
  }, [addWeightRecord, horse._id, horse.name])

  const createDialog = useMemo(
    () =>
      canManage ? (
        <CreateRecordDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          triggerLabel="Add weight"
          title="Add weight"
          description="Record a weight measurement without losing your place in the list."
        >
          <WeightRecordForm onSubmit={onAddWeightRecord} />
        </CreateRecordDialog>
      ) : null,
    [canManage, isCreateOpen, onAddWeightRecord],
  )
  const inlineCreateDialog = onCreateActionChange ? null : createDialog

  useHorseDetailCreateAction(createDialog, onCreateActionChange)

  const onRemoveWeightRecord = async (record: Doc<'horseWeightRecords'>) => {
    try {
      setPendingRecordId(record._id)
      await removeWeightRecord({ id: record._id })
      toast.success('Weight record removed', {
        description: (
          <p>
            The record from {formatMeasuredAt(record.measuredAt)} was removed.
          </p>
        ),
        position: 'top-right',
      })
    } catch (err) {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
    } finally {
      setPendingRecordId(undefined)
    }
  }

  const recordList = (
    <div className="grid gap-4">
      {listToolbar}
      {records.length === 0 ? (
        <div className={dashboardEmptyClassName('soft')}>
          <p>No weight records have been added for this horse yet.</p>
        </div>
      ) : filtering.items.length === 0 ? (
        <div className={dashboardEmptyClassName('soft')}>
          <p>No weight records match these filters.</p>
        </div>
      ) : (
        filtering.items.map((record) => (
          <WeightRecordRow
            key={record._id}
            record={record}
            canManage={canManage}
            pending={pendingRecordId === record._id}
            onRemove={onRemoveWeightRecord}
          />
        ))
      )}
    </div>
  )

  const content = (
    <>
      {latestRecord && <LatestWeightRecord record={latestRecord} />}
      {inlineCreateDialog}
      {recordList}
    </>
  )

  if (onCreateActionChange) return content

  return (
    <section className={dashboardSectionClassName('soft', 'grid gap-6')}>
      {content}
    </section>
  )
}

function LatestWeightRecord({ record }: { record: Doc<'horseWeightRecords'> }) {
  return (
    <div className="grid gap-3 rounded-row bg-background/55 p-5 text-sm">
      <span className="text-muted-foreground">Latest record</span>
      <div className="grid gap-3 sm:grid-cols-3">
        <LatestWeightMetric
          label="Weight"
          value={`${record.weight} ${record.unit}`}
        />
        <LatestWeightMetric
          label="Measured"
          value={formatMeasuredAt(record.measuredAt)}
        />
        {record.bodyConditionScore !== undefined && (
          <LatestWeightMetric
            label="Body condition"
            value={`${record.bodyConditionScore}/9`}
          />
        )}
      </div>
    </div>
  )
}

function LatestWeightMetric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="grid gap-1 rounded-row bg-card/70 p-5">
      <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <span className="text-base font-semibold tracking-tight">{value}</span>
    </div>
  )
}

function WeightRecordRow({
  record,
  canManage,
  pending,
  onRemove,
}: {
  record: Doc<'horseWeightRecords'>
  canManage: boolean
  pending: boolean
  onRemove: (record: Doc<'horseWeightRecords'>) => Promise<void>
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
        <span className="font-medium">
          {record.weight} {record.unit}
        </span>
        <p className="text-sm text-muted-foreground">
          Measured {formatMeasuredAt(record.measuredAt)}
          {record.bodyConditionScore !== undefined
            ? ` · BCS ${record.bodyConditionScore}/9`
            : ''}
        </p>
        {record.notes && (
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {record.notes}
          </p>
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
              onClick={() => onRemove(record)}
            >
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
