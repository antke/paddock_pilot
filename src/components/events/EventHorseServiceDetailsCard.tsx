import { useT, useLocale } from '#/i18n/LocaleProvider'
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
  const t = useT()

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
        showAppSuccessToast({ title: t('eventViews.serviceSaved') })
      }}
      onWithdraw={async (rowId) => {
        await withdrawHorse({ eventHorseId: rowId })
        showAppSuccessToast({ title: t('eventViews.horseWithdrawn') })
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
  withdrawalDescription,
}: EventHorseServiceDetailsViewProps) {
  const t = useT()
  return (
    <DashboardSectionCard
      title={t('eventViews.serviceNotes')}
      size="panel"
      description={t('eventViews.serviceHelp')}
      descriptionSize="sm"
    >
      {rows.length === 0 ? (
        <DashboardEmptyState chrome="cards">
          {t('eventViews.noHorses')}
        </DashboardEmptyState>
      ) : (
        <DashboardItemList>
          {rows.map((row) => (
            <EventHorseServiceRow
              key={row.eventHorse._id}
              row={row}
              onSubmit={(values) => onSave(row.eventHorse._id, values)}
              onWithdraw={() => onWithdraw(row.eventHorse._id)}
              withdrawalDescription={
                withdrawalDescription ?? t('eventViews.withdrawalHelp')
              }
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
  const t = useT()
  const { locale } = useLocale()
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
      aria-label={t('eventViews.serviceRegion', {
        name: horse?.name ?? t('eventViews.unknownHorse'),
      })}
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
                {hasDetails
                  ? t('eventViews.editDetails')
                  : t('eventViews.addDetails')}
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
                  {t('eventViews.withdraw')}
                </AlertDialogTrigger>
                <AlertDialogContent
                  finalFocus={() =>
                    withdrawTrigger.current ?? rowFocusTarget.current
                  }
                >
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {horse?.name
                        ? t('eventViews.withdrawNamed', { name: horse.name })
                        : t('eventViews.withdrawUnnamed')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {withdrawalDescription}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  {withdrawError && (
                    <RouteStatusAlert
                      tone="danger"
                      title={t('eventViews.withdrawFailed')}
                      description={t('eventViews.withdrawFailedHelp')}
                    />
                  )}
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isWithdrawing}>
                      {t('eventViews.keepHorse')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      disabled={isWithdrawing}
                      aria-busy={isWithdrawing || undefined}
                      onClick={() => void confirmWithdrawal()}
                    >
                      {isWithdrawing
                        ? t('eventViews.withdrawing')
                        : t('eventViews.withdraw')}
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
                <DetailTextBlock label={t('eventViews.requestedService')}>
                  {eventHorse.requestedServiceNotes}
                </DetailTextBlock>
              )}
              {eventHorse.completionNotes && (
                <DetailTextBlock label={t('eventViews.outcome')}>
                  {eventHorse.completionNotes}
                </DetailTextBlock>
              )}
            </>
          ) : (
            <DashboardEmptyState chrome="soft" spacing="flush">
              {t('eventViews.noServiceNotes')}
            </DashboardEmptyState>
          )}
        </DashboardItemRecordFooter>
      }
    >
      <HorseCardContent
        horse={horse ?? { name: t('eventViews.unknownHorse') }}
        badges={
          eventHorse.status && eventHorse.status !== 'confirmed' ? (
            <EventHorseStatusBadge status={eventHorse.status} />
          ) : undefined
        }
        meta={
          eventHorse.costShare !== undefined
            ? t('eventViews.cost', {
                amount: formatCurrencyAmount(eventHorse.costShare, locale),
              })
            : undefined
        }
      />
    </DashboardItemRecordCard>
  )
}
