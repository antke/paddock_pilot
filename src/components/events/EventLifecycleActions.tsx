import { CaretDownIcon, DotsThreeIcon } from '@phosphor-icons/react'
import { useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { EntityActionsMenu } from '#/components/dashboard/EntityActionsMenu'
import { ActionErrorAlert } from '#/components/layout/ActionErrorAlert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { showAppErrorToast } from '#/components/ui/sonner'
import { useActionErrorText } from '#/lib/actionError'
import { eventStatuses } from 'shared/events/eventSchema'
import type { EventStatus } from 'shared/events/eventSchema'
import { useLocale, useT } from '#/i18n/LocaleProvider'
import { formatShortDateKey, getTodayDateKey } from '#/lib/dateDisplay'
import { getUserFacingErrorCode } from 'shared/i18n/errors'

type Action =
  | 'cancel'
  | 'restore'
  | 'delete'
  | 'deleteBlocked'
  | 'cancelDate'
  | 'restoreDate'

/**
 * Cancel/restore/delete for the organizer, behind one menu beside Edit. On
 * phones (`leadingItems`) it becomes the page's one actions menu, Edit first.
 * With `status`, a Change status menu sets the status in place; it then owns
 * cancel and restore, so the "…" menu doesn't repeat them.
 */
export function EventLifecycleActions({
  eventId,
  title,
  cancelled,
  canDelete = true,
  training,
  stableId,
  occurrenceDate,
  occurrenceCancelled = false,
  leadingItems,
  status,
  editAction,
}: {
  leadingItems?: ReactNode
  status?: EventStatus
  /** Desktop Edit, placed after Change status and before "…". */
  editAction?: ReactNode
  eventId: Id<'events'>
  title: string
  cancelled: boolean
  /** False when horses' history keeps the event: Delete then explains and offers Cancel. */
  canDelete?: boolean
  training: boolean
  stableId?: string
  /** One date of a series, when the page was opened from that date. */
  occurrenceDate?: string
  occurrenceCancelled?: boolean
}) {
  const t = useT()
  const navigate = useNavigate()
  const setCancelled = useMutation(api.events.setCancelled)
  const remove = useMutation(api.events.remove)
  const setOccurrenceSkip = useMutation(api.events.setOccurrenceSkip)
  const setCompleted = useMutation(api.events.setCompleted)
  const describeError = useActionErrorText()
  const { locale } = useLocale()
  const date = occurrenceDate ? formatShortDateKey(occurrenceDate, locale) : ''
  const [action, setAction] = useState<Action | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const noun = training ? 'Training' : 'Event'

  const confirm = async () => {
    if (!action || busy) return
    setBusy(true)
    setError(null)
    try {
      if (action === 'delete') {
        await remove({ id: eventId })
        // The detail page no longer exists; return to the matching calendar.
        if (stableId)
          await navigate({
            to: training
              ? '/stables/$stableId/training'
              : '/stables/$stableId/events',
            params: { stableId },
          })
        else await navigate({ to: training ? '/training' : '/events' })
      } else if (
        (action === 'cancelDate' || action === 'restoreDate') &&
        occurrenceDate
      )
        await setOccurrenceSkip({
          eventId,
          date: occurrenceDate,
          skipped: action === 'cancelDate',
          today: getTodayDateKey(),
        })
      else
        await setCancelled({
          id: eventId,
          cancelled: action === 'cancel' || action === 'deleteBlocked',
        })
      setAction(null)
    } catch (caught) {
      // Someone's history arrived meanwhile: explain and offer Cancel, as up front.
      if (
        action === 'delete' &&
        getUserFacingErrorCode(caught) === 'eventDeleteBlocked'
      )
        setAction('deleteBlocked')
      else setError(caught ?? new Error('Event change failed'))
    } finally {
      setBusy(false)
    }
  }

  const label = (key: Action): string =>
    key === 'deleteBlocked'
      ? label('cancel')
      : key === 'cancelDate' || key === 'restoreDate'
        ? t(`eventViews.${key}`, { date })
        : t(`eventViews.${key}${noun}`)

  const changeStatus = async (next: EventStatus) => {
    if (!status || next === status) return
    // Cancelling closes open invitations and tells everyone, so it still confirms.
    if (next === 'cancelled') return setAction('cancel')
    try {
      if (status === 'cancelled')
        await setCancelled({ id: eventId, cancelled: false })
      if (next === 'completed' || status === 'completed')
        await setCompleted({ id: eventId, completed: next === 'completed' })
    } catch (caught) {
      showAppErrorToast({
        title: t('eventViews.statusChangeFailed', { title }),
        description: <p>{describeError(caught)}</p>,
      })
    }
  }

  const statusItems = status && (
    <DropdownMenuRadioGroup
      value={status}
      onValueChange={(next: EventStatus) => void changeStatus(next)}
    >
      {eventStatuses.map((option) => (
        <DropdownMenuRadioItem key={option} value={option} closeOnClick>
          {t(`calendar.${option}`)}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  )

  const lifecycleItems = (
    <>
      {!status && (
        <DropdownMenuItem
          onClick={() => setAction(cancelled ? 'restore' : 'cancel')}
        >
          {label(cancelled ? 'restore' : 'cancel')}
        </DropdownMenuItem>
      )}
      {/* A past date can't be cancelled any more; an earlier cancel can still be undone. */}
      {occurrenceDate &&
        !cancelled &&
        (occurrenceCancelled || occurrenceDate >= getTodayDateKey()) && (
          <DropdownMenuItem
            onClick={() =>
              setAction(occurrenceCancelled ? 'restoreDate' : 'cancelDate')
            }
          >
            {label(occurrenceCancelled ? 'restoreDate' : 'cancelDate')}
          </DropdownMenuItem>
        )}
      <DropdownMenuItem
        variant="destructive"
        onClick={() => setAction(canDelete ? 'delete' : 'deleteBlocked')}
      >
        {label('delete')}
      </DropdownMenuItem>
    </>
  )

  return (
    <>
      {leadingItems ? (
        <EntityActionsMenu>
          {leadingItems}
          {statusItems && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  {t('eventViews.changeStatus')}
                </DropdownMenuLabel>
                {statusItems}
              </DropdownMenuGroup>
            </>
          )}
          <DropdownMenuSeparator />
          {lifecycleItems}
        </EntityActionsMenu>
      ) : (
        <>
          {statusItems && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  // Outlined like Edit event and the same height, so the row reads as one.
                  <Button type="button" variant="outline" />
                }
              >
                {t('eventViews.changeStatus')}
                <CaretDownIcon data-icon="inline-end" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {statusItems}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {editAction}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                // Same outline and height as Edit beside it.
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={t('eventViews.moreActions')}
                />
              }
            >
              <DotsThreeIcon weight="bold" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {lifecycleItems}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
      <AlertDialog
        open={action !== null}
        onOpenChange={(open) => {
          if (!open && !busy) {
            setAction(null)
            setError(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action && t(`eventViews.${action}Named`, { title, date })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action &&
                t(
                  action === 'delete' && training
                    ? 'eventViews.deleteTrainingHelp'
                    : action === 'deleteBlocked' && cancelled
                      ? 'eventViews.deleteBlockedCancelledHelp'
                      : `eventViews.${action}Help`,
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {action && error != null && (
            <ActionErrorAlert
              title={t(`eventViews.${action}Failed`, { title, date })}
              error={error}
            />
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>
              {t(
                action === 'deleteBlocked' && cancelled
                  ? 'eventViews.withdrawClosedDismiss'
                  : 'eventViews.keepEvent',
              )}
            </AlertDialogCancel>
            {!(action === 'deleteBlocked' && cancelled) && (
              <AlertDialogAction
                variant={
                  action === 'restore' || action === 'restoreDate'
                    ? 'default'
                    : 'destructive'
                }
                disabled={busy}
                aria-busy={busy || undefined}
                onClick={() => void confirm()}
              >
                {action && label(action)}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
