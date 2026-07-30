import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DetailTextBlock } from '#/components/dashboard/DetailBlocks'
import {
  DashboardItemList,
  DashboardItemRecordCard,
  DashboardItemRecordFooter,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import {
  HorseCardContent,
  horseCardSurfaceClassName,
} from '#/components/horses/HorseCard'
import { Button } from '#/components/ui/button'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import type { FunctionReturnType } from 'convex/server'
import { useState } from 'react'
import type { EventHorseDetailsFormSchema } from 'shared/events/eventHorseDetailsSchema'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { EventCostShareBadge, EventHorseStatusBadge } from './EventBadges'
import { EventHorseServiceDetailsForm } from './EventHorseServiceDetailsForm'
import { cn } from '#/lib/utils'

type EventHorseDetails = FunctionReturnType<
  typeof api.eventHorseDetails.listForEvent
>
type EventHorseDetailRow = EventHorseDetails['rows'][number]

type EventHorseServiceDetailsCardProps = {
  eventId: string
}

export function EventHorseServiceDetailsCard({
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
      showAppSuccessToast({ title: 'Horse service details saved' })
    } catch (err) {
      showAppErrorToast({ title: 'Could not save service details' })
    }
  }

  if (!data.event) return null

  return (
    <DashboardSectionCard
      title="Horse service notes"
      size="panel"
      description="Record what each horse needs before a shared visit and what happened afterwards."
      descriptionSize="sm"
    >
      {data.rows.length === 0 ? (
        <DashboardEmptyState chrome="cards">
          No horses are attached to this event.
        </DashboardEmptyState>
      ) : (
        <DashboardItemList>
          {data.rows.map((row) => (
            <EventHorseServiceRow
              key={row.eventHorse._id}
              row={row}
              isEditing={editingRowId === row.eventHorse._id}
              onEdit={() => setEditingRowId(row.eventHorse._id)}
              onCancel={() => setEditingRowId(null)}
              onSubmit={(values) => onSubmit(row.eventHorse._id, values)}
            />
          ))}
        </DashboardItemList>
      )}
    </DashboardSectionCard>
  )
}

function EventHorseServiceRow({
  row,
  isEditing,
  onEdit,
  onCancel,
  onSubmit,
}: {
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
    <DashboardItemRecordCard
      chrome="cards"
      density="compact"
      interactive={false}
      className={cn(horseCardSurfaceClassName, 'p-4')}
      actions={
        canManage && !isEditing ? (
          <Button type="button" variant="outline" size="sm" onClick={onEdit}>
            {hasDetails ? 'Edit details' : 'Add details'}
          </Button>
        ) : undefined
      }
      footer={
        <DashboardItemRecordFooter textSize="sm">
          {isEditing ? (
            <EventHorseServiceDetailsForm
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              onCancel={onCancel}
            />
          ) : hasDetails ? (
            <>
              {eventHorse.requestedServiceNotes && (
                <DetailTextBlock label="Requested service">
                  {eventHorse.requestedServiceNotes}
                </DetailTextBlock>
              )}
              {eventHorse.completionNotes && (
                <DetailTextBlock label="Outcome">
                  {eventHorse.completionNotes}
                </DetailTextBlock>
              )}
            </>
          ) : (
            <DashboardEmptyState chrome="soft" spacing="flush">
              No per-horse service notes have been added yet.
            </DashboardEmptyState>
          )}
        </DashboardItemRecordFooter>
      }
    >
      <HorseCardContent
        horse={horse ?? { name: 'Unknown horse' }}
        badges={
          <>
            <EventHorseStatusBadge status={eventHorse.status} />
            {eventHorse.costShare !== undefined && (
              <EventCostShareBadge costShare={eventHorse.costShare} />
            )}
          </>
        }
      />
    </DashboardItemRecordCard>
  )
}
