import { dashboardInlinePanelClassName } from '#/components/dashboard/dashboardChrome'
import type { DashboardChrome } from '#/components/dashboard/dashboardChrome'
import { cn } from '#/lib/utils'

export function calendarShellClassName(className?: string) {
  return cn('app-panel-strong overflow-hidden text-xs', className)
}

export function calendarWeekdayRowClassName(className?: string) {
  return cn(
    'grid grid-cols-7 border-b border-border-subtle bg-surface-muted',
    className,
  )
}

export function calendarWeekdayCellClassName(className?: string) {
  return cn(
    'border-r border-border-subtle p-2 text-center font-semibold text-muted-foreground last:border-r-0',
    className,
  )
}

export function calendarGridClassName(className?: string) {
  return cn(
    'grid grid-cols-7 [&>[role=row]:last-child>[role=cell]]:border-b-0',
    className,
  )
}

export function calendarDayCellClassName({
  isSelected = false,
  isToday = false,
  muted = false,
  className,
}: {
  isSelected?: boolean
  isToday?: boolean
  muted?: boolean
  className?: string
} = {}) {
  return cn(
    'min-h-28 border-r border-b border-border-subtle last:border-r-0',
    muted ? 'bg-surface-muted' : 'bg-surface-elevated p-2.5',
    isToday && 'bg-surface-muted',
    isSelected && 'bg-selection-surface ring-2 ring-inset ring-selection',
    className,
  )
}

export function calendarMoreEventsButtonClassName(className?: string) {
  return cn(
    'app-control-focus h-auto min-h-8 w-full justify-start rounded-control border-0 bg-surface-muted px-2 py-1 text-left text-xs font-semibold text-muted-foreground hover:bg-card hover:text-foreground focus-visible:outline-none',
    className,
  )
}

export function calendarDayNumberClassName({
  isToday = false,
  className,
}: {
  isToday?: boolean
  className?: string
} = {}) {
  return cn(
    'font-medium',
    isToday && 'font-bold underline decoration-border underline-offset-4',
    className,
  )
}

export function calendarDayHeaderClassName(className?: string) {
  return cn('mb-2 flex items-center justify-between gap-2', className)
}

export function calendarDayEventListClassName(className?: string) {
  return cn('grid gap-1', className)
}

export function calendarEventChipClassName(className?: string) {
  return cn(
    'app-row group/event grid gap-0.5 border-border-subtle bg-card px-2 py-1.5 text-left text-xs text-foreground hover:border-border hover:bg-surface-muted focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
    className,
  )
}

export function calendarEventChipTitleClassName(className?: string) {
  return cn('truncate font-semibold leading-tight', className)
}

export function calendarEventChipMetaClassName(className?: string) {
  return cn('truncate text-muted-foreground', className)
}

export function calendarWeekGridClassName({
  className,
  isCompact = false,
  variant = 'selectable',
}: {
  className?: string
  isCompact?: boolean
  variant?: 'columns' | 'selectable'
} = {}) {
  return cn(
    'grid',
    variant === 'columns' && 'gap-3 md:grid-cols-7',
    variant === 'selectable' && 'gap-2',
    variant === 'selectable' && !isCompact && 'md:grid-cols-7',
    variant === 'selectable' &&
      isCompact &&
      'grid-flow-col auto-cols-[minmax(16rem,1fr)] snap-x snap-mandatory overflow-x-auto overscroll-x-contain pb-2 lg:grid-flow-row lg:auto-cols-auto lg:grid-cols-7 lg:snap-none lg:overflow-visible lg:pb-0',
    className,
  )
}

export function calendarWeekDayColumnClassName(className?: string) {
  return cn('grid snap-start content-start', className)
}

// Weekly calendar entries and their containing panels share the same paper
// surface, including when the surrounding dashboard uses flat or soft chrome.
export function calendarWeekPaperClassName(className?: string) {
  return cn('bg-card', className)
}

export function calendarWeekDayPanelClassName({
  className,
  isToday = false,
}: {
  className?: string
  isToday?: boolean
}) {
  return cn(
    'app-row content-start',
    isToday && 'border-border',
    calendarWeekPaperClassName(className),
  )
}

export function calendarWeekDayButtonClassName({
  chrome,
  className,
  isCompact = false,
  isExpanded = false,
  isSelected = false,
  isToday = false,
  showSelectedDay = false,
}: {
  chrome: DashboardChrome
  className?: string
  isCompact?: boolean
  isExpanded?: boolean
  isSelected?: boolean
  isToday?: boolean
  showSelectedDay?: boolean
}) {
  return cn(
    'text-left',
    chrome === 'flat' &&
      'rounded-control border border-transparent bg-transparent p-3 hover:bg-surface-muted',
    chrome === 'cards' && 'app-row hover:border-border hover:bg-card',
    chrome === 'soft' &&
      'rounded-control border border-transparent bg-transparent p-3 hover:bg-surface-muted',
    isCompact
      ? 'grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3'
      : 'grid min-h-28 content-between',
    isToday && 'border-border bg-surface-muted',
    isSelected &&
      'border-selection bg-selection-surface text-selection ring-1 ring-selection hover:border-selection hover:bg-selection-surface',
    showSelectedDay &&
      isExpanded &&
      (chrome === 'cards' || chrome === 'soft') &&
      'rounded-b-none',
    className,
  )
}

export function calendarWeekDayLabelClassName({
  className,
  isCompact = false,
}: {
  className?: string
  isCompact?: boolean
} = {}) {
  return cn(
    'text-sm font-semibold tracking-normal text-foreground',
    isCompact && 'order-2',
    className,
  )
}

export function calendarWeekDayNumberClassName({
  className,
  isCompact = false,
}: {
  className?: string
  isCompact?: boolean
} = {}) {
  return cn(
    'text-2xl font-semibold tabular-nums',
    isCompact && 'order-1',
    className,
  )
}

export function calendarWeekDayMetaClassName({
  className,
  isCompact = false,
}: {
  className?: string
  isCompact?: boolean
} = {}) {
  return cn(
    'text-xs font-medium text-muted-foreground',
    isCompact && 'order-3 justify-self-end',
    className,
  )
}

export function calendarSelectedDayPanelClassName({
  chrome,
  className,
}: {
  chrome: DashboardChrome
  className?: string
}) {
  return dashboardInlinePanelClassName(
    chrome,
    cn(
      'grid gap-2 rounded-t-none px-3 py-3',
      calendarWeekPaperClassName(className),
    ),
  )
}
