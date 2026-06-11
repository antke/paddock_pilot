import { cn } from '#/lib/utils'
import type { DashboardLabChrome } from '../dashboardLabTypes'

export function dashboardSectionClassName(
  chrome: DashboardLabChrome,
  className?: string,
) {
  return cn(
    chrome === 'cards' &&
      'rounded-panel border border-border-subtle bg-card/80 p-5 shadow-control',
    chrome === 'soft' && 'rounded-panel bg-muted/30 p-5',
    chrome === 'lines' && 'border-t border-border-subtle pt-5',
    chrome === 'open' && 'pt-5',
    chrome === 'bare' && 'pt-2',
    className,
  )
}

export function dashboardHeroClassName(chrome: DashboardLabChrome) {
  return cn(
    'overflow-hidden',
    chrome === 'cards' &&
      'rounded-panel border border-primary/15 bg-[linear-gradient(135deg,hsl(var(--primary)/0.12),hsl(var(--card)),hsl(var(--muted)/0.55))] p-5 shadow-control md:p-7',
    chrome === 'soft' &&
      'rounded-panel bg-[linear-gradient(135deg,hsl(var(--primary)/0.1),hsl(var(--muted)/0.45))] p-5 md:p-7',
    chrome === 'lines' && 'border-b border-border-subtle pb-6',
    chrome === 'open' && 'pb-6',
    chrome === 'bare' && 'pb-2',
  )
}

export function dashboardInlinePanelClassName(
  chrome: DashboardLabChrome,
  className?: string,
) {
  return cn(
    chrome === 'cards' &&
      'rounded-row border border-border-subtle bg-muted/30 p-3',
    chrome === 'soft' && 'rounded-row bg-background/55 p-3',
    chrome === 'lines' && 'border-t border-border-subtle py-3',
    chrome === 'open' && 'py-3',
    chrome === 'bare' && 'py-2',
    className,
  )
}

export function dashboardEmptyClassName(
  chrome: DashboardLabChrome,
  className?: string,
) {
  return cn(
    'text-sm text-muted-foreground',
    chrome === 'cards' &&
      'rounded-row border border-dashed border-border-subtle p-4',
    chrome === 'soft' && 'rounded-row bg-muted/35 p-4',
    chrome === 'lines' && 'border-t border-border-subtle py-3',
    chrome === 'open' && 'py-3',
    chrome === 'bare' && 'py-2',
    className,
  )
}
