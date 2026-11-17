import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'
import { Button } from '#/components/ui/button'
import { getTodayDateKey } from '#/lib/dateDisplay'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useT } from '#/i18n/LocaleProvider'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { Badge } from '#/components/ui/badge'
import { HorseInvitationInbox } from './HorseInvitationInbox'

export function EventParticipation({ eventId }: { eventId: Id<'events'> }) {
  const t = useT()
  const participants = useQuery(api.events.participationSummary, { eventId })
  const rejoin = useMutation(api.events.rejoinHorse)
  const [failed, setFailed] = useState(false)
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
                <span className="flex flex-wrap items-center gap-2">
                  {participant.canRejoin && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFailed(false)
                        rejoin({
                          eventHorseId: participant.id,
                          today: getTodayDateKey(),
                        }).catch(() => setFailed(true))
                      }}
                    >
                      {t('eventViews.rejoin')}
                    </Button>
                  )}
                  {/* Beside Rejoin the status takes the button's height. */}
                  <Badge
                    variant="secondary"
                    size={participant.canRejoin ? 'action' : 'default'}
                  >
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
                </span>
              </li>
            ))}
          </ul>
          {failed && (
            <p role="alert" className="text-sm text-destructive">
              {t('eventViews.rejoinFailed')}
            </p>
          )}
        </DashboardSectionCard>
      )}
      <HorseInvitationInbox eventId={eventId} />
    </>
  )
}
