import { useOwnershipCopy } from '#/components/ownership/ownershipCopy'
import { useT } from '#/i18n/LocaleProvider'
import { LanguageSelector } from '#/i18n/LanguageSelector'
import { Show } from '@clerk/tanstack-react-start'
import type { ReactNode } from 'react'
import { Popover } from '@base-ui/react/popover'
import { GearIcon } from '@phosphor-icons/react'

import { useAppUserState } from '#/components/layout/AppUserStateProvider'
import { Button, ButtonLink, buttonVariants } from '#/components/ui/button'
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
import { useSmallScreen } from '#/lib/useSmallScreen'
import { AuthStateSwitch } from './layout/AuthStateSwitch'
import { WorkspaceNavigation } from './layout/WorkspaceNavigationShell'

const activeNavigationClassName =
  'border-selection bg-selection-surface text-selection hover:bg-selection-surface hover:text-selection'

export default function Header() {
  const devAuthBypassEnabled = useDevAuthBypassEnabled()

  const header = (
    <HeaderView
      navigation={
        <HeaderNavigation devAuthBypassEnabled={devAuthBypassEnabled} />
      }
      accountActions={
        <HeaderAccountActions devAuthBypassEnabled={devAuthBypassEnabled} />
      }
    />
  )
  return (
    <AuthStateSwitch
      signedOut={header}
      loading={header}
      signedIn={<WorkspaceNavigation />}
    />
  )
}

export function HeaderView({
  navigation,
  accountActions,
  position,
  navigationLabel,
  mobileContext,
}: {
  navigation: ReactNode
  accountActions: ReactNode
  position?: 'sticky' | 'static'
  navigationLabel?: string
  mobileContext?: ReactNode
}) {
  const t = useT()
  const small = useSmallScreen()
  return (
    <AppHeader position={position}>
      <AppHeaderNav
        className={!mobileContext ? 'sm:gap-4 sm:py-3' : undefined}
        aria-label={
          navigationLabel ??
          t(
            mobileContext && small
              ? 'dashboard.workspace'
              : 'navigation.primary',
          )
        }
      >
        {mobileContext ? (
          <>
            <div className="min-w-0 flex-1 md:hidden">{mobileContext}</div>
            <div className="hidden md:block">
              <AppBrandLink>Paddock Pilot</AppBrandLink>
            </div>
          </>
        ) : (
          <AppBrandLink>Paddock Pilot</AppBrandLink>
        )}

        {mobileContext && (
          <AppHeaderLinks className="hidden md:flex">
            {navigation}
          </AppHeaderLinks>
        )}

        <AppHeaderActions className="gap-2 sm:gap-3 max-sm:w-full max-sm:justify-between">
          <div className="flex min-w-0 items-center gap-1 [&>a]:min-h-10 [&>a]:text-sm max-md:[&>a]:min-h-11">
            {!mobileContext && navigation}
            {accountActions}
          </div>
          <AppHeaderUtilityCluster className="hidden flex-nowrap border-l border-border-subtle py-0 pr-0 pl-3 sm:flex [&_button]:size-10 max-md:[&_button]:size-11">
            <LanguageSelector compact />
            <ThemeToggle />
          </AppHeaderUtilityCluster>
          <Popover.Root>
            <Popover.Trigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden"
                  aria-label={t('navigation.accountPreferences')}
                />
              }
            >
              <GearIcon aria-hidden="true" />
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner
                align="end"
                sideOffset={8}
                className="z-50 sm:hidden"
              >
                <Popover.Popup
                  aria-label={t('navigation.accountPreferences')}
                  className="grid max-h-(--available-height) max-w-[calc(100vw-2rem)] gap-4 overflow-y-auto rounded-row border border-border bg-popover p-4 text-popover-foreground outline-none"
                >
                  <div className="flex items-center justify-between gap-4">
                    <LanguageSelector compact />
                    <ThemeToggle />
                  </div>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
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
  const t = useT()
  if (devAuthBypassEnabled) return <ClerkHeader />

  return (
    <>
      <Show when="signed-out">
        <ButtonLink to="/sign-in/$" variant="ghost" size="control">
          {t('navigation.signIn')}
        </ButtonLink>
        <ButtonLink to="/sign-up/$" size="control">
          <span className="sm:hidden">{t('navigation.create')}</span>
          <span className="hidden sm:inline">
            {t('navigation.createAccount')}
          </span>
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
  const t = useT()
  const { activeStable } = useAppUserState()
  const c = useOwnershipCopy()
  const { pathname } = useLocation()
  const stableNavigation =
    activeStable && pathname.startsWith('/stables/') ? (
      <ActiveStableNavigation stableId={activeStable._id} />
    ) : (
      <>
        <HeaderNavigationLink to="/" exact>
          {t('navigation.home')}
        </HeaderNavigationLink>
        <HeaderNavigationLink to="/events">
          {t('dashboard.events')}
        </HeaderNavigationLink>
        <HeaderNavigationLink to="/training">
          {t('navigation.training')}
        </HeaderNavigationLink>
        <HeaderNavigationLink to="/stables">
          {t('navigation.stables')}
        </HeaderNavigationLink>
      </>
    )

  const signedInNavigation = (
    <>
      {activeStable && pathname.startsWith('/stables/') && (
        <HeaderNavigationLink to="/horses">{c.title}</HeaderNavigationLink>
      )}
      {stableNavigation}
    </>
  )
  return (
    <>
      {devAuthBypassEnabled ? (
        <>
          <HeaderNavigationLink to="/" exact>
            {t('navigation.home')}
          </HeaderNavigationLink>
          <HeaderNavigationLink to="/stables">
            {t('navigation.stables')}
          </HeaderNavigationLink>
          <HeaderNavigationLink to="/pricing">
            {t('navigation.plans')}
          </HeaderNavigationLink>
        </>
      ) : (
        <>
          <Show when="signed-out">
            <HeaderNavigationLink to="/pricing">
              {t('navigation.plans')}
            </HeaderNavigationLink>
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
  const t = useT()
  const location = useLocation()
  const pathname = samplePath ?? location.pathname
  const stableBasePath = `/stables/${stableId}`

  return (
    <>
      <Link
        to="/stables/$stableId"
        params={{ stableId }}
        activeOptions={{ exact: true }}
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          pathname.replace(/\/$/, '') === stableBasePath &&
            activeNavigationClassName,
        )}
        aria-current={
          pathname.replace(/\/$/, '') === stableBasePath ? 'page' : undefined
        }
      >
        {t('navigation.home')}
      </Link>
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
        {t('navigation.horses')}
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
        {t('navigation.training')}
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
        {t('dashboard.events')}
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
        {t('navigation.care')}
      </Link>
      <Link
        to="/stables/$stableId/stable"
        params={{ stableId }}
        data-slot="button"
        aria-current={
          [
            'stable',
            'settings',
            'members',
            'documents',
            'analysis',
            'welcome',
            'edit',
          ].some((section) =>
            pathname.startsWith(`${stableBasePath}/${section}`),
          )
            ? 'page'
            : undefined
        }
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          [
            'stable',
            'settings',
            'members',
            'documents',
            'analysis',
            'welcome',
            'edit',
          ].some((section) =>
            pathname.startsWith(`${stableBasePath}/${section}`),
          ) && activeNavigationClassName,
        )}
      >
        {t('navigation.stable')}
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
  to: '/' | '/stables' | '/pricing' | '/horses' | '/events' | '/training'
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
