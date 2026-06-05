import { NutritionLogForm } from '#/components/horses/NutritionLogForm'
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
import type { NutritionLogFormSchema } from 'shared/horses/nutritionLogSchema'

type HorseNutritionLogsCardProps = {
  horse: Doc<'horses'>
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const formatChangedAt = (timestamp: number) => dateFormatter.format(new Date(timestamp))

const changedDateToTimestamp = (date: string) => new Date(`${date}T00:00:00`).getTime()

export function HorseNutritionLogsCard({ horse }: HorseNutritionLogsCardProps) {
  const { data: logs } = useSuspenseQuery(
    convexQuery(api.horseNutritionLogs.listForHorse, { horseId: horse._id }),
  )
  const { data: permissions } = useSuspenseQuery(
    convexQuery(api.horseNutritionLogs.getPermissions, { horseId: horse._id }),
  )
  const addNutritionLog = useMutation(api.horseNutritionLogs.add)
  const removeNutritionLog = useMutation(api.horseNutritionLogs.remove)
  const [pendingLogId, setPendingLogId] = useState<string>()
  const canManage = permissions.canManage

  const onAddNutritionLog = async (data: NutritionLogFormSchema) => {
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
    } catch (err) {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
    }
  }

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nutrition history</CardTitle>
        <CardDescription>
          Log feeding changes so weight, health, and diet history can be reviewed together.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6">
        {canManage && <NutritionLogForm horse={horse} onSubmit={onAddNutritionLog} />}

        {canManage && logs.length > 0 && <Separator />}

        <div className="grid gap-3">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No nutrition changes have been logged for this horse yet.
            </p>
          ) : (
            logs.map((log) => (
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
      </CardContent>
    </Card>
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
    <div className="grid gap-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-3">
          <div className="grid gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium">{log.summary}</h3>
              <Badge variant="secondary">{formatChangedAt(log.changedAt)}</Badge>
            </div>
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

          {Boolean(log.recommendedSnapshot?.length || log.avoidSnapshot?.length) && (
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              {Boolean(log.recommendedSnapshot?.length) && (
                <SnapshotList title="Recommended" items={log.recommendedSnapshot ?? []} />
              )}
              {Boolean(log.avoidSnapshot?.length) && (
                <SnapshotList title="Avoid" items={log.avoidSnapshot ?? []} />
              )}
            </div>
          )}
        </div>

        {canManage && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => onRemove(log)}
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  )
}

function SnapshotList({ title, items }: { title: string; items: Array<string> }) {
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
