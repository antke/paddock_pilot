import type { ReactNode } from 'react'
import { ClerkLoaded, ClerkLoading, Show } from '@clerk/tanstack-react-start'

import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'
import { RoutePending } from './RoutePending'

type AuthStateSwitchProps = {
  signedIn: ReactNode
  signedOut: ReactNode
  loading?: ReactNode
}

export function AuthStateSwitch({
  signedIn,
  signedOut,
  loading = <RoutePending />,
}: AuthStateSwitchProps) {
  const devAuthBypassEnabled = useDevAuthBypassEnabled()

  if (devAuthBypassEnabled) {
    return <>{signedIn}</>
  }

  return (
    <>
      <ClerkLoading>{loading}</ClerkLoading>

      <ClerkLoaded>
        <Show when="signed-out">{signedOut}</Show>
        <Show when="signed-in">{signedIn}</Show>
      </ClerkLoaded>
    </>
  )
}
