import { useT } from '#/i18n/LocaleProvider'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AuthStateSwitch } from '#/components/layout/AuthStateSwitch'
import { RoutePending } from '#/components/layout/RoutePending'
import { SignedOutRoutePrompt } from '#/components/layout/SignedOutRoutePrompt'

export const Route = createFileRoute('/stables/_layout')({
  pendingComponent: RoutePending,
  component: StableLayout,
})

function StableLayout() {
  const t = useT()

  return (
    <AuthStateSwitch
      signedOut={
        <SignedOutRoutePrompt
          title={t('stables.signIn')}
          description={t('stables.signInHelp')}
        />
      }
      signedIn={<Outlet />}
    />
  )
}
