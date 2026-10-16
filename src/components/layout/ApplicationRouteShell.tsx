import type { ReactNode } from 'react'

import { AppMotionProvider } from '#/components/motion/appMotion'

import Footer from '../Footer'
import Header from '../Header'
import { AppShell, AppSkipLink } from './AppShell'
import { AuthStateSwitch } from './AuthStateSwitch'
import { PageLayout } from './PageLayout'

type ApplicationRouteShellProps = {
  pathname: string
  children: ReactNode
}

export function ApplicationRouteShell({
  pathname,
  children,
}: ApplicationRouteShellProps) {
  const motionEnabled =
    !/^\/(?:pricing|style-lab|page-lab|dashboard-lab|landing-lab)(?:\/|$)/.test(
      pathname,
    )
  const appShell = (
    <AppMotionProvider enabled={motionEnabled}>
      <AppShell data-app-motion-scope={motionEnabled || undefined}>
        <AppSkipLink />
        <Header />
        <PageLayout>{children}</PageLayout>
        <AuthStateSwitch
          signedIn={null}
          signedOut={<Footer />}
          loading={null}
        />
      </AppShell>
    </AppMotionProvider>
  )

  return (
    <AuthStateSwitch
      signedIn={appShell}
      signedOut={pathname === '/' ? children : appShell}
      loading={appShell}
    />
  )
}
