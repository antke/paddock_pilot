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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
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
  const withdrawHorse = useMutation(api.events.withdrawHorseFromEvent)
  const [editingRowId, setEditingRowId] = useState<Id<'eventsHorses'> | null>(
    null,
  )
  const [withdrawingRowId, setWithdrawingRowId] = useState<
    Id<'eventsHorses'> | undefined
  >()

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

  const onWithdraw = async (rowId: Id<'eventsHorses'>) => {
    try {
      setWithdrawingRowId(rowId)
      await withdrawHorse({ eventHorseId: rowId })
      showAppSuccessToast({ title: 'Horse withdrawn from event' })
    } catch {
      showAppErrorToast({ title: 'Could not withdraw the horse' })
    } finally {
      setWithdrawingRowId(undefined)
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
              onWithdraw={() => onWithdraw(row.eventHorse._id)}
              isWithdrawing={withdrawingRowId === row.eventHorse._id}
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
  onWithdraw,
  isWithdrawing,
}: {
  row: EventHorseDetailRow
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  onSubmit: (values: EventHorseDetailsFormSchema) => Promise<void>
  onWithdraw: () => Promise<void>
  isWithdrawing: boolean
}) {
  const { eventHorse, horse, canManage, canWithdraw } = row
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
        !isEditing && (canManage || canWithdraw) ? (
          <>
            {canManage && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onEdit}
              >
                {hasDetails ? 'Edit details' : 'Add details'}
              </Button>
            )}
            {canWithdraw && (
              <AlertDialog>
                <AlertDialogTrigger
                  render={<Button type="button" variant="outline" size="sm" />}
                >
                  Withdraw horse
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Withdraw {horse?.name ?? 'this horse'}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      The horse will no longer count as participating in this
                      event. The organiser will be notified.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isWithdrawing}>
                      Keep horse
                    </AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      disabled={isWithdrawing}
                      onClick={onWithdraw}
                    >
                      {isWithdrawing ? 'Withdrawing...' : 'Withdraw horse'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </>
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
