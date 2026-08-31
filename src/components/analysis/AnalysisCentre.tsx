import { DashboardBadgeList } from '#/components/dashboard/DashboardBadgeList'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardInlineHeader } from '#/components/dashboard/DashboardInlineHeader'
import { DashboardInlinePanel } from '#/components/dashboard/DashboardInlinePanel'
import {
  DashboardItemCard,
  DashboardItemBodyText,
  DashboardItemFieldsetCard,
  DashboardItemLinkCard,
  DashboardItemRecordContent,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardLayoutStack } from '#/components/dashboard/DashboardLayoutGrid'
import { DashboardSectionTabs } from '#/components/dashboard/DashboardNavigation'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import {
  DetailKeyValueList,
  DetailKeyValueRow,
} from '#/components/dashboard/DetailBlocks'
import { EventRow } from '#/components/events/EventRow'
import { formatEventDate } from '#/components/events/eventDisplay'
import { Badge } from '#/components/ui/badge'
import { Checkbox } from '#/components/ui/checkbox'
import { ChoiceButtonGroup } from '#/components/ui/choice-button-group'
import { FieldLabel } from '#/components/ui/field'
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
type LabHorse = DashboardLabData['horses'][number]
type StableAnalysis = FunctionReturnType<typeof api.stableAnalysis.getForStable>
type UnlockedStableAnalysis = Extract<StableAnalysis, { hasAccess: true }>
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
const stableAttentionListVisibleItemLimit = 4
const stableAttentionListEstimatedItemHeightRem = 5.75

type StableAttentionItem = {
  id: string
  title: string
  meta: Array<string>
  description?: string
  priority: number
  date: string
  accent: 'danger' | 'warning'
  target:
    | { kind: 'reminders' }
    | { kind: 'horse-care'; horseId: string }
    | { kind: 'event'; eventId: string }
}

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
  const stableAttentionItems = unlockedStableAnalysis
    ? createStableAttentionItems(unlockedStableAnalysis)
    : []
  const [activeAnalysisTab, setActiveAnalysisTab] = useState(
    stableAnalysisTabValue,
  )
  const [selectedTimelineDateKey, setSelectedTimelineDateKey] = useState<
    string | null
  >(null)
  const [timelineScale, setTimelineScale] = useState<StableTimelineScale>('day')
  const [visibleSeries, setVisibleSeries] = useState<
    Array<StableEventSeriesKey>
  >(['all'])
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
      if (seriesKey === 'all') return ['all']

      const specificSeries = currentSeries.filter((key) => key !== 'all')
      const nextSeries = specificSeries.includes(seriesKey)
        ? specificSeries.filter((key) => key !== seriesKey)
        : [...specificSeries, seriesKey]

      return nextSeries.length > 0 ? nextSeries : ['all']
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
      <DashboardPageHeader title="Analysis Centre" />

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
            <StableNeedsAttentionPanel
              items={stableAttentionItems}
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
      aria-label="Timeline blocks"
      chrome="soft"
      density="compact"
      className={cn('grid gap-3 p-3 md:p-4', className)}
    >
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
              <FieldLabel
                htmlFor={checkboxId}
                interactive={!isLastActiveSeries}
                width="full"
                className={cn(
                  'min-w-0 items-center gap-2',
                  isLastActiveSeries && 'cursor-default opacity-70',
                )}
              >
                <TimelineSeriesMarker
                  visual={option.visual}
                  color={option.color}
                />
                <span className="truncate">{option.label}</span>
              </FieldLabel>
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
      aria-label="Timeline event categories"
      chrome="soft"
      density="compact"
      className={cn('grid gap-3 p-3 md:p-4', className)}
    >
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
              <FieldLabel
                htmlFor={checkboxId}
                interactive={!isLastActiveType}
                width="full"
                className={cn(
                  'min-w-0 items-center gap-2',
                  isLastActiveType && 'cursor-default opacity-70',
                )}
              >
                <TimelineEventTypeIcon type={option.type} />
                <span className="truncate">{eventTypeLabels[option.type]}</span>
              </FieldLabel>
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
        <DetailKeyValueList>
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
        </DetailKeyValueList>
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
      supplementalMeta={[
        occurrence.durationDays > 1
          ? formatCountLabel(occurrence.durationDays, 'day')
          : undefined,
        occurrence.isRecurring ? 'Repeats' : undefined,
        startsBeforePeriod || endsAfterPeriod
          ? `Continues through this ${getTimelineScaleUnitLabel(period.scale)}`
          : undefined,
        providerDetails ?? 'Provider details missing',
      ]}
      variant="summary"
    />
  )
}

function StableNeedsAttentionPanel({
  items,
  stableId,
  className,
  span,
}: {
  items: Array<StableAttentionItem>
  stableId: DashboardLabData['stable']['_id']
  className?: string
  span?: ComponentProps<typeof DashboardSection>['span']
}) {
  return (
    <AnalysisPanel
      title="Needs attention"
      description="Overdue care, high-severity issues, and missing follow-up notes that need a decision."
      className={className}
      span={span}
    >
      {items.length === 0 ? (
        <DashboardEmptyState chrome="soft">
          No urgent actions or missing follow-up notes.
        </DashboardEmptyState>
      ) : (
        <AnalysisList
          itemCount={items.length}
          visibleItemLimit={stableAttentionListVisibleItemLimit}
          estimatedItemHeightRem={stableAttentionListEstimatedItemHeightRem}
        >
          {items.map((item) => (
            <StableAttentionRow key={item.id} item={item} stableId={stableId} />
          ))}
        </AnalysisList>
      )}
    </AnalysisPanel>
  )
}

function StableAttentionRow({
  item,
  stableId,
}: {
  item: StableAttentionItem
  stableId: DashboardLabData['stable']['_id']
}) {
  const content = (
    <DashboardItemRecordContent
      title={item.title}
      titleTone="open"
      meta={
        <>
          {item.meta.map((value) => (
            <span key={value}>{value}</span>
          ))}
        </>
      }
      description={item.description}
      descriptionClassName="max-w-3xl text-foreground"
    />
  )
  const className = 'hover:bg-surface-elevated active:bg-primary/10'

  if (item.target.kind === 'horse-care') {
    return (
      <DashboardItemLinkCard
        to="/stables/$stableId/horses/$horseId/care"
        params={{ stableId, horseId: item.target.horseId }}
        accent={item.accent}
        chrome="cards"
        density="compact"
        className={className}
      >
        {content}
      </DashboardItemLinkCard>
    )
  }

  if (item.target.kind === 'event') {
    return (
      <DashboardItemLinkCard
        to="/stables/$stableId/events/$eventId"
        params={{ stableId, eventId: item.target.eventId }}
        accent={item.accent}
        chrome="cards"
        density="compact"
        className={className}
      >
        {content}
      </DashboardItemLinkCard>
    )
  }

  return (
    <DashboardItemLinkCard
      to="/stables/$stableId/reminders"
      params={{ stableId }}
      accent={item.accent}
      chrome="cards"
      density="compact"
      className={className}
    >
      {content}
    </DashboardItemLinkCard>
  )
}

function createStableAttentionItems(
  stableAnalysis: UnlockedStableAnalysis,
): Array<StableAttentionItem> {
  const urgentSignals = stableAnalysis.timelineSignals
    .filter((signal) => signal.urgent)
    .map((signal): StableAttentionItem => {
      const isReminder = signal.kind === 'reminder'
      const isOverdueReminder = isReminder && signal.date < stableAnalysis.today

      return {
        id: `${signal.kind}:${signal.id}`,
        title: signal.title,
        meta: [
          signal.horseName,
          isReminder
            ? `Due ${formatEventDate(signal.date)}`
            : formatEventDate(signal.date),
        ].filter((value): value is string => Boolean(value)),
        description: isReminder
          ? isOverdueReminder
            ? 'This care reminder is overdue.'
            : 'This care reminder has high priority.'
          : 'This active health issue has high severity.',
        priority: isOverdueReminder ? 0 : signal.kind === 'health' ? 1 : 2,
        date: signal.date,
        accent:
          isOverdueReminder || signal.kind === 'health' ? 'danger' : 'warning',
        target:
          signal.kind === 'health' && signal.horseId
            ? { kind: 'horse-care', horseId: String(signal.horseId) }
            : { kind: 'reminders' },
      }
    })

  const overdueCare = stableAnalysis.careCadence
    .filter((item) => item.overdue)
    .map(
      (item): StableAttentionItem => ({
        id: `cadence:${item.horseId}:${item.type}`,
        title: `${eventTypeLabels[item.type]} care is overdue`,
        meta: [
          item.horseName,
          item.lastCompletedDate
            ? `Last completed ${formatEventDate(item.lastCompletedDate)}`
            : undefined,
        ].filter((value): value is string => Boolean(value)),
        description: `The usual interval is ${formatCountLabel(item.expectedDays, 'day')}.`,
        priority: 3,
        date: item.lastCompletedDate ?? '',
        accent: 'warning',
        target: { kind: 'horse-care', horseId: String(item.horseId) },
      }),
    )

  const missingEventNotes = stableAnalysis.completionNotesNeeded.map(
    (event): StableAttentionItem => ({
      id: `event-notes:${event._id}`,
      title: `${event.title} needs follow-up notes`,
      meta: [formatEventDate(event.date)],
      description: 'The completed event has no aftercare notes.',
      priority: 4,
      date: event.date,
      accent: 'warning',
      target: { kind: 'event', eventId: String(event._id) },
    }),
  )

  const missingHorseOutcomes = stableAnalysis.horseOutcomeNotesNeeded.map(
    (outcome): StableAttentionItem => ({
      id: `horse-outcome:${outcome.id}`,
      title: `${outcome.horseName} needs an outcome note`,
      meta: [outcome.eventTitle, formatEventDate(outcome.eventDate)],
      description:
        'This horse has no recorded outcome for the completed event.',
      priority: 5,
      date: outcome.eventDate,
      accent: 'warning',
      target: { kind: 'event', eventId: String(outcome.eventId) },
    }),
  )

  return [
    ...urgentSignals,
    ...overdueCare,
    ...missingEventNotes,
    ...missingHorseOutcomes,
  ].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority
    return a.date.localeCompare(b.date)
  })
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
