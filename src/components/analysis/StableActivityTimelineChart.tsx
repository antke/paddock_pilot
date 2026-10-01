import { useT, useLocale } from '#/i18n/LocaleProvider'
import type { Locale } from 'shared/i18n/locale'
import { localeInstances } from '#/i18n/resources'
import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { Button } from '#/components/ui/button'
import {
  getOverviewWindowMetrics,
  getScrollRatioFromWindow,
  getTimelineViewportCenter,
  getCenteredTimelineScrollLeft,
  getNextTimelineZoom,
  minTimelineColumnZoom,
  maxTimelineColumnZoom,
} from './timelineOverviewGeometry'
import type { TimelineScrollState } from './timelineOverviewGeometry'
import { DashboardInlineHeader } from '#/components/dashboard/DashboardInlineHeader'
import { DashboardMetaList } from '#/components/dashboard/DashboardMetaList'
import { formatEventDateRange } from '#/components/events/eventDisplay'
import {
  ActivityTimelineBody,
  ActivityTimelineActivitySummary,
  ActivityTimelineCanvas,
  ActivityTimelineCaption,
  ActivityTimelineCurrentPeriodBadge,
  ActivityTimelineEmptyState,
  ActivityTimelineEventBadgeRow,
  ActivityTimelineEventBlock,
  ActivityTimelineEventText,
  ActivityTimelineEventTitle,
  ActivityTimelineGrid,
  ActivityTimelineGridPeriodButton,
  ActivityTimelineHeaderRow,
  ActivityTimelineOverviewPanel,
  ActivityTimelineOverviewPeriodButton,
  ActivityTimelineOverviewRail,
  ActivityTimelineOverviewTrack,
  ActivityTimelinePeriodButton,
  ActivityTimelinePeriodLabel,
  ActivityTimelineRoot,
  ActivityTimelineScrollArea,
  ActivityTimelineTodayMarker,
  ActivityTimelineViewportPanel,
  ActivityTimelineWindow,
  ActivityTimelineWindowDrag,
} from '#/components/timeline/ActivityTimeline'
import { Badge } from '#/components/ui/badge'
import { TextLabel, textLabelVariants } from '#/components/ui/text-label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { dateKeyToDate, getTodayDateKey } from '#/lib/dateDisplay'
import { cn } from '#/lib/utils'
import {
  BellRingingIcon,
  ForkKnifeIcon,
  HeartbeatIcon,
  PillIcon,
  ScalesIcon,
} from '@phosphor-icons/react'
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import type {
  LabTimelineOccurrence,
  LabTimelineSeriesKey,
  LabTimelineSignalKind,
} from './analysisCentreData'
import type { Icon } from '@phosphor-icons/react'
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'
import type { EventType } from 'shared/events/eventSchema'
import type {
  StableTimelinePeriod,
  StableTimelineScale,
} from './stableActivityTimelineScale'
import { timelineSignalKindAccentColors } from './analysisTimelineSignalMeta'

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
  'circle' | 'diamond' | 'square' | 'pill' | 'triangle' | 'rhomboid'

type TimelineBlock = {
  occurrence: LabTimelineOccurrence
  occurrenceCount: number
  laneIndex: number
  startIndex: number
  endIndex: number
}

const columnWidthByScale = {
  day: 24,
  week: 28,
  month: 32,
} satisfies Record<StableTimelineScale, number>

const laneHeightRem = 6.6
const blockHeightRem = 5.7
const blockInsetRem = 0.48

const eventTypeAccents = {
  competition: 'var(--chart-3)',
  vet: 'var(--destructive)',
  training: 'var(--primary)',
  dentist: 'var(--chart-1)',
  hoof_trimming: 'var(--chart-4)',
  massage: 'var(--chart-2)',
  other: 'var(--muted-foreground)',
} satisfies Record<TimelineEvent['type'], string>

const timelineSignalKindIcons = {
  health: HeartbeatIcon,
  medication: PillIcon,
  nutrition: ForkKnifeIcon,
  weight: ScalesIcon,
  reminder: BellRingingIcon,
} satisfies Record<LabTimelineSignalKind, Icon>

export const stableTimelineEventTypeOptions = [
  { type: 'competition', shape: 'diamond' },
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

function getScaleDescriptions(locale: Locale) {
  const t = localeInstances[locale].t
  const scaleDescription = {
    day: t('analysisViews.dayDescription'),
    week: t('analysisViews.weekDescription'),
    month: t('analysisViews.monthDescription'),
  } satisfies Record<StableTimelineScale, string>

  return scaleDescription
}
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
  const t = useT()
  const { locale } = useLocale()

  const viewportRef = useRef<HTMLDivElement>(null)
  const periodButtons = useRef(new Map<string, HTMLButtonElement>())
  const lastAutoScrolledPeriodKeyRef = useRef<string | null>(null)
  const [scrollState, setScrollState] =
    useState<TimelineScrollState>(initialScrollState)
  const [columnZoom, setColumnZoom] = useState(1)
  const pendingZoomCenter = useRef<number | null>(null)
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
  }, [
    blocks.length,
    bodyHeightRem,
    periods.length,
    timelineWidthRem,
    updateScrollState,
  ])

  const scrollToRatio = useCallback(
    (ratio: number) => {
      const viewport = viewportRef.current
      if (!viewport) return

      const maxScrollLeft = Math.max(
        0,
        viewport.scrollWidth - viewport.clientWidth,
      )
      viewport.scrollLeft = maxScrollLeft * clamp(ratio, 0, 1)
      updateScrollState()
    },
    [updateScrollState],
  )

  const scrollToPeriod = useCallback(
    (periodIndex: number) => {
      const viewport = viewportRef.current
      if (
        !viewport ||
        viewport.clientWidth === 0 ||
        viewport.scrollWidth === 0
      ) {
        return false
      }

      const columnWidthPixels = getRootRemInPixels() * columnWidthRem
      const maxScrollLeft = Math.max(
        0,
        viewport.scrollWidth - viewport.clientWidth,
      )
      const nextScrollLeft = clamp(
        periodIndex * columnWidthPixels -
          (viewport.clientWidth - columnWidthPixels) / 2,
        0,
        maxScrollLeft,
      )

      viewport.scrollLeft = nextScrollLeft
      updateScrollState()
      return true
    },
    [columnWidthRem, updateScrollState],
  )

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

  const changeZoom = (direction: -1 | 1) => {
    const viewport = viewportRef.current
    if (!viewport) return
    pendingZoomCenter.current = getTimelineViewportCenter(
      getTimelineScrollState(viewport),
    )
    setColumnZoom((current) => getNextTimelineZoom(current, direction))
  }

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || pendingZoomCenter.current === null) return
    viewport.scrollLeft = getCenteredTimelineScrollLeft(
      pendingZoomCenter.current,
      getTimelineScrollState(viewport),
    )
    pendingZoomCenter.current = null
    updateScrollState()
  }, [columnZoom, updateScrollState])

  return (
    <ActivityTimelineRoot className={className}>
      <ActivityTimelineViewportPanel>
        <ActivityTimelineScrollArea
          ref={viewportRef}
          role="region"
          aria-label={t('analysisViews.calendar')}
          tabIndex={0}
          onScroll={updateScrollState}
        >
          <ActivityTimelineCanvas style={{ width: `${timelineWidthRem}rem` }}>
            <ActivityTimelineHeaderRow
              role="group"
              aria-label={t('analysisViews.periodNavigation')}
              style={{ gridTemplateColumns }}
            >
              {periods.map((period, index) => (
                <ActivityTimelinePeriodButton
                  key={period.key}
                  ref={(button) => {
                    if (button) periodButtons.current.set(period.key, button)
                    else periodButtons.current.delete(period.key)
                  }}
                  tabIndex={index === Math.max(0, selectedPeriodIndex) ? 0 : -1}
                  onKeyDown={(event) => {
                    const nextIndex =
                      event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                          ? periods.length - 1
                          : event.key === 'ArrowLeft'
                            ? Math.max(0, index - 1)
                            : event.key === 'ArrowRight'
                              ? Math.min(periods.length - 1, index + 1)
                              : null
                    if (nextIndex === null) return
                    event.preventDefault()
                    const nextPeriod = periods[nextIndex]
                    onPeriodSelect(nextPeriod)
                    periodButtons.current
                      .get(nextPeriod.key)
                      ?.focus({ preventScroll: true })
                    scrollToPeriod(nextIndex)
                  }}
                  selected={selectedPeriodKey === period.key}
                  onClick={() => onPeriodSelect(period)}
                >
                  {isCurrentTimelinePeriod(period, todayKey) ? (
                    <CurrentPeriodTag scale={scale} />
                  ) : null}
                  <TextLabel size="micro" weight="semibold">
                    {getScaleLabel(scale, locale)}
                  </TextLabel>
                  <ActivityTimelinePeriodLabel>
                    {period.shortLabel}
                  </ActivityTimelinePeriodLabel>
                  <TimelinePeriodActivityIcons period={period} />
                </ActivityTimelinePeriodButton>
              ))}
            </ActivityTimelineHeaderRow>

            <ActivityTimelineBody style={{ height: `${bodyHeightRem}rem` }}>
              <ActivityTimelineGrid style={{ gridTemplateColumns }}>
                {periods.map((period) => (
                  <ActivityTimelineGridPeriodButton
                    key={period.key}
                    aria-label={t('analysisViews.selectPeriod', {
                      period: period.label,
                    })}
                    onClick={() => onPeriodSelect(period)}
                    selected={selectedPeriodKey === period.key}
                    hasActivity={getTimelinePeriodActivityCount(period) > 0}
                  />
                ))}
              </ActivityTimelineGrid>

              {blocks.length === 0 ? (
                <ActivityTimelineEmptyState>
                  {occurrences.length === 0
                    ? t('analysisViews.noScheduled')
                    : t('analysisViews.noFilteredEvents')}
                </ActivityTimelineEmptyState>
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
            </ActivityTimelineBody>
          </ActivityTimelineCanvas>
        </ActivityTimelineScrollArea>
      </ActivityTimelineViewportPanel>

      <TimelineOverviewNavigator
        periods={periods}
        todayKey={todayKey}
        scrollState={scrollState}
        onScrollRatioChange={scrollToRatio}
        onPeriodJump={scrollToPeriod}
        columnZoom={columnZoom}
        onZoomChange={changeZoom}
      />

      <ActivityTimelineCaption>
        {getScaleDescriptions(locale)[scale]}{' '}
        {t('analysisViews.headerIconsHelp')}
      </ActivityTimelineCaption>
    </ActivityTimelineRoot>
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
  const t = useT()
  const { locale } = useLocale()

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
    (block.endIndex - block.startIndex + 1) * columnWidthRem -
      blockInsetRem * 2,
  )
  const topRem = block.laneIndex * laneHeightRem + 0.45
  const badges = [
    occurrence.durationDays > 1
      ? t('analysisViews.shortDays', { count: occurrence.durationDays })
      : null,
    block.occurrenceCount > 1 ? `${block.occurrenceCount}x` : null,
    occurrence.isRecurring ? t('analysisViews.repeatBadge') : null,
  ].filter((badge): badge is string => badge !== null)

  return (
    <ActivityTimelineEventBlock
      accentColor={accent}
      onClick={() => onEventOpen(String(occurrence.eventId))}
      muted={status === 'cancelled'}
      selected={selected}
      style={{
        left: `${leftRem}rem`,
        top: `${topRem}rem`,
        width: `${widthRem}rem`,
        height: `${blockHeightRem}rem`,
      }}
      title={`${event.title} · ${formatEventDateRange(occurrence.startDate, occurrence.endDate, locale)}`}
    >
      <ActivityTimelineEventTitle>
        <TimelineEventTypeIcon type={event.type} className="shrink-0" />
        <ActivityTimelineEventText>{event.title}</ActivityTimelineEventText>
      </ActivityTimelineEventTitle>
      <DashboardMetaList
        size="micro"
        gap="compact"
        separator="dot"
        className="min-w-0 overflow-hidden"
      >
        <span className="truncate">{t(`events.types.${event.type}`)}</span>
        <span>{event.time}</span>
        <span>{t(`calendar.${status}`)}</span>
      </DashboardMetaList>
      {badges.length > 0 && (
        <ActivityTimelineEventBadgeRow>
          {badges.map((badge) => (
            <Badge key={badge} variant="outline" size="micro">
              {badge}
            </Badge>
          ))}
        </ActivityTimelineEventBadgeRow>
      )}
    </ActivityTimelineEventBlock>
  )
}

function TimelinePeriodActivityIcons({
  period,
}: {
  period: StableTimelinePeriod
}) {
  const t = useT()
  const { locale } = useLocale()

  if (getTimelinePeriodActivityCount(period) === 0) return null

  const activitySummary = formatTimelinePeriodActivitySummary(period, locale)

  return (
    <ActivityTimelineActivitySummary title={activitySummary}>
      <span className="sr-only">{activitySummary}</span>
      {period.eventTypeCounts.map((item) => {
        const label = t(`events.types.${item.type}`)

        return (
          <Tooltip key={item.type}>
            <TooltipTrigger
              render={
                <Badge
                  variant="neutral"
                  size="micro"
                  aria-label={`${label}: ${item.count}`}
                />
              }
            >
              <TimelineEventTypeIcon type={item.type} className="size-3.5" />
              {item.count}
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        )
      })}
      {period.signalKindCounts.map((item) => {
        const label = t(`analysisViews.${item.kind}`)

        return (
          <Tooltip key={item.kind}>
            <TooltipTrigger
              render={
                <Badge
                  variant="neutral"
                  size="micro"
                  aria-label={`${label}: ${item.count}`}
                />
              }
            >
              <TimelineSignalKindIcon kind={item.kind} />
              {item.count}
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        )
      })}
    </ActivityTimelineActivitySummary>
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
  const { locale } = useLocale()

  return (
    <ActivityTimelineCurrentPeriodBadge>
      {getCurrentPeriodTagLabel(scale, locale)}
    </ActivityTimelineCurrentPeriodBadge>
  )
}

export function TimelineEventTypeIcon({
  type,
  className,
}: {
  type: EventType
  className?: string
}) {
  const option = stableTimelineEventTypeOptions.find(
    (item) => item.type === type,
  )
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
  columnZoom,
  onZoomChange,
}: {
  periods: Array<StableTimelinePeriod>
  todayKey: string
  scrollState: TimelineScrollState
  onScrollRatioChange: (ratio: number) => void
  onPeriodJump: (periodIndex: number) => void
  columnZoom: number
  onZoomChange: (direction: -1 | 1) => void
}) {
  const t = useT()
  const { locale } = useLocale()

  const rangeId = useId()
  const railRef = useRef<HTMLDivElement>(null)
  const cancelDrag = useRef<(() => void) | null>(null)
  useEffect(() => () => cancelDrag.current?.(), [columnZoom, periods.length])
  const windowMetrics = getOverviewWindowMetrics(scrollState)
  const todayMarkerRatio = getTodayOverviewMarkerRatio(periods, todayKey)
  const maxActivityCount = Math.max(
    1,
    ...periods.map(getTimelinePeriodActivityCount),
  )

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    const rail = railRef.current
    if (!rail || event.button !== 0) return

    event.preventDefault()
    cancelDrag.current?.()
    const railBounds = rail.getBoundingClientRect()
    const initialLeft = windowMetrics.leftRatio
    const initialWidth = windowMetrics.widthRatio
    const pointerStartRatio = getPointerRatio(event.clientX, railBounds)

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const pointerRatio = getPointerRatio(moveEvent.clientX, railBounds)

      const nextLeft = clamp(
        initialLeft + pointerRatio - pointerStartRatio,
        0,
        1 - initialWidth,
      )
      onScrollRatioChange(getScrollRatioFromWindow(nextLeft, initialWidth))
    }

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
      cancelDrag.current = null
    }

    cancelDrag.current = handlePointerUp
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
  }

  const handleWindowKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return

    event.preventDefault()
    const direction = event.key === 'ArrowLeft' ? -1 : 1
    const step = Math.max(1 / Math.max(periods.length, 1), 0.02)
    const initialLeft = windowMetrics.leftRatio
    const initialWidth = windowMetrics.widthRatio

    const nextLeft = clamp(initialLeft + direction * step, 0, 1 - initialWidth)
    onScrollRatioChange(getScrollRatioFromWindow(nextLeft, initialWidth))
  }
  const firstVisible = Math.min(
    periods.length,
    Math.floor(windowMetrics.leftRatio * periods.length) + 1,
  )
  const lastVisible = Math.min(
    periods.length,
    Math.ceil(
      (windowMetrics.leftRatio + windowMetrics.widthRatio) * periods.length,
    ),
  )

  return (
    <ActivityTimelineOverviewPanel>
      <DashboardInlineHeader
        title={t('analysisViews.overview')}
        description={t('analysisViews.overviewHelp')}
        aside={
          <Badge variant="neutral">
            {t('analysisViews.periodCount', { count: periods.length })}
          </Badge>
        }
        titleClassName={textLabelVariants({
          size: 'xs',
          weight: 'semibold',
          tracking: 'tight',
        })}
        descriptionSize="xs"
        descriptionClassName="leading-5"
      />

      <DashboardActions align="start">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={columnZoom >= maxTimelineColumnZoom}
          onClick={() => onZoomChange(1)}
          aria-describedby={rangeId}
        >
          {t('analysisViews.zoomIn')}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={columnZoom <= minTimelineColumnZoom}
          onClick={() => onZoomChange(-1)}
          aria-describedby={rangeId}
        >
          {t('analysisViews.zoomOut')}
        </Button>
        <span
          id={rangeId}
          role="status"
          className="text-sm text-muted-foreground"
        >
          {periods.length
            ? t('analysisViews.visibleColumns', {
                first: firstVisible,
                last: lastVisible,
                total: periods.length,
              })
            : t('analysisViews.noColumns')}{' '}
          {t('analysisViews.columnZoom', {
            percent: Math.round(columnZoom * 100),
          })}
        </span>
      </DashboardActions>

      <ActivityTimelineOverviewRail ref={railRef}>
        <ActivityTimelineOverviewTrack>
          {periods.map((period, index) => {
            const density =
              getTimelinePeriodActivityCount(period) / maxActivityCount

            return (
              <ActivityTimelineOverviewPeriodButton
                key={period.key}
                tabIndex={-1}
                title={`${period.label} · ${formatTimelinePeriodActivitySummary(period, locale)}`}
                onClick={() => onPeriodJump(index)}
                density={density}
              />
            )
          })}
        </ActivityTimelineOverviewTrack>

        {todayMarkerRatio !== null ? (
          <ActivityTimelineTodayMarker
            style={{ left: `${todayMarkerRatio * 100}%` }}
          />
        ) : null}

        <ActivityTimelineWindow
          aria-hidden="true"
          style={{
            left: `${windowMetrics.leftRatio * 100}%`,
            width: `${windowMetrics.widthRatio * 100}%`,
          }}
        />
        <ActivityTimelineWindowDrag
          aria-label={t('analysisViews.moveWindow')}
          aria-describedby={rangeId}
          aria-keyshortcuts="ArrowLeft ArrowRight"
          disabled={windowMetrics.widthRatio >= 1}
          windowBounds={windowMetrics}
          onKeyDown={handleWindowKeyDown}
          onPointerDown={handlePointerDown}
        />
      </ActivityTimelineOverviewRail>
    </ActivityTimelineOverviewPanel>
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
    blocks.push({
      occurrence,
      occurrenceCount: 1,
      laneIndex,
      startIndex,
      endIndex,
    })
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

      const timeSort = a.occurrence.event.time.localeCompare(
        b.occurrence.event.time,
      )
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
  const laneIndex = laneEndIndexes.findIndex(
    (endIndex) => endIndex < startIndex,
  )
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

function getScaleLabel(scale: StableTimelineScale, locale: Locale) {
  const t = localeInstances[locale].t
  if (scale === 'week') return t('analysisViews.week')
  if (scale === 'month') return t('analysisViews.month')
  return t('analysisViews.day')
}

function getCurrentPeriodTagLabel(scale: StableTimelineScale, locale: Locale) {
  const t = localeInstances[locale].t
  if (scale === 'week') return t('analysisViews.thisWeek')
  if (scale === 'month') return t('analysisViews.thisMonth')
  return t('analysisViews.today')
}

function formatTimelinePeriodActivitySummary(
  period: StableTimelinePeriod,
  locale: Locale,
) {
  const t = localeInstances[locale].t
  const items = [
    ...period.eventTypeCounts.map(
      (item) => `${t(`events.types.${item.type}`)}: ${item.count}`,
    ),
    ...period.signalKindCounts.map(
      (item) => `${t(`analysisViews.${item.kind}`)}: ${item.count}`,
    ),
  ]
  if (period.urgentSignalCount > 0)
    items.push(
      t('analysisViews.urgentCount', { count: period.urgentSignalCount }),
    )
  return items.join(', ') || t('analysisViews.noEvents')
}

function getTimelinePeriodActivityCount(period: StableTimelinePeriod) {
  return period.allEventCount + period.signalCount
}

function isCurrentTimelinePeriod(
  period: StableTimelinePeriod,
  todayKey: string,
) {
  return period.startKey <= todayKey && period.endKey >= todayKey
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
  const startDate = dateKeyToDate(startKey)
  const endDate = dateKeyToDate(endKey)
  const millisecondsPerDay = 86_400_000

  return Math.max(
    1,
    Math.round((endDate.getTime() - startDate.getTime()) / millisecondsPerDay) +
      1,
  )
}

function getTimelineScrollState(viewport: HTMLDivElement): TimelineScrollState {
  return {
    scrollLeft: viewport.scrollLeft,
    clientWidth: viewport.clientWidth,
    scrollWidth: viewport.scrollWidth,
  }
}

function getPointerRatio(clientX: number, railBounds: DOMRect) {
  return clamp((clientX - railBounds.left) / railBounds.width, 0, 1)
}

function getRootRemInPixels() {
  return (
    Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
