import { BackButton } from '#/components/ui/back-action'
import {
  HomeIcon,
  EventIcon,
  TrainingIcon,
} from '#/components/icons/domain-icons'
import { useEffect, useRef, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import {
  Link,
  useLocation,
  useCanGoBack,
  useRouter,
} from '@tanstack/react-router'
import { ListIcon } from '@phosphor-icons/react'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { useT } from '#/i18n/LocaleProvider'
import { useOwnershipCopy } from '#/components/ownership/ownershipCopy'
import { useAppUserState } from './AppUserStateProvider'
import { Button, ButtonLink } from '#/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogDescription,
} from '#/components/ui/dialog'
import { useMobileViewport } from './useMobileViewport'
import { useSmallScreen } from '#/lib/useSmallScreen'
import { cn } from '#/lib/utils'

export function isMobileTaskPath(pathname: string) {
  return (
    /\/(create|edit)\/?$/.test(pathname) || pathname.startsWith('/onboarding')
  )
}

/** A stable is active in the shell only when the URL actually names that stable. */
export function mobileStableId(pathname: string) {
  const match = /^\/stables\/([^/]+)(?:\/|$)/.exec(pathname)
  return match && !['create', 'deleted'].includes(match[1])
    ? match[1]
    : undefined
}

export function MobileBackButton() {
  const { pathname } = useLocation()
  const router = useRouter()
  const canGoBack = useCanGoBack()
  const t = useT()
  const stable = mobileStableId(pathname)
  const path = stable ? pathname.slice(`/stables/${stable}`.length) : pathname
  const detail =
    /^\/(horses|events|training)\/[^/]+/.test(path) &&
    !/^\/(horses|events|training)\/(create|contacts|history|unclaimed)(\/|$)/.test(
      path,
    )
  if (!detail || isMobileTaskPath(pathname)) return null
  return (
    <BackButton
      type="button"
      className="min-h-11 min-w-11"
      aria-label={t('dashboard.back')}
      onClick={() =>
        canGoBack
          ? router.history.back()
          : void router.navigate({
              href: stable
                ? `/stables/${stable}`
                : path.startsWith('/horses')
                  ? '/'
                  : '/events',
            })
      }
    >
      {t('dashboard.back')}
    </BackButton>
  )
}

export function MobileNavigation() {
  const { pathname } = useLocation()
  const { activeStable } = useAppUserState()
  const stableId =
    activeStable && activeStable._id === mobileStableId(pathname)
      ? activeStable._id
      : undefined
  return <MobileNavigationView pathname={pathname} stableId={stableId} />
}

export function MobileNavigationView({
  pathname,
  stableId,
  renderMore,
}: {
  pathname: string
  stableId?: string
  renderMore?: (button: ReactElement) => ReactNode
}) {
  const t = useT()
  const c = useOwnershipCopy()
  const [open, setOpen] = useState(false)
  const small = useSmallScreen()
  const navigation = useRef<HTMLElement>(null)
  useMobileViewport()
  useEffect(() => {
    setOpen(false)
  }, [pathname, small])
  useEffect(() => {
    const element = navigation.current
    if (!element || !small) return
    const root = element.closest<HTMLElement>('[data-slot=app-shell]')
    const measure = () =>
      root?.style.setProperty(
        '--mobile-navigation-height',
        `${element.getBoundingClientRect().height}px`,
      )
    measure()
    const observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(measure)
    observer?.observe(element)
    return () => {
      observer?.disconnect()
      root?.style.removeProperty('--mobile-navigation-height')
    }
  }, [small, pathname])
  const task = isMobileTaskPath(pathname)
  const itemClass = (active: boolean) =>
    cn(
      'app-navigation-item app-control-focus grid min-h-14 min-w-0 grid-rows-[1.5rem_auto] content-start items-center justify-items-center gap-1 rounded-control border-0 px-0 py-1.5 text-center text-[0.75rem] leading-4 font-medium text-muted-foreground [&_svg]:size-5.5 [&_svg]:shrink-0',
      active && 'bg-selection-surface font-bold text-foreground',
    )
  const personalHomeSelected =
    pathname === '/' ||
    (pathname.startsWith('/horses') &&
      !['/horses/contacts', '/horses/deleted'].some((path) =>
        pathname.startsWith(path),
      ))
  const eventsSelected =
    pathname.startsWith('/events') ||
    Boolean(stableId && pathname.startsWith(`/stables/${stableId}/events`))
  const trainingSelected =
    pathname.startsWith('/training') ||
    Boolean(stableId && pathname.startsWith(`/stables/${stableId}/training`))
  const moreSelected =
    [
      '/profile',
      '/pricing',
      '/stables',
      '/horses/contacts',
      '/horses/deleted',
    ].some((destination) => pathname.startsWith(destination)) &&
    !eventsSelected &&
    !trainingSelected

  return (
    // Keep the shell marker without adding a row to the header/main/footer grid.
    <div
      className="contents"
      data-slot="mobile-app-chrome"
      data-task={task || undefined}
    >
      {!task && (
        <nav
          ref={navigation}
          data-slot="mobile-app-navigation"
          aria-label={t('navigation.primary')}
          className="md:hidden grid-cols-4"
        >
          <>
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className={itemClass(personalHomeSelected)}
              aria-current={personalHomeSelected ? 'page' : undefined}
            >
              <MobileNavigationIcon>
                <HomeIcon aria-hidden="true" />
              </MobileNavigationIcon>
              <span className="w-full wrap-anywhere">
                {t('navigationShell.mobileHome')}
              </span>
            </Link>
            <Link
              to="/events"
              className={itemClass(eventsSelected)}
              aria-current={eventsSelected ? 'page' : undefined}
            >
              <MobileNavigationIcon>
                <EventIcon aria-hidden="true" />
              </MobileNavigationIcon>
              <span className="w-full wrap-anywhere">
                {t('dashboard.events')}
              </span>
            </Link>
            <Link
              to="/training"
              className={itemClass(trainingSelected)}
              aria-current={trainingSelected ? 'page' : undefined}
            >
              <MobileNavigationIcon>
                <TrainingIcon aria-hidden="true" />
              </MobileNavigationIcon>
              <span className="w-full wrap-anywhere">
                {t('navigationShell.mobileTraining')}
              </span>
            </Link>
          </>
          {renderMore ? (
            renderMore(
              <Button
                type="button"
                variant="ghost"
                className={itemClass(moreSelected)}
                aria-label={t('navigationShell.openMenu')}
              >
                <MobileNavigationIcon>
                  <ListIcon aria-hidden="true" className="size-5.5" />
                </MobileNavigationIcon>
                <span className="w-full wrap-anywhere">
                  {t('navigationShell.menu')}
                </span>
              </Button>,
            )
          ) : (
            <MobileSheet
              open={open}
              onOpenChange={setOpen}
              title={t('navigationShell.menu')}
              description={t('dashboard.moreHelp')}
              trigger={
                <Button
                  type="button"
                  variant="ghost"
                  className={itemClass(moreSelected)}
                  aria-label={t('navigationShell.openMenu')}
                >
                  <MobileNavigationIcon>
                    <ListIcon aria-hidden="true" className="size-5.5" />
                  </MobileNavigationIcon>
                  <span className="w-full wrap-anywhere">
                    {t('navigationShell.menu')}
                  </span>
                </Button>
              }
            >
              {stableId && (
                <>
                  <ButtonLink
                    to="/stables/$stableId/reminders"
                    params={{ stableId }}
                    variant="ghost"
                    onClick={() => setOpen(false)}
                  >
                    {t('navigation.care')}
                  </ButtonLink>
                  <ButtonLink
                    to="/stables/$stableId/stable"
                    params={{ stableId }}
                    search={{ tab: 'contacts' }}
                    variant="ghost"
                    onClick={() => setOpen(false)}
                  >
                    {t('dashboard.contacts')}
                  </ButtonLink>
                  <ButtonLink
                    to="/stables/$stableId/stable"
                    params={{ stableId }}
                    search={{ tab: 'yard' }}
                    variant="ghost"
                    onClick={() => setOpen(false)}
                  >
                    {t('navigation.stable')}
                  </ButtonLink>
                  <ButtonLink
                    to="/stables/$stableId/documents"
                    params={{ stableId }}
                    variant="ghost"
                    onClick={() => setOpen(false)}
                  >
                    {t('navigation.documents')}
                  </ButtonLink>
                  <ButtonLink
                    to="/stables/$stableId/analysis"
                    params={{ stableId }}
                    variant="ghost"
                    onClick={() => setOpen(false)}
                  >
                    {t('navigation.analysis')}
                  </ButtonLink>
                </>
              )}
              {!stableId && (
                <ButtonLink
                  to="/stables"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
                  {t('navigation.stables')}
                </ButtonLink>
              )}
              <ButtonLink
                to="/horses"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                {c.title}
              </ButtonLink>
              <ButtonLink
                to="/horses/contacts"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                {c.providers}
              </ButtonLink>
              <ButtonLink
                to="/profile"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                {t('navigation.profile')}
              </ButtonLink>
            </MobileSheet>
          )}
        </nav>
      )}
    </div>
  )
}

function MobileNavigationIcon({ children }: { children: ReactNode }) {
  return (
    <span
      data-slot="mobile-navigation-icon"
      className="flex h-6 items-center justify-center"
    >
      {children}
    </span>
  )
}

function MobileSheet({
  open,
  onOpenChange,
  title,
  description,
  trigger,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  trigger: React.ReactElement
  children: React.ReactNode
}) {
  const t = useT()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger render={trigger} />
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Viewport className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto overscroll-contain">
          <DialogPrimitive.Popup className="app-dialog-motion app-mobile-sheet grid max-h-[85dvh] w-full gap-3 overflow-y-auto rounded-t-panel bg-popover px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-popover-foreground outline-none md:max-w-md">
            <div className="flex items-center justify-between gap-4">
              <DialogTitle>{title}</DialogTitle>
              <DialogClose
                render={<Button variant="ghost" className="min-h-11" />}
              >
                {t('common.close')}
              </DialogClose>
            </div>
            <DialogDescription>{description}</DialogDescription>
            <div className="grid gap-1 [&>a]:min-h-12 [&>a]:justify-start">
              {children}
            </div>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Viewport>
      </DialogPortal>
    </Dialog>
  )
}
