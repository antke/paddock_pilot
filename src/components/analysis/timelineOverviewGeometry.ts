export type TimelineScrollState = {
  scrollLeft: number
  clientWidth: number
  scrollWidth: number
}

export const minTimelineColumnZoom = 0.85
export const maxTimelineColumnZoom = 2.2

export function getOverviewWindowMetrics(state: TimelineScrollState) {
  if (state.scrollWidth <= 0 || state.clientWidth <= 0)
    return { leftRatio: 0, widthRatio: 1 }
  const widthRatio = Math.min(1, state.clientWidth / state.scrollWidth)
  const leftRatio = Math.max(
    0,
    Math.min(1 - widthRatio, state.scrollLeft / state.scrollWidth),
  )
  return { leftRatio, widthRatio }
}

export function getScrollRatioFromWindow(
  leftRatio: number,
  widthRatio: number,
) {
  if (widthRatio >= 1) return 0
  return Math.max(0, Math.min(1, leftRatio / (1 - widthRatio)))
}

export function getTimelineViewportCenter(state: TimelineScrollState) {
  if (state.scrollWidth <= 0) return 0.5
  return Math.max(
    0,
    Math.min(1, (state.scrollLeft + state.clientWidth / 2) / state.scrollWidth),
  )
}

export function getCenteredTimelineScrollLeft(
  center: number,
  state: Pick<TimelineScrollState, 'clientWidth' | 'scrollWidth'>,
) {
  return Math.max(
    0,
    Math.min(
      Math.max(0, state.scrollWidth - state.clientWidth),
      center * state.scrollWidth - state.clientWidth / 2,
    ),
  )
}

export function getNextTimelineZoom(current: number, direction: -1 | 1) {
  return Math.max(
    minTimelineColumnZoom,
    Math.min(
      maxTimelineColumnZoom,
      Math.round((current + direction * 0.15) * 100) / 100,
    ),
  )
}
