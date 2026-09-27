import { Show } from '@clerk/tanstack-react-start'
import type { ReactNode } from 'react'

import { useAppUserState } from '#/components/layout/AppUserStateProvider'
import { ButtonLink, buttonVariants } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'
import { Link, useLocation } from '@tanstack/react-router'
import ClerkHeader from '../integrations/clerk/header-user.tsx'
import {
  AppBrandLink,
  AppHeader,
  AppHeaderActions,
  AppHeaderNav,
  AppHeaderUtilityCluster,
  AppHeaderLinks,
} from './layout/AppShell'
import ThemeToggle from './ThemeToggle'

const activeNavigationClassName =
  'border-selection bg-selection-surface text-selection hover:bg-selection-surface hover:text-selection'

export default function Header() {
  const devAuthBypassEnabled = useDevAuthBypassEnabled()

  return (
    <HeaderView
      navigation={
        <HeaderNavigation devAuthBypassEnabled={devAuthBypassEnabled} />
      }
      accountActions={
        <HeaderAccountActions devAuthBypassEnabled={devAuthBypassEnabled} />
      }
    />
  )
}

export function HeaderView({
  navigation,
  accountActions,
  position,
  navigationLabel = 'Primary navigation',
}: {
  navigation: ReactNode
  accountActions: ReactNode
  position?: 'sticky' | 'static'
  navigationLabel?: string
}) {
  return (
    <AppHeader position={position}>
      <AppHeaderNav aria-label={navigationLabel}>
        <AppBrandLink>Paddock Pilot</AppBrandLink>

        <AppHeaderLinks>{navigation}</AppHeaderLinks>

        <AppHeaderActions>
          <AppHeaderUtilityCluster>
            {accountActions}
            <ThemeToggle />
          </AppHeaderUtilityCluster>
        </AppHeaderActions>
      </AppHeaderNav>
    </AppHeader>
  )
}

function HeaderAccountActions({
  devAuthBypassEnabled,
}: {
  devAuthBypassEnabled: boolean
}) {
  if (devAuthBypassEnabled) return <ClerkHeader />

  return (
    <>
      <Show when="signed-out">
        <ButtonLink to="/sign-in/$" variant="ghost" size="sm">
          Sign in
        </ButtonLink>
        <ButtonLink to="/sign-up/$" size="sm">
          <span className="sm:hidden">Create</span>
          <span className="hidden sm:inline">Create account</span>
        </ButtonLink>
      </Show>
      <Show when="signed-in">
        <ClerkHeader />
      </Show>
    </>
  )
}

function HeaderNavigation({
  devAuthBypassEnabled,
}: {
  devAuthBypassEnabled: boolean
}) {
  const { activeStable } = useAppUserState()

  const signedInNavigation = activeStable ? (
    <ActiveStableNavigation stableId={activeStable._id} />
  ) : (
    <>
      <HeaderNavigationLink to="/" exact>
        Home
      </HeaderNavigationLink>
      <HeaderNavigationLink to="/stables">Stables</HeaderNavigationLink>
    </>
  )

  return (
    <>
      {devAuthBypassEnabled ? (
        <>
          <HeaderNavigationLink to="/" exact>
            Home
          </HeaderNavigationLink>
          <HeaderNavigationLink to="/stables">Stables</HeaderNavigationLink>
          <HeaderNavigationLink to="/pricing">Plans</HeaderNavigationLink>
        </>
      ) : (
        <>
          <Show when="signed-out">
            <HeaderNavigationLink to="/pricing">Plans</HeaderNavigationLink>
          </Show>
          <Show when="signed-in">{signedInNavigation}</Show>
        </>
      )}
    </>
  )
}

export function ActiveStableNavigation({
  stableId,
  pathname: samplePath,
}: {
  stableId: string
  pathname?: string
}) {
  const location = useLocation()
  const pathname = samplePath ?? location.pathname
  const stableBasePath = `/stables/${stableId}`

  return (
    <>
      <HeaderNavigationLink to="/" active={pathname === '/'}>
        Home
      </HeaderNavigationLink>
      <Link
        to="/stables/$stableId/horses"
        params={{ stableId }}
        data-slot="button"
        aria-current={
          pathname.startsWith(`${stableBasePath}/horses`) ? 'page' : undefined
        }
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          pathname.startsWith(`${stableBasePath}/horses`) &&
            activeNavigationClassName,
        )}
      >
        Horses
      </Link>
      <Link
        to="/stables/$stableId/reminders"
        params={{ stableId }}
        data-slot="button"
        aria-current={
          pathname.startsWith(`${stableBasePath}/reminders`)
            ? 'page'
            : undefined
        }
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          pathname.startsWith(`${stableBasePath}/reminders`) &&
            activeNavigationClassName,
        )}
      >
        Care
      </Link>
      <Link
        to="/stables/$stableId/events"
        params={{ stableId }}
        data-slot="button"
        aria-current={
          pathname.startsWith(`${stableBasePath}/events`) ? 'page' : undefined
        }
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          pathname.startsWith(`${stableBasePath}/events`) &&
            activeNavigationClassName,
        )}
      >
        Events
      </Link>
      <Link
        to="/stables/$stableId/training"
        params={{ stableId }}
        data-slot="button"
        aria-current={
          pathname.startsWith(`${stableBasePath}/training`) ? 'page' : undefined
        }
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          pathname.startsWith(`${stableBasePath}/training`) &&
            activeNavigationClassName,
        )}
      >
        Training log
      </Link>
      <Link
        to="/stables/$stableId/documents"
        params={{ stableId }}
        data-slot="button"
        aria-current={
          pathname === `${stableBasePath}/documents` ? 'page' : undefined
        }
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          pathname === `${stableBasePath}/documents` &&
            activeNavigationClassName,
        )}
      >
        Documents
      </Link>
      <Link
        to="/stables/$stableId/analysis"
        params={{ stableId }}
        data-slot="button"
        aria-current={
          pathname === `${stableBasePath}/analysis` ? 'page' : undefined
        }
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          pathname === `${stableBasePath}/analysis` &&
            activeNavigationClassName,
        )}
      >
        Analysis
      </Link>
    </>
  )
}

function HeaderNavigationLink({
  children,
  exact = false,
  active,
  to,
}: {
  children: ReactNode
  exact?: boolean
  active?: boolean
  to: '/' | '/stables' | '/pricing'
}) {
  return (
    <ButtonLink
      to={to}
      activeOptions={{ exact }}
      activeProps={
        active === undefined
          ? {
              'aria-current': 'page',
              className: activeNavigationClassName,
            }
          : undefined
      }
      aria-current={active ? 'page' : undefined}
      className={cn(active && activeNavigationClassName)}
      variant="ghost"
      size="sm"
    >
      {children}
    </ButtonLink>
  )
}
