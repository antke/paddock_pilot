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
import { Button } from '#/components/ui/button'
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
import { useCallback, useMemo, useState } from 'react'
import type { WeightRecordFormSchema } from 'shared/horses/weightRecordSchema'
import { createHorseWeightRecordListFilterConfig } from './horseDetailListFilters'
import type { HorseDetailCreateActionChange } from './useHorseDetailCreateAction'
import { useHorseDetailCreateAction } from './useHorseDetailCreateAction'

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
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [pendingRecordId, setPendingRecordId] = useState<string>()
  const canManage = permissions.canManage
  const latestRecord = records[0]
  const filterConfig = useMemo(createHorseWeightRecordListFilterConfig, [])
  const filtering = useListFiltering({
    items: records,
    config: filterConfig,
  })

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
        setIsCreateOpen(false)
      } catch (err) {
        showAppErrorToast()
        throw err
      }
    },
    [addWeightRecord, horse._id, horse.name],
  )

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
    } finally {
      setPendingRecordId(undefined)
    }
  }

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
          pending={pendingRecordId === record._id}
          onRemove={onRemoveWeightRecord}
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

  if (onCreateActionChange) return content

  return <DashboardSection chrome="cards">{content}</DashboardSection>
}

function LatestWeightRecord({ record }: { record: Doc<'horseWeightRecords'> }) {
  return (
    <DashboardInlinePanel stack="default" textSize="sm">
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
  pending,
  onRemove,
}: {
  record: Doc<'horseWeightRecords'>
  canManage: boolean
  pending: boolean
  onRemove: (record: Doc<'horseWeightRecords'>) => Promise<void>
}) {
  return (
    <DashboardItemRecordCard
      chrome="cards"
      actionsPlacement="footer"
      actionsClassName="ml-auto"
      actions={
        canManage ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => onRemove(record)}
          >
            Remove
          </Button>
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
