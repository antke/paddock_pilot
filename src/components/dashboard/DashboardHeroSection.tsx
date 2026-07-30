import type { ComponentProps, ReactNode } from 'react'

import { cn } from '#/lib/utils'
import type { DashboardChrome } from './dashboardChrome'
import { dashboardHeroClassName } from './dashboardChrome'
import { DashboardDisplayHeading } from './DashboardDisplayHeading'

type DashboardHeroSectionProps = ComponentProps<'section'> & {
  chrome?: DashboardChrome
}

type DashboardHeroContentProps = ComponentProps<'div'>
type DashboardHeroTextProps = ComponentProps<'div'>
type DashboardHeroTitleProps = Omit<ComponentProps<'h1'>, 'children'> & {
  children: ReactNode
}
type DashboardHeroActionsProps = ComponentProps<'div'>

export function DashboardHeroSection({
  chrome = 'cards',
  className,
  ...props
}: DashboardHeroSectionProps) {
  return (
    <section
      data-slot="dashboard-hero-section"
      className={cn(dashboardHeroClassName(chrome), className)}
      {...props}
    />
  )
}

export function DashboardHeroContent({
  className,
  ...props
}: DashboardHeroContentProps) {
  return (
    <div
      className={cn(
        'grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start',
        className,
      )}
      {...props}
    />
  )
}

export function DashboardHeroText({
  className,
  ...props
}: DashboardHeroTextProps) {
  return <div className={cn('grid max-w-3xl gap-3', className)} {...props} />
}

export function DashboardHeroTitle({
  className,
  ...props
}: DashboardHeroTitleProps) {
  return (
    <DashboardDisplayHeading scale="hero" className={className} {...props} />
  )
}

export function DashboardHeroActions({
  className,
  ...props
}: DashboardHeroActionsProps) {
  return (
    <div
      className={cn(
        'grid gap-3 justify-items-start lg:justify-items-end',
        className,
      )}
      {...props}
    />
  )
}
