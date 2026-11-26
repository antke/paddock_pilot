import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'
import { Button } from '#/components/ui/button'
import { getTodayDateKey } from '#/lib/dateDisplay'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import { useT } from '#/i18n/LocaleProvider'
import { useActionErrorText } from '#/lib/actionError'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { Badge } from '#/components/ui/badge'
import {
  DashboardItemList,
  DashboardItemRecordCard,
} from '#/components/dashboard/DashboardItemCard'
import { HorseCardContent } from '#/components/horses/HorseCard'
import { HorseInvitationInbox } from './HorseInvitationInbox'

/**
 * The event's one Horses panel: each horse as a horse row with its status at
 * the end. `horses` adds event horses the summary leaves out, as confirmed,
 * and keeps the panel, with its empty state, when there are none.
 */
export function EventParticipation({
  eventId,
  horses,
}: {
  eventId: Id<'events'>
  horses?: Array<Doc<'horses'> & { profileImageUrl?: string | null }>
}) {
  const t = useT()
  const summary = useQuery(api.events.participationSummary, { eventId })
  const participants = summary && [
    ...summary,
    ...(horses ?? [])
      .filter((horse) => !summary.some((row) => row.horseId === horse._id))
      .map((horse) => ({
        ...horse,
        id: horse._id,
        name: getHorseDisplayName(horse),
        status: 'confirmed' as const,
        canRejoin: false,
      })),
  ]
  const rejoin = useMutation(api.events.rejoinHorse)
  const describe = useActionErrorText()
  const [failure, setFailure] = useState<{
    name: string
    error: unknown
  } | null>(null)
  return (
    <>
      {participants && (participants.length > 0 || horses) && (
        <DashboardSectionCard
          title={t('eventEditor.participants')}
          size="panel"
          contentGap="comfortable"
        >
          {participants.length === 0 && (
            <DashboardEmptyState chrome="soft" spacing="flush">
              {t('eventViews.noHorses')}
            </DashboardEmptyState>
          )}
          <DashboardItemList gap="comfortable">
            {participants.map((participant) => (
              <DashboardItemRecordCard
                key={participant.id}
                chrome="flat"
                density="compact"
                interactive={false}
                actionsAlign="center"
                actions={
                  <>
                    {participant.canRejoin && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFailure(null)
                          rejoin({
                            // Only summary rows can rejoin, and their id is the event row.
                            eventHorseId: participant.id as Id<'eventsHorses'>,
                            today: getTodayDateKey(),
                          }).catch((error: unknown) =>
                            setFailure({ name: participant.name, error }),
                          )
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
                  </>
                }
              >
                <HorseCardContent horse={participant} />
              </DashboardItemRecordCard>
            ))}
          </DashboardItemList>
          {failure && (
            <p role="alert" className="text-sm text-destructive">
              {`${t('eventViews.rejoinFailed', { name: failure.name })} ${describe(failure.error)}`}
            </p>
          )}
        </DashboardSectionCard>
      )}
      <HorseInvitationInbox eventId={eventId} />
    </>
  )
}
