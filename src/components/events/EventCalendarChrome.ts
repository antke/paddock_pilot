import { dashboardInlinePanelClassName } from '#/components/dashboard/dashboardChrome'
import type { DashboardChrome } from '#/components/dashboard/dashboardChrome'
import { cn } from '#/lib/utils'

export function calendarShellClassName(className?: string) {
  return cn('app-panel overflow-hidden text-xs', className)
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
  return cn('grid grid-cols-7', className)
}

export function calendarDayCellClassName({
  isToday = false,
  muted = false,
  className,
}: {
  isToday?: boolean
  muted?: boolean
  className?: string
} = {}) {
  return cn(
    'min-h-28 border-r border-b border-border-subtle last:border-r-0',
    muted ? 'bg-surface-muted' : 'bg-surface-elevated p-2.5',
    isToday && 'bg-primary/8 ring-1 ring-inset ring-primary/25',
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
  return cn('font-medium', isToday && 'text-primary', className)
}

export function calendarDayHeaderClassName(className?: string) {
  return cn('mb-2 flex items-center justify-between gap-2', className)
}

export function calendarDayEventListClassName(className?: string) {
  return cn('grid gap-1', className)
}

export function calendarEventChipClassName(className?: string) {
  return cn(
    'app-row group/event grid gap-0.5 border-primary/20 bg-card px-2 py-1.5 text-left text-[0.72rem] text-foreground hover:border-primary/40 hover:bg-primary/10 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:outline-none',
    className,
  )
}

export function calendarEventChipTitleClassName(className?: string) {
  return cn('truncate font-semibold leading-tight', className)
}

export function calendarEventChipMetaClassName(className?: string) {
  return cn('truncate text-muted-foreground', className)
}

export function calendarMutedPillClassName(className?: string) {
  return cn(
    'app-row rounded-control border-0 bg-surface-muted px-2 py-1 text-[0.7rem] font-medium text-muted-foreground',
    className,
  )
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
    className,
  )
}

export function calendarWeekDayColumnClassName(className?: string) {
  return cn('grid content-start', className)
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
    isToday && 'border-primary/30 bg-primary/8',
    className,
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
    chrome === 'cards' && 'app-row hover:border-primary/30 hover:bg-card',
    chrome === 'soft' && 'app-row hover:border-primary/25 hover:bg-card',
    isCompact
      ? 'grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3'
      : 'grid min-h-28 content-between',
    isToday && 'border-primary/25 bg-primary/8 text-primary',
    isSelected && 'border-primary/45 bg-primary/10 ring-1 ring-primary/20',
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
  return cn('text-2xl font-semibold', isCompact && 'order-1', className)
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

export function calendarEventPopoverClassName(className?: string) {
  return cn(
    'app-panel-strong z-50 grid w-72 origin-(--transform-origin) gap-3 p-5 text-sm text-popover-foreground outline-none data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
    className,
  )
}

export function calendarEventPopoverHeaderClassName(className?: string) {
  return cn('grid gap-1', className)
}

export function calendarEventPopoverTitleClassName(className?: string) {
  return cn('font-semibold tracking-normal', className)
}

export function calendarEventPopoverTextClassName(className?: string) {
  return cn('text-muted-foreground', className)
}

export function calendarEventPopoverDescriptionClassName(className?: string) {
  return cn('line-clamp-3 text-muted-foreground', className)
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
    cn('grid gap-2 rounded-t-none px-3 py-3', className),
  )
}
