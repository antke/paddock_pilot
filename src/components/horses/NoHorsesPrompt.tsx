import { useT } from '#/i18n/LocaleProvider'
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
  children,
  chrome = 'cards',
  stableId,
}: NoHorsesPromptProps) {
  const t = useT()

  return (
    <DashboardEmptyState
      actions={
        stableId ? (
          <ButtonLink
            to="/stables/$stableId/horses/create"
            params={{ stableId }}
            action="create"
          >
            {t('horseList.addHorse')}
          </ButtonLink>
        ) : undefined
      }
      chrome={chrome}
      title={t('horseList.noneTitle')}
    >
      {children ?? t('horseList.addHelp')}
    </DashboardEmptyState>
  )
}
