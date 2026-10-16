import { useClerk, useUser } from '@clerk/tanstack-react-start'
import { Link } from '@tanstack/react-router'
import { useEffect, useId, useRef, useState } from 'react'
import {
  CreditCardIcon,
  GearIcon,
  SignOutIcon,
  UserCircleIcon,
  UserGearIcon,
} from '@phosphor-icons/react'
import { StableIcon } from '#/components/icons/domain-icons'
import { Button } from '#/components/ui/button'
import { Spinner } from '#/components/ui/spinner'
import { FormSubmissionError } from '#/components/forms/FormSubmissionError'
import { useT } from '#/i18n/LocaleProvider'

export function DrawerAccount({
  closeDrawer,
  onPreferences,
  showManageStables,
}: {
  closeDrawer: (afterClose?: () => void) => void
  onPreferences: () => void
  showManageStables: boolean
}) {
  const clerk = useClerk()
  const { user } = useUser()
  if (!user) return null
  return (
    <DrawerAccountView
      name={user.fullName ?? user.username ?? ''}
      email={user.primaryEmailAddress?.emailAddress}
      showManageStables={showManageStables}
      onNavigate={() => closeDrawer()}
      onManageAccount={() => closeDrawer(() => clerk.openUserProfile())}
      onPreferences={() => closeDrawer(onPreferences)}
      onSignOut={() => clerk.signOut({ redirectUrl: '/' })}
    />
  )
}

/** Direct drawer actions; Clerk still owns identity, account management and sign-out. */
export function DrawerAccountView({
  name,
  email,
  showManageStables = true,
  onNavigate,
  onManageAccount,
  onPreferences,
  onSignOut,
}: {
  name: string
  email?: string
  showManageStables?: boolean
  onNavigate: () => void
  onManageAccount: () => void
  onPreferences: () => void
  onSignOut: () => Promise<unknown>
}) {
  const t = useT()
  const headingId = useId()
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const locked = useRef(false)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  async function signOut() {
    if (locked.current) return
    locked.current = true
    setPending(true)
    setFailed(false)
    try {
      await onSignOut()
    } catch {
      if (mounted.current) setFailed(true)
    } finally {
      locked.current = false
      if (mounted.current) setPending(false)
    }
  }
  const linkClass = 'app-workspace-link app-control-focus app-navigation-item'
  const buttonClass =
    'app-workspace-link w-full justify-start text-left font-medium'
  return (
    <section aria-labelledby={headingId} className="grid min-w-0 gap-3">
      <div className="grid min-w-0 gap-1 px-3">
        <h2
          id={headingId}
          className="text-sm font-medium text-muted-foreground"
        >
          {t('navigationShell.accountAndPreferences')}
        </h2>
        {name && (
          <p className="text-base font-semibold [overflow-wrap:anywhere]">
            {name}
          </p>
        )}
        {email && (
          <p className="text-sm text-muted-foreground [overflow-wrap:anywhere]">
            {email}
          </p>
        )}
      </div>
      <ul className="grid gap-1">
        <li>
          <Link to="/profile" className={linkClass} onClick={onNavigate}>
            <UserCircleIcon className="size-5 shrink-0" aria-hidden="true" />
            {t('navigation.profile')}
          </Link>
        </li>
        {showManageStables && (
          <li>
            <Link to="/stables" className={linkClass} onClick={onNavigate}>
              <StableIcon className="size-5 shrink-0" aria-hidden="true" />
              {t('navigation.manageStables')}
            </Link>
          </li>
        )}
        <li>
          <Link to="/pricing" className={linkClass} onClick={onNavigate}>
            <CreditCardIcon className="size-5 shrink-0" aria-hidden="true" />
            {t('navigation.billing')}
          </Link>
        </li>
        <li>
          <Button
            variant="ghost"
            className={buttonClass}
            onClick={onPreferences}
          >
            <GearIcon className="size-5 shrink-0" aria-hidden="true" />
            {t('navigation.accountPreferences')}
          </Button>
        </li>
        <li>
          <Button
            variant="ghost"
            className={buttonClass}
            onClick={onManageAccount}
          >
            <UserGearIcon className="size-5 shrink-0" aria-hidden="true" />
            {t('navigationShell.manageAccount')}
          </Button>
        </li>
        <li>
          <Button
            variant="ghost"
            className={buttonClass}
            disabled={pending}
            aria-busy={pending}
            onClick={() => void signOut()}
          >
            {pending ? (
              <Spinner className="size-5 shrink-0" aria-hidden="true" />
            ) : (
              <SignOutIcon className="size-5 shrink-0" aria-hidden="true" />
            )}
            {t(pending ? 'recovery.signingOut' : 'navigationShell.signOut')}
          </Button>
        </li>
      </ul>
      <FormSubmissionError
        message={failed ? t('recovery.signOutFailed') : undefined}
      />
    </section>
  )
}
