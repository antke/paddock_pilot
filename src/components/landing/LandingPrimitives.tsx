import { CaretDown } from '@phosphor-icons/react'
import type { ComponentProps, ReactNode } from 'react'

import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { DashboardDisplayHeading } from '#/components/dashboard/DashboardDisplayHeading'
import { DashboardInlinePanel } from '#/components/dashboard/DashboardInlinePanel'
import { dashboardItemCardClassName } from '#/components/dashboard/DashboardItemCard'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { TextLabel } from '#/components/ui/text-label'
import { cn } from '#/lib/utils'
import type { LandingFaq, LandingOutcome } from './landingContent'

type LandingTitleSize = 'hero' | 'section' | 'panel' | 'cta'
type LandingLeadSize = 'default' | 'hero' | 'brand'
type LandingSectionTone = 'default' | 'card' | 'soft' | 'brand'

type LandingCopyBlockProps = ComponentProps<'div'> & {
  align?: 'start' | 'center'
  width?: 'default' | 'wide'
}

type LandingTitleProps = Omit<ComponentProps<'h1'>, 'children'> & {
  as?: 'h1' | 'h2' | 'h3'
  children: ReactNode
  size?: LandingTitleSize
}

type LandingLeadProps = ComponentProps<'p'> & {
  size?: LandingLeadSize
}

type LandingSplitSectionProps = ComponentProps<typeof DashboardSection> & {
  split?: 'default' | 'textRail'
}

const landingTitleScale = {
  cta: 'section',
  hero: 'hero',
  panel: 'panel',
  section: 'section',
} as const

const landingLeadSizeClassNames = {
  brand: 'max-w-2xl text-primary-foreground/80',
  default: 'text-muted-foreground',
  hero: 'max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8',
} satisfies Record<LandingLeadSize, string>

const landingSplitClassNames = {
  default: 'lg:grid-cols-[1fr_0.9fr]',
  textRail: 'lg:grid-cols-[0.8fr_1fr]',
} satisfies Record<NonNullable<LandingSplitSectionProps['split']>, string>

const landingSectionToneClassNames = {
  default: '',
  card: 'app-panel-strong bg-card p-5 sm:p-7 lg:p-9',
  soft: 'border-y border-border-subtle bg-surface px-5 py-8 sm:px-7 lg:px-9 lg:py-10',
  brand:
    'app-panel-strong bg-primary p-6 text-primary-foreground sm:p-8 lg:p-12',
} satisfies Record<LandingSectionTone, string>

export function LandingPageShell({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'grid gap-12 pb-4 pt-1 sm:gap-16 sm:pt-4 lg:gap-20',
        className,
      )}
      {...props}
    />
  )
}

export function LandingSection({
  className,
  tone = 'default',
  ...props
}: ComponentProps<'section'> & { tone?: LandingSectionTone }) {
  return (
    <section
      className={cn(
        'grid gap-8 scroll-mt-24',
        landingSectionToneClassNames[tone],
        className,
      )}
      {...props}
    />
  )
}

export function LandingHeroGrid({
  className,
  ...props
}: ComponentProps<'section'>) {
  return (
    <section
      className={cn(
        'grid items-center gap-9 overflow-hidden lg:grid-cols-[0.82fr_1.18fr] lg:gap-10',
        className,
      )}
      {...props}
    />
  )
}

export function LandingHeroActionStack({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'grid gap-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-reduce:animate-none',
        className,
      )}
      {...props}
    />
  )
}

export function LandingActionRow({
  className,
  ...props
}: ComponentProps<typeof DashboardActions>) {
  return (
    <DashboardActions
      align="start"
      className={cn('[&_[data-slot=button]]:max-sm:flex-1', className)}
      {...props}
    />
  )
}

export function LandingPreviewShell({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div className={cn('app-panel bg-card p-3 sm:p-4', className)} {...props} />
  )
}

export function LandingCopyBlock({
  align = 'start',
  className,
  width = 'default',
  ...props
}: LandingCopyBlockProps) {
  return (
    <div
      className={cn(
        'grid content-start gap-3',
        width === 'wide' && 'max-w-2xl gap-4',
        align === 'center' && 'mx-auto justify-items-center text-center',
        className,
      )}
      {...props}
    />
  )
}

export function LandingEyebrow({ className, ...props }: ComponentProps<'p'>) {
  return (
    <TextLabel
      as="p"
      className={cn('text-primary', className)}
      tracking="wide"
      {...props}
    />
  )
}

export function LandingTitle({
  as = 'h2',
  className,
  size = 'section',
  ...props
}: LandingTitleProps) {
  return (
    <DashboardDisplayHeading
      as={as}
      className={className}
      scale={landingTitleScale[size]}
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

export function LandingOutcomeRail({
  className,
  items,
}: {
  className?: string
  items: ReadonlyArray<LandingOutcome>
}) {
  return (
    <ol className={cn('grid gap-3 md:grid-cols-3', className)}>
      {items.map((item) => (
        <li
          key={item.label}
          className={dashboardItemCardClassName({
            accent: item.tone,
            density: 'compact',
            className: 'grid content-start gap-2 bg-card',
          })}
        >
          <TextLabel as="span" className="text-muted-foreground">
            {item.label}
          </TextLabel>
          <h2 className="font-display text-xl font-black uppercase leading-none">
            {item.title}
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {item.description}
          </p>
        </li>
      ))}
    </ol>
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

export function LandingMediaFigure({
  caption,
  className,
  imageClassName,
  ...props
}: ComponentProps<'img'> & {
  caption: ReactNode
  imageClassName?: string
}) {
  return (
    <figure className={cn('grid gap-3', className)}>
      <div className="app-panel overflow-hidden bg-surface">
        <img
          className={cn('block h-full w-full object-cover', imageClassName)}
          loading="lazy"
          {...props}
        />
      </div>
      <figcaption className="text-sm leading-6 text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  )
}

export function LandingFaqList({
  className,
  items,
}: {
  className?: string
  items: ReadonlyArray<LandingFaq>
}) {
  return (
    <div
      className={cn(
        'divide-y divide-border-subtle border-y border-border-subtle',
        className,
      )}
    >
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-4 font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring/25 [&::-webkit-details-marker]:hidden">
            {item.question}
            <CaretDown
              aria-hidden="true"
              className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
            />
          </summary>
          <p className="max-w-2xl pb-5 pr-8 text-sm leading-6 text-muted-foreground">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
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
      className={cn(
        'justify-items-center gap-4 p-8 text-center md:p-12',
        className,
      )}
      {...props}
    />
  )
}
