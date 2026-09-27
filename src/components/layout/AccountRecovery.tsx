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
      title={<h1>Could not prepare your account</h1>}
      tone="danger"
      width="narrow"
      description={
        <div className="grid gap-3">
          <p>
            We couldn’t refresh your account details. Try again to continue. If
            this keeps happening, reload the page or sign out and sign in again.
          </p>
          <p role="status" aria-live="polite">
            {isRetrying
              ? 'Refreshing your account…'
              : retryFailed
                ? 'Your account still couldn’t be refreshed. You can try reloading or signing in again.'
                : null}
          </p>
          {signOutFailed ? (
            <p role="alert">
              We couldn’t sign you out. Check your connection and try again, or
              reload the page.
            </p>
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
            {isRetrying ? 'Trying again…' : 'Try again'}
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload page
          </Button>
          <Button
            variant="outline"
            onClick={() => void handleSignOut()}
            disabled={isSigningOut}
            aria-busy={isSigningOut}
          >
            {isSigningOut ? 'Signing out…' : 'Sign out'}
          </Button>
        </>
      }
    />
  )
}
