import { useT } from '#/i18n/LocaleProvider'
import type { ReactNode } from 'react'

import { DashboardActions } from './DashboardActions'
import { DashboardFeatureBadge } from './DashboardBadges'
import { DashboardSectionCard } from './DashboardSectionCard'
import { ButtonLink } from '#/components/ui/button'

type FeatureAccessPromptProps = {
  title: ReactNode
  description: ReactNode
  badge?: ReactNode
  primaryActionLabel?: ReactNode
  secondaryAction?: ReactNode
}

export function FeatureAccessPrompt({
  title,
  description,
  badge = <DashboardFeatureBadge />,
  primaryActionLabel,
  secondaryAction,
}: FeatureAccessPromptProps) {
  const t = useT()

  return (
    <DashboardSectionCard
      title={title}
      description={description}
      badges={badge}
      descriptionSize="sm"
    >
      <DashboardActions align="start">
        <ButtonLink to="/pricing">
          {primaryActionLabel ?? t('uiRemainder.viewPlans')}
        </ButtonLink>
        {secondaryAction}
      </DashboardActions>
    </DashboardSectionCard>
  )
}

export { BackLink as FeatureAccessBackLink } from '#/components/ui/back-action'
