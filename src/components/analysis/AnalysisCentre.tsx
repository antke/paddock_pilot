import { DashboardBadgeList } from '#/components/dashboard/DashboardBadgeList'
import {
  DashboardFeatureBadge,
  DashboardValueBadge,
} from '#/components/dashboard/DashboardBadges'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardInlineHeader } from '#/components/dashboard/DashboardInlineHeader'
import { DashboardInlinePanel } from '#/components/dashboard/DashboardInlinePanel'
import {
  DashboardItemCard,
  DashboardItemBodyText,
  DashboardItemFieldsetCard,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardLayoutStack } from '#/components/dashboard/DashboardLayoutGrid'
import { DashboardSectionTabs } from '#/components/dashboard/DashboardNavigation'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { DetailKeyValueRow } from '#/components/dashboard/DetailBlocks'
import { EventRow } from '#/components/events/EventRow'
import { HorseCard } from '#/components/horses/HorseCard'
import {
  CareReminderCategoryBadge,
  CareReminderPriorityBadge,
} from '#/components/reminders/CareReminderBadges'
import { formatEventDate } from '#/components/events/eventDisplay'
import { Badge } from '#/components/ui/badge'
import { Checkbox } from '#/components/ui/checkbox'
import { ChoiceButtonGroup } from '#/components/ui/choice-button-group'
import { Progress } from '#/components/ui/progress'
import { ScrollableList } from '#/components/ui/scrollable-list'
import { TextLabel } from '#/components/ui/text-label'
import { cn } from '#/lib/utils'
import { formatCountLabel } from '#/lib/numberDisplay'
import { formatMetaText } from '#/lib/textDisplay'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { useNavigate } from '@tanstack/react-router'
import type { api } from 'convex/_generated/api'
import type { FunctionReturnType } from 'convex/server'
import type { ComponentProps, ReactNode } from 'react'
import { useCallback, useState } from 'react'
import { eventTypeLabels, eventTypes } from 'shared/events/eventSchema'
import type { EventType } from 'shared/events/eventSchema'
import { AnalysisHorseTab } from './AnalysisHorseTab'
import { createAnalysisCentreData } from './analysisCentreData'
import type {
  LabAnalysis,
  LabAttentionHorse,
  LabCompletionCoverage,
  LabTimeline,
  LabTimelineOccurrence,
  LabTimelineSignal,
  LabTimelineSeriesKey,
} from './analysisCentreData'
import { createHorseAnalysisData } from './analysisHorseData'
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

export function AnalysisCentre({
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
  const unlockedStableAnalysis = stableAnalysis.hasAccess
    ? stableAnalysis
    : null
  const analysis = createAnalysisCentreData(data, timelineSignals)
  const [activeAnalysisTab, setActiveAnalysisTab] = useState(
    stableAnalysisTabValue,
  )
  const [selectedTimelineDateKey, setSelectedTimelineDateKey] = useState<
    string | null
  >(null)
  const [timelineScale, setTimelineScale] = useState<StableTimelineScale>('day')
  const [visibleSeries, setVisibleSeries] = useState<
    Array<StableEventSeriesKey>
  >(['all', 'completed', 'planned'])
  const [visibleEventTypes, setVisibleEventTypes] = useState<Array<EventType>>([
    ...eventTypes,
  ])
  const activeTabValue = getActiveAnalysisTabValue(
    activeAnalysisTab,
    data.horses,
  )
  const activeHorse = data.horses.find(
    (horse) => getHorseAnalysisTabValue(horse._id) === activeTabValue,
  )
  const activeHorseAnalysis = activeHorse
    ? createHorseAnalysisData({
        horse: activeHorse,
        data,
        analysis,
        stableAnalysis: unlockedStableAnalysis,
        timelineSignals,
      })
    : null
  const analysisTabItems = [
    { id: stableAnalysisTabValue, label: data.stable.name },
    ...data.horses.map((horse) => ({
      id: getHorseAnalysisTabValue(horse._id),
      label: horse.name,
    })),
  ]
  const timelinePeriods = getTimelinePeriods(
    analysis.timeline.buckets,
    timelineScale,
  )
  const selectedPeriod = getSelectedTimelinePeriod(
    timelinePeriods,
    analysis.timeline,
    selectedTimelineDateKey,
  )
  const handlePeriodSelect = useCallback((period: StableTimelinePeriod) => {
    setSelectedTimelineDateKey(period.buckets[0]?.key ?? period.startKey)
  }, [])
  const handleTimelineScaleChange = useCallback(
    (scale: StableTimelineScale) => {
      setTimelineScale(scale)
    },
    [],
  )
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
        urgentCount={analysis.summary.urgentCount}
        eventCount={analysis.timeline.totalEventCount}
        signalCount={analysis.timeline.totalSignalCount}
      />

      <div className="grid gap-3">
        <DashboardSectionTabs
          activeId={activeTabValue}
          items={analysisTabItems}
          onSelect={setActiveAnalysisTab}
        />

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
              span="xl3"
            />

            <SelectedTimelinePeriodPanel
              period={selectedPeriod}
              scale={timelineScale}
              stableId={data.stable._id}
              span="xl3"
            />
            <StableWatchlistPanel
              items={analysis.horsesNeedingAttention}
              span="xl2"
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
              span="xl3"
            />
          </div>
        )}

        {activeHorse && activeHorseAnalysis && (
          <AnalysisHorseTab
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
  urgentCount,
  eventCount,
  signalCount,
}: {
  urgentCount: number
  eventCount: number
  signalCount: number
}) {
  return (
    <DashboardPageHeader
      title="Analysis Centre"
      badges={<DashboardFeatureBadge>Personal Pro</DashboardFeatureBadge>}
      actions={
        <DashboardBadgeList>
          <DashboardValueBadge>
            {formatCountLabel(eventCount, 'event block')}
          </DashboardValueBadge>
          <DashboardValueBadge>
            {formatCountLabel(signalCount, 'event')}
          </DashboardValueBadge>
          <DashboardValueBadge
            variant={urgentCount > 0 ? 'destructive' : 'secondary'}
          >
            {urgentCount > 0
              ? formatCountLabel(urgentCount, 'urgent event')
              : 'All clear'}
          </DashboardValueBadge>
        </DashboardBadgeList>
      }
    />
  )
}

function AnalysisPanel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
  span,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  span?: ComponentProps<typeof DashboardSection>['span']
}) {
  return (
    <DashboardSection
      chrome="cards"
      className={cn('min-w-0 gap-5', className)}
      span={span}
      title={title}
      description={description}
      actions={action}
      headerClassName="gap-3"
      descriptionWidth="narrow"
      size="panel"
    >
      <div className={cn('min-w-0', bodyClassName)}>{children}</div>
    </DashboardSection>
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
      className={cn('min-h-0 p-2', className)}
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
  span,
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
  span?: ComponentProps<typeof DashboardSection>['span']
}) {
  return (
    <AnalysisPanel
      title="Stable activity timeline"
      description="A calendar-lane view of event durations and recurring occurrences. Overlaps stack vertically so pressure points are easier to scan."
      className={className}
      span={span}
    >
      <DashboardLayoutStack gap="compact">
        <TimelineScaleControls
          scale={timelineScale}
          onScaleChange={onTimelineScaleChange}
        />

        <DashboardItemCard
          chrome="soft"
          className="min-w-0 overflow-hidden p-3 md:p-4"
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
        </DashboardItemCard>

        <TimelineSeriesControls
          visibleSeries={visibleSeries}
          onSeriesToggle={onSeriesToggle}
        />
        <TimelineEventTypeControls
          visibleEventTypes={visibleEventTypes}
          onEventTypeToggle={onEventTypeToggle}
        />
      </DashboardLayoutStack>
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
    <DashboardItemCard
      chrome="soft"
      density="compact"
      className="flex flex-wrap items-center justify-between gap-3 p-3 md:p-4"
    >
      <div className="grid gap-1">
        <TextLabel as="p" weight="semibold">
          Calendar scale
        </TextLabel>
        <DashboardItemBodyText tone="muted">
          Switch between readable day blocks and wider week/month planning
          views.
        </DashboardItemBodyText>
      </div>
      <ChoiceButtonGroup
        value={scale}
        options={stableTimelineScaleOptions}
        onValueChange={onScaleChange}
        className="w-full justify-start [&>*]:min-w-0 [&>*]:flex-1 sm:w-auto sm:[&>*]:flex-none"
      />
    </DashboardItemCard>
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
    <DashboardItemFieldsetCard
      chrome="soft"
      density="compact"
      className={cn('grid gap-3 p-3 md:p-4', className)}
    >
      <TextLabel as="legend" weight="semibold">
        Show blocks
      </TextLabel>

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
    </DashboardItemFieldsetCard>
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
    <DashboardItemFieldsetCard
      chrome="soft"
      density="compact"
      className={cn('grid gap-3 p-3 md:p-4', className)}
    >
      <TextLabel as="legend" weight="semibold">
        Event categories
      </TextLabel>

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
    </DashboardItemFieldsetCard>
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
      <span
        aria-hidden="true"
        className="flex h-5 w-8 items-end justify-center"
      >
        <span
          className="h-4 w-3 rounded-t-[0.2rem]"
          style={{ backgroundColor: color }}
        />
      </span>
    )
  }

  if (visual === 'triangle') {
    return (
      <span
        aria-hidden="true"
        className="flex h-5 w-8 items-center justify-center"
      >
        <span
          className="h-0 w-0 border-x-[0.36rem] border-b-[0.68rem] border-x-transparent"
          style={{ borderBottomColor: color }}
        />
      </span>
    )
  }

  if (visual === 'pin') {
    return (
      <span
        aria-hidden="true"
        className="flex h-5 w-8 items-center justify-center"
      >
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
      <span
        aria-hidden="true"
        className="flex h-5 w-8 items-center justify-center"
      >
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
  span,
}: {
  period: StableTimelinePeriod | null
  scale: StableTimelineScale
  stableId: DashboardLabData['stable']['_id']
  className?: string
  span?: ComponentProps<typeof DashboardSection>['span']
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
          <DashboardBadgeList>
            <Badge variant="outline">
              {formatCountLabel(period.allEventCount, 'block')}
            </Badge>
            {period.signalCount > 0 && (
              <Badge
                variant={
                  period.urgentSignalCount > 0 ? 'destructive' : 'secondary'
                }
              >
                {formatCountLabel(period.signalCount, 'event')}
              </Badge>
            )}
          </DashboardBadgeList>
        ) : undefined
      }
      className={cn(
        hasConstrainedOccurrenceList &&
          'h-[70vh] max-h-[70vh] grid-rows-[auto_minmax(0,1fr)] overflow-hidden',
        className,
      )}
      bodyClassName={cn(
        'min-h-0',
        hasConstrainedOccurrenceList && 'overflow-hidden',
      )}
      span={span}
    >
      {!period ? (
        <DashboardEmptyState chrome="soft">
          Select a timeline {unitLabel} to preview overlapping event blocks.
        </DashboardEmptyState>
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
            <DashboardEmptyState chrome="soft">
              No event blocks overlap this {unitLabel}.
            </DashboardEmptyState>
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
      <DashboardItemCard chrome="soft" className="grid gap-3">
        <DashboardInlineHeader
          title={period.scale === 'day' ? 'Day mix' : 'Period mix'}
          titleWeight="semibold"
        />
        <div className="grid gap-2 text-sm leading-5 text-muted-foreground">
          <DetailKeyValueRow label="Blocks" value={period.allEventCount} />
          <DetailKeyValueRow
            label="Completed"
            value={period.completedEventCount}
          />
          <DetailKeyValueRow label="Planned" value={period.plannedEventCount} />
          {period.signalCount > 0 && (
            <DetailKeyValueRow label="Events" value={period.signalCount} />
          )}
          {period.urgentSignalCount > 0 && (
            <DetailKeyValueRow
              label="Urgent"
              value={period.urgentSignalCount}
              className="text-destructive"
              valueClassName="font-semibold text-destructive"
            />
          )}
        </div>
      </DashboardItemCard>

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
    <DashboardItemCard chrome="soft" className="grid gap-3">
      <DashboardInlineHeader
        title="Event digest"
        aside={
          <Badge
            variant={period.urgentSignalCount > 0 ? 'destructive' : 'secondary'}
          >
            {formatCountLabel(period.signalCount, 'event')}
          </Badge>
        }
        titleWeight="semibold"
      />

      <DashboardBadgeList gap="compact">
        {period.signalKindCounts.slice(0, 3).map((item) => (
          <Badge
            key={item.kind}
            variant="neutral"
            className="min-w-0 gap-1.5 font-medium"
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{
                backgroundColor: timelineSignalKindAccentColors[item.kind],
              }}
            />
            {timelineSignalKindLabels[item.kind]} {item.count}
          </Badge>
        ))}
      </DashboardBadgeList>

      <div className="grid gap-2">
        {visibleSignals.map((signal) => (
          <TimelineSignalRow
            key={`${signal.kind}:${signal.id}`}
            signal={signal}
            showDate={period.scale !== 'day'}
          />
        ))}
        {hiddenSignalCount > 0 && (
          <DashboardItemBodyText tone="muted" className="text-xs font-medium">
            +{formatCountLabel(hiddenSignalCount, 'more event')} in this period
          </DashboardItemBodyText>
        )}
      </div>
    </DashboardItemCard>
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
    <DashboardInlinePanel
      chrome="soft"
      padding="tight"
      className="min-w-0"
      stack="tight"
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          aria-hidden="true"
          className="h-2 w-2 shrink-0 rounded-full"
          style={{
            backgroundColor: timelineSignalKindAccentColors[signal.kind],
          }}
        />
        <span className="truncate text-sm font-medium">{signal.title}</span>
        {signal.urgent && <Badge variant="destructive">Urgent</Badge>}
      </div>
      <p className="truncate text-xs leading-5 text-muted-foreground">
        {getTimelineSignalDetail(signal, showDate)}
      </p>
    </DashboardInlinePanel>
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
  const providerDetails = getProviderDetails(event)
  const startsBeforePeriod = occurrence.startDate < period.startKey
  const endsAfterPeriod = occurrence.endDate > period.endKey

  return (
    <EventRow
      event={{
        ...event,
        date: occurrence.startDate,
        endDate: occurrence.endDate,
      }}
      stableId={stableId}
      chrome="soft"
      horseCount={event.horseIds.length}
      supplementalBadges={
        occurrence.isRecurring || occurrence.durationDays > 1 ? (
          <>
            {occurrence.durationDays > 1 && (
              <Badge variant="secondary">
                {formatCountLabel(occurrence.durationDays, 'day')}
              </Badge>
            )}
            {occurrence.isRecurring && (
              <Badge variant="secondary">Repeats</Badge>
            )}
            {(startsBeforePeriod || endsAfterPeriod) && (
              <Badge variant="outline">
                Continues through this {getTimelineScaleUnitLabel(period.scale)}
              </Badge>
            )}
          </>
        ) : undefined
      }
      supplementalMeta={[providerDetails ?? 'Provider details missing']}
      variant="summary"
    />
  )
}

function StableWatchlistPanel({
  items,
  className,
  span,
}: {
  items: Array<LabAttentionHorse>
  className?: string
  span?: ComponentProps<typeof DashboardSection>['span']
}) {
  return (
    <AnalysisPanel
      title="Stable watchlist"
      description="Collective view of horses creating the clearest care pressure across the stable. Open a horse tab for the underlying health, medication, and progress detail."
      action={
        <Badge variant="outline">
          {formatCountLabel(items.length, 'horse')}
        </Badge>
      }
      className={className}
      span={span}
    >
      {items.length === 0 ? (
        <DashboardEmptyState chrome="soft">
          No active health issues, medication records, or overdue reminders
          found.
        </DashboardEmptyState>
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
    <HorseCard
      horse={{
        name: horse.horseName,
        ownerName: horse.ownerName,
        breed: horse.breed,
      }}
      badges={
        <>
          {horse.highIssueCount > 0 && (
            <Badge variant="destructive">
              {formatCountLabel(horse.highIssueCount, 'high issue')}
            </Badge>
          )}
          {horse.activeIssueCount > 0 && (
            <Badge variant="destructive">
              {formatCountLabel(horse.activeIssueCount, 'active issue')}
            </Badge>
          )}
          {horse.activeMedicationCount > 0 && (
            <Badge variant="secondary">
              {formatCountLabel(
                horse.activeMedicationCount,
                'active medication',
              )}
            </Badge>
          )}
          {horse.overdueReminderCount > 0 && (
            <Badge variant="destructive">
              {formatCountLabel(horse.overdueReminderCount, 'overdue reminder')}
            </Badge>
          )}
        </>
      }
      meta={
        horse.missingProfileFields.length > 0 ? (
          <span>Also missing {horse.missingProfileFields.join(', ')}</span>
        ) : undefined
      }
    />
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
      action={
        <DashboardValueBadge>
          {formatCountLabel(itemCount, 'item')}
        </DashboardValueBadge>
      }
      className={className}
    >
      {itemCount === 0 ? (
        <DashboardEmptyState chrome="soft">
          No due reminders or planned events in the next 30 days.
        </DashboardEmptyState>
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
    <DashboardItemCard chrome="soft" className="grid gap-2">
      <DashboardInlineHeader
        as="h3"
        title={reminder.title}
        aside={<CareReminderCategoryBadge category={reminder.category} />}
        titleWeight="semibold"
      />
      <DashboardItemBodyText tone="muted">
        Due {formatEventDate(reminder.dueDate)}
        {reminder.horseName ? ` · ${reminder.horseName}` : ''}
      </DashboardItemBodyText>
      {reminder.priority && (
        <CareReminderPriorityBadge priority={reminder.priority} />
      )}
    </DashboardItemCard>
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
    <EventRow
      event={event}
      stableId={stableId}
      chrome="soft"
      horseCount={event.horseIds.length}
      supplementalMeta={['Planned care block']}
      variant="summary"
    />
  )
}

function DocumentationGapsPanel({
  events,
  coverage,
  stableId,
  className,
  span,
}: {
  events: Array<LabEvent>
  coverage: LabCompletionCoverage
  stableId: DashboardLabData['stable']['_id']
  className?: string
  span?: ComponentProps<typeof DashboardSection>['span']
}) {
  return (
    <AnalysisPanel
      title="Documentation gaps"
      description="Completed stable care that still needs aftercare notes. Provider contact is left out here until required provider rules are defined."
      action={
        <Badge variant={events.length > 0 ? 'destructive' : 'secondary'}>
          {formatCountLabel(events.length, 'gap')}
        </Badge>
      }
      className={className}
      span={span}
    >
      <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <DocumentationCoverageSummary coverage={coverage} />
        {events.length === 0 ? (
          <DashboardEmptyState chrome="soft">
            All completed events have aftercare notes.
          </DashboardEmptyState>
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
    <DashboardItemCard chrome="soft" className="grid content-start gap-3">
      <DashboardInlineHeader
        title="Completion notes"
        titleWeight="semibold"
        aside={
          hasCompletedCare ? (
            <Badge
              variant={
                coverage.eventNoteCoveragePercent < 75
                  ? 'destructive'
                  : 'secondary'
              }
            >
              {coverage.eventNoteCoveragePercent}%
            </Badge>
          ) : (
            <Badge variant="outline">No completed care</Badge>
          )
        }
      />
      <DashboardItemBodyText tone="muted">
        {hasCompletedCare
          ? `${coverage.eventsWithNotesCount}/${coverage.completedEventCount} completed events documented`
          : 'Coverage is shown once at least one event has been completed.'}
      </DashboardItemBodyText>
      {hasCompletedCare ? (
        <Progress
          value={coverage.eventNoteCoveragePercent}
          label="Completion note coverage"
        />
      ) : null}
    </DashboardItemCard>
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
    <EventRow
      event={event}
      stableId={stableId}
      chrome="soft"
      horseCount={event.horseIds.length}
      supplementalBadges={<Badge variant="destructive">Notes needed</Badge>}
      variant="summary"
    />
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
    const currentPeriod = getPeriodContainingDate(
      periods,
      timeline.currentBucket.key,
    )
    if (currentPeriod) return currentPeriod
  }

  if (timeline.busiestBucket) {
    const busiestPeriod = getPeriodContainingDate(
      periods,
      timeline.busiestBucket.key,
    )
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
  return formatMetaText([event.providerName, event.providerPhone]) || null
}

function getTimelineSignalDetail(signal: LabTimelineSignal, showDate: boolean) {
  return formatMetaText([
    timelineSignalKindLabels[signal.kind],
    showDate ? formatEventDate(signal.date) : undefined,
    signal.horseName,
    signal.detail,
  ])
}
