// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { getFunctionName } from 'convex/server'
import type { Id } from 'convex/_generated/dataModel'
import {
  ActivityCalendarFilter,
  useActivityCalendars,
} from './ActivityCalendarFilter'

const state = vi.hoisted(
  (): {
    stables: Array<{ _id: string; name: string }> | undefined
    args: unknown
    data:
      { horses: unknown[]; events: unknown[]; records: unknown[] } | undefined
  } => ({
    stables: [{ _id: 'stable', name: 'Stable' }],
    args: undefined,
    data: undefined,
  }),
)
vi.mock('convex/react', () => ({
  useQuery: (
    reference: Parameters<typeof getFunctionName>[0],
    args?: unknown,
  ) => {
    if (getFunctionName(reference) === 'stables:list') return state.stables
    state.args = args
    return state.data
  },
}))
afterEach(cleanup)
beforeEach(() => {
  sessionStorage.clear()
  localStorage.clear()
  state.stables = [{ _id: 'stable', name: 'Stable' }]
  state.data = {
    horses: [{ _id: 'horse' }],
    events: [{ _id: 'event' }],
    records: [],
  }
})

it('keeps results and their link context during rapid filter changes, then replaces them even with an empty result', () => {
  const { result, rerender } = renderHook(() =>
    useActivityCalendars(false, 'stable'),
  )
  const original = result.current.data
  expect(result.current.mixedSources).toBe(true)
  state.data = undefined
  rerender()
  act(() => result.current.setSelected(['mine', 'stable']))
  expect(result.current.loading).toBe(true)
  expect(result.current.data).toBe(original)
  expect(result.current.mixedSources).toBe(true)
  expect(result.current.personal).toBe(true)
  act(() => result.current.setSelected(['mine']))
  expect(result.current.data).toBe(original)
  state.data = { horses: [], events: [], records: [] }
  rerender()
  expect(result.current.data).toBe(state.data)
  expect(result.current.loading).toBe(false)
  expect(result.current.mixedSources).toBe(true)
  expect(result.current.personal).toBe(true)
})

it('discards retained results when membership changes or stops loading', () => {
  const { result, rerender } = renderHook(() => useActivityCalendars(false))
  state.data = undefined
  state.stables = undefined
  rerender()
  expect(result.current.data).toBeUndefined()
  state.stables = []
  rerender()
  expect(result.current.data).toBeUndefined()
})

it('does not carry results between pages or remounts', () => {
  const { result, rerender, unmount } = renderHook(
    ({ training, stableId }) => useActivityCalendars(training, stableId),
    { initialProps: { training: false, stableId: 'stable' } },
  )
  state.data = undefined
  rerender({ training: true, stableId: 'stable' })
  expect(result.current.data).toBeUndefined()
  rerender({ training: true, stableId: 'other' })
  expect(result.current.data).toBeUndefined()
  unmount()
  const next = renderHook(() => useActivityCalendars(false, 'stable'))
  expect(next.result.current.data).toBeUndefined()
  expect(next.result.current.loading).toBe(true)
})

it.each([false, true])(
  'always restores My calendar in saved filters (training=%s)',
  (training) => {
    localStorage.setItem(
      'paddock:calendar-selection:anonymous',
      JSON.stringify(['stable']),
    )
    const { result } = renderHook(() => useActivityCalendars(training))
    expect(result.current.selected).toEqual(['mine', 'stable'])
    expect(state.args).toEqual({
      training,
      personal: true,
      stableIds: ['stable'],
    })
    act(() => result.current.setSelected([]))
    expect(result.current.selected).toEqual(['mine'])
    expect(state.args).toEqual({ training, personal: true, stableIds: [] })
  },
)

it.each(['focus', 'click'] as const)(
  'explains the fixed My calendar choice on %s without changing sources',
  async (interaction) => {
    const onChange = vi.fn()
    render(
      <ActivityCalendarFilter
        selected={['mine']}
        onChange={onChange}
        loading={false}
        stables={[
          {
            _id: 'stable' as Id<'stables'>,
            name: 'Stable',
          },
        ]}
      />,
    )
    const mine = screen.getByRole('checkbox', { name: 'My calendar' })
    expect(mine.getAttribute('aria-checked')).toBe('true')
    expect(mine.getAttribute('aria-disabled')).toBe('true')
    expect(
      screen.queryByRole('button', { name: 'About My calendar' }),
    ).toBeNull()
    if (interaction === 'focus')
      fireEvent.focus(screen.getByLabelText('About My calendar'))
    else fireEvent.click(screen.getByText('My calendar'))
    expect((await screen.findByRole('tooltip')).textContent).toContain(
      'Your calendar is always included. Select stables to see their shared records too.',
    )
    expect(onChange).not.toHaveBeenCalled()
    expect(mine.getAttribute('aria-checked')).toBe('true')
    fireEvent.click(screen.getByRole('checkbox', { name: 'Stable' }))
    expect(onChange).toHaveBeenCalledWith(['mine', 'stable'])
  },
)

it('hides calendar selection without stable memberships and shows it when a stable becomes available', () => {
  const props = { selected: ['mine'], onChange: vi.fn(), loading: false }
  const { container, rerender } = render(
    <ActivityCalendarFilter {...props} stables={[]} />,
  )
  expect(container.childElementCount).toBe(0)
  rerender(
    <ActivityCalendarFilter
      {...props}
      stables={[{ _id: 'stable' as Id<'stables'>, name: 'Stable' }]}
    />,
  )
  expect(screen.getByRole('checkbox', { name: 'My calendar' })).toBeTruthy()
  expect(screen.getByRole('checkbox', { name: 'Stable' })).toBeTruthy()
  rerender(<ActivityCalendarFilter {...props} stables={[]} />)
  expect(container.childElementCount).toBe(0)
  expect(props.onChange).not.toHaveBeenCalled()
})
