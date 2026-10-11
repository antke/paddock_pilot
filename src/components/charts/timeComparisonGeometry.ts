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

export type TimeChartMark = {
  point: TimeChartPoint
  left: number
  right: number
  top: number
  lane: number
}

/** One geometry source for the visible mark, highlight and pointer target. */
export function timeChartMarkBounds(
  type: TimeChartRow['type'],
  mark: TimeChartMark,
  bottom: number,
) {
  if (type === 'bar')
    return {
      x: mark.right > mark.left ? mark.left + 2 : mark.left - 3,
      y: mark.top,
      width: Math.max(
        2,
        mark.right > mark.left ? mark.right - mark.left - 4 : 6,
      ),
      height: Math.max(2, bottom - mark.top),
    }
  if (type === 'intervals')
    return {
      x: mark.left,
      y: mark.top - 8,
      width: Math.max(4, mark.right - mark.left),
      height: 16,
    }
  const size = type === 'events' ? 12 : 8
  return {
    x: mark.left - size / 2,
    y: mark.top - size / 2,
    width: size,
    height: size,
  }
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
      let lane = laneEnds.findIndex((value) => value + 44 < left)
      if (lane === -1) lane = laneEnds.length
      laneEnds[lane] = right
      return { point, left, right, lane }
    })
}
