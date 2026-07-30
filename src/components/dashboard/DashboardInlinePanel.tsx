import { forwardRef } from 'react'
import type { ComponentProps } from 'react'
import { createLink } from '@tanstack/react-router'

import { cn } from '#/lib/utils'
import type { DashboardChrome } from './dashboardChrome'
import { dashboardInlinePanelClassName } from './dashboardChrome'

type DashboardInlinePanelStack = 'tight' | 'compact' | 'default' | 'loose'
type DashboardInlinePanelPadding = 'default' | 'compact' | 'tight' | 'none'
type DashboardInlinePanelTextSize = 'default' | 'sm'
type DashboardInlinePanelTone = 'default' | 'highlight'

type DashboardInlinePanelOwnProps = {
  chrome?: DashboardChrome
  padding?: DashboardInlinePanelPadding
  stack?: DashboardInlinePanelStack
  textSize?: DashboardInlinePanelTextSize
  tone?: DashboardInlinePanelTone
}

type DashboardInlinePanelProps = ComponentProps<'div'> &
  DashboardInlinePanelOwnProps

type DashboardInlinePanelButtonProps = ComponentProps<'button'> &
  DashboardInlinePanelOwnProps

type DashboardInlinePanelLinkProps = ComponentProps<'a'> &
  DashboardInlinePanelOwnProps

const dashboardInlinePanelStackClassNames = {
  tight: 'grid gap-1',
  compact: 'grid gap-2',
  default: 'grid gap-3',
  loose: 'grid gap-4',
} satisfies Record<DashboardInlinePanelStack, string>

const dashboardInlinePanelPaddingClassNames = {
  default: '',
  compact: 'p-4',
  tight: 'p-3',
  none: 'p-0',
} satisfies Record<DashboardInlinePanelPadding, string>

const dashboardInlinePanelTextSizeClassNames = {
  default: '',
  sm: 'text-sm',
} satisfies Record<DashboardInlinePanelTextSize, string>

const dashboardInlinePanelToneClassNames = {
  default: '',
  highlight: 'bg-primary/8 hover:bg-primary/12',
} satisfies Record<DashboardInlinePanelTone, string>

function dashboardInlinePanelClasses({
  chrome = 'soft',
  className,
  interactive = false,
  padding = 'default',
  stack,
  textSize = 'default',
  tone = 'default',
}: DashboardInlinePanelOwnProps & {
  className?: string
  interactive?: boolean
}) {
  return dashboardInlinePanelClassName(
    chrome,
    cn(
      stack && dashboardInlinePanelStackClassNames[stack],
      dashboardInlinePanelPaddingClassNames[padding],
      dashboardInlinePanelTextSizeClassNames[textSize],
      interactive &&
        'transition-colors hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
      dashboardInlinePanelToneClassNames[tone],
      className,
    ),
  )
}

export function DashboardInlinePanel({
  chrome = 'soft',
  className,
  padding = 'default',
  stack,
  textSize = 'default',
  tone = 'default',
  ...props
}: DashboardInlinePanelProps) {
  return (
    <div
      data-slot="dashboard-inline-panel"
      className={dashboardInlinePanelClasses({
        chrome,
        className,
        padding,
        stack,
        textSize,
        tone,
      })}
      {...props}
    />
  )
}

export function DashboardInlinePanelButton({
  chrome = 'soft',
  className,
  padding = 'default',
  stack,
  textSize = 'default',
  tone = 'default',
  type = 'button',
  ...props
}: DashboardInlinePanelButtonProps) {
  return (
    <button
      data-slot="dashboard-inline-panel"
      type={type}
      className={dashboardInlinePanelClasses({
        chrome,
        className,
        interactive: true,
        padding,
        stack,
        textSize,
        tone,
      })}
      {...props}
    />
  )
}

const DashboardInlinePanelLinkAnchor = forwardRef<
  HTMLAnchorElement,
  DashboardInlinePanelLinkProps
>(function DashboardInlinePanelLinkAnchor(
  {
    chrome = 'soft',
    className,
    padding = 'default',
    stack,
    textSize = 'default',
    tone = 'default',
    ...props
  },
  ref,
) {
  return (
    <a
      ref={ref}
      data-slot="dashboard-inline-panel"
      className={dashboardInlinePanelClasses({
        chrome,
        className,
        interactive: true,
        padding,
        stack,
        textSize,
        tone,
      })}
      {...props}
    />
  )
})

export const DashboardInlinePanelLink = createLink(
  DashboardInlinePanelLinkAnchor,
)
