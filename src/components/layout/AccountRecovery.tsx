import { useT } from '#/i18n/LocaleProvider'
import { useClerk } from '@clerk/tanstack-react-start'
import { useState } from 'react'

import { Button } from '#/components/ui/button'
import { RouteStatusAlert } from './RouteStatusAlert'

export function AccountRecovery({
  isRetrying,
  retryFailed,
  onRetry,
}: {
  isRetrying: boolean
  retryFailed: boolean
  onRetry: () => void
}) {
  const t = useT()
  const { signOut } = useClerk()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signOutFailed, setSignOutFailed] = useState(false)

  const handleSignOut = async () => {
    if (isSigningOut) return
    setIsSigningOut(true)
    setSignOutFailed(false)
    try {
      await signOut({ redirectUrl: '/sign-in' })
    } catch {
      setSignOutFailed(true)
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <RouteStatusAlert
      title={<h1>{t('recovery.title')}</h1>}
      tone="danger"
      width="narrow"
      description={
        <div className="grid gap-3">
          <p>{t('recovery.description')}</p>
          <p role="status" aria-live="polite">
            {isRetrying
              ? t('recovery.refreshing')
              : retryFailed
                ? t('recovery.failed')
                : null}
          </p>
          {signOutFailed ? (
            <p role="alert">{t('recovery.signOutFailed')}</p>
          ) : null}
        </div>
      }
      actions={
        <>
          <Button
            onClick={onRetry}
            disabled={isRetrying || isSigningOut}
            aria-busy={isRetrying}
          >
            {isRetrying ? t('recovery.retrying') : t('common.retry')}
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            {t('recovery.reload')}
          </Button>
          <Button
            variant="outline"
            onClick={() => void handleSignOut()}
            disabled={isSigningOut}
            aria-busy={isSigningOut}
          >
            {isSigningOut ? t('recovery.signingOut') : t('recovery.signOut')}
          </Button>
        </>
      }
    />
  )
}
