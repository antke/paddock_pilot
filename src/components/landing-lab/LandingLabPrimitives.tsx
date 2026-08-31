import type { ComponentProps, ReactNode } from 'react'
import { ArrowRight } from '@phosphor-icons/react'

import { ButtonLink } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { landingLabContent } from './landingLabContent'

export type LandingLabVariantProps = {
  theme?: 'light' | 'dark'
  versionId?: string
}

export function LandingLabPageFrame({
  children,
  className,
  footerClassName,
  headerClassName,
  theme = 'light',
}: {
  children: ReactNode
  className?: string
  footerClassName?: string
  headerClassName?: string
  theme?: 'light' | 'dark'
}) {
  return (
    <div
      className={cn(
        'min-h-screen overflow-x-clip bg-background text-foreground selection:bg-primary/25',
        theme === 'dark' && 'dark',
        className,
      )}
    >
      <a
        href="#main-content"
        className="sr-only z-[100] rounded-control bg-primary px-4 py-3 font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <LandingLabPublicHeader className={headerClassName} />
      {children}
      <LandingLabPublicFooter className={footerClassName} />
    </div>
  )
}

export function LandingLabPublicHeader({
  className,
}: ComponentProps<'header'>) {
  return (
    <header className={cn('border-b border-border bg-surface', className)}>
      <nav
        aria-label="Public navigation"
        className="flex w-full items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10 xl:px-12"
      >
        <ButtonLink
          to="/"
          variant="ghost"
          size="sm"
          className="h-auto border-0 bg-transparent px-0 py-0 font-serif text-xl font-bold text-foreground hover:bg-transparent"
        >
          Paddock Pilot
        </ButtonLink>
        <div className="flex items-center gap-1 sm:gap-2">
          <ButtonLink
            to={landingLabContent.signInActionTo}
            variant="ghost"
            size="sm"
          >
            {landingLabContent.signInAction}
          </ButtonLink>
          <ButtonLink to={landingLabContent.primaryActionTo} size="sm">
            <span className="sm:hidden">Create account</span>
            <span className="hidden sm:inline">Create your account</span>
          </ButtonLink>
        </div>
      </nav>
    </header>
  )
}

export function LandingLabPublicFooter({
  className,
}: ComponentProps<'footer'>) {
  return (
    <footer className={cn('border-t border-border bg-surface', className)}>
      <div className="grid w-full gap-8 px-4 py-10 sm:grid-cols-[1fr_auto] sm:items-end sm:px-6 lg:px-10 xl:px-12">
        <div className="max-w-2xl">
          <p className="font-serif text-2xl font-bold text-foreground">
            Paddock Pilot
          </p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {landingLabContent.promise}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <ButtonLink
            to={landingLabContent.signInActionTo}
            variant="ghost"
            size="sm"
          >
            {landingLabContent.signInAction}
          </ButtonLink>
          <ButtonLink
            to={landingLabContent.primaryActionTo}
            variant="outline"
            size="sm"
          >
            Create account
          </ButtonLink>
        </div>
      </div>
    </footer>
  )
}

export function LandingLabActions({
  className,
  inverse = false,
}: {
  className?: string
  inverse?: boolean
}) {
  return (
    <div
      className={cn('flex flex-col items-start gap-2 sm:flex-row', className)}
    >
      <ButtonLink
        to={landingLabContent.primaryActionTo}
        size="lg"
        variant={inverse ? 'secondary' : 'default'}
      >
        {landingLabContent.primaryAction}
        <ArrowRight data-icon="inline-end" />
      </ButtonLink>
      <ButtonLink
        to={landingLabContent.signInActionTo}
        size="lg"
        variant="ghost"
        className={cn(
          inverse && 'text-primary-foreground hover:text-primary-foreground',
        )}
      >
        {landingLabContent.signInAction}
      </ButtonLink>
    </div>
  )
}
