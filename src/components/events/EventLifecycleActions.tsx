import { DotsThreeIcon } from '@phosphor-icons/react'
import { useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import { getUserFacingErrorCode } from 'shared/i18n/errors'
import { RouteStatusAlert } from '#/components/layout/RouteStatusAlert'
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
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { useLocale, useT } from '#/i18n/LocaleProvider'
import { formatShortDateKey, getTodayDateKey } from '#/lib/dateDisplay'

type Action = 'cancel' | 'restore' | 'delete' | 'cancelDate' | 'restoreDate'

/** Cancel/restore/delete for the organizer, behind one menu beside Edit. */
export function EventLifecycleActions({
  eventId,
  title,
  cancelled,
  training,
  stableId,
  occurrenceDate,
  occurrenceCancelled = false,
}: {
  eventId: Id<'events'>
  title: string
  cancelled: boolean
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
  const { locale } = useLocale()
  const date = occurrenceDate ? formatShortDateKey(occurrenceDate, locale) : ''
  const [action, setAction] = useState<Action | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
      else await setCancelled({ id: eventId, cancelled: action === 'cancel' })
      setAction(null)
    } catch (caught) {
      const code = getUserFacingErrorCode(caught)
      setError(
        code ? t(`serverErrors.${code}`) : t('eventViews.lifecycleFailed'),
      )
    } finally {
      setBusy(false)
    }
  }

  const label = (key: Action) =>
    key === 'cancelDate' || key === 'restoreDate'
      ? t(`eventViews.${key}`, { date })
      : t(`eventViews.${key}${noun}`)

  return (
    <>
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
          <DropdownMenuItem
            onClick={() => setAction(cancelled ? 'restore' : 'cancel')}
          >
            {label(cancelled ? 'restore' : 'cancel')}
          </DropdownMenuItem>
          {occurrenceDate && !cancelled && (
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
            onClick={() => setAction('delete')}
          >
            {label('delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
                    : `eventViews.${action}Help`,
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <RouteStatusAlert tone="danger" title={error} />}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>
              {t('eventViews.keepEvent')}
            </AlertDialogCancel>
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
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
