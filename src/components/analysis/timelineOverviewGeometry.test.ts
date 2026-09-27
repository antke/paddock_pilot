import { describe, expect, it } from 'vitest'
import {
  getOverviewWindowMetrics,
  getScrollRatioFromWindow,
  getCenteredTimelineScrollLeft,
  getTimelineViewportCenter,
  getNextTimelineZoom,
} from './timelineOverviewGeometry'

describe.each([1184, 288])(
  '98-period overview at viewport width %i',
  (clientWidth) => {
    it('represents the actual small window and reverses an arrow step without drift', () => {
      const state = { clientWidth, scrollWidth: 37632, scrollLeft: 2288 }
      const initial = getOverviewWindowMetrics(state)
      expect(initial.widthRatio).toBeCloseTo(clientWidth / 37632, 12)
      const rightRatio = getScrollRatioFromWindow(
        initial.leftRatio + 0.02,
        initial.widthRatio,
      )
      const moved = {
        ...state,
        scrollLeft: rightRatio * (state.scrollWidth - clientWidth),
      }
      const next = getOverviewWindowMetrics(moved)
      const leftRatio = getScrollRatioFromWindow(
        next.leftRatio - 0.02,
        next.widthRatio,
      )
      expect(leftRatio * (state.scrollWidth - clientWidth)).toBeCloseTo(
        state.scrollLeft,
        8,
      )
    })
    it('keeps the same center when zoom changes, with bounded edges and readable zoom limits', () => {
      const state = { clientWidth, scrollWidth: 37632, scrollLeft: 9000 }
      const center = getTimelineViewportCenter(state)
      const zoomed = { ...state, scrollWidth: 37632 * 1.15 }
      const scrollLeft = getCenteredTimelineScrollLeft(center, zoomed)
      expect(getTimelineViewportCenter({ ...zoomed, scrollLeft })).toBeCloseTo(
        center,
        12,
      )
      expect(getCenteredTimelineScrollLeft(0, zoomed)).toBe(0)
      expect(getCenteredTimelineScrollLeft(1, zoomed)).toBe(
        zoomed.scrollWidth - clientWidth,
      )
      expect(getNextTimelineZoom(0.85, -1)).toBe(0.85)
      expect(getNextTimelineZoom(2.2, 1)).toBe(2.2)
      expect(getNextTimelineZoom(1, -1)).toBe(0.85)
    })
  },
)

it('handles a viewport containing the whole timeline without division by zero', () => {
  expect(
    getOverviewWindowMetrics({
      clientWidth: 1184,
      scrollWidth: 800,
      scrollLeft: 0,
    }),
  ).toEqual({ leftRatio: 0, widthRatio: 1 })
  expect(getScrollRatioFromWindow(0, 1)).toBe(0)
  expect(
    getCenteredTimelineScrollLeft(0.5, { clientWidth: 1184, scrollWidth: 800 }),
  ).toBe(0)
})
