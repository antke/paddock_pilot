import { MedicationRecordForm } from '#/components/horses/MedicationRecordForm'
import { CreateRecordDialog } from '#/components/list-layout/CreateRecordDialog'
import { FilteredDashboardItemList } from '#/components/list-filtering/FilteredDashboardItemList'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'
import { DashboardBadgeList } from '#/components/dashboard/DashboardBadgeList'
import { DashboardInlineHeader } from '#/components/dashboard/DashboardInlineHeader'
import { DashboardInlinePanel } from '#/components/dashboard/DashboardInlinePanel'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import {
  DashboardItemBodyText,
  DashboardItemList,
  DashboardItemRecordCard,
  DashboardItemRecordContent,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardMetaList } from '#/components/dashboard/DashboardMetaList'
import { Button } from '#/components/ui/button'
import { formatMediumDateKey } from '#/lib/dateDisplay'
import { useLocalDateContext } from '#/lib/useLocalDateContext'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useCallback, useMemo, useState } from 'react'
import type { MedicationRecordFormSchema } from 'shared/horses/medicationRecordSchema'
import {
  MedicationDosageBadge,
  MedicationFrequencyBadge,
  MedicationRecordStatusBadge,
} from './HorseCareBadges'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { createHorseMedicationRecordListFilterConfig } from './horseDetailListFilters'
import type { HorseDetailCreateActionChange } from './useHorseDetailCreateAction'
import { useHorseDetailCreateAction } from './useHorseDetailCreateAction'

type HorseMedicationRecordsCardProps = {
  horse: Doc<'horses'>
  onCreateActionChange?: HorseDetailCreateActionChange
}

export function HorseMedicationRecordsCard({
  horse,
  onCreateActionChange,
}: HorseMedicationRecordsCardProps) {
  const { today } = useLocalDateContext()
  const { data: records } = useSuspenseQuery(
    convexQuery(api.horseMedicationRecords.listForHorse, {
      horseId: horse._id,
    }),
  )
  const { data: permissions } = useSuspenseQuery(
    convexQuery(api.horseMedicationRecords.getPermissions, {
      horseId: horse._id,
    }),
  )
  const addMedicationRecord = useMutation(api.horseMedicationRecords.add)
  const completeMedicationRecord = useMutation(
    api.horseMedicationRecords.complete,
  )
  const removeMedicationRecord = useMutation(api.horseMedicationRecords.remove)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [pendingRecordId, setPendingRecordId] = useState<string>()
  const canManage = permissions.canManage
  const activeRecords = records.filter((record) => record.status === 'active')
  const filterConfig = useMemo(createHorseMedicationRecordListFilterConfig, [])
  const filtering = useListFiltering({
    items: records,
    config: filterConfig,
  })

  const onAddMedicationRecord = useCallback(
    async (data: MedicationRecordFormSchema) => {
      try {
        await addMedicationRecord({ horseId: horse._id, ...data })

        showAppSuccessToast({
          title: 'Medication record added',
          description: (
            <p>
              {data.medicationName} is now on {horse.name}'s record.
            </p>
          ),
        })
        setIsCreateOpen(false)
      } catch (err) {
        showAppErrorToast()
        throw err
      }
    },
    [addMedicationRecord, horse._id, horse.name],
  )

  const createDialog = useMemo(
    () =>
      canManage ? (
        <CreateRecordDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          triggerLabel="Add medication"
          title="Add medication"
          description="Record a medication course without losing your place in the list."
        >
          <MedicationRecordForm onSubmit={onAddMedicationRecord} />
        </CreateRecordDialog>
      ) : null,
    [canManage, isCreateOpen, onAddMedicationRecord],
  )
  const inlineCreateDialog = onCreateActionChange ? null : createDialog

  useHorseDetailCreateAction(createDialog, onCreateActionChange)

  const onCompleteMedicationRecord = async (
    record: Doc<'horseMedicationRecords'>,
  ) => {
    try {
      setPendingRecordId(record._id)
      await completeMedicationRecord({ id: record._id, endDate: today })
      showAppSuccessToast({
        title: 'Medication completed',
        description: <p>{record.medicationName} was marked as completed.</p>,
      })
    } catch (err) {
      showAppErrorToast()
    } finally {
      setPendingRecordId(undefined)
    }
  }

  const onRemoveMedicationRecord = async (
    record: Doc<'horseMedicationRecords'>,
  ) => {
    try {
      setPendingRecordId(record._id)
      await removeMedicationRecord({ id: record._id })
      showAppSuccessToast({
        title: 'Medication record removed',
        description: <p>{record.medicationName} was removed.</p>,
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
      emptyMessage="No medication records have been added for this horse yet."
      filteredEmptyMessage="No medication records match these filters."
      renderItem={(record) => (
        <MedicationRecordRow
          key={record._id}
          record={record}
          canManage={canManage}
          pending={pendingRecordId === record._id}
          onComplete={onCompleteMedicationRecord}
          onRemove={onRemoveMedicationRecord}
        />
      )}
    />
  )

  const content = (
    <>
      {activeRecords.length > 0 && (
        <ActiveMedicationPanel records={activeRecords} />
      )}
      {inlineCreateDialog}
      {recordList}
    </>
  )

  if (onCreateActionChange) return content

  return <DashboardSection chrome="cards">{content}</DashboardSection>
}

function ActiveMedicationPanel({
  records,
}: {
  records: Array<Doc<'horseMedicationRecords'>>
}) {
  return (
    <DashboardSection
      as="h3"
      chrome="cards"
      gap="compact"
      padding="compact"
      title="Active medication"
      description="Current courses that should stay visible while reviewing this horse."
      size="panel"
      descriptionSize="sm"
    >
      <DashboardItemList>
        {records.map((record) => (
          <MedicationRecordSummary key={record._id} record={record} />
        ))}
      </DashboardItemList>
    </DashboardSection>
  )
}

function MedicationRecordSummary({
  record,
}: {
  record: Doc<'horseMedicationRecords'>
}) {
  return (
    <DashboardInlinePanel stack="compact" textSize="sm">
      <DashboardInlineHeader
        title={record.medicationName}
        description={record.reason}
        titleClassName="tracking-normal"
        titleWeight="semibold"
        aside={
          <DashboardBadgeList>
            <MedicationDosageBadge dosage={record.dosage} variant="default" />
            {record.frequency && (
              <MedicationFrequencyBadge frequency={record.frequency} />
            )}
          </DashboardBadgeList>
        }
      />
      {(record.startDate || record.prescribedBy) && (
        <DashboardMetaList separator="dot">
          {record.startDate && (
            <span>Started {formatMediumDateKey(record.startDate)}</span>
          )}
          {record.prescribedBy && <span>{record.prescribedBy}</span>}
        </DashboardMetaList>
      )}
    </DashboardInlinePanel>
  )
}

function MedicationRecordRow({
  record,
  canManage,
  pending,
  onComplete,
  onRemove,
}: {
  record: Doc<'horseMedicationRecords'>
  canManage: boolean
  pending: boolean
  onComplete: (record: Doc<'horseMedicationRecords'>) => Promise<void>
  onRemove: (record: Doc<'horseMedicationRecords'>) => Promise<void>
}) {
  return (
    <DashboardItemRecordCard
      chrome="cards"
      actionsPlacement="footer"
      actionsClassName="ml-auto"
      actionBadges={<MedicationRecordStatusBadge status={record.status} />}
      actions={
        canManage ? (
          <>
            {record.status === 'active' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => onComplete(record)}
              >
                Complete
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => onRemove(record)}
            >
              Remove
            </Button>
          </>
        ) : undefined
      }
    >
      <DashboardItemRecordContent
        title={record.medicationName}
        titleSize="dense"
        titleBadges={
          <DashboardBadgeList gap="compact">
            <MedicationDosageBadge dosage={record.dosage} />
            {record.frequency && (
              <MedicationFrequencyBadge frequency={record.frequency} />
            )}
          </DashboardBadgeList>
        }
        meta={
          <>
            <span>Started {formatMediumDateKey(record.startDate)}</span>
            {record.endDate && (
              <span>Ended {formatMediumDateKey(record.endDate)}</span>
            )}
            {record.prescribedBy && <span>{record.prescribedBy}</span>}
          </>
        }
        description={record.reason}
      >
        {record.notes && (
          <DashboardItemBodyText>{record.notes}</DashboardItemBodyText>
        )}
      </DashboardItemRecordContent>
    </DashboardItemRecordCard>
  )
}
