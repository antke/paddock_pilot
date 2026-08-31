import { cn } from '#/lib/utils'
import { createLink } from '@tanstack/react-router'
import { forwardRef } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import type { DashboardChrome } from './dashboardChrome'
import { DashboardActions } from './DashboardActions'
import { DashboardBadgeList } from './DashboardBadgeList'
import { DashboardMetaList } from './DashboardMetaList'

type DashboardItemCardDensity = 'comfortable' | 'compact'
export type DashboardItemAccent =
  | 'none'
  | 'primary'
  | 'warning'
  | 'danger'
  | 'muted'
type DashboardItemOpenRowTone = 'primary' | 'warning' | 'danger' | 'muted'
type DashboardItemCardTitleSize = 'default' | 'sm'
type DashboardItemCardTitleTone = 'default' | 'open'
type DashboardItemRecordTitleSize = 'default' | 'dense'
type DashboardItemRecordTitleTone = 'default' | 'open'

type DashboardItemCardContentProps = {
  title: ReactNode
  className?: string
  meta?: ReactNode
  metaSeparator?: ComponentProps<typeof DashboardMetaList>['separator']
  leading?: ReactNode
  media?: ReactNode
  badges?: ReactNode
  density?: DashboardItemCardDensity
  badgesClassName?: string
  metaGap?: ComponentProps<typeof DashboardMetaList>['gap']
  metaClassName?: string
  titleClassName?: string
  titleSize?: DashboardItemCardTitleSize
  titleTone?: DashboardItemCardTitleTone
}

type DashboardItemCardProps = ComponentProps<'div'> & {
  accent?: DashboardItemAccent
  chrome?: DashboardChrome
  density?: DashboardItemCardDensity
  interactive?: boolean
  selected?: boolean
}

type DashboardItemFieldsetCardProps = ComponentProps<'fieldset'> & {
  accent?: DashboardItemAccent
  chrome?: DashboardChrome
  density?: DashboardItemCardDensity
  interactive?: boolean
  selected?: boolean
}

export type DashboardItemRecordContentProps = {
  title: ReactNode
  children?: ReactNode
  className?: string
  description?: ReactNode
  descriptionClassName?: string
  meta?: ReactNode
  metaClassName?: string
  metaSeparator?: ComponentProps<typeof DashboardMetaList>['separator']
  titleClassName?: string
  titleSize?: DashboardItemRecordTitleSize
  titleTone?: DashboardItemRecordTitleTone
}

type DashboardItemActionColumnProps = {
  badges?: ReactNode
  badgesClassName?: string
  children?: ReactNode
  className?: string
}

type DashboardItemActionRowProps = ComponentProps<'div'> & {
  align?: 'center' | 'start' | 'stretch'
  gap?: '3' | '4'
}

type DashboardItemActionsProps = ComponentProps<typeof DashboardActions> & {
  placement?: 'start' | 'end'
}

type DashboardItemRecordCardProps = ComponentProps<'div'> & {
  accent?: DashboardItemAccent
  actionBadges?: ReactNode
  actionBadgesClassName?: string
  actionColumnClassName?: string
  actions?: ReactNode
  actionsClassName?: string
  actionsPlacement?: 'side' | 'footer'
  chrome?: DashboardChrome
  density?: DashboardItemCardDensity
  footer?: ReactNode
  interactive?: boolean
  selected?: boolean
}

type DashboardItemRecordFooterGap = 'compact' | 'default'
type DashboardItemRecordFooterTextSize = 'default' | 'sm'

type DashboardItemRecordFooterProps = ComponentProps<'div'> & {
  gap?: DashboardItemRecordFooterGap
  textSize?: DashboardItemRecordFooterTextSize
}

type DashboardItemLinkCardProps = ComponentProps<'a'> & {
  accent?: DashboardItemAccent
  chrome?: DashboardChrome
  density?: DashboardItemCardDensity
  selected?: boolean
}

type DashboardItemOpenLinkProps = ComponentProps<'a'> & {
  density?: DashboardItemCardDensity
  tone?: DashboardItemOpenRowTone
}

type DashboardItemOpenTitleProps = ComponentProps<'span'>
type DashboardItemBodyTextTone = 'default' | 'muted'
type DashboardItemBodyTextProps = ComponentProps<'p'> & {
  tone?: DashboardItemBodyTextTone
}

type DashboardItemMediaCardProps = Omit<ComponentProps<'div'>, 'title'> & {
  accent?: DashboardItemAccent
  actions?: ReactNode
  badges?: ReactNode
  badgesClassName?: string
  chrome?: DashboardChrome
  contentClassName?: string
  density?: DashboardItemCardDensity
  interactive?: boolean
  media: ReactNode
  meta?: ReactNode
  metaSeparator?: ComponentProps<typeof DashboardMetaList>['separator']
  summary?: ReactNode
  summaryClassName?: string
  title: ReactNode
  titleClassName?: string
  titleSize?: DashboardItemCardTitleSize
}

type DashboardItemListGap = 'comfortable' | 'compact' | 'flush' | 'loose'
type DashboardItemListContentAlign = 'default' | 'start'

type DashboardItemListProps = ComponentProps<'div'> & {
  contentAlign?: DashboardItemListContentAlign
  gap?: DashboardItemListGap
}

export const dashboardItemActionGridClassName =
  'grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-stretch'

export const dashboardItemListClassName = 'grid gap-3'

export const dashboardItemActionRowClassName =
  'grid sm:grid-cols-[minmax(0,1fr)_auto]'

export const dashboardItemActionColumnClassName =
  'grid gap-4 sm:min-w-max sm:self-stretch sm:justify-items-end sm:justify-self-end'

export const dashboardItemActionButtonsClassName =
  'flex w-fit max-w-full min-w-0 flex-row flex-wrap justify-end self-start [&>*]:shrink-0'

export const dashboardItemDescriptionClassName =
  'whitespace-pre-wrap text-sm leading-6 text-muted-foreground'

export const dashboardItemBodyTextClassName =
  'whitespace-pre-wrap text-sm leading-6'

export const dashboardItemRecordFooterClassName = 'grid sm:col-span-2'

export const dashboardItemTitleClassName =
  'no-underline decoration-transparent hover:no-underline hover:decoration-transparent group-hover/dashboard-item:no-underline group-hover/dashboard-item:decoration-transparent group-hover/open:no-underline group-hover/open:decoration-transparent [&_a]:no-underline [&_a]:decoration-transparent [&_a:hover]:no-underline [&_a:hover]:decoration-transparent'

const dashboardItemCardTitleSizeClassNames = {
  default: '',
  sm: 'text-sm',
} satisfies Record<DashboardItemCardTitleSize, string>

export const dashboardItemCompactTitleClassName = cn(
  'text-sm font-semibold',
  dashboardItemTitleClassName,
)

export const dashboardItemLargeTitleClassName = cn(
  'text-lg font-semibold leading-snug tracking-normal',
  dashboardItemTitleClassName,
)

export const dashboardItemDenseRecordTitleClassName = cn(
  'text-base font-medium tracking-normal',
  dashboardItemTitleClassName,
)

export const dashboardItemSummaryClassName =
  'line-clamp-3 min-h-8 whitespace-pre-line text-sm leading-6 text-foreground sm:line-clamp-2'

export const dashboardItemOpenTitleClassName = cn(
  'text-sm font-semibold transition-colors group-hover/open:text-primary',
  dashboardItemTitleClassName,
)

export function DashboardItemOpenTitle({
  className,
  ...props
}: DashboardItemOpenTitleProps) {
  return (
    <span
      className={cn(dashboardItemOpenTitleClassName, className)}
      {...props}
    />
  )
}

export function DashboardItemBodyText({
  className,
  tone = 'default',
  ...props
}: DashboardItemBodyTextProps) {
  return (
    <p
      className={cn(
        dashboardItemBodyTextClassName,
        tone === 'muted' && 'text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function dashboardItemOpenRowClassName({
  density = 'comfortable',
  tone = 'primary',
  className,
}: {
  density?: DashboardItemCardDensity
  tone?: DashboardItemOpenRowTone
  className?: string
} = {}) {
  return cn(
    'group/open grid gap-2 rounded-row border-l-4 bg-transparent no-underline transition-colors hover:bg-primary/5 hover:no-underline focus-visible:no-underline',
    density === 'compact' ? 'p-4' : 'p-5',
    tone === 'primary' && 'border-l-primary/45',
    tone === 'warning' && 'border-l-chart-3',
    tone === 'danger' && 'border-l-destructive/45',
    tone === 'muted' && 'border-l-muted-foreground/30',
    className,
  )
}

export function DashboardItemActions({
  align = 'start',
  wrap = true,
  className,
  placement = 'start',
  ...props
}: DashboardItemActionsProps) {
  return (
    <DashboardActions
      align={align}
      wrap={wrap}
      data-dashboard-item-actions=""
      className={cn(
        dashboardItemActionButtonsClassName,
        placement === 'end' && 'justify-self-end',
        className,
      )}
      {...props}
    />
  )
}

export function DashboardItemList({
  children,
  className,
  contentAlign = 'default',
  gap = 'comfortable',
  ...props
}: DashboardItemListProps) {
  return (
    <div
      data-slot="dashboard-item-list"
      className={cn(
        'grid',
        gap === 'comfortable' && 'gap-3',
        gap === 'compact' && 'gap-2',
        gap === 'flush' && 'gap-0',
        gap === 'loose' && 'gap-4',
        contentAlign === 'start' && 'content-start',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function DashboardItemCard({
  accent = 'none',
  children,
  chrome = 'cards',
  className,
  density,
  interactive,
  selected,
  ...props
}: DashboardItemCardProps) {
  return (
    <div
      data-slot="dashboard-item-card"
      data-accent={accent === 'none' ? undefined : accent}
      data-selected={selected || undefined}
      className={dashboardItemCardClassName({
        chrome,
        accent,
        density,
        interactive,
        selected,
        className,
      })}
      {...props}
    >
      {children}
    </div>
  )
}

export function DashboardItemFieldsetCard({
  accent = 'none',
  children,
  chrome = 'cards',
  className,
  density,
  interactive,
  selected,
  ...props
}: DashboardItemFieldsetCardProps) {
  return (
    <fieldset
      data-slot="dashboard-item-card"
      data-accent={accent === 'none' ? undefined : accent}
      data-selected={selected || undefined}
      className={dashboardItemCardClassName({
        chrome,
        accent,
        density,
        interactive,
        selected,
        className,
      })}
      {...props}
    >
      {children}
    </fieldset>
  )
}

export function DashboardItemActionRow({
  align = 'center',
  children,
  className,
  gap = '3',
  ...props
}: DashboardItemActionRowProps) {
  return (
    <div
      className={cn(
        dashboardItemActionRowClassName,
        gap === '3' && 'gap-3',
        gap === '4' && 'gap-4',
        align === 'center' && 'sm:items-center',
        align === 'start' && 'sm:items-start',
        align === 'stretch' && 'sm:items-stretch',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function DashboardItemActionColumn({
  badges,
  badgesClassName,
  children,
  className,
}: DashboardItemActionColumnProps) {
  return (
    <div
      className={cn(
        dashboardItemActionColumnClassName,
        badges ? 'sm:content-between' : 'sm:content-end',
        'sm:[&>[data-dashboard-item-actions]]:mt-auto',
        className,
      )}
    >
      {badges && (
        <DashboardBadgeList
          align="end"
          gap="compact"
          className={badgesClassName}
        >
          {badges}
        </DashboardBadgeList>
      )}

      {children}
    </div>
  )
}

export function DashboardItemRecordCard({
  accent = 'none',
  actionBadges,
  actionBadgesClassName,
  actionColumnClassName,
  actions,
  actionsClassName,
  actionsPlacement = 'side',
  children,
  chrome = 'cards',
  className,
  density,
  footer,
  interactive = true,
  selected,
  ...props
}: DashboardItemRecordCardProps) {
  const hasActionColumn = Boolean(
    actionBadges ?? (actionsPlacement === 'side' ? actions : undefined),
  )

  return (
    <div
      data-slot="dashboard-item-card"
      data-accent={accent === 'none' ? undefined : accent}
      data-selected={selected || undefined}
      className={dashboardItemCardClassName({
        chrome,
        accent,
        density,
        interactive,
        selected,
        className: cn(dashboardItemActionGridClassName, className),
      })}
      {...props}
    >
      {children}

      {hasActionColumn && (
        <DashboardItemActionColumn
          badges={actionBadges}
          badgesClassName={actionBadgesClassName}
          className={cn(
            actionsPlacement === 'footer' &&
              actionBadges &&
              '-order-1 justify-items-end sm:order-none',
            actionColumnClassName,
          )}
        >
          {actionsPlacement === 'side' && actions && (
            <DashboardItemActions className={actionsClassName}>
              {actions}
            </DashboardItemActions>
          )}
        </DashboardItemActionColumn>
      )}

      {footer}

      {actionsPlacement === 'footer' && actions && (
        <DashboardItemRecordFooter gap="compact">
          <DashboardItemActions className={actionsClassName}>
            {actions}
          </DashboardItemActions>
        </DashboardItemRecordFooter>
      )}
    </div>
  )
}

export function DashboardItemRecordFooter({
  children,
  className,
  gap = 'default',
  textSize = 'default',
  ...props
}: DashboardItemRecordFooterProps) {
  return (
    <div
      className={cn(
        dashboardItemRecordFooterClassName,
        gap === 'compact' ? 'gap-2' : 'gap-3',
        textSize === 'sm' && 'text-sm',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const DashboardItemLinkCardAnchor = forwardRef<
  HTMLAnchorElement,
  DashboardItemLinkCardProps
>(function DashboardItemLinkCardAnchor(
  {
    accent = 'none',
    children,
    chrome = 'cards',
    className,
    density,
    selected,
    ...props
  },
  ref,
) {
  return (
    <a
      ref={ref}
      data-slot="dashboard-item-card"
      data-accent={accent === 'none' ? undefined : accent}
      data-selected={selected || undefined}
      className={dashboardItemCardClassName({
        accent,
        chrome,
        density,
        interactive: true,
        selected,
        className: cn('block h-full w-full', className),
      })}
      {...props}
    >
      {children}
    </a>
  )
})

export const DashboardItemLinkCard = createLink(DashboardItemLinkCardAnchor)

const DashboardItemOpenLinkAnchor = forwardRef<
  HTMLAnchorElement,
  DashboardItemOpenLinkProps
>(function DashboardItemOpenLinkAnchor(
  { children, className, density, tone = 'primary', ...props },
  ref,
) {
  return (
    <a
      ref={ref}
      data-slot="dashboard-item-open-link"
      className={dashboardItemOpenRowClassName({ density, tone, className })}
      {...props}
    >
      {children}
    </a>
  )
})

export const DashboardItemOpenLink = createLink(DashboardItemOpenLinkAnchor)

export function DashboardItemMediaCard({
  accent = 'none',
  actions,
  badges,
  badgesClassName,
  chrome = 'cards',
  className,
  contentClassName,
  density,
  interactive = true,
  media,
  meta,
  metaSeparator,
  summary,
  summaryClassName,
  title,
  titleClassName,
  titleSize = 'default',
  ...props
}: DashboardItemMediaCardProps) {
  return (
    <div
      data-slot="dashboard-item-card"
      data-accent={accent === 'none' ? undefined : accent}
      className={dashboardItemCardClassName({
        accent,
        chrome,
        density,
        interactive,
        className: cn('grid', className),
      })}
      {...props}
    >
      <div className="flex min-h-28 items-stretch gap-4">
        {media}

        <div
          className={cn(
            'grid min-w-0 flex-1 grid-rows-[auto_1fr_auto] gap-1',
            contentClassName,
          )}
        >
          <DashboardItemCardContent
            className="items-start"
            title={title}
            titleClassName={titleClassName}
            titleSize={titleSize}
            meta={meta}
            metaSeparator={metaSeparator}
            density="compact"
            badges={badges}
            badgesClassName={badgesClassName}
          />

          {summary !== undefined && (
            <p className={cn(dashboardItemSummaryClassName, summaryClassName)}>
              {summary}
            </p>
          )}

          {actions && (
            <DashboardItemActions placement="end">
              {actions}
            </DashboardItemActions>
          )}
        </div>
      </div>
    </div>
  )
}

export function DashboardItemRecordContent({
  title,
  children,
  className,
  description,
  descriptionClassName,
  meta,
  metaClassName,
  metaSeparator = 'dot',
  titleClassName,
  titleSize = 'default',
  titleTone = 'default',
}: DashboardItemRecordContentProps) {
  const titleNode = (
    <h3
      className={cn(
        titleTone === 'open'
          ? dashboardItemOpenTitleClassName
          : titleSize === 'dense'
            ? dashboardItemDenseRecordTitleClassName
            : dashboardItemLargeTitleClassName,
        titleClassName,
      )}
    >
      {title}
    </h3>
  )

  return (
    <div className={cn('grid min-w-0 gap-3', className)}>
      {titleNode}

      {meta && (
        <DashboardMetaList separator={metaSeparator} className={metaClassName}>
          {meta}
        </DashboardMetaList>
      )}

      {description && (
        <p
          className={cn(
            dashboardItemDescriptionClassName,
            descriptionClassName,
          )}
        >
          {description}
        </p>
      )}

      {children}
    </div>
  )
}

export function dashboardItemCardClassName({
  accent = 'none',
  density = 'comfortable',
  interactive = false,
  chrome = 'cards',
  selected = false,
  className,
}: {
  accent?: DashboardItemAccent
  density?: DashboardItemCardDensity
  interactive?: boolean
  chrome?: DashboardChrome
  selected?: boolean
  className?: string
} = {}) {
  return cn(
    'group/dashboard-item group/open no-underline transition-[background-color,border-color,color,box-shadow] duration-150 hover:no-underline hover:[&_a]:no-underline hover:[&_h3]:no-underline hover:[&_[data-slot=card-title]]:no-underline',
    chrome === 'cards' && 'app-row text-card-foreground',
    chrome === 'soft' && 'rounded-row bg-surface text-card-foreground',
    density === 'compact' ? 'p-4' : 'p-5',
    accent !== 'none' && 'border-l-4',
    accent === 'primary' && 'border-l-primary/70',
    accent === 'warning' && 'border-l-chart-3',
    accent === 'danger' && 'border-l-destructive/65',
    accent === 'muted' && 'border-l-muted-foreground/35',
    interactive &&
      cn(
        'focus-visible:ring-3 focus-visible:ring-ring/25 focus-visible:outline-none',
        chrome === 'cards' &&
          'hover:border-primary/30 hover:bg-card hover:text-foreground',
        chrome === 'soft' &&
          'hover:border-primary/25 hover:bg-surface-elevated hover:text-foreground',
      ),
    selected &&
      'border-primary/45 bg-primary/10 text-foreground ring-1 ring-primary/25',
    className,
  )
}

export function DashboardItemCardContent({
  title,
  className,
  meta,
  metaSeparator,
  leading,
  media,
  badges,
  density = 'comfortable',
  badgesClassName,
  metaGap,
  metaClassName,
  titleClassName,
  titleSize = 'default',
  titleTone = 'default',
}: DashboardItemCardContentProps) {
  const hasLeading = Boolean(media ?? leading)
  const hasBadges = Boolean(badges)

  return (
    <div
      className={cn(
        'grid min-w-0 items-center gap-2 sm:gap-3',
        hasLeading &&
          hasBadges &&
          'grid-cols-[auto_minmax(0,1fr)] sm:grid-cols-[auto_minmax(0,1fr)_auto]',
        hasLeading && !hasBadges && 'grid-cols-[auto_minmax(0,1fr)]',
        !hasLeading &&
          hasBadges &&
          'grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto]',
        !hasLeading && !hasBadges && 'grid-cols-1',
        className,
      )}
    >
      {media ?? leading}

      <div className="min-w-0">
        <div
          className={cn(
            'line-clamp-2 break-words font-semibold',
            dashboardItemCardTitleSizeClassNames[titleSize],
            titleTone === 'open'
              ? dashboardItemOpenTitleClassName
              : dashboardItemTitleClassName,
            titleClassName,
          )}
        >
          {title}
        </div>
        {meta && (
          <DashboardMetaList
            className={cn('mt-1', metaClassName)}
            gap={metaGap}
            separator={metaSeparator}
            size={density === 'compact' ? 'xs' : 'sm'}
          >
            {meta}
          </DashboardMetaList>
        )}
      </div>

      {badges && (
        <DashboardBadgeList
          align="end"
          className={cn(
            'max-w-full shrink-0',
            hasLeading &&
              hasBadges &&
              'col-span-2 justify-self-end sm:col-span-1 sm:justify-self-auto',
            badgesClassName,
          )}
        >
          {badges}
        </DashboardBadgeList>
      )}
    </div>
  )
}
