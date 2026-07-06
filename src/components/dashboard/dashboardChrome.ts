import { cn } from '#/lib/utils'

export type DashboardChrome = 'cards' | 'soft' | 'lines' | 'open' | 'bare'

export function dashboardSectionClassName(
  chrome: DashboardChrome,
  className?: string,
) {
  return cn(
    chrome === 'cards' &&
      'rounded-panel bg-card/80 p-6 shadow-control md:p-7',
    chrome === 'soft' && 'rounded-panel bg-muted/30 p-6 md:p-7',
    chrome === 'lines' && 'border-t border-border-subtle pt-5',
    chrome === 'open' && 'pt-5',
    chrome === 'bare' && 'pt-2',
    className,
  )
}

export function dashboardHeroClassName(chrome: DashboardChrome) {
  return cn(
    'overflow-hidden',
    chrome === 'cards' &&
      'rounded-panel bg-[linear-gradient(135deg,hsl(var(--primary)/0.12),hsl(var(--card)),hsl(var(--muted)/0.55))] p-5 shadow-control md:p-7',
    chrome === 'soft' &&
      'rounded-panel bg-[linear-gradient(135deg,hsl(var(--primary)/0.1),hsl(var(--muted)/0.45))] p-5 md:p-7',
    chrome === 'lines' && 'border-b border-border-subtle pb-6',
    chrome === 'open' && 'pb-6',
    chrome === 'bare' && 'pb-2',
  )
}

export function dashboardInlinePanelClassName(
  chrome: DashboardChrome,
  className?: string,
) {
  return cn(
    chrome === 'cards' &&
      'rounded-row bg-muted/30 p-5',
    chrome === 'soft' && 'rounded-row p-5',
    chrome === 'lines' && 'border-t border-border-subtle py-3',
    chrome === 'open' && 'py-3',
    chrome === 'bare' && 'py-2',
    className,
  )
}

export function dashboardEmptyClassName(
  chrome: DashboardChrome,
  className?: string,
) {
  return cn(
    'text-sm text-muted-foreground',
    chrome === 'cards' &&
      'rounded-row bg-muted/35 p-5',
    chrome === 'soft' && 'rounded-row bg-muted/35 p-5',
    chrome === 'lines' && 'border-t border-border-subtle py-3',
    chrome === 'open' && 'py-3',
    chrome === 'bare' && 'py-2',
    className,
  )
}
