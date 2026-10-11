// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { TimeComparisonChart } from './TimeComparisonChart'
import type { TimeChartRow } from './TimeComparisonChart'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

it.each([800, 220])(
  'covers the full interval and actual bar at width %i, highlighting the shapes on hover and focus',
  (viewportWidth) => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      width: viewportWidth,
    } as DOMRect)
    const onSelect = vi.fn()
    const rows: TimeChartRow[] = [
      {
        id: 'health',
        label: 'Health',
        type: 'intervals',
        color: 'red',
        points: [
          {
            id: 'issue',
            date: '2026-09-02',
            endDate: '2026-09-16',
            label: 'Fourteen-day issue',
            recordIds: ['issue'],
          },
          {
            id: 'overlapping',
            date: '2026-09-03',
            endDate: '2026-09-12',
            label: 'Overlapping issue',
            recordIds: ['overlapping'],
          },
        ],
      },
      {
        id: 'training',
        label: 'Training',
        type: 'bar',
        color: 'green',
        points: [
          {
            id: 'sessions',
            date: '2026-09-07',
            endDate: '2026-09-13',
            value: 3,
            label: 'Three sessions',
            recordIds: ['a', 'b', 'c'],
          },
        ],
      },
    ]
    render(
      <TimeComparisonChart
        rows={rows}
        range={{ start: '2026-09-01', end: '2026-09-30' }}
        onSelect={onSelect}
        formatDate={(date) => date}
        formatNumber={String}
        emptyLabel="No records"
        axisLabel="Date"
        ariaLabel="Comparison"
      />,
    )
    const chart = screen.getByRole('group', { name: 'Comparison' })
    expect(
      chart.querySelector('svg')?.getAttribute('viewBox')?.split(' ')[2],
    ).toBe(String(viewportWidth))
    for (const [id, label] of [
      ['issue', 'Fourteen-day issue'],
      ['sessions', 'Three sessions'],
    ]) {
      const button = within(chart).getByRole('button', { name: label })
      const mark = chart.querySelector(`[data-chart-mark="${id}"]`)!
      const shape = mark.querySelector('rect')!
      const x = Number(shape.getAttribute('x')),
        y = Number(shape.getAttribute('y'))
      const width = Number(shape.getAttribute('width')),
        height = Number(shape.getAttribute('height'))
      const hitX = parseFloat(button.style.left),
        hitWidth = parseFloat(button.style.width)
      const hitY = parseFloat(button.style.top),
        hitHeight = parseFloat(button.style.height)
      expect(hitX - hitWidth / 2).toBeLessThanOrEqual(x)
      expect(hitX + hitWidth / 2).toBeGreaterThanOrEqual(x + width)
      expect(hitY - hitHeight / 2).toBeLessThanOrEqual(y)
      expect(hitY + hitHeight / 2).toBeGreaterThanOrEqual(y + height)
      expect(hitHeight).toBe(Math.max(44, height))
      fireEvent.mouseEnter(button)
      expect(mark.getAttribute('data-highlighted')).toBe('true')
      expect(shape.getAttribute('width')).toBe(String(width))
      fireEvent.mouseLeave(button)
      expect(mark.hasAttribute('data-highlighted')).toBe(false)
      fireEvent.focus(button)
      expect(mark.getAttribute('data-highlighted')).toBe('true')
      fireEvent.click(button)
      expect(onSelect).toHaveBeenLastCalledWith(expect.objectContaining({ id }))
      fireEvent.blur(button)
    }
    const first = within(chart).getByRole('button', {
      name: 'Fourteen-day issue',
    })
    const overlapping = within(chart).getByRole('button', {
      name: 'Overlapping issue',
    })
    expect(
      Math.abs(parseFloat(first.style.top) - parseFloat(overlapping.style.top)),
    ).toBeGreaterThanOrEqual(44)
  },
)
