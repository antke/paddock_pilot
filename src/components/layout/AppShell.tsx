import { useT } from '#/i18n/LocaleProvider'
import { useEffect, useImperativeHandle, useRef } from 'react'
import type { ComponentProps, ReactNode } from 'react'

import { DashboardBrandWordmark } from '#/components/dashboard/DashboardDisplayHeading'
import { ButtonLink, buttonVariants } from '#/components/ui/button'
import { cn } from '#/lib/utils'

const appHeaderActiveLinkClassName = 'text-primary dark:text-primary'
const appBrandLinkClassName =
  'h-auto border-0 bg-transparent px-0 py-0 text-foreground hover:bg-transparent'

export const appBodyClassName =
  'font-sans antialiased [overflow-wrap:anywhere] selection:bg-selection-surface'

type AppShellProps = ComponentProps<'div'>
type AppHeaderProps = ComponentProps<'header'> & {
  position?: 'sticky' | 'static'
}
type AppHeaderNavProps = ComponentProps<'nav'>
type AppHeaderUtilityClusterProps = ComponentProps<'div'>
type AppBrandLinkProps = {
  children: ReactNode
}
type AppFooterProps = ComponentProps<'footer'>
type AppMainProps = ComponentProps<'main'>
type AppMainContentWidth = 'default' | 'wide'
type AppMainContentProps = ComponentProps<'div'> & {
  width?: AppMainContentWidth
}

export function AppShell({ className, style, ...props }: AppShellProps) {
  return (
    <div
      data-slot="app-shell"
      className={cn('app-shell', className)}
      style={{
        display: 'grid',
        minHeight: '100vh',
        gridTemplateRows: 'auto 1fr auto',
        ...style,
      }}
      {...props}
    />
  )
}

// Only mounted sticky application headers contribute; static lab specimens do not.
const stickyHeaderHeights = new Map<HTMLElement, number>()
const headerScrollClearanceProperty = '--app-header-scroll-clearance'
const headerScrollGapRem = 1
let previousScrollClearance: { value: string; priority: string } | undefined

function publishHeaderScrollClearance() {
  const style = document.documentElement.style
  if (stickyHeaderHeights.size > 0) {
    const height = Math.max(...stickyHeaderHeights.values())
    style.setProperty(
      headerScrollClearanceProperty,
      `calc(${height}px + ${headerScrollGapRem}rem)`,
    )
  } else if (previousScrollClearance) {
    if (previousScrollClearance.value) {
      style.setProperty(
        headerScrollClearanceProperty,
        previousScrollClearance.value,
        previousScrollClearance.priority,
      )
    } else {
      style.removeProperty(headerScrollClearanceProperty)
    }
    previousScrollClearance = undefined
  }
}

function getHeaderScrollClearance() {
  if (stickyHeaderHeights.size === 0) return 0
  const rootFontSize =
    Number.parseFloat(
      window.getComputedStyle(document.documentElement).fontSize,
    ) || 16
  return (
    Math.max(...stickyHeaderHeights.values()) +
    headerScrollGapRem * rootFontSize
  )
}

export function AppHeader({
  className,
  position = 'sticky',
  ref,
  ...props
}: AppHeaderProps) {
  const headerRef = useRef<HTMLElement>(null)
  useImperativeHandle(ref, () => headerRef.current!, [])
  useEffect(() => {
    const header = headerRef.current
    if (!header || position !== 'sticky') return
    if (stickyHeaderHeights.size === 0) {
      const style = document.documentElement.style
      previousScrollClearance = {
        value: style.getPropertyValue(headerScrollClearanceProperty),
        priority: style.getPropertyPriority(headerScrollClearanceProperty),
      }
    }
    stickyHeaderHeights.set(header, 0)
    const measure = () => {
      if (!stickyHeaderHeights.has(header)) return
      stickyHeaderHeights.set(
        header,
        Math.ceil(header.getBoundingClientRect().height),
      )
      publishHeaderScrollClearance()
    }
    measure()
    const observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(measure)
    observer?.observe(header)
    window.addEventListener('resize', measure)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
      stickyHeaderHeights.delete(header)
      publishHeaderScrollClearance()
    }
  }, [position])
  return (
    <header
      ref={headerRef}
      data-slot="app-header"
      className={cn(
        'border-b border-border-subtle bg-background px-0 sm:px-4',
        position === 'sticky' && 'sticky top-0 z-50',
        className,
      )}
      {...props}
    />
  )
}

export function AppSkipLink() {
  const t = useT()
  return (
    <a
      href="#main-content"
      className={cn(
        buttonVariants(),
        'absolute sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100]',
      )}
      onClick={(event) => {
        const main = document.getElementById('main-content')
        if (!main) return
        event.preventDefault()
        main.focus({ preventScroll: true })
        const clearance = getHeaderScrollClearance()
        window.scrollTo({
          top: Math.max(
            0,
            window.scrollY + main.getBoundingClientRect().top - clearance,
          ),
          behavior: 'instant',
        })
      }}
    >
      {t('navigation.skip')}
    </a>
  )
}

export function AppHeaderLinks({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="app-header-links"
      className={cn(
        'order-3 flex w-full min-w-0 flex-wrap items-center gap-1 xl:order-none xl:w-auto',
        className,
      )}
      {...props}
    />
  )
}

export function AppHeaderNav({ className, ...props }: AppHeaderNavProps) {
  return (
    <nav
      data-slot="app-header-nav"
      className={cn(
        'page-wrap flex flex-wrap items-center justify-between gap-3 py-4',
        className,
      )}
      {...props}
    />
  )
}

export function AppBrandLink({ children }: AppBrandLinkProps) {
  return (
    <ButtonLink
      to="/"
      activeOptions={{ exact: true }}
      activeProps={{ className: appHeaderActiveLinkClassName }}
      variant="ghost"
      size="sm"
      className={appBrandLinkClassName}
    >
      <DashboardBrandWordmark>{children}</DashboardBrandWordmark>
    </ButtonLink>
  )
}

export function AppHeaderActions({
  className,
  ...props
}: AppHeaderUtilityClusterProps) {
  return (
    <div
      data-slot="app-header-actions"
      className={cn(
        'flex flex-wrap items-center justify-end gap-3 sm:gap-5',
        className,
      )}
      {...props}
    />
  )
}

export function AppHeaderUtilityCluster({
  className,
  ...props
}: AppHeaderUtilityClusterProps) {
  return (
    <div
      data-slot="app-header-utility-cluster"
      className={cn('flex flex-wrap items-center gap-2 p-1', className)}
      {...props}
    />
  )
}

export function AppFooter({ className, ...props }: AppFooterProps) {
  return (
    <footer
      data-slot="app-footer"
      className={cn(
        'border-t border-border-subtle bg-surface px-4 pt-4 pb-2 text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function AppFooterInner({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="app-footer-inner"
      className={cn('page-wrap text-center sm:text-left', className)}
      {...props}
    />
  )
}

export function AppMain({ className, ...props }: AppMainProps) {
  return (
    <main
      data-slot="app-main"
      id="main-content"
      tabIndex={-1}
      className={cn(
        'app-canvas flex flex-1 flex-col px-0 py-8 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-6 lg:px-8',
        className,
      )}
      {...props}
    />
  )
}

export function AppMainContent({
  className,
  width = 'wide',
  ...props
}: AppMainContentProps) {
  return (
    <div
      data-slot="app-main-wrap"
      className="page-wrap grid flex-1 grid-cols-12"
    >
      <div
        data-slot="app-main-content"
        className={cn(
          'min-h-full',
          width === 'wide' && 'col-span-12',
          width === 'default' && 'col-span-12 md:col-span-8 md:col-start-3',
          className,
        )}
        {...props}
      />
    </div>
  )
}
