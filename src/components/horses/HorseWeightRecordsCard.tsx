import { WeightRecordForm } from '#/components/horses/WeightRecordForm'
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
import type { WeightRecordFormSchema } from 'shared/horses/weightRecordSchema'

type HorseWeightRecordsCardProps = {
  horse: Doc<'horses'>
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const formatMeasuredAt = (timestamp: number) => dateFormatter.format(new Date(timestamp))

const measuredDateToTimestamp = (date: string) => new Date(`${date}T00:00:00`).getTime()

export function HorseWeightRecordsCard({ horse }: HorseWeightRecordsCardProps) {
  const { data: records } = useSuspenseQuery(
    convexQuery(api.horseWeightRecords.listForHorse, { horseId: horse._id }),
  )
  const { data: permissions } = useSuspenseQuery(
    convexQuery(api.horseWeightRecords.getPermissions, { horseId: horse._id }),
  )
  const addWeightRecord = useMutation(api.horseWeightRecords.add)
  const removeWeightRecord = useMutation(api.horseWeightRecords.remove)
  const [pendingRecordId, setPendingRecordId] = useState<string>()
  const canManage = permissions.canManage
  const latestRecord = records[0]

  const onAddWeightRecord = async (data: WeightRecordFormSchema) => {
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
    } catch (err) {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
    }
  }

  const onRemoveWeightRecord = async (record: Doc<'horseWeightRecords'>) => {
    try {
      setPendingRecordId(record._id)
      await removeWeightRecord({ id: record._id })
      toast.success('Weight record removed', {
        description: <p>The record from {formatMeasuredAt(record.measuredAt)} was removed.</p>,
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
        <CardTitle>Weight and condition</CardTitle>
        <CardDescription>
          Track weight and body condition changes for care decisions and analysis.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6">
        {latestRecord && (
          <div className="grid gap-2 rounded-lg border p-4 text-sm">
            <span className="text-muted-foreground">Latest record</span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-semibold">
                {latestRecord.weight} {latestRecord.unit}
              </span>
              <Badge variant="secondary">
                {formatMeasuredAt(latestRecord.measuredAt)}
              </Badge>
              {latestRecord.bodyConditionScore !== undefined && (
                <Badge variant="outline">
                  BCS {latestRecord.bodyConditionScore}/9
                </Badge>
              )}
            </div>
          </div>
        )}

        {canManage && <WeightRecordForm onSubmit={onAddWeightRecord} />}

        {canManage && records.length > 0 && <Separator />}

        <div className="grid gap-3">
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No weight records have been added for this horse yet.
            </p>
          ) : (
            records.map((record) => (
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
      </CardContent>
    </Card>
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
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border p-4">
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">
            {record.weight} {record.unit}
          </span>
          <Badge variant="secondary">{formatMeasuredAt(record.measuredAt)}</Badge>
          {record.bodyConditionScore !== undefined && (
            <Badge variant="outline">BCS {record.bodyConditionScore}/9</Badge>
          )}
        </div>
        {record.notes && (
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {record.notes}
          </p>
        )}
      </div>

      {canManage && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => onRemove(record)}
        >
          Remove
        </Button>
      )}
    </div>
  )
}
