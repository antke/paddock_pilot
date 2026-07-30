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
  children: ReactNode
  className?: string
  inset?: boolean
  listClassName?: string
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
  'align' | 'inset'
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
}

type DashboardNavigationMenuLinkProps = ComponentProps<
  typeof NavigationMenuLink
>

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
  children,
  className,
  inset = true,
  listClassName,
}: DashboardNavigationProps) {
  const alignEnd = align === 'end'
  const alignAlways = alignEnd && alignMode === 'always'
  const alignResponsive = alignEnd && alignMode === 'responsive'

  return (
    <NavigationMenu
      className={cn(
        'justify-start',
        alignAlways && 'ml-auto justify-end',
        alignResponsive && 'lg:justify-end',
        inset && 'px-1',
        className,
      )}
    >
      <NavigationMenuList
        className={cn(
          dashboardNavigationListClassName,
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
  items,
  onSelect,
  ...navigationProps
}: DashboardSectionTabsProps<TTabId>) {
  return (
    <DashboardNavigation {...navigationProps}>
      {items.map((item) => (
        <NavigationMenuItem key={item.id}>
          <NavigationMenuButtonLink
            data-active={activeId === item.id || undefined}
            className="h-11 px-3.5 py-2.5 font-display text-sm font-black uppercase leading-none tracking-normal sm:px-5"
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
        className={cn(
          variant === 'section' &&
            'h-10 px-3.5 font-display text-sm font-black uppercase leading-none tracking-normal',
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
}: DashboardNavigationMenuGroupProps) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger
        data-active={active || undefined}
        className={triggerClassName}
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

export function DashboardNavigationMenuLink(
  props: DashboardNavigationMenuLinkProps,
) {
  return <NavigationMenuLink closeOnClick {...props} />
}

export function DashboardNavigationMenuButton(
  props: DashboardNavigationMenuButtonProps,
) {
  return <NavigationMenuButtonLink closeOnClick {...props} />
}

export function DashboardSectionTabGroup<TTabId extends string>({
  activeId,
  align,
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
