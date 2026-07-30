import { cn } from '#/lib/utils'

export type DashboardChrome = 'cards' | 'soft'

export function dashboardSectionClassName(
  chrome: DashboardChrome,
  className?: string,
) {
  return cn(
    chrome === 'cards' && 'app-panel bg-card p-6 md:p-7',
    chrome === 'soft' &&
      'border-y border-border-subtle bg-surface px-5 py-6 md:px-6 md:py-7',
    className,
  )
}

export function dashboardHeroClassName(chrome: DashboardChrome) {
  return cn(
    'overflow-hidden',
    chrome === 'cards' && 'app-panel-strong bg-card p-5 md:p-7',
    chrome === 'soft' &&
      'border-y border-border-subtle bg-surface px-5 py-6 md:px-7',
  )
}

export function dashboardInlinePanelClassName(
  chrome: DashboardChrome,
  className?: string,
) {
  return cn(
    chrome === 'cards' && 'app-row p-5',
    chrome === 'soft' && 'rounded-row bg-surface p-5',
    className,
  )
}

export function dashboardEmptyClassName(
  chrome: DashboardChrome,
  className?: string,
) {
  return cn(
    'text-sm text-muted-foreground',
    chrome === 'cards' && 'app-row border-dashed border-border p-5',
    chrome === 'soft' && 'app-row border-dashed border-border-subtle p-5',
    className,
  )
}
