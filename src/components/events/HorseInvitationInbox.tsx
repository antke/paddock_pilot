import { useWorkspace } from '#/components/layout/WorkspaceContext'
import { useMutation } from 'convex/react'
import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { Button } from '#/components/ui/button'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { PendingHorseInvitationList } from '#/components/dashboard/PendingHorseInvitationList'
import { useT } from '#/i18n/LocaleProvider'

export function HorseInvitationInbox({ eventId }: { eventId?: Id<'events'> }) {
  const workspace = useWorkspace()
  const t = useT()
  const {
    data: invitations,
    error,
    refetch,
  } = useQuery(
    convexQuery(api.events.listPendingHorseInvitations, {
      stableId: workspace?.stableId,
    }),
  )
  const approve = useMutation(api.events.approveHorseInvitation)
  const decline = useMutation(api.events.declineHorseInvitation)
  if (error)
    return (
      <div role="alert">
        <p>{t('eventEditor.invitationsFailed')}</p>
        <Button variant="outline" onClick={() => void refetch()}>
          {t('common.retry')}
        </Button>
      </div>
    )
  if (invitations === undefined)
    return <p role="status">{t('eventEditor.invitationsLoading')}</p>
  return (
    <PendingHorseInvitationList
      invitations={
        eventId
          ? invitations.filter((item) => item.event?._id === eventId)
          : invitations
      }
      onApprove={async (eventHorseId) => {
        await approve({ eventHorseId })
      }}
      onDecline={async (eventHorseId) => {
        await decline({ eventHorseId })
      }}
    />
  )
}
