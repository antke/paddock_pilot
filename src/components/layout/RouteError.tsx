import type { ErrorComponentProps } from '@tanstack/react-router'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { ButtonLink } from '#/components/ui/button'
import { RouteQueryErrorAlert } from './RouteStatusAlert'

export function RouteError({ reset }: ErrorComponentProps) {
  return (
    <DashboardPage width="compact">
      <RouteQueryErrorAlert
        reset={reset}
        title={<h1>This page couldn’t load</h1>}
        description="Try again. If the problem continues, you can return home."
        recoveryActions={
          <ButtonLink to="/" variant="outline">
            Go home
          </ButtonLink>
        }
      />
    </DashboardPage>
  )
}
