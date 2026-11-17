import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { CompletionCheckButton } from '#/components/training/TrainingCompletionControl'
import { useLocalDateContext } from '#/lib/useLocalDateContext'

/**
 * Whether an ordinary event can be ticked off from its page: started, not
 * cancelled, and a single event, since a series shares one status.
 */
export function canQuickCompleteEvent(event: Doc<'events'>, today: string) {
  return (
    event.type !== 'training' &&
    event.status !== 'cancelled' &&
    !event.recurrence &&
    event.date <= today
  )
}

/** The labelled check at the top of an event page (The Quick Completion Rule). */
export function EventCompletionCheck({ event }: { event: Doc<'events'> }) {
  const setCompleted = useMutation(api.events.setCompleted)
  const { today } = useLocalDateContext()
  if (!canQuickCompleteEvent(event, today)) return null
  return (
    <CompletionCheckButton
      key={event._id}
      copy="event"
      labelled
      completed={event.status === 'completed'}
      name={event.title}
      save={(status) =>
        setCompleted({ id: event._id, completed: status === 'completed' })
      }
    />
  )
}
