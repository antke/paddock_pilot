import type { ComponentProps, ReactNode } from 'react'

import { DashboardBrandWordmark } from '#/components/dashboard/DashboardDisplayHeading'
import { ButtonLink } from '#/components/ui/button'
import { cn } from '#/lib/utils'

const appHeaderActiveLinkClassName = 'text-primary dark:text-primary'
const appBrandLinkClassName =
  'h-auto border-0 bg-transparent px-0 py-0 text-foreground hover:bg-transparent'

export const appBodyClassName =
  'font-sans antialiased [overflow-wrap:anywhere] selection:bg-primary/20'

type AppShellProps = ComponentProps<'div'>
type AppHeaderProps = ComponentProps<'header'>
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

export function AppHeader({ className, ...props }: AppHeaderProps) {
  return (
    <header
      data-slot="app-header"
      className={cn(
        'sticky top-0 z-50 border-b border-border-subtle bg-surface/95 px-0 backdrop-blur supports-[backdrop-filter]:bg-surface/90 sm:px-4',
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
      className={cn(
        'flex items-center gap-2 rounded-control border border-border-subtle bg-surface-elevated p-1',
        className,
      )}
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
      className={cn(
        'flex flex-1 flex-col px-0 py-8 sm:px-6 lg:px-8',
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
