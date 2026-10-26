import { useRef, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import type { TrainingEntry } from './trainingCalendarData'
import { Button } from '#/components/ui/button'
import { useT } from '#/i18n/LocaleProvider'
import { useLocalDateContext } from '#/lib/useLocalDateContext'

export function TrainingSessionCompletionControl({
  entries,
  stableId,
}: {
  entries: Array<TrainingEntry>
  stableId?: string
}) {
  const t = useT()
  const { today } = useLocalDateContext()
  const save = useMutation(api.training.setSessionStatus)
  const locked = useRef(false)
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)
  if (
    entries.length < 2 ||
    entries.some(
      (entry) => !entry.horse.canRecord || entry.occurrence.startDate > today,
    )
  )
    return null
  const completed = entries.every((entry) => entry.status === 'completed')
  return (
    <div className="grid justify-items-start gap-2">
      <Button
        disabled={pending}
        aria-busy={pending}
        onClick={async () => {
          if (locked.current) return
          locked.current = true
          setPending(true)
          setFailed(false)
          try {
            await save({
              eventId: entries[0].occurrence.eventId,
              horseIds: entries.map((entry) => entry.horse._id),
              date: entries[0].occurrence.startDate,
              stableId: stableId as Id<'stables'> | undefined,
              status: completed ? 'planned' : 'completed',
              errorFormat: 'structured',
            })
          } catch {
            setFailed(true)
          } finally {
            locked.current = false
            setPending(false)
          }
        }}
      >
        {t(
          completed
            ? 'trainingViews.reopenSession'
            : 'trainingViews.completeSession',
        )}
      </Button>
      {failed && <p role="alert">{t('trainingViews.saveFailed')}</p>}
    </div>
  )
}
