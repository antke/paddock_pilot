import type { ReactNode } from 'react'
import { DashboardPage } from '#/components/dashboard/DashboardPage'

/** The stable route shell shared by connected routes and local composition previews. */
export function StableRouteLayoutView({
  breadcrumbs,
  children,
}: {
  breadcrumbs: ReactNode
  children: ReactNode
}) {
  return (
    <DashboardPage>
      {breadcrumbs}
      {children}
    </DashboardPage>
  )
}
