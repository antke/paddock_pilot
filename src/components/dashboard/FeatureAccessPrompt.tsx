import { forwardRef } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { createLink } from '@tanstack/react-router'

import { DashboardActions } from './DashboardActions'
import { DashboardFeatureBadge } from './DashboardBadges'
import { DashboardSectionCard } from './DashboardSectionCard'
import { ButtonAnchor, ButtonLink } from '#/components/ui/button'

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
  primaryActionLabel = 'View plans',
  secondaryAction,
}: FeatureAccessPromptProps) {
  return (
    <DashboardSectionCard
      title={title}
      description={description}
      badges={badge}
      descriptionSize="sm"
    >
      <DashboardActions align="start">
        <ButtonLink to="/pricing">{primaryActionLabel}</ButtonLink>
        {secondaryAction}
      </DashboardActions>
    </DashboardSectionCard>
  )
}

const FeatureAccessBackLinkAnchor = forwardRef<
  HTMLAnchorElement,
  Omit<ComponentProps<typeof ButtonAnchor>, 'variant'>
>(function FeatureAccessBackLinkAnchor(props, ref) {
  return <ButtonAnchor ref={ref} variant="outline" {...props} />
})

export const FeatureAccessBackLink = createLink(
  FeatureAccessBackLinkAnchor,
)
