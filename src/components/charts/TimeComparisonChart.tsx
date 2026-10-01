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
} from './timeComparisonGeometry'
import type { TimeChartPoint, TimeChartRow } from './timeComparisonGeometry'

export type { TimeChartPoint, TimeChartRow } from './timeComparisonGeometry'

/** Shared rendering only: callers own records, aggregation, units and translations. */
export function TimeComparisonChart({
  rows,
  range,
  selectedId,
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
  const id = useId()
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const resize = () =>
      setWidth(Math.max(240, element.getBoundingClientRect().width))
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
      {rows.map((row, rowIndex) => {
        const numeric = row.type === 'line' || row.type === 'bar'
        const packed = layoutContextPoints(row.points, position, range.end)
        const height = numeric
          ? 184
          : Math.max(
              66,
              (Math.max(0, ...packed.map((p) => p.lane)) + 1) * 38 + 22,
            )
        const top = 18,
          bottom = height - 24
        const [min, max] = numericDomain(row)
        const y = (value: number) =>
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
              right: position(point.date),
              lane: 0,
              top: y(point.value!),
            }))
          : packed.map((p) => ({ ...p, top: 24 + p.lane * 38 }))
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
                  {numeric &&
                    yTicks.map((value, index) => (
                      <g key={index}>
                        <line
                          x1={left}
                          x2={right}
                          y1={y(value)}
                          y2={y(value)}
                          stroke="var(--border-subtle)"
                        />
                        <text
                          x={left - 10}
                          y={y(value) + 4}
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
                            `${index ? 'L' : 'M'}${position(point.date)},${y(point.value!)}`,
                        )
                        .join(' ')}
                      fill="none"
                      stroke={row.color}
                      strokeWidth={2}
                    />
                  )}
                  {marks.map((mark) => (
                    <g key={mark.point.id}>
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
                          x={mark.left - 5}
                          y={mark.top}
                          width={10}
                          height={Math.max(2, bottom - mark.top)}
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
                            x={mark.left}
                            y={mark.top - 8}
                            width={Math.max(4, mark.right - mark.left)}
                            height={16}
                            rx={3}
                            fill={row.color}
                            opacity={0.35}
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
                {marks.map((mark) => (
                  <Tooltip key={mark.point.id}>
                    <TooltipTrigger
                      aria-label={mark.point.label}
                      aria-pressed={selectedId === mark.point.id}
                      onClick={() => onSelect(mark.point)}
                      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-control border border-transparent bg-transparent hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-pressed:border-primary"
                      style={{
                        left: (mark.left + mark.right) / 2,
                        top: mark.top,
                        width: Math.max(28, mark.right - mark.left),
                        height: 28,
                      }}
                    >
                      <span className="sr-only">{mark.point.label}</span>
                    </TooltipTrigger>
                    <TooltipContent>{mark.point.label}</TooltipContent>
                  </Tooltip>
                ))}
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
