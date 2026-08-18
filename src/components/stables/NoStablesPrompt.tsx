import type { ReactNode } from 'react'

import type { DashboardChrome } from '#/components/dashboard/dashboardChrome'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { ButtonLink } from '#/components/ui/button'

type NoStablesPromptProps = {
  children?: ReactNode
  chrome?: DashboardChrome
}

export function NoStablesPrompt({
  children = 'Create a stable to start adding horses, events, reminders, and records.',
  chrome = 'cards',
}: NoStablesPromptProps) {
  return (
    <DashboardEmptyState
      chrome={chrome}
      title="No stables yet"
      actions={<ButtonLink to="/onboarding">Get started</ButtonLink>}
    >
      {children}
    </DashboardEmptyState>
  )
}
