import type { Doc, Id } from 'convex/_generated/dataModel'

import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { StableInvitationsList } from '#/components/stables/StableInvitationsList'
import { StableInviteForm } from '#/components/stables/StableInviteForm'
import { Button } from '#/components/ui/button'
import { OnboardingLaterNote } from './OnboardingLayout'

export function InviteTeamStep({
  stableId,
  invitations,
  onContinue,
  onDeferred,
}: {
  stableId: Id<'stables'>
  invitations: Array<Doc<'stableInvitations'>>
  onContinue: () => void | Promise<void>
  onDeferred: () => void | Promise<void>
}) {
  return (
    <div className="grid gap-5">
      <OnboardingLaterNote>
        Your stable is ready to use. Invite someone now, or add people later
        from the Members section in Stable settings.
      </OnboardingLaterNote>

      <StableInviteForm stableId={stableId} />
      {invitations.length > 0 && (
        <StableInvitationsList invitations={invitations} />
      )}

      <DashboardActions align="end">
        {invitations.length === 0 && (
          <Button type="button" variant="outline" onClick={onDeferred}>
            Do this later
          </Button>
        )}
        <Button type="button" onClick={onContinue}>
          {invitations.length > 0 ? 'Continue' : 'I’m ready'}
        </Button>
      </DashboardActions>
    </div>
  )
}
