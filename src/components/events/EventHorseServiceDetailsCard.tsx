import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import { formatShortDateKey, getTodayDateKey } from '#/lib/dateDisplay'
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
import { EditActionButton } from '#/components/ui/edit-action'
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
  trainingDisclosure?: boolean
  occurrenceDate?: string
}

export function EventHorseServiceDetailsCard({
  eventId,
  trainingDisclosure = false,
  occurrenceDate,
}: EventHorseServiceDetailsCardProps) {
  const t = useT()

  const { data } = useSuspenseQuery(
    convexQuery(api.eventHorseDetails.listForEvent, {
      eventId: eventId as Id<'events'>,
    }),
  )
  const updateDetails = useMutation(api.eventHorseDetails.update)
  const withdrawHorse = useMutation(api.events.withdrawHorseFromEvent)
  const setOccurrenceSkip = useMutation(api.events.setOccurrenceSkip)
  const { locale } = useLocale()
  if (!data.event) return null
  const event = data.event
  const dateSkip =
    occurrenceDate && event.recurrence && !trainingDisclosure
      ? {
          label: formatShortDateKey(occurrenceDate, locale),
          skipped: (horseId: string) =>
            Boolean(
              event.occurrenceSkips?.some(
                (skip) =>
                  skip.date === occurrenceDate && skip.horseId === horseId,
              ),
            ),
          toggle: (horseId: Id<'horses'>, skipped: boolean) =>
            setOccurrenceSkip({
              eventId: event._id,
              date: occurrenceDate,
              horseId,
              skipped,
              today: getTodayDateKey(),
            }),
        }
      : undefined

  return (
    <EventHorseServiceDetailsView
      rows={data.rows}
      trainingDisclosure={trainingDisclosure}
      dateSkip={dateSkip}
      onSave={async (rowId, values) => {
        await updateDetails({ id: rowId, ...values })
        showAppSuccessToast({ title: t('eventViews.serviceSaved') })
      }}
      onWithdraw={async (rowId) => {
        await withdrawHorse({ eventHorseId: rowId, today: getTodayDateKey() })
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
  trainingDisclosure?: boolean
  dateSkip?: DateSkip
}

type DateSkip = {
  label: string
  skipped: (horseId: string) => boolean
  toggle: (horseId: Id<'horses'>, skipped: boolean) => Promise<unknown>
}

/** Shared UI; mutation owners must reject failures and resolve only after saving. */
export function EventHorseServiceDetailsView({
  rows,
  onSave,
  onWithdraw,
  withdrawalDescription,
  trainingDisclosure = false,
  dateSkip,
}: EventHorseServiceDetailsViewProps) {
  const t = useT()
  const content =
    rows.length === 0 ? (
      <DashboardEmptyState chrome="cards">
        {t('eventViews.noHorses')}
      </DashboardEmptyState>
    ) : (
      <DashboardItemList>
        {rows.map((row) => (
          <EventHorseServiceRow
            key={row.eventHorse._id}
            row={row}
            training={trainingDisclosure}
            dateSkip={dateSkip}
            onSubmit={(values) => onSave(row.eventHorse._id, values)}
            onWithdraw={() => onWithdraw(row.eventHorse._id)}
            withdrawalDescription={
              withdrawalDescription ?? t('eventViews.withdrawalHelp')
            }
          />
        ))}
      </DashboardItemList>
    )

  if (trainingDisclosure) {
    return (
      <details className="app-panel bg-card p-4 sm:p-5">
        <summary className="app-control-focus min-h-11 cursor-pointer py-2 font-semibold">
          {t('trainingViews.horseNotes')}
        </summary>
        <div className="grid gap-4 border-t border-border-subtle pt-4">
          <p className="text-sm leading-6 text-muted-foreground">
            {t('trainingViews.horseNotesHelp')}
          </p>
          {content}
        </div>
      </details>
    )
  }
  return (
    <DashboardSectionCard
      title={t('eventViews.serviceNotes')}
      size="panel"
      description={t('eventViews.serviceHelp')}
      descriptionSize="sm"
    >
      {content}
    </DashboardSectionCard>
  )
}

function EventHorseServiceRow({
  row,
  onSubmit,
  onWithdraw,
  withdrawalDescription,
  training = false,
  dateSkip,
}: {
  dateSkip?: DateSkip
  row: EventHorseDetailRow
  onSubmit: (values: EventHorseDetailsFormSchema) => Promise<void>
  onWithdraw: () => Promise<void>
  withdrawalDescription: string
  training?: boolean
}) {
  const t = useT()
  const { locale, currency } = useLocale()
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
  const horseName = getHorseDisplayName(horse) ?? t('eventViews.unknownHorse')
  const showStatus = Boolean(
    eventHorse.status && eventHorse.status !== 'confirmed',
  )
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
      aria-label={t('eventViews.serviceRegion', { name: horseName })}
      tabIndex={-1}
      chrome="flat"
      density="compact"
      interactive={false}
      actions={
        !isEditing && (canManage || canWithdraw || showStatus) ? (
          <>
            {canWithdraw && dateSkip && (
              // Same size as Withdraw beside it.
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  void dateSkip.toggle(horse._id, !dateSkip.skipped(horse._id))
                }
              >
                {t(
                  dateSkip.skipped(horse._id)
                    ? 'eventViews.joinDate'
                    : 'eventViews.skipDate',
                  { date: dateSkip.label },
                )}
              </Button>
            )}
            {/* The status takes Withdraw's place and height, so the row keeps its shape. */}
            {showStatus && (
              <EventHorseStatusBadge
                status={eventHorse.status}
                size="action"
                reserveLabel={
                  eventHorse.status === 'withdrawn'
                    ? t('eventViews.withdraw')
                    : undefined
                }
              />
            )}
            {canManage &&
              (hasDetails ? (
                <EditActionButton
                  ref={editTrigger}
                  label={t('eventViews.editDetailsNamed', { name: horseName })}
                  onClick={() => setIsEditing(true)}
                />
              ) : (
                <Button
                  type="button"
                  ref={editTrigger}
                  action="create"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  {t('eventViews.addDetails')}
                </Button>
              ))}
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
                      {getHorseDisplayName(horse)
                        ? t('eventViews.withdrawNamed', {
                            name: getHorseDisplayName(horse),
                          })
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
              training={training}
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
                <DetailTextBlock
                  label={t(
                    training
                      ? 'trainingViews.beforeSession'
                      : 'eventViews.requestedService',
                  )}
                >
                  {eventHorse.requestedServiceNotes}
                </DetailTextBlock>
              )}
              {eventHorse.completionNotes && (
                <DetailTextBlock
                  label={t(
                    training
                      ? 'trainingViews.afterSession'
                      : 'eventViews.outcome',
                  )}
                >
                  {eventHorse.completionNotes}
                </DetailTextBlock>
              )}
            </>
          ) : (
            <DashboardEmptyState chrome="soft" spacing="flush">
              {t(
                training
                  ? 'trainingViews.noHorseNotes'
                  : 'eventViews.noServiceNotes',
              )}
            </DashboardEmptyState>
          )}
        </DashboardItemRecordFooter>
      }
    >
      <HorseCardContent
        horse={horse ?? { name: t('eventViews.unknownHorse') }}
        meta={
          eventHorse.costShare !== undefined
            ? t('eventViews.cost', {
                amount: formatCurrencyAmount(eventHorse.costShare, locale, currency),
              })
            : undefined
        }
      />
    </DashboardItemRecordCard>
  )
}
