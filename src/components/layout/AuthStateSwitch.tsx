import type { ReactNode } from 'react'
import { ClerkLoaded, ClerkLoading, Show } from '@clerk/tanstack-react-start'

import { isDevAuthBypassEnabled } from '#/lib/devAuthBypass'
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
  if (isDevAuthBypassEnabled()) {
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
