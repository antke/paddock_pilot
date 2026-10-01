import { describe, expect, it } from 'vitest'
import type { HorseComparisonRecord } from 'shared/analysis/horseComparison'
import { dateInTimeZone } from 'shared/analysis/horseComparison'
import {
  comparisonRecordLabel,
  createComparisonRows,
  horseComparisonPresets,
} from './horseComparisonData'
import {
  numericDomain,
  timePosition,
} from '#/components/charts/timeComparisonGeometry'

const range = { start: '2026-02-01', end: '2026-03-01' }
const records: Array<HorseComparisonRecord> = [
  { id: 'w1', kind: 'weight', date: '2026-02-03', value: 500 },
  {
    id: 't1',
    kind: 'training',
    date: '2026-02-05',
    status: 'completed',
    durationMinutes: 30,
  },
  {
    id: 't2',
    kind: 'training',
    date: '2026-02-05',
    status: 'completed',
    durationMinutes: 40,
  },
  { id: 't3', kind: 'training', date: '2026-02-06', status: 'completed' },
  {
    id: 't4',
    kind: 'training',
    date: '2026-02-07',
    status: 'planned',
    durationMinutes: 60,
  },
]
describe('comparison projection', () => {
  it('groups same-day training without inventing missing durations or counting plans', () => {
    const data = createComparisonRows(
      records,
      horseComparisonPresets.weightTraining,
      range,
      'en',
    )
    expect(
      data.rows.find((row) => row.id === 'training')?.points,
    ).toMatchObject([
      { date: '2026-02-05', value: 70, recordIds: ['t1', 't2'] },
    ])
    expect(
      data.rows
        .find((row) => row.id === 'missingDuration')
        ?.points.map((p) => p.id),
    ).toEqual(['t3'])
    expect(data.completed).toHaveLength(3)
    expect(data.records.map((r) => r.id)).not.toContain('t4')
  })
  it('counts completed sessions with missing duration and exposes other statuses only as context', () => {
    const data = createComparisonRows(
      records,
      { measure: 'sessions', context: 'none', extra: 'none' },
      range,
      'en',
      true,
    )
    expect(data.rows[0].points.map((p) => p.value)).toEqual([2, 1])
    expect(
      data.rows.find((row) => row.id === 'otherTraining')?.points[0].recordIds,
    ).toEqual(['t4'])
  })
  it('retains a single weight point, uses real date distances, and deduplicates context lanes', () => {
    const data = createComparisonRows(
      records,
      { measure: 'weight', context: 'weight', extra: 'condition' },
      range,
      'en',
    )
    expect(data.rows).toHaveLength(2)
    const domain = numericDomain(data.rows[0])
    expect(domain[0]).toBeLessThan(500)
    expect(domain[1]).toBeGreaterThan(500)
    expect(data.rows[1].points).toEqual([])
    expect(timePosition('2026-02-05', range.start, range.end, 0, 280)).toBe(40)
    expect(timePosition('2026-02-25', range.start, range.end, 0, 280)).toBe(240)
  })
  it('uses historical daylight-saving offset for measurement dates', () => {
    expect(
      dateInTimeZone(Date.parse('2026-07-02T22:30:00Z'), 'Europe/Warsaw'),
    ).toBe('2026-07-03')
    expect(
      dateInTimeZone(Date.parse('2026-01-02T22:30:00Z'), 'Europe/Warsaw'),
    ).toBe('2026-01-02')
  })
})

it('keeps years in actual record labels across historical ranges', () => {
  for (const locale of ['en', 'pl'] as const) {
    const earlier = comparisonRecordLabel(
      { id: 'a', kind: 'weight', date: '2025-02-02', value: 500 },
      locale,
    )
    const later = comparisonRecordLabel(
      { id: 'b', kind: 'weight', date: '2026-02-02', value: 500 },
      locale,
    )
    expect(earlier).toContain('2025')
    expect(later).toContain('2026')
    expect(earlier).not.toBe(later)
  }
})
