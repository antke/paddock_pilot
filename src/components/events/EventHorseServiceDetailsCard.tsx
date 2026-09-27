import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DetailTextBlock } from '#/components/dashboard/DetailBlocks'
import {
  DashboardItemList,
  DashboardItemRecordCard,
  DashboardItemRecordFooter,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { HorseCardContent } from '#/components/horses/HorseCard'
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
import { useEffect, useRef, useState } from 'react'
import type { EventHorseDetailsFormSchema } from 'shared/events/eventHorseDetailsSchema'
import { showAppSuccessToast } from '#/components/ui/sonner'
import { RouteStatusAlert } from '#/components/layout/RouteStatusAlert'
import { EventHorseStatusBadge } from './EventBadges'
import { EventHorseServiceDetailsForm } from './EventHorseServiceDetailsForm'
import { formatCurrencyAmount } from '#/lib/numberDisplay'

type EventHorseDetails = FunctionReturnType<
  typeof api.eventHorseDetails.listForEvent
>
export type EventHorseDetailRow = EventHorseDetails['rows'][number]

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
  if (!data.event) return null

  return (
    <EventHorseServiceDetailsView
      rows={data.rows}
      onSave={async (rowId, values) => {
        await updateDetails({ id: rowId, ...values })
        showAppSuccessToast({ title: 'Horse service details saved' })
      }}
      onWithdraw={async (rowId) => {
        await withdrawHorse({ eventHorseId: rowId })
        showAppSuccessToast({ title: 'Horse withdrawn from event' })
      }}
    />
  )
}

type EventHorseServiceDetailsViewProps = {
  rows: Array<EventHorseDetailRow>
  onSave: (
    rowId: Id<'eventsHorses'>,
    values: EventHorseDetailsFormSchema,
  ) => Promise<void>
  onWithdraw: (rowId: Id<'eventsHorses'>) => Promise<void>
  withdrawalDescription?: string
}

/** Shared UI; mutation owners must reject failures and resolve only after saving. */
export function EventHorseServiceDetailsView({
  rows,
  onSave,
  onWithdraw,
  withdrawalDescription = 'The horse will no longer count as participating in this event. The organiser will be notified.',
}: EventHorseServiceDetailsViewProps) {
  return (
    <DashboardSectionCard
      title="Horse service notes"
      size="panel"
      description="Record what each horse needs before a shared visit and what happened afterwards."
      descriptionSize="sm"
    >
      {rows.length === 0 ? (
        <DashboardEmptyState chrome="cards">
          No horses are attached to this event.
        </DashboardEmptyState>
      ) : (
        <DashboardItemList>
          {rows.map((row) => (
            <EventHorseServiceRow
              key={row.eventHorse._id}
              row={row}
              onSubmit={(values) => onSave(row.eventHorse._id, values)}
              onWithdraw={() => onWithdraw(row.eventHorse._id)}
              withdrawalDescription={withdrawalDescription}
            />
          ))}
        </DashboardItemList>
      )}
    </DashboardSectionCard>
  )
}

function EventHorseServiceRow({
  row,
  onSubmit,
  onWithdraw,
  withdrawalDescription,
}: {
  row: EventHorseDetailRow
  onSubmit: (values: EventHorseDetailsFormSchema) => Promise<void>
  onWithdraw: () => Promise<void>
  withdrawalDescription: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [withdrawError, setWithdrawError] = useState(false)
  const withdrawing = useRef(false)
  const editTrigger = useRef<HTMLButtonElement>(null)
  const withdrawTrigger = useRef<HTMLButtonElement>(null)
  const rowFocusTarget = useRef<HTMLDivElement>(null)
  const wasEditing = useRef(false)

  useEffect(() => {
    if (wasEditing.current && !isEditing) editTrigger.current?.focus()
    wasEditing.current = isEditing
  }, [isEditing])

  const confirmWithdrawal = async () => {
    if (withdrawing.current) return
    withdrawing.current = true
    setIsWithdrawing(true)
    setWithdrawError(false)
    try {
      await onWithdraw()
      setWithdrawOpen(false)
    } catch {
      setWithdrawError(true)
    } finally {
      withdrawing.current = false
      setIsWithdrawing(false)
    }
  }

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
      ref={rowFocusTarget}
      role="group"
      aria-label={`${horse?.name ?? 'Unknown horse'} service notes`}
      tabIndex={-1}
      chrome="flat"
      density="compact"
      interactive={false}
      actions={
        !isEditing && (canManage || canWithdraw) ? (
          <>
            {canManage && (
              <Button
                type="button"
                ref={editTrigger}
                action={hasDetails ? 'edit' : 'create'}
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                {hasDetails ? 'Edit details' : 'Add details'}
              </Button>
            )}
            {canWithdraw && (
              <AlertDialog
                open={withdrawOpen}
                onOpenChange={(open) => {
                  if (!withdrawing.current) {
                    setWithdrawOpen(open)
                    if (open) setWithdrawError(false)
                  }
                }}
              >
                <AlertDialogTrigger
                  render={
                    <Button
                      ref={withdrawTrigger}
                      type="button"
                      variant="outline"
                      size="sm"
                    />
                  }
                >
                  Withdraw horse
                </AlertDialogTrigger>
                <AlertDialogContent
                  finalFocus={() =>
                    withdrawTrigger.current ?? rowFocusTarget.current
                  }
                >
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Withdraw {horse?.name ?? 'this horse'}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {withdrawalDescription}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  {withdrawError && (
                    <RouteStatusAlert
                      tone="danger"
                      title="Could not withdraw the horse"
                      description="Withdrawal was not confirmed. Try again or close this dialog."
                    />
                  )}
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isWithdrawing}>
                      Keep horse
                    </AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      disabled={isWithdrawing}
                      aria-busy={isWithdrawing || undefined}
                      onClick={() => void confirmWithdrawal()}
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
              onSubmit={async (values) => {
                await onSubmit(values)
                setIsEditing(false)
              }}
              onCancel={() => setIsEditing(false)}
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
          eventHorse.status && eventHorse.status !== 'confirmed' ? (
            <EventHorseStatusBadge status={eventHorse.status} />
          ) : undefined
        }
        meta={
          eventHorse.costShare !== undefined
            ? `Cost ${formatCurrencyAmount(eventHorse.costShare)}`
            : undefined
        }
      />
    </DashboardItemRecordCard>
  )
}
