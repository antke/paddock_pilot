import { compareWeightRecordsNewestFirst } from 'shared/horses/weightRecordOrder'
import { WeightRecordForm } from '#/components/horses/WeightRecordForm'
import { CreateRecordDialog } from '#/components/list-layout/CreateRecordDialog'
import { FilteredDashboardItemList } from '#/components/list-filtering/FilteredDashboardItemList'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'
import {
  DetailGrid,
  DetailMetricBlock,
} from '#/components/dashboard/DetailBlocks'
import { DashboardInlinePanel } from '#/components/dashboard/DashboardInlinePanel'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import {
  DashboardItemRecordCard,
  DashboardItemRecordContent,
} from '#/components/dashboard/DashboardItemCard'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { TextLabel } from '#/components/ui/text-label'
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
import type { WeightRecordFormSchema } from 'shared/horses/weightRecordSchema'
import { createHorseWeightRecordListFilterConfig } from './horseDetailListFilters'
import type { HorseDetailCreateActionChange } from './useHorseDetailCreateAction'
import { useHorseDetailCreateAction } from './useHorseDetailCreateAction'
import { HorseRecordRemoveAction } from './HorseRecordRemoveAction'

type HorseWeightRecordsCardProps = {
  horse: Doc<'horses'>
  onCreateActionChange?: HorseDetailCreateActionChange
}

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
  const onAddWeightRecord = useCallback(
    async (data: WeightRecordFormSchema) => {
      try {
        await addWeightRecord({
          horseId: horse._id,
          weight: data.weight,
          unit: data.unit,
          measuredAt: dateKeyToTimestamp(data.measuredDate),
          bodyConditionScore: data.bodyConditionScore,
          notes: data.notes,
        })

        showAppSuccessToast({
          title: 'Weight record added',
          description: <p>{horse.name}'s weight history was updated.</p>,
        })
      } catch (err) {
        showAppErrorToast()
        throw err
      }
    },
    [addWeightRecord, horse._id, horse.name],
  )

  const onRemoveWeightRecord = async (record: Doc<'horseWeightRecords'>) => {
    try {
      await removeWeightRecord({ id: record._id })
      showAppSuccessToast({
        title: 'Weight record removed',
        description: (
          <p>
            The record from {formatMediumTimestampDate(record.measuredAt)} was
            removed.
          </p>
        ),
      })
    } catch (err) {
      showAppErrorToast()
      throw err
    }
  }

  return (
    <HorseWeightRecordsView
      key={horse._id}
      horse={horse}
      records={records}
      canManage={permissions.canManage}
      onAdd={onAddWeightRecord}
      onRemove={onRemoveWeightRecord}
      onCreateActionChange={onCreateActionChange}
    />
  )
}

export function HorseWeightRecordsView({
  horse,
  records,
  canManage,
  onAdd,
  onRemove,
  onCreateActionChange,
}: HorseWeightRecordsCardProps & {
  records: Array<Doc<'horseWeightRecords'>>
  canManage: boolean
  onAdd: (values: WeightRecordFormSchema) => Promise<void>
  onRemove: (record: Doc<'horseWeightRecords'>) => Promise<void>
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
    async (values: WeightRecordFormSchema) => {
      await onAdd(values)
      setIsCreateOpen(false)
    },
    [onAdd],
  )
  const orderedRecords = useMemo(
    () => [...records].sort(compareWeightRecordsNewestFirst),
    [records],
  )
  const latestRecord = orderedRecords[0]
  const filterConfig = useMemo(createHorseWeightRecordListFilterConfig, [])
  const filtering = useListFiltering({
    items: orderedRecords,
    config: filterConfig,
  })
  const createDialog = useMemo(
    () =>
      canManage ? (
        <CreateRecordDialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            if (!creating.current) setIsCreateOpen(open)
          }}
          isPending={isCreating}
          triggerLabel="Add weight"
          title="Add weight"
          description="Record a weight measurement without losing your place in the list."
        >
          <WeightRecordForm
            key={horse._id}
            onSubmit={addAndClose}
            onPendingChange={onPendingChange}
          />
        </CreateRecordDialog>
      ) : null,
    [
      canManage,
      horse._id,
      isCreateOpen,
      isCreating,
      addAndClose,
      onPendingChange,
    ],
  )
  const inlineCreateDialog = onCreateActionChange ? null : createDialog

  useHorseDetailCreateAction(createDialog, onCreateActionChange)

  const recordList = (
    <FilteredDashboardItemList
      config={filterConfig}
      filtering={filtering}
      emptyMessage="No weight records have been added for this horse yet."
      filteredEmptyMessage="No weight records match these filters."
      renderItem={(record) => (
        <WeightRecordRow
          key={record._id}
          record={record}
          canManage={canManage}
          onRemove={onRemove}
          removalFocusTarget={() => region.current}
        />
      )}
    />
  )

  const content = (
    <>
      {latestRecord && <LatestWeightRecord record={latestRecord} />}
      {inlineCreateDialog}
      {recordList}
    </>
  )

  if (onCreateActionChange)
    return (
      <div
        ref={(element) => {
          region.current = element
        }}
        role="group"
        aria-label="Weight records"
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
      aria-label="Weight records"
      tabIndex={-1}
    >
      {content}
    </DashboardSection>
  )
}

function LatestWeightRecord({ record }: { record: Doc<'horseWeightRecords'> }) {
  return (
    <DashboardInlinePanel
      chrome="flat"
      padding="none"
      stack="default"
      textSize="sm"
    >
      <TextLabel as="div">Latest record</TextLabel>
      <DetailGrid columns={3}>
        <LatestWeightMetric
          label="Weight"
          value={`${record.weight} ${record.unit}`}
        />
        <LatestWeightMetric
          label="Measured"
          value={formatMediumTimestampDate(record.measuredAt)}
        />
        {record.bodyConditionScore !== undefined && (
          <LatestWeightMetric
            label="Body condition"
            value={`${record.bodyConditionScore}/9`}
          />
        )}
      </DetailGrid>
    </DashboardInlinePanel>
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
    <DetailMetricBlock
      label={label}
      value={value}
      labelProps={{ tracking: 'tight', weight: 'medium' }}
      size="compact"
    />
  )
}

function WeightRecordRow({
  record,
  canManage,
  removalFocusTarget,
  onRemove,
}: {
  record: Doc<'horseWeightRecords'>
  canManage: boolean
  removalFocusTarget: () => HTMLElement | null
  onRemove: (record: Doc<'horseWeightRecords'>) => Promise<void>
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
            title="Remove this weight record?"
            description={`The measurement from ${formatMediumTimestampDate(record.measuredAt)} will be removed permanently. This cannot be undone.`}
            onConfirm={() => onRemove(record)}
          />
        ) : undefined
      }
    >
      <DashboardItemRecordContent
        title={`${record.weight} ${record.unit}`}
        titleSize="dense"
        meta={
          <>
            <span>Measured {formatMediumTimestampDate(record.measuredAt)}</span>
            {record.bodyConditionScore !== undefined && (
              <span>BCS {record.bodyConditionScore}/9</span>
            )}
          </>
        }
        description={record.notes}
      />
    </DashboardItemRecordCard>
  )
}
