import { useClaimedNavigationSection } from './navigationSection'
import {
  HomeIcon,
  EventIcon,
  TrainingIcon,
} from '#/components/icons/domain-icons'
import { useEffect, useRef } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { HorseIcon, ListIcon } from '@phosphor-icons/react'
import { useT } from '#/i18n/LocaleProvider'
import { Button } from '#/components/ui/button'
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

export function MobileNavigationView({
  pathname,
  stableId,
  renderMore,
}: {
  pathname: string
  stableId?: string
  /** Wraps the Menu button in the shell drawer's trigger, so phones open the same menu as the header. */
  renderMore: (button: ReactElement) => ReactNode
}) {
  const t = useT()
  const small = useSmallScreen()
  const navigation = useRef<HTMLElement>(null)
  useMobileViewport()
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
  const section = useClaimedNavigationSection()
  const task = isMobileTaskPath(pathname)
  const itemClass = (active: boolean) =>
    cn(
      'app-navigation-item app-control-focus grid min-h-14 min-w-0 grid-rows-[1.5rem_auto] content-start items-center justify-items-center gap-1 rounded-control border-0 px-0 py-1.5 text-center text-[0.8125rem] leading-4 font-medium text-muted-foreground [&_svg]:size-5.5 [&_svg]:shrink-0',
      active && 'bg-selection-surface font-bold text-foreground',
    )
  const personalHomeSelected = pathname === '/'
  // Contacts and deleted horses go Back to Horses, so the tab agrees.
  const horsesSelected =
    pathname.startsWith('/horses') ||
    Boolean(stableId && pathname.startsWith(`/stables/${stableId}/horses`))
  // A personal training page lives under /events but belongs to Training.
  const eventsSelected =
    section !== 'training' &&
    (pathname.startsWith('/events') ||
      Boolean(stableId && pathname.startsWith(`/stables/${stableId}/events`)))
  const trainingSelected =
    section === 'training' ||
    pathname.startsWith('/training') ||
    Boolean(stableId && pathname.startsWith(`/stables/${stableId}/training`))
  const moreSelected =
    ['/profile', '/pricing', '/stables'].some((destination) =>
      pathname.startsWith(destination),
    ) &&
    !eventsSelected &&
    !trainingSelected &&
    !horsesSelected

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
          className="md:hidden grid-cols-5"
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
            <Link
              to="/horses"
              className={itemClass(horsesSelected)}
              aria-current={horsesSelected ? 'page' : undefined}
            >
              <MobileNavigationIcon>
                <HorseIcon aria-hidden="true" className="size-5.5" />
              </MobileNavigationIcon>
              <span className="w-full wrap-anywhere">
                {t('navigation.horses')}
              </span>
            </Link>
          </>
          {renderMore(
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
