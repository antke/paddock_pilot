import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useLocale } from '#/i18n/LocaleProvider'
import { Button, ButtonLink } from '#/components/ui/button'

export function ScheduledTrainingChoices({
  horseIds,
  date,
}: {
  horseIds: Array<string>
  date: string
}) {
  const { locale } = useLocale()
  const pl = locale === 'pl'
  const [dismissed, setDismissed] = useState(false)
  const sessions = useQuery(api.training.scheduledForLogging, {
    horseIds: horseIds as Array<Id<'horses'>>,
    date,
  })
  if (!sessions?.length || dismissed) return null
  return (
    <div className="space-y-3 border-b border-border pb-4">
      <p className="font-medium">
        {pl
          ? 'Zaplanowane treningi na ten dzień'
          : 'Scheduled sessions on this day'}
      </p>
      {sessions.map((session) => (
        <div
          key={`${session.eventId}:${session.horseId}`}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <span>
            {session.horseName} · {session.title} · {session.time}
          </span>
          <ButtonLink
            to="/events/$eventId"
            params={{ eventId: session.eventId }}
            search={{ horseId: session.horseId, date: session.date }}
            variant="outline"
          >
            {pl ? 'Zapisz ten trening' : 'Record this session'}
          </ButtonLink>
        </div>
      ))}
      <Button type="button" variant="ghost" onClick={() => setDismissed(true)}>
        {pl ? 'Utwórz nowy trening' : 'Create a new session'}
      </Button>
    </div>
  )
}
