// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useTransientConfirmation } from './useTransientConfirmation'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

it('acknowledges only the current record, restarts after another action and cleans up', () => {
  vi.useFakeTimers()
  const { result, rerender, unmount } = renderHook(
    ({ id }) => useTransientConfirmation(id),
    { initialProps: { id: 'passport' } },
  )
  const oldConfirmation = result.current.confirm
  act(() => result.current.confirm())
  expect(result.current.confirmed).toBe(true)
  act(() => vi.advanceTimersByTime(2000))
  act(() => result.current.confirm())
  act(() => vi.advanceTimersByTime(1000))
  expect(result.current.confirmed).toBe(true)
  rerender({ id: 'microchip' })
  expect(result.current.confirmed).toBe(false)
  act(oldConfirmation)
  expect(result.current.confirmed).toBe(false)
  act(() => result.current.confirm())
  act(() => vi.advanceTimersByTime(2400))
  expect(result.current.confirmed).toBe(false)
  act(() => result.current.confirm())
  unmount()
  expect(vi.getTimerCount()).toBe(0)
})
