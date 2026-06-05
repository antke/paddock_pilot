import { MedicationRecordForm } from '#/components/horses/MedicationRecordForm'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Separator } from '#/components/ui/separator'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import { toast } from 'sonner'
import type {
  MedicationRecordFormSchema,
  MedicationRecordStatus,
} from 'shared/horses/medicationRecordSchema'

type HorseMedicationRecordsCardProps = {
  horse: Doc<'horses'>
}

const statusLabels = {
  active: 'Active',
  completed: 'Completed',
} satisfies Record<MedicationRecordStatus, string>

export function HorseMedicationRecordsCard({ horse }: HorseMedicationRecordsCardProps) {
  const { data: records } = useSuspenseQuery(
    convexQuery(api.horseMedicationRecords.listForHorse, { horseId: horse._id }),
  )
  const { data: permissions } = useSuspenseQuery(
    convexQuery(api.horseMedicationRecords.getPermissions, { horseId: horse._id }),
  )
  const addMedicationRecord = useMutation(api.horseMedicationRecords.add)
  const completeMedicationRecord = useMutation(api.horseMedicationRecords.complete)
  const removeMedicationRecord = useMutation(api.horseMedicationRecords.remove)
  const [pendingRecordId, setPendingRecordId] = useState<string>()
  const canManage = permissions.canManage
  const activeRecords = records.filter((record) => record.status === 'active')

  const onAddMedicationRecord = async (data: MedicationRecordFormSchema) => {
    try {
      await addMedicationRecord({ horseId: horse._id, ...data })

      toast.success('Medication record added', {
        description: <p>{data.medicationName} is now on {horse.name}'s record.</p>,
        position: 'top-right',
      })
    } catch (err) {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
    }
  }

  const onCompleteMedicationRecord = async (record: Doc<'horseMedicationRecords'>) => {
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

  const onRemoveMedicationRecord = async (record: Doc<'horseMedicationRecords'>) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medication</CardTitle>
        <CardDescription>
          Keep active medication visible and preserve completed courses for care history.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6">
        {activeRecords.length > 0 && (
          <div className="grid gap-3 rounded-lg border p-4">
            <span className="text-sm text-muted-foreground">Active medication</span>
            {activeRecords.map((record) => (
              <MedicationRecordSummary key={record._id} record={record} />
            ))}
          </div>
        )}

        {canManage && <MedicationRecordForm onSubmit={onAddMedicationRecord} />}

        {canManage && records.length > 0 && <Separator />}

        <div className="grid gap-3">
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No medication records have been added for this horse yet.
            </p>
          ) : (
            records.map((record) => (
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
      </CardContent>
    </Card>
  )
}

function MedicationRecordSummary({ record }: { record: Doc<'horseMedicationRecords'> }) {
  return (
    <div className="grid gap-1 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{record.medicationName}</span>
        <Badge>{record.dosage}</Badge>
        {record.frequency && <Badge variant="outline">{record.frequency}</Badge>}
      </div>
      {record.reason && <p className="text-muted-foreground">{record.reason}</p>}
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
    <div className="grid gap-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">{record.medicationName}</h3>
            <Badge variant={record.status === 'active' ? 'default' : 'secondary'}>
              {statusLabels[record.status]}
            </Badge>
            <Badge variant="outline">{record.dosage}</Badge>
            {record.frequency && <Badge variant="outline">{record.frequency}</Badge>}
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
          {record.notes && <p className="whitespace-pre-wrap text-sm">{record.notes}</p>}
        </div>

        {canManage && (
          <div className="flex flex-wrap gap-2">
            {record.status === 'active' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() => onComplete(record)}
              >
                Complete
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
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
