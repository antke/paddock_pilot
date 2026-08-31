import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardBadgeList } from '#/components/dashboard/DashboardBadgeList'
import { DashboardInlinePanel } from '#/components/dashboard/DashboardInlinePanel'
import { DashboardItemRecordContent } from '#/components/dashboard/DashboardItemCard'
import type {
  DashboardItemAccent,
  DashboardItemRecordContentProps,
} from '#/components/dashboard/DashboardItemCard'
import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils'
import type { ComponentProps, ReactNode } from 'react'

type ActivityTimelineSelectedProps = {
  selected?: boolean
}

type ActivityTimelineActivityProps = {
  hasActivity?: boolean
}

type ActivityTimelineEventBlockProps = ComponentProps<'button'> &
  ActivityTimelineSelectedProps & {
    accentColor: string
    muted?: boolean
  }

type ActivityTimelineOverviewPeriodProps = ComponentProps<'button'> & {
  density: number
}

type ActivityTimelineWindowHandleProps = ComponentProps<'button'> & {
  edge: 'start' | 'end'
}

type ActivityTimelineListEntryProps = Omit<
  DashboardItemRecordContentProps,
  'titleSize'
> & {
  accent?: DashboardItemAccent
  badges?: ReactNode
}

export function ActivityTimelineRoot({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      data-slot="activity-timeline-root"
      className={cn(
        'grid min-h-[29rem] min-w-0 gap-3 overflow-hidden',
        className,
      )}
      {...props}
    />
  )
}

export function ActivityTimelineViewportPanel({
  className,
  ...props
}: ComponentProps<typeof DashboardInlinePanel>) {
  return (
    <DashboardInlinePanel
      data-slot="activity-timeline-viewport"
      chrome="soft"
      padding="none"
      className={cn('relative min-w-0 overflow-hidden', className)}
      {...props}
    />
  )
}

export function ActivityTimelineScrollArea({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      data-slot="activity-timeline-scroll-area"
      className={cn(
        'max-h-[38rem] w-full min-w-0 overflow-auto overscroll-x-contain [contain:layout_paint]',
        className,
      )}
      {...props}
    />
  )
}

export function ActivityTimelineCanvas({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      data-slot="activity-timeline-canvas"
      className={cn(
        'relative min-w-full transition-[width] duration-300 ease-out',
        className,
      )}
      {...props}
    />
  )
}

export function ActivityTimelineHeaderRow({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      data-slot="activity-timeline-header-row"
      className={cn(
        'sticky top-0 z-20 grid border-b border-border-subtle bg-card backdrop-blur',
        className,
      )}
      {...props}
    />
  )
}

export function ActivityTimelinePeriodButton({
  className,
  selected,
  ...props
}: ComponentProps<'button'> & ActivityTimelineSelectedProps) {
  return (
    <button
      data-slot="activity-timeline-period-button"
      type="button"
      aria-pressed={selected}
      className={cn(
        'relative grid min-h-20 content-center gap-1 border-r border-border/20 px-4 py-3 text-left transition-colors hover:bg-primary/8',
        selected && 'bg-primary/10 text-primary',
        className,
      )}
      {...props}
    />
  )
}

export function ActivityTimelinePeriodLabel({
  className,
  ...props
}: ComponentProps<'span'>) {
  return (
    <span
      className={cn('text-sm font-semibold leading-5', className)}
      {...props}
    />
  )
}

export function ActivityTimelineCurrentPeriodBadge({
  className,
  ...props
}: Omit<ComponentProps<typeof Badge>, 'size'>) {
  return (
    <Badge
      variant="success"
      size="micro"
      className={cn('absolute right-3 top-2 font-bold uppercase', className)}
      {...props}
    />
  )
}

export function ActivityTimelineBody({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'relative transition-[height] duration-300 ease-out',
        className,
      )}
      {...props}
    />
  )
}

export function ActivityTimelineGrid({
  className,
  ...props
}: ComponentProps<'div'>) {
  return <div className={cn('absolute inset-0 grid', className)} {...props} />
}

export function ActivityTimelineGridPeriodButton({
  className,
  selected,
  hasActivity,
  ...props
}: ComponentProps<'button'> &
  ActivityTimelineSelectedProps &
  ActivityTimelineActivityProps) {
  return (
    <button
      data-slot="activity-timeline-grid-period-button"
      type="button"
      tabIndex={-1}
      className={cn(
        'h-full border-r border-border/15 transition-colors hover:bg-primary/6',
        selected
          ? 'bg-primary/8'
          : hasActivity
            ? 'bg-surface-elevated'
            : 'bg-transparent',
        className,
      )}
      {...props}
    />
  )
}

export function ActivityTimelineEventBlock({
  accentColor,
  className,
  muted,
  selected,
  style,
  ...props
}: ActivityTimelineEventBlockProps) {
  return (
    <button
      data-slot="activity-timeline-event-block"
      type="button"
      className={cn(
        'absolute z-10 grid min-w-0 content-start gap-1.5 rounded-row border border-border-subtle px-3.5 py-2.5 text-left transition-[left,top,width,height,border-color,filter] duration-300 ease-out hover:border-primary/30 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        muted && 'opacity-55',
        selected && 'border-primary/35 brightness-95 saturate-150',
        className,
      )}
      style={{
        background: `color-mix(in oklab, ${accentColor} 8%, var(--card))`,
        ...style,
      }}
      {...props}
    />
  )
}

export function ActivityTimelineEmptyState({
  className,
  ...props
}: ComponentProps<typeof DashboardEmptyState>) {
  return (
    <DashboardEmptyState
      chrome="soft"
      className={cn('absolute left-4 right-4 top-6', className)}
      {...props}
    />
  )
}

export function ActivityTimelineEventTitle({
  className,
  ...props
}: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'flex min-w-0 items-center gap-2 text-sm font-semibold leading-5 text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function ActivityTimelineEventText({
  className,
  ...props
}: ComponentProps<'span'>) {
  return <span className={cn('truncate', className)} {...props} />
}

export function ActivityTimelineEventBadgeRow({
  className,
  ...props
}: ComponentProps<'span'>) {
  return (
    <span
      className={cn('flex min-w-0 flex-wrap items-center gap-1.5', className)}
      {...props}
    />
  )
}

export function ActivityTimelineActivitySummary({
  className,
  ...props
}: ComponentProps<'span'>) {
  return (
    <span
      className={cn('flex min-w-0 flex-wrap items-center gap-1', className)}
      {...props}
    />
  )
}

export function ActivityTimelineCaption({
  className,
  ...props
}: ComponentProps<'p'>) {
  return (
    <p
      className={cn('text-xs leading-5 text-muted-foreground', className)}
      {...props}
    />
  )
}

export function ActivityTimelineListEntry({
  accent = 'primary',
  badges,
  children,
  ...props
}: ActivityTimelineListEntryProps) {
  return (
    <div
      data-slot="activity-timeline-list-entry"
      data-accent={accent}
      className="grid grid-cols-[1.5rem_minmax(0,1fr)] overflow-hidden rounded-row border border-border bg-surface-elevated"
    >
      <div
        className="relative flex justify-center bg-surface-muted/65"
        aria-hidden={true}
      >
        <span className="absolute inset-y-0 w-px bg-border" />
        <span
          className={cn(
            'relative mt-[1.35rem] size-2.5 rounded-full border-2 border-background',
            accent === 'primary' && 'bg-primary',
            accent === 'warning' && 'bg-chart-3',
            accent === 'danger' && 'bg-destructive',
            accent === 'muted' && 'bg-muted-foreground',
            accent === 'none' && 'bg-border',
          )}
        />
      </div>

      <div className="grid min-w-0 gap-2 p-4 sm:p-5">
        {badges && <DashboardBadgeList>{badges}</DashboardBadgeList>}
        <DashboardItemRecordContent titleSize="dense" {...props}>
          {children}
        </DashboardItemRecordContent>
      </div>
    </div>
  )
}

export function ActivityTimelineOverviewPanel({
  className,
  ...props
}: ComponentProps<typeof DashboardInlinePanel>) {
  return (
    <DashboardInlinePanel
      data-slot="activity-timeline-overview-panel"
      chrome="soft"
      padding="tight"
      stack="compact"
      className={className}
      {...props}
    />
  )
}

export function ActivityTimelineOverviewRail({
  className,
  ...props
}: ComponentProps<typeof DashboardInlinePanel>) {
  return (
    <DashboardInlinePanel
      data-slot="activity-timeline-overview-rail"
      chrome="soft"
      padding="none"
      className={cn('relative h-14 overflow-hidden', className)}
      {...props}
    />
  )
}

export function ActivityTimelineOverviewTrack({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      data-slot="activity-timeline-overview-track"
      className={cn('absolute inset-1 flex gap-0.5', className)}
      {...props}
    />
  )
}

export function ActivityTimelineOverviewPeriodButton({
  className,
  density,
  style,
  ...props
}: ActivityTimelineOverviewPeriodProps) {
  return (
    <button
      data-slot="activity-timeline-overview-period-button"
      type="button"
      className={cn(
        'min-w-1 flex-1 rounded-[0.35rem] bg-secondary transition-colors hover:bg-primary/18',
        className,
      )}
      style={{ opacity: 0.28 + density * 0.62, ...style }}
      {...props}
    />
  )
}

export function ActivityTimelineTodayMarker({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      data-slot="activity-timeline-today-marker"
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-y-1 z-20 w-1 -translate-x-1/2 rounded-full bg-primary/80',
        className,
      )}
      {...props}
    />
  )
}

export function ActivityTimelineWindow({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      data-slot="activity-timeline-window"
      className={cn(
        'absolute inset-y-1 rounded-row border border-primary/35 bg-primary/12',
        className,
      )}
      {...props}
    />
  )
}

export function ActivityTimelineWindowHandle({
  className,
  edge,
  ...props
}: ActivityTimelineWindowHandleProps) {
  return (
    <button
      data-slot="activity-timeline-window-handle"
      type="button"
      className={cn(
        'absolute inset-y-1 z-10 w-2 cursor-ew-resize rounded-full bg-primary/45 outline-none after:absolute after:-inset-x-[18px] after:-inset-y-1 hover:bg-primary/65 focus-visible:ring-2 focus-visible:ring-ring',
        edge === 'start' ? 'left-1' : 'right-1',
        className,
      )}
      {...props}
    />
  )
}

export function ActivityTimelineWindowDrag({
  className,
  ...props
}: ComponentProps<'button'>) {
  return (
    <button
      data-slot="activity-timeline-window-drag"
      type="button"
      className={cn(
        'absolute inset-y-0 left-4 right-4 cursor-grab rounded-control outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing',
        className,
      )}
      {...props}
    />
  )
}
