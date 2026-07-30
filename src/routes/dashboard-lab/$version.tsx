import { DashboardLabPage } from '#/components/dashboard-lab/DashboardLabPage'
import { LabRouteBoundary } from '#/components/lab/LabChrome'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard-lab/$version')({
  component: DashboardLabRoute,
})

function DashboardLabRoute() {
  return (
    <LabRouteBoundary
      signedOutTitle="Sign in to try the dashboard lab"
      signedOutDescription="The dashboard lab uses your active stable data."
    >
      <DashboardLabPage />
    </LabRouteBoundary>
  )
}
