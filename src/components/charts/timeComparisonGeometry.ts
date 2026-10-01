import { dateNumber } from 'shared/analysis/horseComparison'

export type TimeChartPoint = {
  id: string
  date: string
  value?: number
  endDate?: string
  openEnd?: boolean
  label: string
  recordIds: Array<string>
}

export type TimeChartRow = {
  id: string
  label: string
  unit?: string
  type: 'line' | 'bar' | 'events' | 'intervals'
  color: string
  points: Array<TimeChartPoint>
  domain?: readonly [number, number]
}

export function numericDomain(row: TimeChartRow): readonly [number, number] {
  if (row.domain) return row.domain
  const values = row.points.flatMap((point) =>
    point.value !== undefined && Number.isFinite(point.value)
      ? [point.value]
      : [],
  )
  if (!values.length) return [0, 1]
  const min = Math.min(...values),
    max = Math.max(...values)
  if (row.type === 'bar') return [0, Math.max(1, max)]
  const padding = Math.max((max - min) * 0.15, Math.abs(max) * 0.005, 0.5)
  return [min - padding, max + padding]
}

export function timePosition(
  date: string,
  start: string,
  end: string,
  left: number,
  right: number,
) {
  const span = dateNumber(end) - dateNumber(start)
  if (span <= 0) return (left + right) / 2
  return (
    left +
    Math.max(0, Math.min(1, (dateNumber(date) - dateNumber(start)) / span)) *
      (right - left)
  )
}

/** Pack interval/marker lanes in pixels so close dates remain independently selectable. */
export function layoutContextPoints(
  points: Array<TimeChartPoint>,
  position: (date: string) => number,
  end: string,
) {
  const laneEnds: Array<number> = []
  return [...points]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((point) => {
      const left = position(point.date)
      const right = position(
        point.openEnd ? end : (point.endDate ?? point.date),
      )
      let lane = laneEnds.findIndex((value) => value + 32 < left)
      if (lane === -1) lane = laneEnds.length
      laneEnds[lane] = right
      return { point, left, right, lane }
    })
}
