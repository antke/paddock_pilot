import type { ReactNode } from 'react'

import type { DashboardChrome } from '#/components/dashboard/dashboardChrome'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { ButtonLink } from '#/components/ui/button'

type NoHorsesPromptProps = {
  children?: ReactNode
  chrome?: DashboardChrome
  stableId?: string
}

export function NoHorsesPrompt({
  children = 'Add a horse to start building this stable roster.',
  chrome = 'cards',
  stableId,
}: NoHorsesPromptProps) {
  return (
    <DashboardEmptyState
      actions={
        stableId ? (
          <ButtonLink
            to="/stables/$stableId/horses/create"
            params={{ stableId }}
          >
            Add horse
          </ButtonLink>
        ) : undefined
      }
      chrome={chrome}
      title="No horses added yet."
    >
      {children}
    </DashboardEmptyState>
  )
}
