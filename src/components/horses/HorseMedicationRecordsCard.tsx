import { MedicationRecordForm } from '#/components/horses/MedicationRecordForm'
import { CreateRecordDialog } from '#/components/list-layout/CreateRecordDialog'
import { FilteredDashboardItemList } from '#/components/list-filtering/FilteredDashboardItemList'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'
import { DashboardInlineHeader } from '#/components/dashboard/DashboardInlineHeader'
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
import { useCallback, useMemo, useRef, useState } from 'react'
import type { MedicationRecordFormSchema } from 'shared/horses/medicationRecordSchema'
import { MedicationRecordStatusBadge } from './HorseCareBadges'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { createHorseMedicationRecordListFilterConfig } from './horseDetailListFilters'
import type { HorseDetailCreateActionChange } from './useHorseDetailCreateAction'
import { useHorseDetailCreateAction } from './useHorseDetailCreateAction'
import { HorseRecordRemoveAction } from './HorseRecordRemoveAction'

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
  return (
    <HorseMedicationRecordsCardView
      key={horse._id}
      horse={horse}
      records={records}
      canManage={permissions.canManage}
      onCreateActionChange={onCreateActionChange}
      onAdd={async (data) => {
        try {
          await addMedicationRecord({ horseId: horse._id, ...data })
          showAppSuccessToast({ title: 'Medication record added' })
        } catch (error) {
          showAppErrorToast()
          throw error
        }
      }}
      onComplete={async (record) => {
        try {
          await completeMedicationRecord({ id: record._id, endDate: today })
          showAppSuccessToast({ title: 'Medication completed' })
        } catch (error) {
          showAppErrorToast()
          throw error
        }
      }}
      onRemove={async (record) => {
        try {
          await removeMedicationRecord({ id: record._id })
          showAppSuccessToast({ title: 'Medication record removed' })
        } catch (error) {
          showAppErrorToast()
          throw error
        }
      }}
    />
  )
}

type HorseMedicationRecordsCardViewProps = HorseMedicationRecordsCardProps & {
  records: Array<Doc<'horseMedicationRecords'>>
  canManage: boolean
  onAdd: (data: MedicationRecordFormSchema) => Promise<void>
  onComplete: (record: Doc<'horseMedicationRecords'>) => Promise<void>
  onRemove: (record: Doc<'horseMedicationRecords'>) => Promise<void>
}

export function HorseMedicationRecordsCardView({
  horse,
  records,
  canManage,
  onAdd,
  onComplete,
  onRemove,
  onCreateActionChange,
}: HorseMedicationRecordsCardViewProps) {
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
  const { today } = useLocalDateContext()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const activeRecords = records.filter((record) => record.status === 'active')
  const filterConfig = useMemo(createHorseMedicationRecordListFilterConfig, [])
  const filtering = useListFiltering({
    items: records,
    config: filterConfig,
  })

  const onAddMedicationRecord = useCallback(
    async (data: MedicationRecordFormSchema) => {
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
          triggerLabel="Add medication"
          title="Add medication"
          description="Record a medication course without losing your place in the list."
        >
          <MedicationRecordForm
            onSubmit={onAddMedicationRecord}
            onPendingChange={setIsCreating}
          />
        </CreateRecordDialog>
      ) : null,
    [canManage, isCreateOpen, isCreating, onAddMedicationRecord],
  )
  const inlineCreateDialog = onCreateActionChange ? null : createDialog

  useHorseDetailCreateAction(createDialog, onCreateActionChange)

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
          pending={operations[record._id]?.pending ?? null}
          failed={operations[record._id]?.failed ?? false}
          run={(kind, callback) => runRecordAction(record._id, kind, callback)}
          canManage={canManage}
          removalFocusTarget={() => listRegion.current}
          today={today}
          onComplete={onComplete}
          onRemove={onRemove}
        />
      )}
    />
  )

  const content = (
    <div
      ref={listRegion}
      role="region"
      aria-label={`${horse.name}: medication records`}
      tabIndex={-1}
      className="grid gap-5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {activeRecords.length > 0 && (
        <ActiveMedicationPanel records={activeRecords} />
      )}
      {inlineCreateDialog}
      {recordList}
    </div>
  )

  if (onCreateActionChange) return content

  return <DashboardSection>{content}</DashboardSection>
}

function ActiveMedicationPanel({
  records,
}: {
  records: Array<Doc<'horseMedicationRecords'>>
}) {
  return (
    <DashboardSection
      as="h3"
      chrome="flat"
      gap="compact"
      title="Active and planned medication"
      description="Courses remain visible here while you search the history below."
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
  const { today } = useLocalDateContext()
  return (
    <div className="app-record grid gap-2">
      <DashboardInlineHeader
        title={record.medicationName}
        description={record.reason}
        titleClassName="tracking-normal"
        titleWeight="semibold"
      />
      <DashboardMetaList separator="dot">
        <span>{record.dosage}</span>
        {record.frequency && <span>{record.frequency}</span>}
        {record.startDate && (
          <span>
            {record.startDate > today ? 'Starts' : 'Started'}{' '}
            {formatMediumDateKey(record.startDate)}
          </span>
        )}
        {record.prescribedBy && <span>{record.prescribedBy}</span>}
      </DashboardMetaList>
    </div>
  )
}

function MedicationRecordRow({
  record,
  canManage,
  pending,
  failed,
  run,
  removalFocusTarget,
  today,
  onComplete,
  onRemove,
}: {
  record: Doc<'horseMedicationRecords'>
  canManage: boolean
  pending: 'status' | 'remove' | null
  failed: boolean
  run: (
    kind: 'status' | 'remove',
    callback: () => Promise<void>,
  ) => Promise<void>
  removalFocusTarget: () => HTMLElement | null
  today: string
  onComplete: (record: Doc<'horseMedicationRecords'>) => Promise<void>
  onRemove: (record: Doc<'horseMedicationRecords'>) => Promise<void>
}) {
  return (
    <DashboardItemRecordCard
      chrome="flat"
      footer={
        failed ? (
          <p role="alert" className="text-sm text-destructive">
            Could not update this record. Please try again.
          </p>
        ) : undefined
      }
      actionsPlacement="footer"
      actionsClassName="ml-auto"
      actionBadges={
        record.status === 'completed' ? (
          <MedicationRecordStatusBadge status={record.status} />
        ) : undefined
      }
      actions={
        canManage ? (
          <>
            {record.status === 'active' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending !== null || record.startDate > today}
                title={
                  record.startDate > today
                    ? 'A future course cannot be completed before its start date.'
                    : undefined
                }
                aria-busy={pending === 'status' || undefined}
                aria-label={`Complete ${record.medicationName}`}
                onClick={() => void run('status', () => onComplete(record))}
              >
                {pending === 'status' ? 'Completing…' : 'Complete'}
              </Button>
            )}
            <HorseRecordRemoveAction
              disabled={pending !== null}
              title={`Remove ${record.medicationName}?`}
              description="This medication record will be removed from the horse history permanently. This cannot be undone."
              removalFocusTarget={removalFocusTarget}
              onConfirm={() => run('remove', () => onRemove(record))}
            />
          </>
        ) : undefined
      }
    >
      <DashboardItemRecordContent
        title={record.medicationName}
        titleSize="dense"
        meta={
          <>
            <span>
              {record.startDate > today ? 'Starts' : 'Started'}{' '}
              {formatMediumDateKey(record.startDate)}
            </span>
            <span>{record.dosage}</span>
            {record.frequency && <span>{record.frequency}</span>}
            {record.endDate && (
              <span>
                {record.status === 'completed' ? 'Ended' : 'Planned end'}{' '}
                {formatMediumDateKey(record.endDate)}
              </span>
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
