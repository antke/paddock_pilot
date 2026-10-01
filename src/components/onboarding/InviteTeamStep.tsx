import { useT } from '#/i18n/LocaleProvider'
import type { ReactNode } from 'react'
import { useOnboardingPending } from './onboardingAsync'
import type { Doc, Id } from 'convex/_generated/dataModel'

import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { StableInvitationsList } from '#/components/stables/StableInvitationsList'
import { StableInviteForm } from '#/components/stables/StableInviteForm'
import { Button } from '#/components/ui/button'
import { OnboardingLaterNote } from './OnboardingLayout'

type InviteTeamStepProps = {
  stableId: Id<'stables'>
  invitations: Array<Doc<'stableInvitations'>>
  onContinue: () => void | Promise<void>
  onDeferred: () => void | Promise<void>
}

export function InviteTeamStep(props: InviteTeamStepProps) {
  const onPendingChange = useOnboardingPending()
  return (
    <InviteTeamStepView
      {...props}
      inviteForm={
        <StableInviteForm
          stableId={props.stableId}
          onPendingChange={onPendingChange}
        />
      }
      invitationList={<StableInvitationsList invitations={props.invitations} />}
    />
  )
}

export function InviteTeamStepView({
  inviteForm,
  invitationList,
  invitations,
  onContinue,
  onDeferred,
}: InviteTeamStepProps & { inviteForm: ReactNode; invitationList: ReactNode }) {
  const t = useT()

  return (
    <div className="grid gap-5">
      <OnboardingLaterNote>
        {t('onboarding.inviteLaterHelp')}
      </OnboardingLaterNote>

      {inviteForm}
      {invitations.length > 0 && invitationList}

      <DashboardActions align="end">
        {invitations.length === 0 && (
          <Button type="button" variant="outline" onClick={onDeferred}>
            {t('onboarding.later')}
          </Button>
        )}
        <Button type="button" onClick={onContinue}>
          {invitations.length > 0
            ? t('onboarding.continue')
            : t('onboarding.ready')}
        </Button>
      </DashboardActions>
    </div>
  )
}
