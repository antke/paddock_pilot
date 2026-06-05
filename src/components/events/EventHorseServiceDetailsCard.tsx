import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import type { FunctionReturnType } from 'convex/server'
import { useState } from 'react'
import type { EventHorseDetailsFormSchema } from 'shared/events/eventHorseDetailsSchema'
import { toast } from 'sonner'
import { EventHorseServiceDetailsForm } from './EventHorseServiceDetailsForm'

type EventHorseDetails = FunctionReturnType<typeof api.eventHorseDetails.listForEvent>
type EventHorseDetailRow = EventHorseDetails['rows'][number]

type EventHorseServiceDetailsCardProps = {
  stableId: string
  eventId: string
}

export function EventHorseServiceDetailsCard({
  stableId,
  eventId,
}: EventHorseServiceDetailsCardProps) {
  const { data } = useSuspenseQuery(
    convexQuery(api.eventHorseDetails.listForEvent, {
      eventId: eventId as Id<'events'>,
    }),
  )
  const updateDetails = useMutation(api.eventHorseDetails.update)
  const [editingRowId, setEditingRowId] = useState<Id<'eventsHorses'> | null>(
    null,
  )

  const onSubmit = async (
    rowId: Id<'eventsHorses'>,
    values: EventHorseDetailsFormSchema,
  ) => {
    try {
      await updateDetails({ id: rowId, ...values })
      setEditingRowId(null)
      toast.success('Horse service details saved', { position: 'top-right' })
    } catch (err) {
      toast.error('Could not save service details', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
    }
  }

  if (!data.event) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horse service notes</CardTitle>
        <CardDescription>
          Record what each horse needs before a shared visit and what happened
          afterwards.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4">
        {data.rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No horses are attached to this event.
          </p>
        ) : (
          data.rows.map((row) => (
            <EventHorseServiceRow
              key={row.eventHorse._id}
              stableId={stableId}
              row={row}
              isEditing={editingRowId === row.eventHorse._id}
              onEdit={() => setEditingRowId(row.eventHorse._id)}
              onCancel={() => setEditingRowId(null)}
              onSubmit={(values) => onSubmit(row.eventHorse._id, values)}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}

function EventHorseServiceRow({
  stableId,
  row,
  isEditing,
  onEdit,
  onCancel,
  onSubmit,
}: {
  stableId: string
  row: EventHorseDetailRow
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  onSubmit: (values: EventHorseDetailsFormSchema) => Promise<void>
}) {
  const { eventHorse, horse, canManage } = row
  const hasDetails = Boolean(
    eventHorse.requestedServiceNotes ||
      eventHorse.completionNotes ||
      eventHorse.costShare !== undefined,
  )
  const defaultValues = {
    requestedServiceNotes: eventHorse.requestedServiceNotes ?? '',
    completionNotes: eventHorse.completionNotes ?? '',
    costShare: eventHorse.costShare,
  }

  return (
    <div className="grid gap-4 rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          {horse ? (
            <Link
              to="/stables/$stableId/horses/$horseId"
              params={{ stableId, horseId: horse._id }}
              className="font-medium hover:underline"
            >
              {horse.name}
            </Link>
          ) : (
            <span className="font-medium">Unknown horse</span>
          )}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{eventHorse.status ?? 'confirmed'}</Badge>
            {eventHorse.costShare !== undefined && (
              <Badge variant="secondary">Cost {eventHorse.costShare}</Badge>
            )}
          </div>
        </div>

        {canManage && !isEditing && (
          <Button type="button" variant="outline" size="sm" onClick={onEdit}>
            {hasDetails ? 'Edit details' : 'Add details'}
          </Button>
        )}
      </div>

      {isEditing ? (
        <EventHorseServiceDetailsForm
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      ) : hasDetails ? (
        <div className="grid gap-3 text-sm">
          {eventHorse.requestedServiceNotes && (
            <DetailBlock title="Requested service" value={eventHorse.requestedServiceNotes} />
          )}
          {eventHorse.completionNotes && (
            <DetailBlock title="Outcome" value={eventHorse.completionNotes} />
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No per-horse service notes have been added yet.
        </p>
      )}
    </div>
  )
}

function DetailBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="grid gap-1">
      <span className="text-muted-foreground">{title}</span>
      <p className="whitespace-pre-wrap">{value}</p>
    </div>
  )
}
