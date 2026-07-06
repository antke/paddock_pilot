import { MedicationRecordForm } from '#/components/horses/MedicationRecordForm'
import { CreateRecordDialog } from '#/components/list-layout/CreateRecordDialog'
import { ListFilterBar } from '#/components/list-filtering/ListFilterBar'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'
import { dashboardEmptyClassName } from '#/components/dashboard/dashboardChrome'
import {
  dashboardItemActionButtonsClassName,
  dashboardItemActionColumnClassName,
  dashboardItemActionGridClassName,
  dashboardItemCardClassName,
  dashboardItemStateBadgesClassName,
} from '#/components/dashboard/DashboardItemCard'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '#/lib/utils'
import type {
  MedicationRecordFormSchema,
  MedicationRecordStatus,
} from 'shared/horses/medicationRecordSchema'
import {
  createHorseMedicationRecordListFilterConfig,
  horseMedicationStatusLabels,
} from './horseDetailListFilters'
import type { HorseDetailCreateActionChange } from './useHorseDetailCreateAction'
import { useHorseDetailCreateAction } from './useHorseDetailCreateAction'

type HorseMedicationRecordsCardProps = {
  horse: Doc<'horses'>
  onCreateActionChange?: HorseDetailCreateActionChange
}

const statusBadgeClassName = {
  active: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  completed:
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
} satisfies Record<MedicationRecordStatus, string>

export function HorseMedicationRecordsCard({
  horse,
  onCreateActionChange,
}: HorseMedicationRecordsCardProps) {
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

  const onAddMedicationRecord = useCallback(async (data: MedicationRecordFormSchema) => {
    try {
      await addMedicationRecord({ horseId: horse._id, ...data })

      toast.success('Medication record added', {
        description: (
          <p>
            {data.medicationName} is now on {horse.name}'s record.
          </p>
        ),
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
  }, [addMedicationRecord, horse._id, horse.name])

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
      await completeMedicationRecord({ id: record._id })
      toast.success('Medication completed', {
        description: <p>{record.medicationName} was marked as completed.</p>,
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

  const onRemoveMedicationRecord = async (
    record: Doc<'horseMedicationRecords'>,
  ) => {
    try {
      setPendingRecordId(record._id)
      await removeMedicationRecord({ id: record._id })
      toast.success('Medication record removed', {
        description: <p>{record.medicationName} was removed.</p>,
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
          <p>No medication records have been added for this horse yet.</p>
        </div>
      ) : filtering.items.length === 0 ? (
        <div className={dashboardEmptyClassName('soft')}>
          <p>No medication records match these filters.</p>
        </div>
      ) : (
        filtering.items.map((record) => (
          <MedicationRecordRow
            key={record._id}
            record={record}
            canManage={canManage}
            pending={pendingRecordId === record._id}
            onComplete={onCompleteMedicationRecord}
            onRemove={onRemoveMedicationRecord}
          />
        ))
      )}
    </div>
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

  return <div className="grid gap-6">{content}</div>
}

function ActiveMedicationPanel({
  records,
}: {
  records: Array<Doc<'horseMedicationRecords'>>
}) {
  return (
    <section className="grid gap-4 rounded-panel border border-primary/20 bg-card/90 p-5 shadow-control">
      <div className="grid gap-1">
        <h3 className="text-lg font-semibold tracking-tight">
          Active medication
        </h3>
        <p className="text-sm text-muted-foreground">
          Current courses that should stay visible while reviewing this horse.
        </p>
      </div>

      <div className="grid gap-3">
        {records.map((record) => (
          <MedicationRecordSummary key={record._id} record={record} />
        ))}
      </div>
    </section>
  )
}

function MedicationRecordSummary({
  record,
}: {
  record: Doc<'horseMedicationRecords'>
}) {
  return (
    <div className="grid gap-2 rounded-row bg-background/60 p-5 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <span className="font-semibold tracking-tight">
            {record.medicationName}
          </span>
          {record.reason && (
            <p className="text-muted-foreground">{record.reason}</p>
          )}
        </div>

        <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2">
          <Badge>{record.dosage}</Badge>
          {record.frequency && (
            <Badge variant="outline">{record.frequency}</Badge>
          )}
        </div>
      </div>
      {(record.startDate || record.prescribedBy) && (
        <p className="text-muted-foreground">
          Started {record.startDate}
          {record.prescribedBy ? ` · ${record.prescribedBy}` : ''}
        </p>
      )}
    </div>
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
    <div
      className={dashboardItemCardClassName({
        interactive: true,
        chrome: 'soft',
        className: dashboardItemActionGridClassName,
      })}
    >
      <div className="grid min-w-0 gap-3">
        <div className="grid gap-2">
          <h3 className="font-medium">{record.medicationName}</h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline">{record.dosage}</Badge>
            {record.frequency && (
              <Badge variant="outline">{record.frequency}</Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Started {record.startDate}
          {record.endDate ? ` · Ended ${record.endDate}` : ''}
          {record.prescribedBy ? ` · ${record.prescribedBy}` : ''}
        </p>
        {record.reason && (
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {record.reason}
          </p>
        )}
        {record.notes && (
          <p className="whitespace-pre-wrap text-sm">{record.notes}</p>
        )}
      </div>

      <div className={dashboardItemActionColumnClassName}>
        <div className={dashboardItemStateBadgesClassName}>
          <Badge
            variant="outline"
            className={cn(
              'min-h-5 px-2 text-[10px] font-medium leading-none shadow-none',
              statusBadgeClassName[record.status],
            )}
          >
            {horseMedicationStatusLabels[record.status]}
          </Badge>
        </div>

        {canManage && (
          <div className={dashboardItemActionButtonsClassName}>
            {record.status === 'active' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shadow-none"
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
              className="shadow-none"
              disabled={pending}
              onClick={() => onRemove(record)}
            >
              Remove
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
