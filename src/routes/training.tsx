import { createFileRoute } from '@tanstack/react-router'
import { PersonalTraining } from '#/components/ownership/PersonalTraining'
import { AuthStateSwitch } from '#/components/layout/AuthStateSwitch'
import { SignedOutRoutePrompt } from '#/components/layout/SignedOutRoutePrompt'

export const Route = createFileRoute('/training')({
  component: () => (
    <AuthStateSwitch
      signedIn={<PersonalTraining />}
      signedOut={<SignedOutRoutePrompt title="Paddock Pilot" description="" />}
    />
  ),
})
