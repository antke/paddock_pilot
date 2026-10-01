import { useT } from '#/i18n/LocaleProvider'
import { StableCommandCenter } from './command-center/StableCommandCenter'
import type { DashboardCommandData } from './command-center/dashboardTypes'
import { DashboardPage } from './DashboardPage'
import { PendingHorseInvitationList } from './PendingHorseInvitationList'
import type { PendingHorseInvitation } from './PendingHorseInvitationList'
import { NoStablesPrompt } from '#/components/stables/NoStablesPrompt'

type InvitationId = PendingHorseInvitation['invitation']['_id']
type Props =
  | { data?: undefined }
  | {
      data: DashboardCommandData
      invitations: Array<PendingHorseInvitation>
      onApprove: (id: InvitationId) => Promise<void>
      onDecline: (id: InvitationId) => Promise<void>
    }

/** Actual signed-in home composition; connected callers own queries and persistence. */
export function AppDashboardView(props: Props) {
  const t = useT()

  if (!props.data) {
    return <NoStablesPrompt>{t('listControls.dashboardEmpty')}</NoStablesPrompt>
  }
  const { data, invitations, onApprove, onDecline } = props
  return (
    <DashboardPage>
      <StableCommandCenter data={data} />
      <PendingHorseInvitationList
        key={data.stable._id}
        invitations={invitations.filter(
          ({ event }) => event?.stableId === data.stable._id,
        )}
        onApprove={onApprove}
        onDecline={onDecline}
      />
    </DashboardPage>
  )
}
