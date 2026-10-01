import { useT } from '#/i18n/LocaleProvider'
import type { ReactNode } from 'react'

import type { DashboardChrome } from '#/components/dashboard/dashboardChrome'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { ButtonLink } from '#/components/ui/button'

type NoStablesPromptProps = {
  children?: ReactNode
  chrome?: DashboardChrome
}

export function NoStablesPrompt({
  children,
  chrome = 'cards',
}: NoStablesPromptProps) {
  const t = useT()

  return (
    <DashboardEmptyState
      chrome={chrome}
      title={t('stables.empty')}
      actions={<ButtonLink to="/onboarding">{t('stables.start')}</ButtonLink>}
    >
      {children ?? t('stables.emptyHelp')}
    </DashboardEmptyState>
  )
}
