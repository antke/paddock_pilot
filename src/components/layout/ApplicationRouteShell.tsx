import type { ReactNode } from 'react'

import Footer from '../Footer'
import Header from '../Header'
import { AppShell } from './AppShell'
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
  const appShell = (
    <AppShell>
      <Header />
      <PageLayout>{children}</PageLayout>
      <Footer />
    </AppShell>
  )

  if (pathname !== '/') return appShell

  return (
    <AuthStateSwitch
      signedIn={appShell}
      signedOut={children}
      loading={appShell}
    />
  )
}
