import type { ComponentProps, ReactNode } from 'react'

import { DashboardInlinePanel } from '#/components/dashboard/DashboardInlinePanel'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { cn } from '#/lib/utils'

type LandingTitleSize = 'hero' | 'section' | 'cta'
type LandingLeadSize = 'default' | 'hero' | 'brand'

type LandingCopyBlockProps = ComponentProps<'div'> & {
  width?: 'default' | 'wide'
}

type LandingTitleProps = ComponentProps<'h1'> & {
  as?: 'h1' | 'h2'
  size?: LandingTitleSize
}

type LandingLeadProps = ComponentProps<'p'> & {
  size?: LandingLeadSize
}

type LandingSplitSectionProps = ComponentProps<typeof DashboardSection> & {
  split?: 'default' | 'textRail'
}

const landingTitleSizeClassNames = {
  cta: 'text-3xl',
  hero: 'text-4xl md:text-6xl',
  section: 'text-2xl md:text-3xl',
} satisfies Record<LandingTitleSize, string>

const landingLeadSizeClassNames = {
  brand: 'max-w-xl text-primary-foreground/80',
  default: 'text-muted-foreground',
  hero: 'text-muted-foreground md:text-lg',
} satisfies Record<LandingLeadSize, string>

const landingSplitClassNames = {
  default: 'lg:grid-cols-[1fr_0.9fr]',
  textRail: 'lg:grid-cols-[0.8fr_1fr]',
} satisfies Record<NonNullable<LandingSplitSectionProps['split']>, string>

export function LandingPageShell({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('grid gap-16 py-10 md:py-16', className)} {...props} />
}

export function LandingHeroGrid({ className, ...props }: ComponentProps<'section'>) {
  return (
    <section
      className={cn('grid items-center gap-10', landingSplitClassNames.default, className)}
      {...props}
    />
  )
}

export function LandingHeroActionStack({
  className,
  ...props
}: ComponentProps<'div'>) {
  return <div className={cn('grid gap-6', className)} {...props} />
}

export function LandingPreviewShell({
  className,
  ...props
}: ComponentProps<typeof DashboardSection>) {
  return (
    <DashboardSection
      chrome="cards"
      className={cn('p-4 md:p-6', className)}
      {...props}
    />
  )
}

export function LandingCopyBlock({
  className,
  width = 'default',
  ...props
}: LandingCopyBlockProps) {
  return (
    <div
      className={cn(
        'grid content-start gap-3',
        width === 'wide' && 'max-w-2xl gap-4',
        className,
      )}
      {...props}
    />
  )
}

export function LandingTitle({
  as: Component = 'h2',
  className,
  size = 'section',
  ...props
}: LandingTitleProps) {
  return (
    <Component
      className={cn(
        'font-semibold tracking-normal',
        landingTitleSizeClassNames[size],
        className,
      )}
      {...props}
    />
  )
}

export function LandingLead({
  className,
  size = 'default',
  ...props
}: LandingLeadProps) {
  return (
    <p className={cn(landingLeadSizeClassNames[size], className)} {...props} />
  )
}

export function LandingSplitSection({
  className,
  split = 'textRail',
  ...props
}: LandingSplitSectionProps) {
  return (
    <DashboardSection
      chrome="cards"
      gap="loose"
      className={cn(landingSplitClassNames[split], className)}
      {...props}
    />
  )
}

export function LandingFeatureList({
  className,
  items,
}: {
  className?: string
  items: ReadonlyArray<ReactNode>
}) {
  return (
    <div className={cn('grid gap-4', className)}>
      {items.map((item, index) => (
        <DashboardInlinePanel key={String(index)} padding="compact">
          <p className="font-medium">{item}</p>
        </DashboardInlinePanel>
      ))}
    </div>
  )
}

export function LandingCompactStack({
  className,
  ...props
}: ComponentProps<'div'>) {
  return <div className={cn('grid gap-2 text-sm', className)} {...props} />
}

export function LandingMutedValue({
  className,
  ...props
}: ComponentProps<'span'>) {
  return (
    <span
      className={cn('text-right text-muted-foreground', className)}
      {...props}
    />
  )
}

export function LandingCtaSection({
  className,
  ...props
}: ComponentProps<typeof DashboardSection>) {
  return (
    <DashboardSection
      chrome="cards"
      tone="brand"
      className={cn('justify-items-center gap-4 p-8 text-center md:p-12', className)}
      {...props}
    />
  )
}
