import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import { useEffect, useRef, useState } from 'react'
import { ConfirmedCheck } from '#/components/motion/StateFeedback'
import { CheckIcon } from '@phosphor-icons/react'
import { useMutation } from 'convex/react'
import { api } from 'convex/_generated/api'
import { useLocale, useT } from '#/i18n/LocaleProvider'
import { useLocalDateContext } from '#/lib/useLocalDateContext'
import { getUserFacingErrorCode } from 'shared/i18n/errors'
import { cn } from '#/lib/utils'
import { Spinner } from '#/components/ui/spinner'
import { Button } from '#/components/ui/button'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import type { FunctionArgs } from 'convex/server'
import type { Id } from 'convex/_generated/dataModel'
import type { TrainingEntry } from './trainingCalendarData'

export function TrainingCompletionControl({
  entry,
  labelled = false,
}: {
  entry: TrainingEntry
  labelled?: boolean
}) {
  const setStatus = useMutation(api.training.setStatus)
  const { today } = useLocalDateContext()
  if (!entry.horse.canRecord || entry.occurrence.startDate > today) return null
  return (
    <TrainingCompletionControlView
      key={entry.key}
      entry={entry}
      labelled={labelled}
      setStatus={setStatus}
    />
  )
}

export function TrainingCompletionControlView({
  entry,
  labelled,
  setStatus,
}: {
  entry: TrainingEntry
  labelled: boolean
  setStatus: (
    args: FunctionArgs<typeof api.training.setStatus>,
  ) => Promise<unknown>
}) {
  return (
    <CompletionCheckButton
      completed={entry.status === 'completed'}
      labelled={labelled}
      name={`${getHorseDisplayName(entry.horse)} · ${entry.occurrence.event.title}`}
      save={(status) =>
        setStatus({
          eventId: entry.occurrence.eventId,
          horseId: entry.horse._id,
          date: entry.occurrence.startDate,
          status,
          errorFormat: 'structured',
        })
      }
    />
  )
}

/** The horses of one session the viewer may record, today or earlier. */
export function recordableSessionEntries(
  entries: ReadonlyArray<TrainingEntry>,
  today: string,
) {
  return entries.filter(
    (entry) => entry.horse.canRecord && entry.occurrence.startDate <= today,
  )
}

/**
 * One check for a whole session. It completes every horse the viewer may record:
 * all of them for a stable owner or an editor of every horse, and only their own
 * horse for an owner who shares the session with other people's horses.
 */
export function TrainingSessionCompletionCheck({
  entries,
  stableId,
  labelText,
}: {
  entries: ReadonlyArray<TrainingEntry>
  stableId?: string
  /** Shown beside the box; without it the check is a 44px icon control. */
  labelText?: (completed: boolean) => string
}) {
  const save = useMutation(api.training.setSessionStatus)
  const { today } = useLocalDateContext()
  const { locale } = useLocale()
  const recordable = recordableSessionEntries(entries, today)
  if (!recordable.length) return null
  const completed = recordable.every((entry) => entry.status === 'completed')
  const first = recordable[0].occurrence
  return (
    <CompletionCheckButton
      key={first.eventId + first.startDate}
      completed={completed}
      labelled={Boolean(labelText)}
      labelText={labelText?.(completed)}
      name={`${new Intl.ListFormat(locale, { type: 'conjunction' }).format(
        recordable.map((entry) => getHorseDisplayName(entry.horse)),
      )} · ${first.event.title}`}
      save={(status) =>
        save({
          eventId: first.eventId,
          horseIds: recordable.map((entry) => entry.horse._id),
          date: first.startDate,
          stableId: stableId as Id<'stables'> | undefined,
          status,
          errorFormat: 'structured',
        })
      }
    />
  )
}

/**
 * The labelled check at the top of a training detail page. It names the whole
 * session only when it completes every horse; otherwise it completes the viewer's own.
 */
export function TrainingDetailCompletion({
  entries,
  stableId,
}: {
  entries: ReadonlyArray<TrainingEntry>
  stableId?: string
}) {
  const t = useT()
  const { today } = useLocalDateContext()
  const wholeSession =
    entries.length > 1 &&
    recordableSessionEntries(entries, today).length === entries.length
  return (
    <TrainingSessionCompletionCheck
      entries={entries}
      stableId={stableId}
      labelText={(done) =>
        wholeSession
          ? t(
              done
                ? 'trainingViews.reopenSession'
                : 'trainingViews.completeSession',
            )
          : t('trainingViews.complete')
      }
    />
  )
}

const completionCopy = {
  training: {
    complete: 'trainingViews.complete',
    markComplete: 'trainingViews.markComplete',
    markIncomplete: 'trainingViews.markIncomplete',
    markCompleteFor: 'trainingViews.markCompleteFor',
    markIncompleteFor: 'trainingViews.markIncompleteFor',
    markedComplete: 'trainingViews.markedComplete',
    markedIncomplete: 'trainingViews.markedIncomplete',
    failed: 'trainingViews.saveFailed',
  },
  event: {
    complete: 'eventViews.complete',
    markComplete: 'eventViews.markComplete',
    markIncomplete: 'eventViews.markIncomplete',
    markCompleteFor: 'eventViews.markCompleteFor',
    markIncompleteFor: 'eventViews.markIncompleteFor',
    markedComplete: 'eventViews.markedComplete',
    markedIncomplete: 'eventViews.markedIncomplete',
    failed: 'eventViews.completionFailed',
  },
} as const

/** The completion check shared by training entries and ordinary events. */
export function CompletionCheckButton({
  completed,
  labelled,
  labelText,
  name,
  copy = 'training',
  save,
}: {
  completed: boolean
  labelled: boolean
  labelText?: string
  /** What is being completed, for the accessible label and the toast. */
  name: string
  copy?: keyof typeof completionCopy
  save: (status: 'planned' | 'completed') => Promise<unknown>
}) {
  const t = useT()
  const keys = completionCopy[copy]
  const submitting = useRef(false)
  const [pending, setPending] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  useEffect(() => {
    if (!completed) setConfirmed(false)
  }, [completed])
  const label = t(completed ? keys.markIncomplete : keys.markComplete)
  const accessibleLabel = t(
    completed ? keys.markIncompleteFor : keys.markCompleteFor,
    { name },
  )
  return (
    <Button
      type="button"
      variant="ghost"
      size={labelled ? 'default' : 'icon-lg'}
      aria-label={accessibleLabel}
      aria-pressed={completed}
      aria-busy={pending}
      title={label}
      disabled={pending}
      className={cn(
        'shrink-0 gap-2 disabled:cursor-wait',
        // Labelled, it sits beside default buttons, so it takes their height.
        labelled
          ? // 1px border + 9px puts the box 10px from the edge, where the 44px icon check
            // centres it, so a labelled check lines up under icon checks in one column.
            'h-10 w-auto justify-end gap-3 ps-3 pe-[9px] py-0 max-md:h-11 pointer-coarse:h-11'
          : 'size-11 min-h-11 p-0',
        completed
          ? 'text-primary hover:bg-primary/10'
          : 'text-foreground hover:bg-surface-muted',
      )}
      onClick={async (event) => {
        event.preventDefault()
        event.stopPropagation()
        if (submitting.current) return
        submitting.current = true
        setPending(true)
        setConfirmed(false)
        try {
          await save(completed ? 'planned' : 'completed')
          setConfirmed(!completed)
          showAppSuccessToast({
            title: t(completed ? keys.markedIncomplete : keys.markedComplete),
            description: name,
          })
        } catch (error) {
          const code = getUserFacingErrorCode(error)
          showAppErrorToast({
            title: code ? t(`serverErrors.${code}`) : t(keys.failed),
          })
        } finally {
          submitting.current = false
          setPending(false)
        }
      }}
    >
      {labelled && (labelText ?? t(keys.complete))}
      <span
        className={cn(
          'app-choice-feedback flex shrink-0 items-center justify-center rounded-control border-2',
          // The 44px button is the touch target; the box inside stays small so
          // the hover highlight has room above and below it.
          'size-6',
          completed
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-input bg-card',
        )}
      >
        {pending ? (
          <Spinner aria-hidden="true" />
        ) : confirmed ? (
          <ConfirmedCheck />
        ) : completed ? (
          <CheckIcon weight="bold" aria-hidden="true" className="size-4" />
        ) : null}
      </span>
    </Button>
  )
}
