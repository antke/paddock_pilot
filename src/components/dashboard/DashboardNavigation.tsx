import { useT } from '#/i18n/LocaleProvider'
import type { ComponentProps, ReactNode } from 'react'
import { useId } from 'react'

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
  role?: 'navigation' | 'group'
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
  contentId?: string
  controlIdPrefix?: string
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
  role,
}: DashboardNavigationProps) {
  const alignEnd = align === 'end'
  const alignAlways = alignEnd && alignMode === 'always'
  const alignResponsive = alignEnd && alignMode === 'responsive'

  return (
    <NavigationMenu
      aria-label={ariaLabel}
      role={role}
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
  ariaLabel,
  items,
  onSelect,
  contentId,
  controlIdPrefix,
  ...navigationProps
}: DashboardSectionTabsProps<TTabId>) {
  const t = useT()

  return (
    <DashboardNavigation
      ariaLabel={ariaLabel ?? t('listControls.sectionViews')}
      role="group"
      {...navigationProps}
    >
      {items.map((item) => (
        <NavigationMenuItem key={item.id}>
          <NavigationMenuButtonLink
            data-active={activeId === item.id || undefined}
            aria-pressed={activeId === item.id}
            aria-controls={contentId}
            id={controlIdPrefix ? `${controlIdPrefix}-${item.id}` : undefined}
            className="h-11 shrink-0 px-3.5 py-2.5 text-base font-semibold whitespace-nowrap leading-tight sm:px-5"
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
            'h-10 shrink-0 px-3.5 text-base font-semibold whitespace-nowrap leading-tight',
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
            'h-10 shrink-0 px-3.5 text-base font-semibold whitespace-nowrap leading-tight',
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
        variant === 'section' && 'text-sm font-semibold',
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
  const id = useId()
  const contentId = `${id}-content`
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
        controlIdPrefix={id}
        contentId={contentId}
      />

      <div
        id={contentId}
        role="region"
        aria-labelledby={`${id}-${activeId}`}
        className="grid min-w-0 gap-3"
      >
        {children}
      </div>
    </div>
  )
}
