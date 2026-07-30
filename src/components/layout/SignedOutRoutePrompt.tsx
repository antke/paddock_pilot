import type { ReactNode } from 'react'

import { ButtonLink } from '#/components/ui/button'
import { RouteStatusAlert } from './RouteStatusAlert'

type SignedOutRoutePromptProps = {
  title: string
  description: string
  actionLabel?: string
  actions?: ReactNode
}

export function SignedOutRoutePrompt({
  title,
  description,
  actionLabel = 'Sign in',
  actions,
}: SignedOutRoutePromptProps) {
  return (
    <RouteStatusAlert
      title={title}
      description={description}
      actions={
        actions ?? (
          <ButtonLink to="/sign-in/$" params={{ _splat: '' }}>
            {actionLabel}
          </ButtonLink>
        )
      }
    />
  )
}
