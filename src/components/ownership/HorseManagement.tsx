import { HorseSharingManager } from '#/components/sharing/HorseSharingManager'
import { HorseHistorySharing } from '#/components/sharing/HistorySharing'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { useLocale } from '#/i18n/LocaleProvider'
import type { FunctionArgs, FunctionReturnType } from 'convex/server'
import type { ReactNode } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { RoutePending } from '#/components/layout/RoutePending'
import { HorseManagementView } from './HorseManagementView'
import type { DepartureReview } from './DepartureReview'

export { HorseManagementView } from './HorseManagementView'
export {
  DepartureReview,
  DepartureReviewView,
  DepartureChecklist,
} from './DepartureReview'

export type ManagementProps = {
  horseId: Id<'horses'>
  data: FunctionReturnType<typeof api.horseCollaboration.management>
  stables: Array<
    Pick<FunctionReturnType<typeof api.stables.list>[number], '_id' | 'name'>
  >
  invite: (
    args: FunctionArgs<typeof api.horseCollaboration.invite>,
  ) => Promise<unknown>
  updateCarer: (
    args: FunctionArgs<typeof api.horseCollaboration.updateCarer>,
  ) => Promise<unknown>
  revoke: (
    args: FunctionArgs<typeof api.horseCollaboration.revokeInvitation>,
  ) => Promise<unknown>
  connect: (
    args: FunctionArgs<typeof api.horseTransitions.connect>,
  ) => Promise<unknown>
  archive: (
    args: FunctionArgs<typeof api.horses.deleteHorse>,
  ) => Promise<unknown>
  renderDeparture?: (props: Parameters<typeof DepartureReview>[0]) => ReactNode
}
export function HorseManagement({ horseId }: { horseId: Id<'horses'> }) {
  const { locale } = useLocale()
  const data = useQuery(api.horseCollaboration.management, { horseId })
  const stables = useQuery(api.stables.list)
  const invite = useMutation(api.horseCollaboration.invite)
  const updateCarer = useMutation(api.horseCollaboration.updateCarer)
  const revoke = useMutation(api.horseCollaboration.revokeInvitation)
  const connect = useMutation(api.horseTransitions.connect)
  const archive = useMutation(api.horses.deleteHorse)
  if (!data || !stables) return <RoutePending />
  return (
    <>
      <HorseSharingManager horseId={horseId} />
      <HorseManagementView
        horseId={horseId}
        data={data}
        stables={stables}
        invite={invite}
        updateCarer={updateCarer}
        revoke={revoke}
        connect={connect}
        archive={archive}
      />
      {data.access.isOwner && data.access.stable ? (
        <DashboardSectionCard
          title={
            locale === 'pl' ? 'Udostępnij historię' : 'Share existing history'
          }
        >
          <HorseHistorySharing
            horseId={horseId}
            stableId={data.access.stable._id}
          />
        </DashboardSectionCard>
      ) : null}
    </>
  )
}
