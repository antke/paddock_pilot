import type { ComponentProps, ReactNode } from 'react'

import {
  NavigationMenu,
  NavigationMenuButtonLink,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '#/components/ui/navigation-menu'
import { cn } from '#/lib/utils'

type DashboardNavigationAlign = 'start' | 'end'
type DashboardNavigationAlignMode = 'responsive' | 'always'
type DashboardNavigationMenuContentWidth = 'auto' | 'sm' | 'md'

type DashboardNavigationProps = {
  align?: DashboardNavigationAlign
  alignMode?: DashboardNavigationAlignMode
  ariaLabel?: string
  children: ReactNode
  className?: string
  inset?: boolean
  listClassName?: string
  overflow?: 'scroll' | 'wrap'
}

type DashboardSectionTabItem<TTabId extends string> = {
  id: TTabId
  label: ReactNode
}

type DashboardSectionTabsProps<TTabId extends string> = Omit<
  DashboardNavigationProps,
  'children'
> & {
  activeId: TTabId
  items: ReadonlyArray<DashboardSectionTabItem<TTabId>>
  onSelect: (id: TTabId) => void
}

type DashboardSectionTabGroupProps<TTabId extends string> = Pick<
  DashboardNavigationProps,
  'align' | 'ariaLabel' | 'inset'
> &
  Omit<ComponentProps<'div'>, 'children' | 'onSelect'> & {
    activeId: TTabId
    children: ReactNode
    items: ReadonlyArray<DashboardSectionTabItem<TTabId>>
    onSelect: (id: TTabId) => void
    tabsClassName?: string
    tabsListClassName?: string
  }

type DashboardNavigationLinkItemProps = ComponentProps<
  typeof NavigationMenuLink
> & {
  active?: boolean
  variant?: 'default' | 'section'
}

type DashboardNavigationMenuGroupProps = {
  active?: boolean
  children: ReactNode
  contentClassName?: string
  contentWidth?: DashboardNavigationMenuContentWidth
  label: ReactNode
  triggerClassName?: string
  variant?: 'default' | 'section'
}

type DashboardNavigationMenuLinkProps = ComponentProps<
  typeof NavigationMenuLink
> & {
  active?: boolean
  variant?: 'default' | 'section'
}

type DashboardNavigationMenuButtonProps = ComponentProps<
  typeof NavigationMenuButtonLink
>

export const dashboardNavigationListClassName = 'flex-wrap justify-start gap-1'

const dashboardNavigationMenuContentWidthClassNames = {
  auto: '',
  sm: 'w-52',
  md: 'w-56',
} satisfies Record<DashboardNavigationMenuContentWidth, string>

export function DashboardNavigation({
  align = 'start',
  alignMode = 'responsive',
  ariaLabel,
  children,
  className,
  inset = true,
  listClassName,
  overflow = 'wrap',
}: DashboardNavigationProps) {
  const alignEnd = align === 'end'
  const alignAlways = alignEnd && alignMode === 'always'
  const alignResponsive = alignEnd && alignMode === 'responsive'

  return (
    <NavigationMenu
      aria-label={ariaLabel}
      className={cn(
        'min-w-0 max-w-full justify-start',
        alignAlways && 'ml-auto justify-end',
        alignResponsive && 'lg:justify-end',
        inset && 'px-1',
        className,
      )}
    >
      <NavigationMenuList
        className={cn(
          dashboardNavigationListClassName,
          overflow === 'scroll' &&
            'max-w-full flex-nowrap justify-start overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:thin]',
          alignAlways && 'justify-end',
          alignResponsive && 'lg:justify-end',
          listClassName,
        )}
      >
        {children}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export function DashboardSectionTabs<TTabId extends string>({
  activeId,
  ariaLabel = 'Section views',
  items,
  onSelect,
  ...navigationProps
}: DashboardSectionTabsProps<TTabId>) {
  return (
    <DashboardNavigation ariaLabel={ariaLabel} {...navigationProps}>
      {items.map((item) => (
        <NavigationMenuItem key={item.id}>
          <NavigationMenuButtonLink
            data-active={activeId === item.id || undefined}
            aria-pressed={activeId === item.id}
            className="h-11 shrink-0 px-3.5 py-2.5 font-display text-sm font-bold whitespace-nowrap uppercase leading-none tracking-[0.025em] sm:px-5"
            onClick={() => onSelect(item.id)}
          >
            {item.label}
          </NavigationMenuButtonLink>
        </NavigationMenuItem>
      ))}
    </DashboardNavigation>
  )
}

export function DashboardNavigationLinkItem({
  active,
  className,
  variant = 'default',
  ...props
}: DashboardNavigationLinkItemProps) {
  return (
    <NavigationMenuItem>
      <NavigationMenuLink
        data-active={active || undefined}
        aria-current={active ? 'page' : undefined}
        className={cn(
          variant === 'section' &&
            'h-10 shrink-0 px-3.5 font-display text-sm font-bold whitespace-nowrap uppercase leading-none tracking-[0.025em]',
          className,
        )}
        {...props}
      />
    </NavigationMenuItem>
  )
}

export function DashboardNavigationMenuGroup({
  active,
  children,
  contentClassName,
  contentWidth = 'auto',
  label,
  triggerClassName,
  variant = 'default',
}: DashboardNavigationMenuGroupProps) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger
        data-active={active || undefined}
        className={cn(
          variant === 'section' &&
            'h-10 shrink-0 px-3.5 font-display text-sm font-bold whitespace-nowrap uppercase leading-none tracking-[0.025em]',
          triggerClassName,
        )}
      >
        {label}
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <div
          className={cn(
            'grid gap-1',
            dashboardNavigationMenuContentWidthClassNames[contentWidth],
            contentClassName,
          )}
        >
          {children}
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
}

export function DashboardNavigationMenuLink({
  active,
  className,
  variant = 'default',
  ...props
}: DashboardNavigationMenuLinkProps) {
  return (
    <NavigationMenuLink
      closeOnClick
      data-active={active || undefined}
      aria-current={active ? 'page' : undefined}
      className={cn(
        variant === 'section' &&
          'font-display text-xs font-bold uppercase tracking-[0.025em]',
        className,
      )}
      {...props}
    />
  )
}

export function DashboardNavigationMenuButton(
  props: DashboardNavigationMenuButtonProps,
) {
  return <NavigationMenuButtonLink closeOnClick {...props} />
}

export function DashboardSectionTabGroup<TTabId extends string>({
  activeId,
  align,
  ariaLabel,
  children,
  className,
  inset,
  items,
  onSelect,
  tabsClassName,
  tabsListClassName,
  ...props
}: DashboardSectionTabGroupProps<TTabId>) {
  return (
    <div className={cn('grid gap-3', className)} {...props}>
      <DashboardSectionTabs
        activeId={activeId}
        align={align}
        ariaLabel={ariaLabel}
        inset={inset}
        items={items}
        listClassName={tabsListClassName}
        onSelect={onSelect}
        className={tabsClassName}
      />

      {children}
    </div>
  )
}
