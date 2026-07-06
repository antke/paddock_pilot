import { formatEventDateRange } from '#/components/events/eventDisplay'
import { cn } from '#/lib/utils'
import {
  BellRingingIcon,
  ForkKnifeIcon,
  HeartbeatIcon,
  PillIcon,
  ScalesIcon,
} from '@phosphor-icons/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { eventStatusLabels, eventTypeLabels } from 'shared/events/eventSchema'
import type {
  LabTimelineOccurrence,
  LabTimelineSeriesKey,
  LabTimelineSignalKind,
} from './analysisPageLabData'
import type { Icon } from '@phosphor-icons/react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { EventType } from 'shared/events/eventSchema'
import type {
  StableTimelinePeriod,
  StableTimelineScale,
} from './stableActivityTimelineScale'
import {
  timelineSignalKindAccentColors,
  timelineSignalKindLabels,
} from './analysisTimelineSignalMeta'

type StableEventTimelineSeriesKey = Extract<
  LabTimelineSeriesKey,
  'all' | 'completed' | 'planned'
>

type StableActivityTimelineChartProps = {
  periods: Array<StableTimelinePeriod>
  occurrences: Array<LabTimelineOccurrence>
  scale: StableTimelineScale
  visibleSeries: Array<StableEventTimelineSeriesKey>
  visibleEventTypes: Array<EventType>
  selectedPeriodKey: string | null
  onPeriodSelect: (period: StableTimelinePeriod) => void
  onEventOpen: (eventId: string) => void
  className?: string
}

type TimelineEvent = LabTimelineOccurrence['event']
type TimelineEventStatus = NonNullable<TimelineEvent['status']>
type TimelineEventTypeShape =
  | 'circle'
  | 'diamond'
  | 'square'
  | 'pill'
  | 'triangle'
  | 'rhomboid'

type TimelineBlock = {
  occurrence: LabTimelineOccurrence
  occurrenceCount: number
  laneIndex: number
  startIndex: number
  endIndex: number
}

type TimelineScrollState = {
  scrollLeft: number
  clientWidth: number
  scrollWidth: number
}

const columnWidthByScale = {
  day: 24,
  week: 28,
  month: 32,
} satisfies Record<StableTimelineScale, number>

const laneHeightRem = 6.6
const blockHeightRem = 5.7
const blockInsetRem = 0.48
const minColumnZoom = 0.85
const maxColumnZoom = 2.2

const eventTypeAccents = {
  vet: 'var(--destructive)',
  training: 'var(--primary)',
  dentist: 'rgb(3 105 161)',
  hoof_trimming: 'rgb(146 64 14)',
  massage: 'rgb(6 95 70)',
  other: 'rgb(71 85 105)',
} satisfies Record<TimelineEvent['type'], string>

const timelineSignalKindIcons = {
  health: HeartbeatIcon,
  medication: PillIcon,
  nutrition: ForkKnifeIcon,
  weight: ScalesIcon,
  reminder: BellRingingIcon,
} satisfies Record<LabTimelineSignalKind, Icon>

export const stableTimelineEventTypeOptions = [
  { type: 'vet', shape: 'circle' },
  { type: 'training', shape: 'rhomboid' },
  { type: 'dentist', shape: 'diamond' },
  { type: 'hoof_trimming', shape: 'square' },
  { type: 'massage', shape: 'pill' },
  { type: 'other', shape: 'triangle' },
] as const satisfies ReadonlyArray<{
  type: EventType
  shape: TimelineEventTypeShape
}>

const scaleDescription = {
  day: 'Day columns are wide for reading individual care blocks.',
  week: 'Week columns compress the schedule to compare recurring pressure.',
  month: 'Month columns zoom out to reveal seasonal overlap patterns.',
} satisfies Record<StableTimelineScale, string>

const initialScrollState = {
  scrollLeft: 0,
  clientWidth: 0,
  scrollWidth: 0,
} satisfies TimelineScrollState

export function StableActivityTimelineChart({
  periods,
  occurrences,
  scale,
  visibleSeries,
  visibleEventTypes,
  selectedPeriodKey,
  onPeriodSelect,
  onEventOpen,
  className,
}: StableActivityTimelineChartProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const lastAutoScrolledPeriodKeyRef = useRef<string | null>(null)
  const [scrollState, setScrollState] =
    useState<TimelineScrollState>(initialScrollState)
  const [columnZoom, setColumnZoom] = useState(1)
  const todayKey = getTodayDateKey()
  const visibleOccurrences = occurrences.filter(
    (occurrence) =>
      shouldShowOccurrence(occurrence, visibleSeries) &&
      visibleEventTypes.includes(occurrence.event.type),
  )
  const baseColumnWidthRem = columnWidthByScale[scale]
  const columnWidthRem = baseColumnWidthRem * columnZoom
  const blocks = getTimelineBlocks(visibleOccurrences, periods, scale)
  const laneCount = Math.max(
    1,
    blocks.reduce((count, block) => Math.max(count, block.laneIndex + 1), 0),
  )
  const selectedPeriod =
    periods.find((period) => period.key === selectedPeriodKey) ?? null
  const selectedPeriodIndex = selectedPeriod
    ? periods.findIndex((period) => period.key === selectedPeriod.key)
    : -1
  const selectedAutoScrollKey = selectedPeriod
    ? `${scale}:${selectedPeriod.key}`
    : null
  const bodyHeightRem = Math.max(11.5, laneCount * laneHeightRem)
  const timelineWidthRem = Math.max(1, periods.length * columnWidthRem)
  const gridTemplateColumns = `repeat(${Math.max(1, periods.length)}, ${columnWidthRem}rem)`

  const updateScrollState = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const nextState = getTimelineScrollState(viewport)

    setScrollState((current) => {
      if (
        current.scrollLeft === nextState.scrollLeft &&
        current.clientWidth === nextState.clientWidth &&
        current.scrollWidth === nextState.scrollWidth
      ) {
        return current
      }

      return nextState
    })
  }, [])

  useEffect(() => {
    updateScrollState()
    window.addEventListener('resize', updateScrollState)

    return () => window.removeEventListener('resize', updateScrollState)
  }, [blocks.length, bodyHeightRem, periods.length, timelineWidthRem, updateScrollState])

  const scrollToRatio = useCallback((ratio: number) => {
    const viewport = viewportRef.current
    if (!viewport) return

    const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth)
    viewport.scrollLeft = maxScrollLeft * clamp(ratio, 0, 1)
    updateScrollState()
  }, [updateScrollState])

  const scrollToPeriod = useCallback((periodIndex: number) => {
    const viewport = viewportRef.current
    if (!viewport || viewport.clientWidth === 0 || viewport.scrollWidth === 0) {
      return false
    }

    const columnWidthPixels = getRootRemInPixels() * columnWidthRem
    const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth)
    const nextScrollLeft = clamp(
      periodIndex * columnWidthPixels - (viewport.clientWidth - columnWidthPixels) / 2,
      0,
      maxScrollLeft,
    )

    viewport.scrollLeft = nextScrollLeft
    updateScrollState()
    return true
  }, [columnWidthRem, updateScrollState])

  useEffect(() => {
    if (!selectedAutoScrollKey || selectedPeriodIndex < 0) return
    if (lastAutoScrolledPeriodKeyRef.current === selectedAutoScrollKey) return

    let nestedAnimationFrameId = 0
    const animationFrameId = requestAnimationFrame(() => {
      nestedAnimationFrameId = requestAnimationFrame(() => {
        if (scrollToPeriod(selectedPeriodIndex)) {
          lastAutoScrolledPeriodKeyRef.current = selectedAutoScrollKey
        }
      })
    })

    return () => {
      cancelAnimationFrame(animationFrameId)
      cancelAnimationFrame(nestedAnimationFrameId)
    }
  }, [
    scrollState.clientWidth,
    scrollState.scrollWidth,
    scrollToPeriod,
    selectedAutoScrollKey,
    selectedPeriodIndex,
  ])

  const resizeVisibleWindow = useCallback(
    (leftRatio: number, visibleRatio: number) => {
      const viewport = viewportRef.current
      if (!viewport || periods.length === 0) return

      const rootRemInPixels = getRootRemInPixels()
      const baseTimelineWidth = periods.length * baseColumnWidthRem * rootRemInPixels
      const nextZoom = clamp(
        viewport.clientWidth / Math.max(1, baseTimelineWidth * visibleRatio),
        minColumnZoom,
        maxColumnZoom,
      )

      setColumnZoom(nextZoom)
      requestAnimationFrame(() => scrollToRatio(leftRatio))
    },
    [baseColumnWidthRem, periods.length, scrollToRatio],
  )

  return (
    <div className={cn('grid min-h-[29rem] gap-3', className)}>
      <div className="relative overflow-hidden rounded-[1.35rem] border border-transparent bg-muted/20 shadow-inner shadow-foreground/5">
        <div
          ref={viewportRef}
          onScroll={updateScrollState}
          className="max-h-[38rem] overflow-auto"
        >
          <div
            className="relative min-w-full transition-[width] duration-300 ease-out"
            style={{ width: `${timelineWidthRem}rem` }}
          >
            <div
              className="sticky top-0 z-20 grid border-b border-border/25 bg-card/90 backdrop-blur"
              style={{ gridTemplateColumns }}
            >
              {periods.map((period) => (
                <button
                  key={period.key}
                  type="button"
                  aria-pressed={selectedPeriodKey === period.key}
                  onClick={() => onPeriodSelect(period)}
                  className={cn(
                    'relative grid min-h-20 content-center gap-1 border-r border-border/20 px-4 py-3 text-left transition-colors hover:bg-muted/60',
                    selectedPeriodKey === period.key && 'bg-primary/10 text-primary',
                  )}
                >
                  {isCurrentTimelinePeriod(period, todayKey) ? (
                    <CurrentPeriodTag scale={scale} />
                  ) : null}
                  <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {getScaleLabel(scale)}
                  </span>
                  <span className="text-sm font-semibold leading-5">
                    {period.shortLabel}
                  </span>
                  <TimelinePeriodActivityIcons period={period} />
                </button>
              ))}
            </div>

            <div
              className="relative transition-[height] duration-300 ease-out"
              style={{ height: `${bodyHeightRem}rem` }}
            >
              <div
                className="absolute inset-0 grid"
                style={{ gridTemplateColumns }}
              >
                {periods.map((period) => (
                  <button
                    key={period.key}
                    type="button"
                    tabIndex={-1}
                    aria-label={`Select ${period.label}`}
                    onClick={() => onPeriodSelect(period)}
                    className={cn(
                      'h-full border-r border-border/15 transition-colors hover:bg-muted/25',
                      selectedPeriodKey === period.key
                        ? 'bg-primary/8'
                        : getTimelinePeriodActivityCount(period) > 0
                          ? 'bg-card/20'
                          : 'bg-transparent',
                    )}
                  />
                ))}
              </div>

              {blocks.length === 0 ? (
                <p className="absolute left-4 right-4 top-6 rounded-[1.15rem] border border-dashed border-border/70 bg-card/80 p-5 text-sm leading-6 text-muted-foreground">
                  No event blocks match the selected timeline filters.
                </p>
              ) : (
                blocks.map((block) => (
                  <TimelineOccurrenceBlock
                    key={`${block.occurrence.eventId}:${block.startIndex}:${block.endIndex}`}
                    block={block}
                    columnWidthRem={columnWidthRem}
                    selectedPeriod={selectedPeriod}
                    onEventOpen={onEventOpen}
                  />
                ))
              )}
            </div>
          </div>
        </div>

      </div>

        <TimelineOverviewNavigator
          periods={periods}
          todayKey={todayKey}
          scrollState={scrollState}
        onScrollRatioChange={scrollToRatio}
        onPeriodJump={scrollToPeriod}
        onResizeVisibleWindow={resizeVisibleWindow}
      />

      <p className="text-xs leading-5 text-muted-foreground">
        {scaleDescription[scale]} Header icons summarise the event types and care
        records present in each period.
      </p>
    </div>
  )
}

function TimelineOccurrenceBlock({
  block,
  columnWidthRem,
  selectedPeriod,
  onEventOpen,
}: {
  block: TimelineBlock
  columnWidthRem: number
  selectedPeriod: StableTimelinePeriod | null
  onEventOpen: (eventId: string) => void
}) {
  const { occurrence } = block
  const event = occurrence.event
  const status = getEventStatus(event)
  const accent = eventTypeAccents[event.type]
  const selected = Boolean(
    selectedPeriod &&
      occurrence.startDate <= selectedPeriod.endKey &&
      occurrence.endDate >= selectedPeriod.startKey,
  )
  const leftRem = block.startIndex * columnWidthRem + blockInsetRem
  const widthRem = Math.max(
    6.25,
    (block.endIndex - block.startIndex + 1) * columnWidthRem - blockInsetRem * 2,
  )
  const topRem = block.laneIndex * laneHeightRem + 0.45
  const badges = [
    occurrence.durationDays > 1 ? `${occurrence.durationDays}d` : null,
    block.occurrenceCount > 1 ? `${block.occurrenceCount}x` : null,
    occurrence.isRecurring ? 'repeats' : null,
  ].filter((badge): badge is string => badge !== null)

  return (
    <button
      type="button"
      onClick={() => onEventOpen(String(occurrence.eventId))}
      className={cn(
        'absolute z-10 grid min-w-0 content-start gap-1.5 border border-transparent px-3.5 py-2.5 text-left transition-[left,top,width,height,background-color,filter] duration-300 ease-out hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        status === 'cancelled' && 'opacity-55',
        selected && 'brightness-95 saturate-150',
      )}
      style={{
        left: `${leftRem}rem`,
        top: `${topRem}rem`,
        width: `${widthRem}rem`,
        height: `${blockHeightRem}rem`,
        background: `color-mix(in oklab, ${accent} 8%, var(--card))`,
      }}
      title={`${event.title} · ${formatEventDateRange(occurrence.startDate, occurrence.endDate)}`}
    >
      <span className="flex min-w-0 items-center gap-2 text-sm font-semibold leading-5 text-foreground">
        <TimelineEventTypeIcon type={event.type} className="shrink-0" />
        <span className="truncate">{event.title}</span>
      </span>
      <span className="flex min-w-0 items-center gap-1.5 overflow-hidden text-[0.68rem] font-medium leading-4 text-muted-foreground">
        <span className="truncate">{eventTypeLabels[event.type]}</span>
        <span aria-hidden="true">·</span>
        <span>{event.time}</span>
        <span aria-hidden="true">·</span>
        <span>{eventStatusLabels[status]}</span>
      </span>
      {badges.length > 0 && (
        <span className="flex min-w-0 flex-wrap items-center gap-1.5">
          {badges.map((badge) => (
            <span
              key={badge}
              className="shrink-0 rounded-full bg-background/70 px-1.5 py-0.5 text-[0.62rem] font-semibold leading-4 text-foreground"
            >
              {badge}
            </span>
          ))}
        </span>
      )}
    </button>
  )
}

function TimelinePeriodActivityIcons({
  period,
}: {
  period: StableTimelinePeriod
}) {
  if (getTimelinePeriodActivityCount(period) === 0) return null

  const activitySummary = formatTimelinePeriodActivitySummary(period)

  return (
    <span
      title={activitySummary}
      className="flex min-w-0 flex-wrap items-center gap-1"
    >
      <span className="sr-only">{activitySummary}</span>
      {period.eventTypeCounts.map((item) => (
        <span
          key={item.type}
          aria-hidden="true"
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-background/75 px-1.5 py-0.5 text-[0.62rem] font-semibold leading-4 text-muted-foreground"
        >
          <TimelineEventTypeIcon type={item.type} className="size-3.5" />
          {item.count}
        </span>
      ))}
      {period.signalKindCounts.map((item) => (
        <span
          key={item.kind}
          aria-hidden="true"
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-background/75 px-1.5 py-0.5 text-[0.62rem] font-semibold leading-4 text-muted-foreground"
        >
          <TimelineSignalKindIcon kind={item.kind} />
          {item.count}
        </span>
      ))}
    </span>
  )
}

function TimelineSignalKindIcon({ kind }: { kind: LabTimelineSignalKind }) {
  const Icon = timelineSignalKindIcons[kind]

  return (
    <Icon
      aria-hidden="true"
      className="size-3.5 shrink-0"
      style={{ color: timelineSignalKindAccentColors[kind] }}
      weight="bold"
    />
  )
}

function CurrentPeriodTag({ scale }: { scale: StableTimelineScale }) {
  return (
    <span className="absolute right-3 top-2 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[0.62rem] font-bold uppercase leading-4 tracking-[0.12em] text-primary shadow-sm shadow-primary/5">
      {getCurrentPeriodTagLabel(scale)}
    </span>
  )
}

export function TimelineEventTypeIcon({
  type,
  className,
}: {
  type: EventType
  className?: string
}) {
  const option = stableTimelineEventTypeOptions.find((item) => item.type === type)
  const shape = option?.shape ?? 'circle'
  const color = eventTypeAccents[type]

  return (
    <span
      aria-hidden="true"
      className={cn('flex h-4 w-4 items-center justify-center', className)}
    >
      <span
        className={cn(
          'block h-3 w-3',
          shape === 'circle' && 'rounded-full',
          shape === 'diamond' && 'rotate-45 rounded-[0.18rem]',
          shape === 'square' && 'rounded-[0.16rem]',
          shape === 'pill' && 'h-2.5 w-4 rounded-full',
          shape === 'triangle' &&
            'h-0 w-0 border-x-[0.38rem] border-b-[0.68rem] border-x-transparent',
          shape === 'rhomboid' && 'skew-x-[-18deg] rounded-[0.16rem]',
        )}
        style={
          shape === 'triangle'
            ? { borderBottomColor: color }
            : { backgroundColor: color }
        }
      />
    </span>
  )
}

function TimelineOverviewNavigator({
  periods,
  todayKey,
  scrollState,
  onScrollRatioChange,
  onPeriodJump,
  onResizeVisibleWindow,
}: {
  periods: Array<StableTimelinePeriod>
  todayKey: string
  scrollState: TimelineScrollState
  onScrollRatioChange: (ratio: number) => void
  onPeriodJump: (periodIndex: number) => void
  onResizeVisibleWindow: (leftRatio: number, visibleRatio: number) => void
}) {
  const railRef = useRef<HTMLDivElement>(null)
  const windowMetrics = getOverviewWindowMetrics(scrollState)
  const todayMarkerRatio = getTodayOverviewMarkerRatio(periods, todayKey)
  const maxActivityCount = Math.max(
    1,
    ...periods.map(getTimelinePeriodActivityCount),
  )

  const handlePointerDown = (
    mode: 'move' | 'start' | 'end',
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    const rail = railRef.current
    if (!rail) return

    event.preventDefault()
    const railBounds = rail.getBoundingClientRect()
    const initialLeft = windowMetrics.leftRatio
    const initialWidth = windowMetrics.widthRatio
    const initialRight = initialLeft + initialWidth
    const pointerStartRatio = getPointerRatio(event.clientX, railBounds)

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const pointerRatio = getPointerRatio(moveEvent.clientX, railBounds)

      if (mode === 'move') {
        const nextLeft = clamp(
          initialLeft + pointerRatio - pointerStartRatio,
          0,
          1 - initialWidth,
        )
        onScrollRatioChange(getScrollRatioFromWindow(nextLeft, initialWidth))
        return
      }

      if (mode === 'start') {
        const nextLeft = clamp(pointerRatio, 0, initialRight - 0.08)
        const nextWidth = initialRight - nextLeft
        onResizeVisibleWindow(getScrollRatioFromWindow(nextLeft, nextWidth), nextWidth)
        return
      }

      const nextRight = clamp(pointerRatio, initialLeft + 0.08, 1)
      const nextWidth = nextRight - initialLeft
      onResizeVisibleWindow(
        getScrollRatioFromWindow(initialLeft, nextWidth),
        nextWidth,
      )
    }

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  return (
    <div className="grid gap-2 rounded-[1.1rem] bg-muted/20 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Timeline overview
          </p>
          <p className="text-xs leading-5 text-muted-foreground">
            Drag the window to move through the calendar; resize its edges to show
            more or fewer periods.
          </p>
        </div>
        <span className="rounded-full bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {periods.length} periods
        </span>
      </div>

      <div ref={railRef} className="relative h-14 overflow-hidden rounded-row bg-background/70">
        <div className="absolute inset-1 flex gap-0.5">
          {periods.map((period, index) => {
            const density = getTimelinePeriodActivityCount(period) / maxActivityCount

            return (
              <button
                key={period.key}
                type="button"
                title={`${period.label} · ${formatTimelinePeriodActivitySummary(period)}`}
                onClick={() => onPeriodJump(index)}
                className="min-w-1 flex-1 rounded-[0.35rem] bg-muted transition-colors hover:bg-muted-foreground/20"
                style={{ opacity: 0.28 + density * 0.62 }}
              />
            )
          })}
        </div>

        {todayMarkerRatio !== null ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-1 z-20 w-1 -translate-x-1/2 rounded-full bg-primary/80"
            style={{ left: `${todayMarkerRatio * 100}%` }}
          />
        ) : null}

        <div
          className="absolute inset-y-1 rounded-[0.65rem] bg-primary/12 ring-1 ring-primary/35 shadow-sm"
          style={{
            left: `${windowMetrics.leftRatio * 100}%`,
            width: `${windowMetrics.widthRatio * 100}%`,
          }}
        >
          <button
            type="button"
            aria-label="Resize visible timeline start"
            onPointerDown={(event) => handlePointerDown('start', event)}
            className="absolute inset-y-1 left-1 w-2 cursor-ew-resize rounded-full bg-primary/45 hover:bg-primary/65"
          />
          <button
            type="button"
            aria-label="Move visible timeline window"
            onPointerDown={(event) => handlePointerDown('move', event)}
            className="absolute inset-y-0 left-4 right-4 cursor-grab active:cursor-grabbing"
          />
          <button
            type="button"
            aria-label="Resize visible timeline end"
            onPointerDown={(event) => handlePointerDown('end', event)}
            className="absolute inset-y-1 right-1 w-2 cursor-ew-resize rounded-full bg-primary/45 hover:bg-primary/65"
          />
        </div>
      </div>
    </div>
  )
}

function getTimelineBlocks(
  occurrences: Array<LabTimelineOccurrence>,
  periods: Array<StableTimelinePeriod>,
  scale: StableTimelineScale,
): Array<TimelineBlock> {
  if (scale !== 'day') return getMergedTimelineBlocks(occurrences, periods)

  const laneEndIndexes: Array<number> = []
  const blocks: Array<TimelineBlock> = []

  for (const occurrence of occurrences) {
    const startIndex = getOccurrenceStartIndex(occurrence, periods)
    const endIndex = getOccurrenceEndIndex(occurrence, periods)

    if (startIndex === null || endIndex === null) continue

    const laneIndex = getAvailableLaneIndex(laneEndIndexes, startIndex)
    laneEndIndexes[laneIndex] = endIndex
    blocks.push({ occurrence, occurrenceCount: 1, laneIndex, startIndex, endIndex })
  }

  return blocks
}

function getMergedTimelineBlocks(
  occurrences: Array<LabTimelineOccurrence>,
  periods: Array<StableTimelinePeriod>,
): Array<TimelineBlock> {
  const blockGroups = new Map<
    string,
    {
      occurrence: LabTimelineOccurrence
      occurrenceCount: number
      startIndex: number
      endIndex: number
    }
  >()

  for (const occurrence of occurrences) {
    const startIndex = getOccurrenceStartIndex(occurrence, periods)
    const endIndex = getOccurrenceEndIndex(occurrence, periods)

    if (startIndex === null || endIndex === null) continue

    const blockKey = `${occurrence.eventId}:${startIndex}:${endIndex}`
    const existingGroup = blockGroups.get(blockKey)

    if (existingGroup) {
      existingGroup.occurrenceCount += 1
      continue
    }

    blockGroups.set(blockKey, {
      occurrence,
      occurrenceCount: 1,
      startIndex,
      endIndex,
    })
  }

  const laneEndIndexes: Array<number> = []

  return [...blockGroups.values()]
    .sort((a, b) => {
      const periodSort = a.startIndex - b.startIndex
      if (periodSort !== 0) return periodSort

      const timeSort = a.occurrence.event.time.localeCompare(b.occurrence.event.time)
      if (timeSort !== 0) return timeSort

      return a.occurrence.event.title.localeCompare(b.occurrence.event.title)
    })
    .map((group) => {
      const laneIndex = getAvailableLaneIndex(laneEndIndexes, group.startIndex)
      laneEndIndexes[laneIndex] = group.endIndex

      return { ...group, laneIndex }
    })
}

function getOccurrenceStartIndex(
  occurrence: LabTimelineOccurrence,
  periods: Array<StableTimelinePeriod>,
) {
  const startIndex = periods.findIndex(
    (period) => period.endKey >= occurrence.startDate,
  )
  return startIndex === -1 ? null : startIndex
}

function getOccurrenceEndIndex(
  occurrence: LabTimelineOccurrence,
  periods: Array<StableTimelinePeriod>,
) {
  for (let index = periods.length - 1; index >= 0; index -= 1) {
    const period = periods[index]
    if (period && period.startKey <= occurrence.endDate) return index
  }

  return null
}

function getAvailableLaneIndex(
  laneEndIndexes: Array<number>,
  startIndex: number,
) {
  const laneIndex = laneEndIndexes.findIndex((endIndex) => endIndex < startIndex)
  return laneIndex === -1 ? laneEndIndexes.length : laneIndex
}

function shouldShowOccurrence(
  occurrence: LabTimelineOccurrence,
  visibleSeries: Array<StableEventTimelineSeriesKey>,
) {
  if (visibleSeries.includes('all')) return true

  const status = getEventStatus(occurrence.event)

  if (status === 'completed') return visibleSeries.includes('completed')
  if (status === 'planned') return visibleSeries.includes('planned')

  return false
}

function getEventStatus(event: TimelineEvent): TimelineEventStatus {
  return event.status ?? 'planned'
}

function getScaleLabel(scale: StableTimelineScale) {
  if (scale === 'week') return 'Week'
  if (scale === 'month') return 'Month'
  return 'Day'
}

function getCurrentPeriodTagLabel(scale: StableTimelineScale) {
  if (scale === 'week') return 'This week'
  if (scale === 'month') return 'This month'
  return 'Today'
}

function formatTimelinePeriodActivitySummary(period: StableTimelinePeriod) {
  const eventTypeSummary = period.eventTypeCounts
    .map((item) =>
      formatCount(item.count, `${eventTypeLabels[item.type].toLowerCase()} event`),
    )
  const recordSummary = period.signalKindCounts
    .map((item) =>
      formatCount(
        item.count,
        `${timelineSignalKindLabels[item.kind].toLowerCase()} event`,
      ),
    )
  const activitySummary = [...eventTypeSummary, ...recordSummary].join(', ')
  const urgentSummary = period.urgentSignalCount > 0
    ? ` · ${formatCount(period.urgentSignalCount, 'urgent event')}`
    : ''

  return activitySummary.length > 0
    ? `${activitySummary}${urgentSummary}`
    : 'No events'
}

function formatCount(count: number, singular: string) {
  return `${count} ${singular}${count === 1 ? '' : 's'}`
}

function getTimelinePeriodActivityCount(period: StableTimelinePeriod) {
  return period.allEventCount + period.signalCount
}

function isCurrentTimelinePeriod(period: StableTimelinePeriod, todayKey: string) {
  return period.startKey <= todayKey && period.endKey >= todayKey
}

function getTodayDateKey() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getTodayOverviewMarkerRatio(
  periods: Array<StableTimelinePeriod>,
  todayKey: string,
) {
  const periodIndex = periods.findIndex(
    (period) => period.startKey <= todayKey && period.endKey >= todayKey,
  )

  if (periodIndex === -1) return null

  const period = periods[periodIndex]
  if (!period) return null

  const periodDayCount = getInclusiveDayCount(period.startKey, period.endKey)
  const todayOffset = getInclusiveDayCount(period.startKey, todayKey) - 1
  const periodProgress = clamp(
    (todayOffset + 0.5) / Math.max(1, periodDayCount),
    0,
    1,
  )

  return (periodIndex + periodProgress) / periods.length
}

function getInclusiveDayCount(startKey: string, endKey: string) {
  const startDate = new Date(`${startKey}T00:00:00`)
  const endDate = new Date(`${endKey}T00:00:00`)
  const millisecondsPerDay = 86_400_000

  return Math.max(
    1,
    Math.round((endDate.getTime() - startDate.getTime()) / millisecondsPerDay) + 1,
  )
}

function getTimelineScrollState(viewport: HTMLDivElement): TimelineScrollState {
  return {
    scrollLeft: viewport.scrollLeft,
    clientWidth: viewport.clientWidth,
    scrollWidth: viewport.scrollWidth,
  }
}

function getOverviewWindowMetrics(scrollState: TimelineScrollState) {
  if (scrollState.scrollWidth <= 0 || scrollState.clientWidth <= 0) {
    return { leftRatio: 0, widthRatio: 1 }
  }

  const widthRatio = clamp(
    scrollState.clientWidth / scrollState.scrollWidth,
    0.08,
    1,
  )
  const leftRatio = clamp(
    scrollState.scrollLeft / scrollState.scrollWidth,
    0,
    1 - widthRatio,
  )

  return { leftRatio, widthRatio }
}

function getScrollRatioFromWindow(leftRatio: number, widthRatio: number) {
  if (widthRatio >= 1) return 0
  return clamp(leftRatio / (1 - widthRatio), 0, 1)
}

function getPointerRatio(clientX: number, railBounds: DOMRect) {
  return clamp((clientX - railBounds.left) / railBounds.width, 0, 1)
}

function getRootRemInPixels() {
  return Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
