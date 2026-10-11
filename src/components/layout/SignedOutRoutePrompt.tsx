import { useT } from '#/i18n/LocaleProvider'
import type { ReactNode } from 'react'
import { SignInButton } from '@clerk/tanstack-react-start'
import { useLocation } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'
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
  actionLabel,
  actions,
}: SignedOutRoutePromptProps) {
  const t = useT()
  const { href } = useLocation()
  return (
    <RouteStatusAlert
      title={title}
      description={description}
      actions={
        actions ?? (
          <SignInButton forceRedirectUrl={href}>
            <Button type="button">
              {actionLabel ?? t('navigation.signIn')}
            </Button>
          </SignInButton>
        )
      }
    />
  )
}
