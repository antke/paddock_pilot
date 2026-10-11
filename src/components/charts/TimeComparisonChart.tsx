import { useEffect, useId, useRef, useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import {
  dateNumber,
  dayMilliseconds,
  shiftDate,
} from 'shared/analysis/horseComparison'
import type { ComparisonRange } from 'shared/analysis/horseComparison'
import {
  layoutContextPoints,
  numericDomain,
  timePosition,
  timeChartMarkBounds,
} from './timeComparisonGeometry'
import type { TimeChartPoint, TimeChartRow } from './timeComparisonGeometry'

export type { TimeChartPoint, TimeChartRow } from './timeComparisonGeometry'

/** Shared rendering only: callers own records, aggregation, units and translations. */
export function TimeComparisonChart({
  rows,
  range,
  selectedId,
  focusedDate,
  clusterLabel,
  onSelect,
  formatDate,
  formatNumber,
  emptyLabel,
  axisLabel,
  ariaLabel,
  minTickSpacing = 80,
}: {
  rows: Array<TimeChartRow>
  range: ComparisonRange
  selectedId?: string
  focusedDate?: string
  clusterLabel?: (count: number, start: string, end: string) => string
  onSelect: (point: TimeChartPoint) => void
  formatDate: (date: string) => string
  formatNumber: (value: number) => string
  emptyLabel: string
  axisLabel: string
  ariaLabel: string
  minTickSpacing?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(600)
  const [hoveredId, setHoveredId] = useState<string>()
  const [focusedId, setFocusedId] = useState<string>()
  const id = useId()
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const resize = () => {
      const measuredWidth = element.getBoundingClientRect().width
      if (measuredWidth > 0) setWidth(measuredWidth)
    }
    resize()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(resize)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const left = 60,
    right = width - 24
  const position = (date: string) =>
    timePosition(date, range.start, range.end, left, right)
  const days = Math.round(
    (dateNumber(range.end) - dateNumber(range.start)) / dayMilliseconds,
  )
  const tickCount = Math.min(
    6,
    Math.max(2, Math.floor((right - left) / minTickSpacing) + 1),
    days + 1,
  )
  const ticks = Array.from({ length: tickCount }, (_, index) =>
    shiftDate(
      range.start,
      Math.round((index * days) / Math.max(1, tickCount - 1)),
    ),
  )
  return (
    <div ref={ref} className="min-w-0" role="group" aria-label={ariaLabel}>
      {focusedDate &&
        focusedDate >= range.start &&
        focusedDate <= range.end && (
          <p className="mb-3 text-sm font-medium tabular-nums">
            {formatDate(focusedDate)}
          </p>
        )}
      {rows.map((row, rowIndex) => {
        const numeric = row.type === 'line' || row.type === 'bar'
        const packed = layoutContextPoints(row.points, position, range.end)
        const height = numeric
          ? 184
          : row.type === 'events'
            ? 70
            : Math.max(
                66,
                (Math.max(0, ...packed.map((p) => p.lane)) + 1) * 48 + 22,
              )
        const top = 18,
          bottom = height - 24
        const [min, max] = numericDomain(row)
        const valueY = (value: number) =>
          bottom - ((value - min) / (max - min)) * (bottom - top)
        const points = row.points
          .filter((p) => p.value !== undefined && Number.isFinite(p.value))
          .sort((a, b) => a.date.localeCompare(b.date))
        const yTicks =
          row.type === 'bar'
            ? [...new Set([0, Math.round(max / 2), max])]
            : [min, (min + max) / 2, max]
        const marks = numeric
          ? points.map((point) => ({
              point,
              left: position(point.date),
              right: position(
                row.type === 'bar' ? (point.endDate ?? point.date) : point.date,
              ),
              lane: 0,
              top: valueY(point.value!),
            }))
          : packed.map((p) => ({
              ...p,
              top: row.type === 'events' ? 30 : 24 + p.lane * 48,
            }))
        const slots = Math.max(1, Math.floor((right - left) / 44))
        const slotWidth = (right - left) / slots
        const targets = new Map<string, typeof marks>()
        for (const mark of marks) {
          const slot = Math.min(
            slots - 1,
            Math.max(
              0,
              Math.floor(((mark.left + mark.right) / 2 - left) / slotWidth),
            ),
          )
          const key = row.type === 'intervals' ? mark.point.id : `${slot}`
          targets.set(key, [...(targets.get(key) ?? []), mark])
        }
        const targetGroups = [...targets.entries()].map(([key, group]) => {
          const bounds = group.map((mark) =>
            timeChartMarkBounds(row.type, mark, bottom),
          )
          const x = Math.min(...bounds.map((bound) => bound.x))
          const y = Math.min(...bounds.map((bound) => bound.y))
          const endX = Math.max(...bounds.map((bound) => bound.x + bound.width))
          const endY = Math.max(
            ...bounds.map((bound) => bound.y + bound.height),
          )
          const first = group[0]
          const last = group.at(-1)!
          const point: TimeChartPoint =
            group.length === 1
              ? first.point
              : {
                  id: `cluster:${row.id}:${key}`,
                  date: first.point.date,
                  recordIds: group.flatMap((mark) => mark.point.recordIds),
                  label:
                    clusterLabel?.(
                      group.length,
                      first.point.date,
                      last.point.endDate ?? last.point.date,
                    ) ?? group.map((mark) => mark.point.label).join('; '),
                }
          return { key, group, point, x, y, endX, endY }
        })
        const highlighted = new Set(
          targetGroups
            .filter(({ point }) =>
              [hoveredId, focusedId, selectedId].includes(point.id),
            )
            .flatMap(({ group }) => group.map((mark) => mark.point.id)),
        )
        return (
          <div
            key={row.id}
            className="min-w-0"
            aria-labelledby={`${id}-${rowIndex}`}
          >
            <div
              className="flex flex-wrap items-center gap-2 text-sm font-medium"
              id={`${id}-${rowIndex}`}
            >
              <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{ backgroundColor: row.color }}
              />
              {row.label}
              {row.unit ? ` (${row.unit})` : ''}
            </div>
            {row.points.length === 0 ? (
              <DashboardEmptyState chrome="flat" className="py-5">
                {emptyLabel}
              </DashboardEmptyState>
            ) : (
              <div className="relative" style={{ height }}>
                <svg
                  width="100%"
                  height={height}
                  viewBox={`0 0 ${width} ${height}`}
                  aria-hidden="true"
                  className="overflow-visible"
                >
                  {ticks.map((date) => (
                    <line
                      key={date}
                      x1={position(date)}
                      x2={position(date)}
                      y1={8}
                      y2={height - 6}
                      stroke="var(--border-subtle)"
                    />
                  ))}
                  {focusedDate &&
                    focusedDate >= range.start &&
                    focusedDate <= range.end && (
                      <line
                        x1={position(focusedDate)}
                        x2={position(focusedDate)}
                        y1={8}
                        y2={height - 6}
                        stroke="var(--foreground)"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                      />
                    )}
                  {numeric &&
                    yTicks.map((value, index) => (
                      <g key={index}>
                        <line
                          x1={left}
                          x2={right}
                          y1={valueY(value)}
                          y2={valueY(value)}
                          stroke="var(--border-subtle)"
                        />
                        <text
                          x={left - 10}
                          y={valueY(value) + 4}
                          textAnchor="end"
                          fill="var(--muted-foreground)"
                          fontSize={12}
                        >
                          {formatNumber(value)}
                        </text>
                      </g>
                    ))}
                  {row.type === 'line' && points.length > 1 && (
                    <path
                      d={points
                        .map(
                          (point, index) =>
                            `${index ? 'L' : 'M'}${position(point.date)},${valueY(point.value!)}`,
                        )
                        .join(' ')}
                      fill="none"
                      stroke={row.color}
                      strokeWidth={2}
                    />
                  )}
                  {marks.map((mark) => (
                    <g
                      key={mark.point.id}
                      data-chart-mark={mark.point.id}
                      data-highlighted={
                        highlighted.has(mark.point.id) || undefined
                      }
                      stroke={
                        highlighted.has(mark.point.id)
                          ? 'var(--foreground)'
                          : 'none'
                      }
                      strokeWidth={2}
                    >
                      {row.type === 'line' && (
                        <circle
                          cx={mark.left}
                          cy={mark.top}
                          r={4}
                          fill={row.color}
                        />
                      )}
                      {row.type === 'bar' && (
                        <rect
                          {...timeChartMarkBounds(row.type, mark, bottom)}
                          rx={2}
                          fill={row.color}
                        />
                      )}
                      {row.type === 'events' && (
                        <path
                          d={`M${mark.left},${mark.top - 6} l6,6 -6,6 -6,-6 Z`}
                          fill={row.color}
                        />
                      )}
                      {row.type === 'intervals' && (
                        <>
                          <rect
                            {...timeChartMarkBounds(row.type, mark, bottom)}
                            rx={3}
                            fill={row.color}
                            fillOpacity={0.35}
                          />
                          <line
                            x1={mark.left}
                            x2={mark.left}
                            y1={mark.top - 8}
                            y2={mark.top + 8}
                            stroke={row.color}
                            strokeWidth={2}
                          />
                          <line
                            x1={mark.right}
                            x2={mark.right}
                            y1={mark.top - 8}
                            y2={mark.top + 8}
                            stroke={row.color}
                            strokeWidth={2}
                            strokeDasharray={
                              mark.point.openEnd ? '2 2' : undefined
                            }
                          />
                        </>
                      )}
                    </g>
                  ))}
                </svg>
                {targetGroups.map((target) => {
                  const { key, group, point, x, y, endX, endY } = target
                  // Keep generous targets around small marks, but split the gap
                  // between neighbours so one cannot intercept the other's shape.
                  const neighbours = targetGroups.filter(
                    (other) =>
                      other !== target &&
                      (row.type !== 'intervals' ||
                        other.group[0].lane === group[0].lane),
                  )
                  const before = Math.max(
                    left - 22,
                    ...neighbours
                      .filter((other) => other.endX <= x)
                      .map((other) => (other.endX + x) / 2),
                  )
                  const after = Math.min(
                    right + 22,
                    ...neighbours
                      .filter((other) => other.x >= endX)
                      .map((other) => (other.x + endX) / 2),
                  )
                  const centerX = (x + endX) / 2
                  const hitLeft = Math.max(before, Math.min(x, centerX - 22))
                  const hitRight = Math.min(after, Math.max(endX, centerX + 22))
                  const hitHeight = Math.max(44, endY - y)
                  return (
                    <Tooltip key={key}>
                      <TooltipTrigger
                        aria-label={point.label}
                        aria-pressed={selectedId === point.id}
                        onClick={() => onSelect(point)}
                        onMouseEnter={() => setHoveredId(point.id)}
                        onMouseLeave={() => setHoveredId(undefined)}
                        onFocus={() => setFocusedId(point.id)}
                        onBlur={() => setFocusedId(undefined)}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-0 outline-none"
                        data-chart-target={point.id}
                        style={{
                          left: (hitLeft + hitRight) / 2,
                          top: (y + endY) / 2,
                          width: hitRight - hitLeft,
                          height: hitHeight,
                        }}
                      >
                        {group.length > 1 && (
                          <span
                            aria-hidden="true"
                            className="inline-flex size-5 items-center justify-center rounded-full bg-background text-xs font-semibold text-foreground ring-1 ring-border"
                          >
                            {group.length}
                          </span>
                        )}
                        <span className="sr-only">{point.label}</span>
                      </TooltipTrigger>
                      <TooltipContent>{point.label}</TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
      <svg
        width="100%"
        height={58}
        viewBox={`0 0 ${width} 58`}
        role="img"
        aria-label={`${axisLabel}: ${formatDate(range.start)} – ${formatDate(range.end)}`}
      >
        <line x1={left} x2={right} y1={1} y2={1} stroke="var(--border)" />
        {ticks.map((date, index) => (
          <text
            key={date}
            x={position(date)}
            y={23}
            textAnchor={
              index === 0
                ? 'start'
                : index === ticks.length - 1
                  ? 'end'
                  : 'middle'
            }
            fill="var(--muted-foreground)"
            fontSize={12}
          >
            {formatDate(date)}
          </text>
        ))}
        <text
          x={(left + right) / 2}
          y={49}
          textAnchor="middle"
          fill="var(--muted-foreground)"
          fontSize={12}
        >
          {axisLabel}
        </text>
      </svg>
    </div>
  )
}
