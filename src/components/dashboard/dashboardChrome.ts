import { cn } from '#/lib/utils'

export type DashboardChrome = 'flat' | 'cards' | 'soft'

export function dashboardSectionClassName(
  chrome: DashboardChrome,
  className?: string,
) {
  return cn(
    chrome === 'flat' && 'bg-transparent',
    chrome === 'cards' && 'app-section border-border-subtle',
    chrome === 'soft' && 'app-section',
    className,
  )
}

export function dashboardHeroClassName(chrome: DashboardChrome) {
  return cn(
    'min-w-0',
    chrome === 'flat' && 'bg-transparent py-2',
    chrome === 'cards' && 'app-section border-border',
    chrome === 'soft' && 'app-section',
  )
}

export function dashboardInlinePanelClassName(
  chrome: DashboardChrome,
  className?: string,
) {
  return cn(
    chrome === 'flat' && 'bg-transparent py-4',
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
    chrome === 'flat' && 'py-4',
    chrome === 'cards' && 'rounded-row bg-surface py-4 px-5',
    chrome === 'soft' && 'py-4',
    className,
  )
}
