// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, expect, it } from 'vitest'
import {
  CalendarSelectionAccount,
  calendarSelectionKey,
  useCalendarSelection,
} from './calendarSourceSelection'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})
afterEach(cleanup)
const account =
  (id: string) =>
  ({ children }: { children: ReactNode }) => (
    <CalendarSelectionAccount.Provider value={id}>
      {children}
    </CalendarSelectionAccount.Provider>
  )

it('shares changes between mounted selectors and restores the preference after remounting', () => {
  const dashboard = renderHook(() => useCalendarSelection(), {
    wrapper: account('owner'),
  })
  const events = renderHook(() => useCalendarSelection(), {
    wrapper: account('owner'),
  })
  act(() => dashboard.result.current.setSelected(['stable-a']))
  expect(events.result.current.selected).toEqual(['mine', 'stable-a'])
  dashboard.unmount()
  events.unmount()
  const training = renderHook(() => useCalendarSelection(), {
    wrapper: account('owner'),
  })
  expect(training.result.current.selected).toEqual(['mine', 'stable-a'])
  act(() => training.result.current.setSelected([]))
  expect(training.result.current.selected).toEqual(['mine'])
})

it('keeps account preferences separate and adds saved stables without removing the current selection', () => {
  const owner = renderHook(() => useCalendarSelection(), {
    wrapper: account('owner'),
  })
  const other = renderHook(() => useCalendarSelection(), {
    wrapper: account('other'),
  })
  act(() => owner.result.current.setSelected(['mine', 'stable-a']))
  act(() => owner.result.current.includeSavedStables(['stable-b', 'stable-b']))
  expect(owner.result.current.selected).toEqual([
    'mine',
    'stable-a',
    'stable-b',
  ])
  expect(other.result.current.selected).toEqual(['mine'])
  act(() => owner.result.current.includeSavedStables([]))
  expect(owner.result.current.selected).toEqual([
    'mine',
    'stable-a',
    'stable-b',
  ])
})

it('receives another tab’s changes and safely replaces malformed preferences', () => {
  const key = calendarSelectionKey('owner')
  localStorage.setItem(key, '{invalid')
  const view = renderHook(() => useCalendarSelection(), {
    wrapper: account('owner'),
  })
  expect(view.result.current.selected).toEqual(['mine'])
  act(() => {
    localStorage.setItem(key, JSON.stringify(['stable-c']))
    window.dispatchEvent(new StorageEvent('storage', { key }))
  })
  expect(view.result.current.selected).toEqual(['mine', 'stable-c'])
})

it('carries the current page preference into the shared selection once', () => {
  const legacy = 'paddock:activity-calendars:events:mine'
  sessionStorage.setItem(legacy, JSON.stringify(['mine', 'stable-old']))
  const events = renderHook(() => useCalendarSelection(undefined, legacy), {
    wrapper: account('owner'),
  })
  expect(events.result.current.selected).toEqual(['mine', 'stable-old'])
  act(() => events.result.current.setSelected(['mine', 'stable-new']))
  const training = renderHook(() => useCalendarSelection(undefined, legacy), {
    wrapper: account('owner'),
  })
  expect(training.result.current.selected).toEqual(['mine', 'stable-new'])
})
