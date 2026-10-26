import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useT } from '#/i18n/LocaleProvider'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { Badge } from '#/components/ui/badge'
import { HorseInvitationInbox } from './HorseInvitationInbox'

export function EventParticipation({ eventId }: { eventId: Id<'events'> }) {
  const t = useT()
  const participants = useQuery(api.events.participationSummary, { eventId })
  return (
    <>
      {participants && participants.length > 0 && (
        <DashboardSectionCard title={t('eventEditor.participants')}>
          <ul className="divide-y divide-border-subtle">
            {participants.map((participant) => (
              <li
                key={participant.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <span>{participant.name}</span>
                <Badge variant="secondary">
                  {t(
                    participant.status === 'invited'
                      ? 'eventEditor.awaiting'
                      : participant.status === 'declined'
                        ? 'eventEditor.declined'
                        : participant.status === 'withdrawn'
                          ? 'eventEditor.withdrawn'
                          : 'eventEditor.confirmed',
                  )}
                </Badge>
              </li>
            ))}
          </ul>
        </DashboardSectionCard>
      )}
      <HorseInvitationInbox eventId={eventId} />
    </>
  )
}
