import { Show } from '@clerk/tanstack-react-start'
import type { ReactNode } from 'react'

import { useAppUserState } from '#/components/layout/AppUserStateProvider'
import { ButtonLink, buttonVariants } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { isDevAuthBypassEnabled } from '#/lib/devAuthBypass'
import { Link, useLocation } from '@tanstack/react-router'
import ClerkHeader from '../integrations/clerk/header-user.tsx'
import {
  AppBrandLink,
  AppHeader,
  AppHeaderActions,
  AppHeaderNav,
  AppHeaderUtilityCluster,
} from './layout/AppShell'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <AppHeader>
      <AppHeaderNav aria-label="Primary navigation">
        <AppBrandLink>Paddock Pilot</AppBrandLink>

        <HeaderNavigation />

        <AppHeaderActions>
          <AppHeaderUtilityCluster>
            <ClerkHeader />

            <ThemeToggle />
          </AppHeaderUtilityCluster>
        </AppHeaderActions>
      </AppHeaderNav>
    </AppHeader>
  )
}

function HeaderNavigation() {
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
    <div className="order-3 flex w-full items-center gap-1 sm:order-none sm:w-auto">
      {isDevAuthBypassEnabled() ? (
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
    </div>
  )
}

function ActiveStableNavigation({ stableId }: { stableId: string }) {
  const { pathname } = useLocation()
  const stableBasePath = `/stables/${stableId}`
  const calendarPath = `${stableBasePath}/events/calendar`

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
            'bg-primary/10 text-foreground',
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
            'bg-primary/10 text-foreground',
        )}
      >
        Care
      </Link>
      <Link
        to="/stables/$stableId/events"
        params={{ stableId }}
        data-slot="button"
        aria-current={
          pathname.startsWith(`${stableBasePath}/events`) &&
          pathname !== calendarPath
            ? 'page'
            : undefined
        }
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          pathname.startsWith(`${stableBasePath}/events`) &&
            pathname !== calendarPath &&
            'bg-primary/10 text-foreground',
        )}
      >
        Events
      </Link>
      <Link
        to="/stables/$stableId/events/calendar"
        params={{ stableId }}
        data-slot="button"
        aria-current={pathname === calendarPath ? 'page' : undefined}
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          pathname === calendarPath && 'bg-primary/10 text-foreground',
        )}
      >
        Calendar
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
            'bg-primary/10 text-foreground',
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
            'bg-primary/10 text-foreground',
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
              className: 'bg-primary/10 text-foreground',
            }
          : undefined
      }
      aria-current={active ? 'page' : undefined}
      className={cn(active && 'bg-primary/10 text-foreground')}
      variant="ghost"
      size="sm"
    >
      {children}
    </ButtonLink>
  )
}
