// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { act, cleanup, renderHook } from '@testing-library/react'
import {
  analysisSessionKey,
  decodeAnalysisRange,
  decodeSelectedPoint,
  encodeSelectedPoint,
  useAnalysisSessionState,
} from './analysisSessionState'

const initial = { start: '2026-07-05', end: '2026-10-02' }
const annual = { start: '2025-10-01', end: '2026-09-30' }
afterEach(() => {
  cleanup()
  sessionStorage.clear()
  vi.restoreAllMocks()
})

it('restores valid exploration after source navigation unmount/remount and isolates stable and horse keys', () => {
  const key = analysisSessionKey('yard-a', 'horse-a')
  const first = renderHook(() =>
    useAnalysisSessionState(key, initial, decodeAnalysisRange),
  )
  act(() => first.result.current[1](annual))
  first.unmount()
  const back = renderHook(() =>
    useAnalysisSessionState(key, initial, decodeAnalysisRange),
  )
  expect(back.result.current[0]).toEqual(annual)
  const otherHorse = renderHook(() =>
    useAnalysisSessionState(
      analysisSessionKey('yard-a', 'horse-b'),
      initial,
      decodeAnalysisRange,
    ),
  )
  const otherStable = renderHook(() =>
    useAnalysisSessionState(
      analysisSessionKey('yard-b', 'horse-a'),
      initial,
      decodeAnalysisRange,
    ),
  )
  expect(otherHorse.result.current[0]).toEqual(initial)
  expect(otherStable.result.current[0]).toEqual(initial)
})
it('leaves fixtures isolated and ignores corrupted or invalid stored ranges', () => {
  sessionStorage.setItem('bad-json', '{')
  sessionStorage.setItem(
    'bad-range',
    JSON.stringify({ start: '2026-99-99', end: '2025-01-01' }),
  )
  for (const key of [undefined, 'bad-json', 'bad-range']) {
    const view = renderHook(() =>
      useAnalysisSessionState(key, initial, decodeAnalysisRange),
    )
    expect(view.result.current[0]).toEqual(initial)
    act(() => view.result.current[1](annual))
    view.unmount()
  }
  const fixture = renderHook(() =>
    useAnalysisSessionState(undefined, initial, decodeAnalysisRange),
  )
  expect(fixture.result.current[0]).toEqual(initial)
})
it('keeps the last valid range while a date field is incomplete', () => {
  const view = renderHook(() =>
    useAnalysisSessionState('range', initial, decodeAnalysisRange),
  )
  act(() => view.result.current[1](annual))
  act(() => view.result.current[1]({ start: '', end: annual.end }))
  expect(view.result.current[0].start).toBe('')
  expect(JSON.parse(sessionStorage.getItem('range')!)).toEqual(annual)
})
it('works when session storage is unavailable', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('Denied')
  })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Denied')
  })
  const view = renderHook(() =>
    useAnalysisSessionState('key', initial, decodeAnalysisRange),
  )
  act(() => view.result.current[1](annual))
  expect(view.result.current[0]).toEqual(annual)
})

it('persists selected source identifiers without record labels or values', () => {
  const view = renderHook(() =>
    useAnalysisSessionState(
      'selected',
      null,
      decodeSelectedPoint,
      encodeSelectedPoint,
    ),
  )
  act(() =>
    view.result.current[1]({
      id: 'weight:a',
      date: '2026-09-01',
      recordIds: ['a'],
      value: 500,
      label: 'Private measurement',
    }),
  )
  expect(JSON.parse(sessionStorage.getItem('selected')!)).toEqual({
    id: 'weight:a',
    date: '2026-09-01',
    recordIds: ['a'],
  })
  expect(
    decodeSelectedPoint({ id: 'a', date: 'bad', recordIds: ['a'] }),
  ).toBeUndefined()
})

it('uses identical default markup on the server before post-hydration storage restoration', () => {
  sessionStorage.setItem('ssr', JSON.stringify(annual))
  const read = vi.spyOn(Storage.prototype, 'getItem')
  function ServerPreview() {
    const [range] = useAnalysisSessionState('ssr', initial, decodeAnalysisRange)
    return <span>{range.start}</span>
  }
  expect(renderToString(<ServerPreview />)).toContain(initial.start)
  expect(read).not.toHaveBeenCalled()
  const hydrated = renderHook(() =>
    useAnalysisSessionState('ssr', initial, decodeAnalysisRange),
  )
  expect(hydrated.result.current[0]).toEqual(annual)
})
