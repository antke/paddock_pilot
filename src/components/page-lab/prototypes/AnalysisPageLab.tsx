import {
  dashboardEmptyClassName,
  dashboardHeroClassName,
  dashboardSectionClassName,
} from '#/components/dashboard/dashboardChrome'
import { dashboardItemCardClassName } from '#/components/dashboard/DashboardItemCard'
import {
  formatEventDate,
  formatEventDateRange,
} from '#/components/events/eventDisplay'
import { Badge } from '#/components/ui/badge'
import { Checkbox } from '#/components/ui/checkbox'
import { ChoiceButtonGroup } from '#/components/ui/choice-button-group'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '#/components/ui/navigation-menu'
import { ScrollableList } from '#/components/ui/scrollable-list'
import { cn } from '#/lib/utils'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { Link, useNavigate } from '@tanstack/react-router'
import type { api } from 'convex/_generated/api'
import type { FunctionReturnType } from 'convex/server'
import type { ReactNode } from 'react'
import { useCallback, useState } from 'react'
import {
  eventStatusLabels,
  eventTypeLabels,
  eventTypes,
} from 'shared/events/eventSchema'
import type { EventType } from 'shared/events/eventSchema'
import {
  careReminderCategoryLabels,
  careReminderPriorityLabels,
} from 'shared/reminders/careReminderSchema'
import { AnalysisPageLabHorseTab } from './AnalysisPageLabHorseTab'
import { createLabAnalysis } from './analysisPageLabData'
import type {
  LabAnalysis,
  LabAttentionHorse,
  LabCompletionCoverage,
  LabTimeline,
  LabTimelineBucket,
  LabTimelineOccurrence,
  LabTimelineSignal,
  LabTimelineSeriesKey,
} from './analysisPageLabData'
import { createHorseLabAnalysis } from './analysisPageLabHorseData'
import {
  timelineSignalKindAccentColors,
  timelineSignalKindLabels,
} from './analysisTimelineSignalMeta'
import {
  StableActivityTimelineChart,
  stableTimelineEventTypeOptions,
  TimelineEventTypeIcon,
} from './StableActivityTimelineChart'
import { getTimelinePeriods } from './stableActivityTimelineScale'
import type {
  StableTimelinePeriod,
  StableTimelineScale,
} from './stableActivityTimelineScale'

type LabEvent = LabAnalysis['upcomingEvents'][number]
type LabReminder = LabAnalysis['dueReminders'][number]
type LabHorse = DashboardLabData['horses'][number]
type StableAnalysis = FunctionReturnType<typeof api.stableAnalysis.getForStable>
type StableEventSeriesKey = Extract<
  LabTimelineSeriesKey,
  'all' | 'completed' | 'planned'
>
type TimelineSeriesVisual =
  | 'bar'
  | 'circle'
  | 'solid-circle-line'
  | 'dashed-circle-line'
  | 'diamond'
  | 'pin'
  | 'square'
  | 'round-square'
  | 'triangle'

const stableTimelineSeriesOptions = [
  {
    key: 'all',
    label: 'All blocks',
    color: 'var(--chart-2)',
    visual: 'round-square',
  },
  {
    key: 'completed',
    label: 'Completed blocks',
    color: 'var(--primary)',
    visual: 'round-square',
  },
  {
    key: 'planned',
    label: 'Planned blocks',
    color: 'var(--chart-4)',
    visual: 'round-square',
  },
] as const satisfies ReadonlyArray<{
  key: StableEventSeriesKey
  label: string
  color: string
  visual: TimelineSeriesVisual
}>

const stableTimelineScaleOptions = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
] as const satisfies ReadonlyArray<{
  value: StableTimelineScale
  label: string
}>

const stableAnalysisTabValue = 'stable'
const selectedPeriodOccurrenceListVisibleItemLimit = 5
const selectedPeriodOccurrenceListEstimatedItemHeightRem = 5.25
const stableActionListClassName = 'xl:h-[37.45rem] xl:content-start'
const stableActionListVisibleItemLimit = 7
const stableActionListEstimatedItemHeightRem = 5.35

export function AnalysisPageLab({
  data,
  stableAnalysis,
}: {
  data: DashboardLabData
  stableAnalysis: StableAnalysis
}) {
  const navigate = useNavigate()
  const timelineSignals: Array<LabTimelineSignal> = stableAnalysis.hasAccess
    ? stableAnalysis.timelineSignals
    : []
  const unlockedStableAnalysis = stableAnalysis.hasAccess ? stableAnalysis : null
  const analysis = createLabAnalysis(data, timelineSignals)
  const [activeAnalysisTab, setActiveAnalysisTab] = useState(stableAnalysisTabValue)
  const [selectedTimelineDateKey, setSelectedTimelineDateKey] = useState<
    string | null
  >(null)
  const [timelineScale, setTimelineScale] = useState<StableTimelineScale>('day')
  const [visibleSeries, setVisibleSeries] = useState<Array<StableEventSeriesKey>>([
    'all',
    'completed',
    'planned',
  ])
  const [visibleEventTypes, setVisibleEventTypes] =
    useState<Array<EventType>>([...eventTypes])
  const activeTabValue = getActiveAnalysisTabValue(activeAnalysisTab, data.horses)
  const activeHorse = data.horses.find(
    (horse) => getHorseAnalysisTabValue(horse._id) === activeTabValue,
  )
  const activeHorseAnalysis = activeHorse
    ? createHorseLabAnalysis({
        horse: activeHorse,
        data,
        analysis,
        stableAnalysis: unlockedStableAnalysis,
        timelineSignals,
      })
    : null
  const analysisTabItems = [
    { value: stableAnalysisTabValue, label: data.stable.name },
    ...data.horses.map((horse) => ({
      value: getHorseAnalysisTabValue(horse._id),
      label: horse.name,
    })),
  ]
  const timelinePeriods = getTimelinePeriods(analysis.timeline.buckets, timelineScale)
  const selectedPeriod = getSelectedTimelinePeriod(
    timelinePeriods,
    analysis.timeline,
    selectedTimelineDateKey,
  )
  const handlePeriodSelect = useCallback((period: StableTimelinePeriod) => {
    setSelectedTimelineDateKey(period.buckets[0]?.key ?? period.startKey)
  }, [])
  const handleTimelineScaleChange = useCallback((scale: StableTimelineScale) => {
    setTimelineScale(scale)
  }, [])
  const handleEventOpen = useCallback(
    (eventId: string) => {
      void navigate({
        to: '/stables/$stableId/events/$eventId',
        params: { stableId: data.stable._id, eventId },
      })
    },
    [data.stable._id, navigate],
  )
  const handleSeriesToggle = useCallback((seriesKey: StableEventSeriesKey) => {
    setVisibleSeries((currentSeries) => {
      const nextSeries = currentSeries.includes(seriesKey)
        ? currentSeries.filter((key) => key !== seriesKey)
        : [...currentSeries, seriesKey]

      if (nextSeries.length === 0) return currentSeries

      return stableTimelineSeriesOptions
        .map((option) => option.key)
        .filter((key) => nextSeries.includes(key))
    })
  }, [])
  const handleEventTypeToggle = useCallback((eventType: EventType) => {
    setVisibleEventTypes((currentTypes) => {
      const nextTypes = currentTypes.includes(eventType)
        ? currentTypes.filter((type) => type !== eventType)
        : [...currentTypes, eventType]

      if (nextTypes.length === 0) return currentTypes

      return eventTypes.filter((type) => nextTypes.includes(type))
    })
  }, [])

  return (
    <div className="grid gap-8">
      <AnalysisHero
        stableName={data.stable.name}
        urgentCount={analysis.summary.urgentCount}
        eventCount={analysis.timeline.totalEventCount}
        signalCount={analysis.timeline.totalSignalCount}
      />

      <div className="grid gap-3">
        <NavigationMenu className="w-full max-w-full justify-start px-1">
          <NavigationMenuList className="flex-wrap justify-start gap-1">
            {analysisTabItems.map((tab) => (
              <NavigationMenuItem key={tab.value}>
                <NavigationMenuLink
                  render={<button type="button" />}
                  data-active={activeTabValue === tab.value || undefined}
                  onClick={() => {
                    if (activeTabValue === tab.value) return
                    setActiveAnalysisTab(tab.value)
                  }}
                >
                  {tab.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {activeTabValue === stableAnalysisTabValue && (
          <div className="grid gap-4 xl:grid-cols-3">
            <StableActivityTimelinePanel
              timeline={analysis.timeline}
              periods={timelinePeriods}
              timelineScale={timelineScale}
              visibleSeries={visibleSeries}
              visibleEventTypes={visibleEventTypes}
              selectedPeriodKey={selectedPeriod?.key ?? null}
              onTimelineScaleChange={handleTimelineScaleChange}
              onPeriodSelect={handlePeriodSelect}
              onEventOpen={handleEventOpen}
              onSeriesToggle={handleSeriesToggle}
              onEventTypeToggle={handleEventTypeToggle}
              className="xl:col-span-3"
            />

            <SelectedTimelinePeriodPanel
              period={selectedPeriod}
              scale={timelineScale}
              stableId={data.stable._id}
              className="xl:col-span-3"
            />
            <StableWatchlistPanel
              items={analysis.horsesNeedingAttention}
              className="xl:col-span-2"
            />
            <ActionQueuePanel
              reminders={analysis.dueReminders}
              events={analysis.upcomingEvents}
              stableId={data.stable._id}
            />
            <DocumentationGapsPanel
              events={analysis.completionNotesNeeded}
              coverage={analysis.completionCoverage}
              stableId={data.stable._id}
              className="xl:col-span-3"
            />
          </div>
        )}

        {activeHorse && activeHorseAnalysis && (
          <AnalysisPageLabHorseTab
            horse={activeHorse}
            stableId={data.stable._id}
            analysis={activeHorseAnalysis}
          />
        )}
      </div>
    </div>
  )
}

function AnalysisHero({
  stableName,
  urgentCount,
  eventCount,
  signalCount,
}: {
  stableName: string
  urgentCount: number
  eventCount: number
  signalCount: number
}) {
  return (
    <header className={dashboardHeroClassName('soft')}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Analysis Centre
            </h1>
            <Badge variant="secondary">Personal Pro</Badge>
          </div>
          <p className="max-w-2xl text-base leading-6 text-muted-foreground">
            Timeline-led care analysis for {stableName}. Explore overlapping care
            blocks, recurring work, and the records behind each busy day.
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Badge variant="outline">{formatCount(eventCount, 'event block')}</Badge>
          <Badge variant="outline">{formatCount(signalCount, 'event')}</Badge>
          <Badge variant={urgentCount > 0 ? 'destructive' : 'secondary'}>
            {urgentCount > 0 ? formatCount(urgentCount, 'urgent event') : 'All clear'}
          </Badge>
        </div>
      </div>
    </header>
  )
}

function AnalysisPanel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section
      className={dashboardSectionClassName(
        'soft',
        cn('grid min-w-0 gap-5', className),
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-1">
          <h2 className="text-2xl font-semibold leading-tight tracking-tight">
            {title}
          </h2>
          {description ? (
            <p className="max-w-2xl text-base leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>

      <div className={cn('min-w-0', bodyClassName)}>{children}</div>
    </section>
  )
}

function AnalysisList({
  children,
  itemCount,
  visibleItemLimit,
  estimatedItemHeightRem,
  fillParent,
  className,
}: {
  children: ReactNode
  itemCount: number
  visibleItemLimit: number
  estimatedItemHeightRem?: number
  fillParent?: boolean
  className?: string
}) {
  return (
    <ScrollableList
      itemCount={itemCount}
      visibleItemLimit={visibleItemLimit}
      estimatedItemHeightRem={estimatedItemHeightRem}
      fillParent={fillParent}
      className={cn('min-h-0 pb-2', className)}
    >
      {children}
    </ScrollableList>
  )
}

function StableActivityTimelinePanel({
  timeline,
  periods,
  timelineScale,
  visibleSeries,
  visibleEventTypes,
  selectedPeriodKey,
  onTimelineScaleChange,
  onPeriodSelect,
  onEventOpen,
  onSeriesToggle,
  onEventTypeToggle,
  className,
}: {
  timeline: LabTimeline
  periods: Array<StableTimelinePeriod>
  timelineScale: StableTimelineScale
  visibleSeries: Array<StableEventSeriesKey>
  visibleEventTypes: Array<EventType>
  selectedPeriodKey: string | null
  onTimelineScaleChange: (scale: StableTimelineScale) => void
  onPeriodSelect: (period: StableTimelinePeriod) => void
  onEventOpen: (eventId: string) => void
  onSeriesToggle: (seriesKey: StableEventSeriesKey) => void
  onEventTypeToggle: (eventType: EventType) => void
  className?: string
}) {
  return (
    <AnalysisPanel
      title="Stable activity timeline"
      description="A calendar-lane view of event durations and recurring occurrences. Overlaps stack vertically so pressure points are easier to scan."
      className={cn(
        'max-h-[70vh] grid-rows-[auto_minmax(0,1fr)] overflow-hidden',
        className,
      )}
      bodyClassName="min-h-0 overflow-hidden"
    >
      <div className="grid gap-4">
        <TimelineScaleControls
          scale={timelineScale}
          onScaleChange={onTimelineScaleChange}
        />

        <div
          className={dashboardItemCardClassName({
            chrome: 'soft',
            className: 'min-w-0 overflow-hidden p-3 md:p-4',
          })}
        >
          <StableActivityTimelineChart
            periods={periods}
            occurrences={timeline.occurrences}
            scale={timelineScale}
            visibleSeries={visibleSeries}
            visibleEventTypes={visibleEventTypes}
            selectedPeriodKey={selectedPeriodKey}
            onPeriodSelect={onPeriodSelect}
            onEventOpen={onEventOpen}
          />
        </div>

        <TimelineSeriesControls
          visibleSeries={visibleSeries}
          onSeriesToggle={onSeriesToggle}
        />
        <TimelineEventTypeControls
          visibleEventTypes={visibleEventTypes}
          onEventTypeToggle={onEventTypeToggle}
        />
      </div>
    </AnalysisPanel>
  )
}

function TimelineScaleControls({
  scale,
  onScaleChange,
}: {
  scale: StableTimelineScale
  onScaleChange: (scale: StableTimelineScale) => void
}) {
  return (
    <div
      className={dashboardItemCardClassName({
        chrome: 'soft',
        density: 'compact',
        className:
          'flex flex-wrap items-center justify-between gap-3 p-3 md:p-4',
      })}
    >
      <div className="grid gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Calendar scale
        </p>
        <p className="text-sm leading-5 text-muted-foreground">
          Switch between readable day blocks and wider week/month planning views.
        </p>
      </div>
      <ChoiceButtonGroup
        value={scale}
        options={stableTimelineScaleOptions}
        onValueChange={onScaleChange}
        className="w-auto justify-start"
      />
    </div>
  )
}

function TimelineSeriesControls({
  visibleSeries,
  onSeriesToggle,
  className,
}: {
  visibleSeries: Array<StableEventSeriesKey>
  onSeriesToggle: (seriesKey: StableEventSeriesKey) => void
  className?: string
}) {
  return (
    <fieldset
      className={cn(
        dashboardItemCardClassName({
          chrome: 'soft',
          density: 'compact',
          className: 'grid gap-3 p-3 md:p-4',
        }),
        className,
      )}
    >
      <legend className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Show blocks
      </legend>

      <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
        {stableTimelineSeriesOptions.map((option) => {
          const active = visibleSeries.includes(option.key)
          const isLastActiveSeries = active && visibleSeries.length === 1
          const checkboxId = `timeline-series-${option.key}`

          return (
            <div
              key={option.key}
              className={cn(
                'grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2',
                active ? 'opacity-100' : 'opacity-55',
              )}
            >
              <Checkbox
                id={checkboxId}
                checked={active}
                disabled={isLastActiveSeries}
                onCheckedChange={(checked) => {
                  if (typeof checked === 'boolean' && checked !== active) {
                    onSeriesToggle(option.key)
                  }
                }}
              />
              <label
                htmlFor={checkboxId}
                className={cn(
                  'flex min-w-0 cursor-pointer items-center gap-2',
                  isLastActiveSeries && 'cursor-default',
                )}
              >
                <TimelineSeriesMarker
                  visual={option.visual}
                  color={option.color}
                />
                <span className="truncate text-sm font-semibold leading-5">
                  {option.label}
                </span>
              </label>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}

function TimelineEventTypeControls({
  visibleEventTypes,
  onEventTypeToggle,
  className,
}: {
  visibleEventTypes: Array<EventType>
  onEventTypeToggle: (eventType: EventType) => void
  className?: string
}) {
  return (
    <fieldset
      className={cn(
        dashboardItemCardClassName({
          chrome: 'soft',
          density: 'compact',
          className: 'grid gap-3 p-3 md:p-4',
        }),
        className,
      )}
    >
      <legend className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Event categories
      </legend>

      <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stableTimelineEventTypeOptions.map((option) => {
          const active = visibleEventTypes.includes(option.type)
          const isLastActiveType = active && visibleEventTypes.length === 1
          const checkboxId = `timeline-event-type-${option.type}`

          return (
            <div
              key={option.type}
              className={cn(
                'grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2',
                active ? 'opacity-100' : 'opacity-55',
              )}
            >
              <Checkbox
                id={checkboxId}
                checked={active}
                disabled={isLastActiveType}
                onCheckedChange={(checked) => {
                  if (typeof checked === 'boolean' && checked !== active) {
                    onEventTypeToggle(option.type)
                  }
                }}
              />
              <label
                htmlFor={checkboxId}
                className={cn(
                  'flex min-w-0 cursor-pointer items-center gap-2',
                  isLastActiveType && 'cursor-default',
                )}
              >
                <TimelineEventTypeIcon type={option.type} />
                <span className="truncate text-sm font-semibold leading-5">
                  {eventTypeLabels[option.type]}
                </span>
              </label>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}

function TimelineSeriesMarker({
  visual,
  color,
}: {
  visual: TimelineSeriesVisual
  color: string
}) {
  if (visual === 'solid-circle-line' || visual === 'dashed-circle-line') {
    return (
      <span aria-hidden="true" className="relative flex h-5 w-8 items-center">
        <span
          className={cn(
            'w-full border-t-2',
            visual === 'dashed-circle-line' && 'border-dashed',
          )}
          style={{ borderColor: color }}
        />
        <span
          className="absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full"
          style={{ backgroundColor: color }}
        />
      </span>
    )
  }

  if (visual === 'bar') {
    return (
      <span aria-hidden="true" className="flex h-5 w-8 items-end justify-center">
        <span
          className="h-4 w-3 rounded-t-[0.2rem]"
          style={{ backgroundColor: color }}
        />
      </span>
    )
  }

  if (visual === 'triangle') {
    return (
      <span aria-hidden="true" className="flex h-5 w-8 items-center justify-center">
        <span
          className="h-0 w-0 border-x-[0.36rem] border-b-[0.68rem] border-x-transparent"
          style={{ borderBottomColor: color }}
        />
      </span>
    )
  }

  if (visual === 'pin') {
    return (
      <span aria-hidden="true" className="flex h-5 w-8 items-center justify-center">
        <span
          className="h-3 w-3 rotate-45 rounded-[50%_50%_50%_0]"
          style={{ backgroundColor: color }}
        />
      </span>
    )
  }

  if (
    visual === 'circle' ||
    visual === 'diamond' ||
    visual === 'square' ||
    visual === 'round-square'
  ) {
    return (
      <span aria-hidden="true" className="flex h-5 w-8 items-center justify-center">
        <span
          className={cn(
            'h-2.5 w-2.5',
            visual === 'circle' && 'rounded-full',
            visual === 'diamond' && 'rotate-45 rounded-[0.18rem]',
            visual === 'square' && 'rounded-[0.16rem]',
            visual === 'round-square' && 'rounded-[0.32rem]',
          )}
          style={{ backgroundColor: color }}
        />
      </span>
    )
  }

  return null
}

function SelectedTimelinePeriodPanel({
  period,
  scale,
  stableId,
  className,
}: {
  period: StableTimelinePeriod | null
  scale: StableTimelineScale
  stableId: DashboardLabData['stable']['_id']
  className?: string
}) {
  const unitLabel = getTimelineScaleUnitLabel(scale)
  const hasConstrainedOccurrenceList = Boolean(
    period &&
      period.occurrences.length > selectedPeriodOccurrenceListVisibleItemLimit,
  )

  return (
    <AnalysisPanel
      title={period ? period.label : `Selected timeline ${unitLabel}`}
      description={`Click a ${unitLabel} column or event block in the timeline to inspect stable events overlapping that ${unitLabel}.`}
      action={
        period ? (
          <div className="flex flex-wrap justify-end gap-2">
            <Badge variant="outline">
              {formatCount(period.allEventCount, 'block')}
            </Badge>
            {period.signalCount > 0 && (
              <Badge
                variant={period.urgentSignalCount > 0 ? 'destructive' : 'secondary'}
              >
                {formatCount(period.signalCount, 'event')}
              </Badge>
            )}
          </div>
        ) : undefined
      }
      className={cn(
        'max-h-[70vh] grid-rows-[auto_minmax(0,1fr)] overflow-hidden',
        hasConstrainedOccurrenceList && 'h-[70vh]',
        className,
      )}
      bodyClassName="min-h-0 overflow-hidden"
    >
      {!period ? (
        <p className={dashboardEmptyClassName('soft')}>
          Select a timeline {unitLabel} to preview overlapping event blocks.
        </p>
      ) : (
        <div
          className={cn(
            'grid min-h-0 gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]',
            hasConstrainedOccurrenceList && 'h-full',
          )}
        >
          <TimelinePeriodBreakdown
            period={period}
            className={
              hasConstrainedOccurrenceList
                ? 'h-full overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
                : undefined
            }
          />

          {period.occurrences.length === 0 ? (
            <p className={dashboardEmptyClassName('soft')}>
              No event blocks overlap this {unitLabel}.
            </p>
          ) : (
            <AnalysisList
              itemCount={period.occurrences.length}
              visibleItemLimit={selectedPeriodOccurrenceListVisibleItemLimit}
              estimatedItemHeightRem={
                selectedPeriodOccurrenceListEstimatedItemHeightRem
              }
              fillParent={hasConstrainedOccurrenceList}
              className={
                hasConstrainedOccurrenceList
                  ? 'h-full content-start pb-0'
                  : undefined
              }
            >
              {period.occurrences.map((occurrence) => (
                <TimelineOccurrenceRow
                  key={occurrence.occurrenceKey}
                  occurrence={occurrence}
                  period={period}
                  stableId={stableId}
                />
              ))}
            </AnalysisList>
          )}
        </div>
      )}
    </AnalysisPanel>
  )
}

function TimelinePeriodBreakdown({
  period,
  className,
}: {
  period: StableTimelinePeriod
  className?: string
}) {
  return (
    <div className={cn('grid min-h-0 content-start gap-3', className)}>
      <div
        className={dashboardItemCardClassName({
          chrome: 'soft',
          className: 'grid gap-3',
        })}
      >
        <span className="font-semibold">
          {period.scale === 'day' ? 'Day mix' : 'Period mix'}
        </span>
        <div className="grid gap-2 text-sm leading-5 text-muted-foreground">
          <div className="flex items-center justify-between gap-3">
            <span>Blocks</span>
            <span className="font-medium text-foreground">
              {period.allEventCount}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Completed</span>
            <span className="font-medium text-foreground">
              {period.completedEventCount}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Planned</span>
            <span className="font-medium text-foreground">
              {period.plannedEventCount}
            </span>
          </div>
          {period.signalCount > 0 && (
            <div className="flex items-center justify-between gap-3">
              <span>Events</span>
              <span className="font-medium text-foreground">
                {period.signalCount}
              </span>
            </div>
          )}
          {period.urgentSignalCount > 0 && (
            <div className="flex items-center justify-between gap-3 text-destructive">
              <span>Urgent</span>
              <span className="font-semibold">{period.urgentSignalCount}</span>
            </div>
          )}
        </div>
      </div>

      <TimelineSignalDigest period={period} />
    </div>
  )
}

function TimelineSignalDigest({ period }: { period: StableTimelinePeriod }) {
  if (period.signalCount === 0) return null

  const urgentSignals = period.signals.filter((signal) => signal.urgent)
  const standardSignals = period.signals.filter((signal) => !signal.urgent)
  const visibleSignals = [...urgentSignals, ...standardSignals].slice(0, 4)
  const hiddenSignalCount = period.signalCount - visibleSignals.length

  return (
    <div
      className={dashboardItemCardClassName({
        chrome: 'soft',
        className: 'grid gap-3',
      })}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">Event digest</span>
        <Badge variant={period.urgentSignalCount > 0 ? 'destructive' : 'secondary'}>
          {formatCount(period.signalCount, 'event')}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {period.signalKindCounts.slice(0, 3).map((item) => (
          <span
            key={item.kind}
            className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-background/65 px-2 py-1 text-xs font-medium text-muted-foreground"
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: timelineSignalKindAccentColors[item.kind] }}
            />
            {timelineSignalKindLabels[item.kind]} {item.count}
          </span>
        ))}
      </div>

      <div className="grid gap-2">
        {visibleSignals.map((signal) => (
          <TimelineSignalRow
            key={`${signal.kind}:${signal.id}`}
            signal={signal}
            showDate={period.scale !== 'day'}
          />
        ))}
        {hiddenSignalCount > 0 && (
          <p className="text-xs font-medium leading-5 text-muted-foreground">
            +{formatCount(hiddenSignalCount, 'more event')} in this period
          </p>
        )}
      </div>
    </div>
  )
}

function TimelineSignalRow({
  signal,
  showDate,
}: {
  signal: LabTimelineSignal
  showDate: boolean
}) {
  return (
    <div className="grid min-w-0 gap-1 rounded-row bg-background/55 p-3">
      <div className="flex min-w-0 items-center gap-2">
        <span
          aria-hidden="true"
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: timelineSignalKindAccentColors[signal.kind] }}
        />
        <span className="truncate text-sm font-medium">{signal.title}</span>
        {signal.urgent && (
          <span className="shrink-0 rounded-full bg-destructive/10 px-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-destructive">
            Urgent
          </span>
        )}
      </div>
      <p className="truncate text-xs leading-5 text-muted-foreground">
        {getTimelineSignalDetail(signal, showDate)}
      </p>
    </div>
  )
}

function TimelineOccurrenceRow({
  occurrence,
  period,
  stableId,
}: {
  occurrence: LabTimelineOccurrence
  period: StableTimelinePeriod
  stableId: DashboardLabData['stable']['_id']
}) {
  const event = occurrence.event
  const eventStatus = event.status ?? 'planned'
  const providerDetails = getProviderDetails(event)
  const startsBeforePeriod = occurrence.startDate < period.startKey
  const endsAfterPeriod = occurrence.endDate > period.endKey

  return (
    <Link
      to="/stables/$stableId/events/$eventId"
      params={{ stableId, eventId: event._id }}
      className={dashboardItemCardClassName({
        chrome: 'soft',
        className: 'grid gap-2 transition-colors hover:bg-background/80',
      })}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">{event.title}</h3>
        <div className="flex flex-wrap justify-end gap-2">
          <Badge variant="outline">{eventTypeLabels[event.type]}</Badge>
          <Badge variant={eventStatus === 'planned' ? 'secondary' : 'outline'}>
            {eventStatusLabels[eventStatus]}
          </Badge>
        </div>
      </div>
      <p className="text-sm leading-5 text-muted-foreground">
        {formatEventDateRange(occurrence.startDate, occurrence.endDate)} at{' '}
        {event.time} · {formatCount(event.horseIds.length, 'horse')}
      </p>
      {(occurrence.isRecurring || occurrence.durationDays > 1) && (
        <div className="flex flex-wrap gap-2">
          {occurrence.durationDays > 1 && (
            <Badge variant="secondary">
              {formatCount(occurrence.durationDays, 'day')}
            </Badge>
          )}
          {occurrence.isRecurring && <Badge variant="secondary">Repeats</Badge>}
          {(startsBeforePeriod || endsAfterPeriod) && (
            <Badge variant="outline">
              Continues through this {getTimelineScaleUnitLabel(period.scale)}
            </Badge>
          )}
        </div>
      )}
      {providerDetails ? (
        <p className="text-sm leading-5">{providerDetails}</p>
      ) : (
        <p className="text-sm leading-5 text-muted-foreground">
          Provider details missing
        </p>
      )}
    </Link>
  )
}

function StableWatchlistPanel({
  items,
  className,
}: {
  items: Array<LabAttentionHorse>
  className?: string
}) {
  return (
    <AnalysisPanel
      title="Stable watchlist"
      description="Collective view of horses creating the clearest care pressure across the stable. Open a horse tab for the underlying health, medication, and progress detail."
      action={<Badge variant="outline">{formatCount(items.length, 'horse')}</Badge>}
      className={className}
    >
      {items.length === 0 ? (
        <p className={dashboardEmptyClassName('soft')}>
          No active health issues, medication records, or overdue reminders found.
        </p>
      ) : (
        <AnalysisList
          itemCount={items.length}
          visibleItemLimit={stableActionListVisibleItemLimit}
          estimatedItemHeightRem={stableActionListEstimatedItemHeightRem}
          className={stableActionListClassName}
        >
          {items.map((horse) => (
            <HorseAttentionRow key={horse.horseId} horse={horse} />
          ))}
        </AnalysisList>
      )}
    </AnalysisPanel>
  )
}

function HorseAttentionRow({ horse }: { horse: LabAttentionHorse }) {
  return (
    <div className={dashboardItemCardClassName({ chrome: 'soft', className: 'grid gap-2' })}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">{horse.horseName}</h3>
        <div className="flex flex-wrap justify-end gap-2">
          {horse.highIssueCount > 0 && (
            <Badge variant="destructive">
              {formatCount(horse.highIssueCount, 'high issue')}
            </Badge>
          )}
          {horse.activeIssueCount > 0 && (
            <Badge variant="destructive">
              {formatCount(horse.activeIssueCount, 'active issue')}
            </Badge>
          )}
          {horse.activeMedicationCount > 0 && (
            <Badge variant="secondary">
              {formatCount(horse.activeMedicationCount, 'active medication')}
            </Badge>
          )}
          {horse.overdueReminderCount > 0 && (
            <Badge variant="destructive">
              {formatCount(horse.overdueReminderCount, 'overdue reminder')}
            </Badge>
          )}
        </div>
      </div>

      {horse.missingProfileFields.length > 0 && (
        <p className="text-sm leading-5 text-muted-foreground">
          Also missing {horse.missingProfileFields.join(', ')}.
        </p>
      )}
    </div>
  )
}

function ActionQueuePanel({
  reminders,
  events,
  stableId,
  className,
}: {
  reminders: Array<LabReminder>
  events: Array<LabEvent>
  stableId: DashboardLabData['stable']['_id']
  className?: string
}) {
  const itemCount = reminders.length + events.length

  return (
    <AnalysisPanel
      title="Action queue"
      description="Stable-wide due reminders first, followed by the nearest planned care blocks."
      action={<Badge variant="outline">{formatCount(itemCount, 'item')}</Badge>}
      className={className}
    >
      {itemCount === 0 ? (
        <p className={dashboardEmptyClassName('soft')}>
          No due reminders or planned events in the next 30 days.
        </p>
      ) : (
        <AnalysisList
          itemCount={itemCount}
          visibleItemLimit={stableActionListVisibleItemLimit}
          estimatedItemHeightRem={stableActionListEstimatedItemHeightRem}
          className={stableActionListClassName}
        >
          {reminders.map((reminder) => (
            <ReminderRow key={reminder.id} reminder={reminder} />
          ))}
          {events.map((event) => (
            <ActionQueueEventRow
              key={event._id}
              event={event}
              stableId={stableId}
            />
          ))}
        </AnalysisList>
      )}
    </AnalysisPanel>
  )
}

function ReminderRow({ reminder }: { reminder: LabReminder }) {
  return (
    <div className={dashboardItemCardClassName({ chrome: 'soft', className: 'grid gap-2' })}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">{reminder.title}</h3>
        <Badge variant={reminder.overdue ? 'destructive' : 'outline'}>
          {careReminderCategoryLabels[reminder.category]}
        </Badge>
      </div>
      <p className="text-sm leading-5 text-muted-foreground">
        Due {formatEventDate(reminder.dueDate)}
        {reminder.horseName ? ` · ${reminder.horseName}` : ''}
      </p>
      {reminder.priority && (
        <p className="text-sm leading-5">
          {careReminderPriorityLabels[reminder.priority]} priority
        </p>
      )}
    </div>
  )
}

function ActionQueueEventRow({
  event,
  stableId,
}: {
  event: LabEvent
  stableId: DashboardLabData['stable']['_id']
}) {
  return (
    <Link
      to="/stables/$stableId/events/$eventId"
      params={{ stableId, eventId: event._id }}
      className={dashboardItemCardClassName({
        chrome: 'soft',
        className: 'grid gap-2 transition-colors hover:bg-background/80',
      })}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">{event.title}</h3>
        <Badge variant="outline">{eventTypeLabels[event.type]}</Badge>
      </div>
      <p className="text-sm leading-5 text-muted-foreground">
        {formatEventDateRange(event.date, event.endDate)} at {event.time} ·{' '}
        {formatCount(event.horseIds.length, 'horse')}
      </p>
      <p className="text-sm leading-5">Planned care block</p>
    </Link>
  )
}

function DocumentationGapsPanel({
  events,
  coverage,
  stableId,
  className,
}: {
  events: Array<LabEvent>
  coverage: LabCompletionCoverage
  stableId: DashboardLabData['stable']['_id']
  className?: string
}) {
  return (
    <AnalysisPanel
      title="Documentation gaps"
      description="Completed stable care that still needs aftercare notes. Provider contact is left out here until required provider rules are defined."
      action={
        <Badge variant={events.length > 0 ? 'destructive' : 'secondary'}>
          {formatCount(events.length, 'gap')}
        </Badge>
      }
      className={className}
    >
      <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <DocumentationCoverageSummary coverage={coverage} />
        {events.length === 0 ? (
          <p className={dashboardEmptyClassName('soft')}>
            All completed events have aftercare notes.
          </p>
        ) : (
          <AnalysisList
            itemCount={events.length}
            visibleItemLimit={5}
            estimatedItemHeightRem={5.25}
          >
            {events.map((event) => (
              <DocumentationEventRow
                key={event._id}
                event={event}
                stableId={stableId}
              />
            ))}
          </AnalysisList>
        )}
      </div>
    </AnalysisPanel>
  )
}

function DocumentationCoverageSummary({
  coverage,
}: {
  coverage: LabCompletionCoverage
}) {
  const hasCompletedCare = coverage.completedEventCount > 0

  return (
    <div
      className={dashboardItemCardClassName({
        chrome: 'soft',
        className: 'grid content-start gap-3',
      })}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-semibold">Completion notes</span>
        {hasCompletedCare ? (
          <Badge
            variant={
              coverage.eventNoteCoveragePercent < 75 ? 'destructive' : 'secondary'
            }
          >
            {coverage.eventNoteCoveragePercent}%
          </Badge>
        ) : (
          <Badge variant="outline">No completed care</Badge>
        )}
      </div>
      <p className="text-sm leading-5 text-muted-foreground">
        {hasCompletedCare
          ? `${coverage.eventsWithNotesCount}/${coverage.completedEventCount} completed events documented`
          : 'Coverage is shown once at least one event has been completed.'}
      </p>
      {hasCompletedCare ? (
        <div className="h-2 overflow-hidden rounded-full bg-background/65">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${coverage.eventNoteCoveragePercent}%` }}
          />
        </div>
      ) : null}
    </div>
  )
}

function DocumentationEventRow({
  event,
  stableId,
}: {
  event: LabEvent
  stableId: DashboardLabData['stable']['_id']
}) {
  return (
    <Link
      to="/stables/$stableId/events/$eventId"
      params={{ stableId, eventId: event._id }}
      className={dashboardItemCardClassName({
        chrome: 'soft',
        className: 'grid gap-2 transition-colors hover:bg-background/80',
      })}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">{event.title}</h3>
        <Badge variant="destructive">Notes needed</Badge>
      </div>
      <p className="text-sm leading-5 text-muted-foreground">
        {formatEventDateRange(event.date, event.endDate)} at {event.time} ·{' '}
        {formatCount(event.horseIds.length, 'horse')}
      </p>
      <p className="text-sm leading-5">{eventTypeLabels[event.type]}</p>
    </Link>
  )
}

function getSelectedTimelinePeriod(
  periods: Array<StableTimelinePeriod>,
  timeline: LabTimeline,
  selectedDateKey: string | null,
) {
  if (selectedDateKey) {
    const selectedPeriod = getPeriodContainingDate(periods, selectedDateKey)
    if (selectedPeriod) return selectedPeriod
  }

  if (timeline.currentBucket) {
    const currentPeriod = getPeriodContainingDate(periods, timeline.currentBucket.key)
    if (currentPeriod) return currentPeriod
  }

  if (timeline.busiestBucket) {
    const busiestPeriod = getPeriodContainingDate(periods, timeline.busiestBucket.key)
    if (busiestPeriod) return busiestPeriod
  }

  return periods[periods.length - 1] ?? null
}

function getPeriodContainingDate(
  periods: Array<StableTimelinePeriod>,
  dateKey: string,
) {
  return periods.find(
    (period) => period.startKey <= dateKey && period.endKey >= dateKey,
  )
}

function getTimelineScaleUnitLabel(scale: StableTimelineScale) {
  if (scale === 'week') return 'week'
  if (scale === 'month') return 'month'
  return 'day'
}

function getActiveAnalysisTabValue(activeTab: string, horses: Array<LabHorse>) {
  if (activeTab === stableAnalysisTabValue) return activeTab

  const horseTabExists = horses.some(
    (horse) => getHorseAnalysisTabValue(horse._id) === activeTab,
  )

  return horseTabExists ? activeTab : stableAnalysisTabValue
}

function getHorseAnalysisTabValue(horseId: LabHorse['_id']) {
  return `horse:${horseId}`
}

function getProviderDetails(event: LabEvent) {
  const details = [event.providerName, event.providerPhone].filter(
    (detail): detail is string => Boolean(detail),
  )

  if (details.length === 0) return null

  return details.join(' · ')
}

function getTimelineSignalDetail(signal: LabTimelineSignal, showDate: boolean) {
  return [
    timelineSignalKindLabels[signal.kind],
    showDate ? formatEventDate(signal.date) : undefined,
    signal.horseName,
    signal.detail,
  ]
    .filter((detail): detail is string => Boolean(detail))
    .join(' · ')
}

function formatCount(count: number, singular: string) {
  return `${count} ${singular}${count === 1 ? '' : 's'}`
}
