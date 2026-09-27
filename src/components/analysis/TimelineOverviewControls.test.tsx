// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { StableActivityTimelineChart } from './StableActivityTimelineChart'
import type { StableTimelinePeriod } from './stableActivityTimelineScale'
import { formatDateKey } from '#/lib/dateDisplay'

const periods: Array<StableTimelinePeriod> = Array.from(
  { length: 98 },
  (_, index) => {
    const key = formatDateKey(new Date(2026, 6, index + 1))
    return {
      key,
      scale: 'day',
      startKey: key,
      endKey: key,
      label: key,
      shortLabel: key,
      buckets: [],
      occurrences: [],
      allEventCount: 0,
      completedEventCount: 0,
      plannedEventCount: 0,
      eventTypeCounts: [],
      signals: [],
      signalCount: 0,
      urgentSignalCount: 0,
      signalKindCounts: [],
    }
  },
)
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

it.each([1184, 288])(
  'actual controls move reversibly and zoom around their center at %ipx',
  (clientWidth) => {
    const { container } = render(
      <StableActivityTimelineChart
        periods={periods}
        occurrences={[]}
        scale="day"
        visibleSeries={['all']}
        visibleEventTypes={[]}
        selectedPeriodKey={null}
        onPeriodSelect={() => {}}
        onEventOpen={() => {}}
      />,
    )
    const viewport = screen.getByRole('region', {
      name: 'Stable activity calendar',
    })
    const canvas = container.querySelector<HTMLElement>(
      '[data-slot="activity-timeline-canvas"]',
    )!
    // Model layout from the real rendered canvas width; jsdom does not perform layout.
    Object.defineProperties(viewport, {
      clientWidth: { configurable: true, get: () => clientWidth },
      scrollWidth: {
        configurable: true,
        get: () => Number.parseFloat(canvas.style.width) * 16,
      },
    })
    viewport.scrollLeft = 2288
    fireEvent.scroll(viewport)
    const move = screen.getByRole('button', {
      name: 'Move visible timeline window',
    })
    const marker = container.querySelector<HTMLElement>(
      '[data-slot="activity-timeline-window"]',
    )!
    expect(Number.parseFloat(marker.style.width)).toBeCloseTo(
      (clientWidth / 37632) * 100,
      8,
    )
    fireEvent.keyDown(move, { key: 'ArrowRight' })
    expect(viewport.scrollLeft).toBeGreaterThan(2288)
    fireEvent.keyDown(move, { key: 'ArrowLeft' })
    expect(viewport.scrollLeft).toBeCloseTo(2288, 8)
    const center =
      (viewport.scrollLeft + clientWidth / 2) / viewport.scrollWidth
    const zoomIn = screen.getByRole<HTMLButtonElement>('button', {
      name: 'Zoom in',
    })
    const zoomOut = screen.getByRole<HTMLButtonElement>('button', {
      name: 'Zoom out',
    })
    fireEvent.click(zoomIn)
    expect(
      (viewport.scrollLeft + clientWidth / 2) / viewport.scrollWidth,
    ).toBeCloseTo(center, 10)
    expect(Number.parseFloat(marker.style.width)).toBeLessThan(
      (clientWidth / 37632) * 100,
    )
    expect(
      document.getElementById(move.getAttribute('aria-describedby')!)
        ?.textContent,
    ).toContain('Column zoom 115%')
    for (let i = 0; i < 20; i++) fireEvent.click(zoomIn)
    expect(zoomIn.disabled).toBe(true)
    expect(viewport.scrollWidth).toBeCloseTo(37632 * 2.2, 6)
    for (let i = 0; i < 20; i++) {
      fireEvent.click(zoomOut)
      expect(
        (viewport.scrollLeft + clientWidth / 2) / viewport.scrollWidth,
      ).toBeCloseTo(center, 10)
      expect(Number.parseFloat(marker.style.width)).toBeCloseTo(
        (clientWidth / viewport.scrollWidth) * 100,
        8,
      )
    }
    expect(zoomOut.disabled).toBe(true)
    expect(viewport.scrollWidth).toBeCloseTo(37632 * 0.85, 6)
    expect(
      screen.queryByRole('button', { name: 'Resize visible timeline start' }),
    ).toBeNull()
  },
)

it('stops the actual pointer move interaction after cancellation', () => {
  const { container } = render(
    <StableActivityTimelineChart
      periods={periods}
      occurrences={[]}
      scale="day"
      visibleSeries={['all']}
      visibleEventTypes={[]}
      selectedPeriodKey={null}
      onPeriodSelect={() => {}}
      onEventOpen={() => {}}
    />,
  )
  const viewport = screen.getByRole('region', {
    name: 'Stable activity calendar',
  })
  Object.defineProperties(viewport, {
    clientWidth: { value: 1184 },
    scrollWidth: { value: 37632 },
  })
  viewport.scrollLeft = 2288
  fireEvent.scroll(viewport)
  const rail = container.querySelector<HTMLElement>(
    '[data-slot="activity-timeline-overview-rail"]',
  )!
  vi.spyOn(rail, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 0, 1000, 56),
  )
  const move = screen.getByRole('button', {
    name: 'Move visible timeline window',
  })
  fireEvent(
    move,
    new MouseEvent('pointerdown', { bubbles: true, clientX: 80, button: 0 }),
  )
  fireEvent(window, new MouseEvent('pointermove', { clientX: 130 }))
  expect(viewport.scrollLeft).toBeCloseTo(2288 + 0.05 * 37632, 8)
  fireEvent(window, new MouseEvent('pointercancel'))
  const stopped = viewport.scrollLeft
  fireEvent(window, new MouseEvent('pointermove', { clientX: 150 }))
  expect(viewport.scrollLeft).toBe(stopped)
})
