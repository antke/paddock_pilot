import { useRef, useState } from 'react'
import { CheckIcon } from '@phosphor-icons/react'
import { useMutation } from 'convex/react'
import { api } from 'convex/_generated/api'
import { useT } from '#/i18n/LocaleProvider'
import { useLocalDateContext } from '#/lib/useLocalDateContext'
import { getUserFacingErrorCode } from 'shared/i18n/errors'
import { cn } from '#/lib/utils'
import { Spinner } from '#/components/ui/spinner'
import { Button } from '#/components/ui/button'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import type { TrainingEntry } from './trainingCalendarData'

export function TrainingCompletionControl({
  entry,
  labelled = false,
}: {
  entry: TrainingEntry
  labelled?: boolean
}) {
  const { today } = useLocalDateContext()
  if (!entry.horse.canRecord || entry.occurrence.startDate > today) return null
  return <CompletionButton key={entry.key} entry={entry} labelled={labelled} />
}

function CompletionButton({
  entry,
  labelled,
}: {
  entry: TrainingEntry
  labelled: boolean
}) {
  const t = useT()
  const setStatus = useMutation(api.training.setStatus)
  const submitting = useRef(false)
  const [pending, setPending] = useState(false)
  const completed = entry.status === 'completed'
  const label = t(
    completed ? 'trainingViews.markIncomplete' : 'trainingViews.markComplete',
  )
  const accessibleLabel = t(
    completed
      ? 'trainingViews.markIncompleteFor'
      : 'trainingViews.markCompleteFor',
    {
      horse: entry.horse.name,
      title: entry.occurrence.event.title,
    },
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
        'min-h-11 shrink-0 gap-2 disabled:cursor-wait',
        labelled ? 'w-full justify-start px-2 text-left' : 'size-11 p-0',
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
        try {
          await setStatus({
            eventId: entry.occurrence.eventId,
            horseId: entry.horse._id,
            date: entry.occurrence.startDate,
            status: completed ? 'planned' : 'completed',
            errorFormat: 'structured',
          })
          showAppSuccessToast({
            title: t(
              completed
                ? 'trainingViews.markedIncomplete'
                : 'trainingViews.markedComplete',
            ),
            description: `${entry.horse.name} · ${entry.occurrence.event.title}`,
          })
        } catch (error) {
          const code = getUserFacingErrorCode(error)
          showAppErrorToast({
            title: code
              ? t(`serverErrors.${code}`)
              : t('trainingViews.saveFailed'),
          })
        } finally {
          submitting.current = false
          setPending(false)
        }
      }}
    >
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-control border-2',
          completed
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-input bg-card',
        )}
      >
        {pending ? (
          <Spinner aria-hidden="true" />
        ) : completed ? (
          <CheckIcon weight="bold" aria-hidden="true" className="size-4" />
        ) : null}
      </span>
      {labelled && label}
    </Button>
  )
}
