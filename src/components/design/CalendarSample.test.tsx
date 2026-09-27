// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { CalendarSample } from './CalendarSample'
import {
  createCalendarSampleEvents,
  getCalendarSampleMonth,
} from './calendarSampleData'
import { CalendarPageLab } from '#/components/page-lab/prototypes/CalendarPageLab'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'

const mode = vi.hoisted(() => ({ bypass: true }))
vi.mock('#/lib/devAuthBypass', () => ({
  useDevAuthBypassEnabled: () => mode.bypass,
}))
vi.mock('convex/react', () => ({
  useMutation: () => {
    throw new Error('Calendar samples cannot mount live writes')
  },
  useQuery: () => {
    throw new Error('Calendar samples cannot mount live queries')
  },
}))
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  mode.bypass = true
})
async function show(child: ReactNode) {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  const root = createRootRoute({ component: () => child })
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  const result = render(<RouterProvider router={router} />)
  await act(async () => {})
  return result
}
function selectMondayMonth() {
  fireEvent.change(screen.getByLabelText('Sample month'), {
    target: { value: 'monday' },
  })
}
function openDenseDay() {
  fireEvent.click(
    screen.getByRole('button', {
      name: /Show 4 additional events on 18 Jun 2026/,
    }),
  )
  return screen.getByRole('region', { name: 'Events on 18 Jun 2026' })
}
describe('actual local calendar specimens', () => {
  it('updates six to two to zero after delay without remounting the selected agenda and makes no request', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch')
    await show(<CalendarSample showUpdateControls />)
    selectMondayMonth()
    const agenda = openDenseDay()
    expect(within(agenda).getAllByRole('link')).toHaveLength(6)
    vi.useFakeTimers()
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Keep two events on day 18 in 3 seconds',
      }),
    )
    expect(within(agenda).getAllByRole('link')).toHaveLength(6)
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.getByRole('region', { name: 'Events on 18 Jun 2026' })).toBe(
      agenda,
    )
    expect(within(agenda).getAllByRole('link')).toHaveLength(2)
    fireEvent.click(
      screen.getByRole('button', { name: 'Clear day 18 in 3 seconds' }),
    )
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })
    expect(
      screen.queryByRole('region', { name: 'Events on 18 Jun 2026' }),
    ).toBeNull()
    expect(screen.getByRole('status').textContent).toContain('Day 18 now has 0')
    expect(fetch).not.toHaveBeenCalled()
  })
  it('cancels scheduled updates on scenario/month changes and explicit cancel', async () => {
    await show(<CalendarSample showUpdateControls />)
    selectMondayMonth()
    vi.useFakeTimers()
    fireEvent.click(screen.getByRole('button', { name: /Keep two events/ }))
    fireEvent.change(screen.getByLabelText('Calendar sample'), {
      target: { value: 'empty' },
    })
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.getByText('No events are scheduled this month.')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Calendar sample'), {
      target: { value: 'dense' },
    })
    expect(within(openDenseDay()).getAllByRole('link')).toHaveLength(6)
    fireEvent.click(screen.getByRole('button', { name: /Keep two events/ }))
    fireEvent.change(screen.getByLabelText('Sample month'), {
      target: { value: 'leap' },
    })
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })
    expect(
      screen.getByRole('button', {
        name: /Show 4 additional events on 18 Feb 2024/,
      }),
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Keep two events/ }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Cancel sample update' }),
    )
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })
    expect(
      screen.getByRole('button', {
        name: /Show 4 additional events on 18 Feb 2024/,
      }),
    ).toBeTruthy()
  })
  it('cleans up an outstanding update on unmount and mounts the default specimen without update controls', async () => {
    const view = await show(<CalendarSample showUpdateControls />)
    vi.useFakeTimers()
    const clear = vi.spyOn(globalThis, 'clearTimeout')
    fireEvent.click(screen.getByRole('button', { name: /Keep two events/ }))
    view.unmount()
    expect(clear).toHaveBeenCalled()
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })
    vi.useRealTimers()
    await show(<CalendarSample />)
    expect(screen.getByLabelText('Calendar sample')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Keep two events/ })).toBeNull()
  })
  it('uses fictional fixtures only in bypass mode and passes only the connected stable events otherwise', async () => {
    const data = createDashboardLabFixtureData()
    const sample = await show(
      <CalendarPageLab data={{ ...data, events: [] }} />,
    )
    expect(screen.getByLabelText('Calendar sample')).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Add event' })).toBeNull()
    sample.unmount()
    mode.bypass = false
    const records = createCalendarSampleEvents(
      getCalendarSampleMonth('current'),
      'sparse',
    )
    const own = {
      ...records[2],
      title: 'Connected stable appointment',
      stableId: data.stable._id,
    }
    const other = { ...records[3], title: 'Other stable appointment' }
    await show(<CalendarPageLab data={{ ...data, events: [own, other] }} />)
    expect(screen.queryByLabelText('Calendar sample')).toBeNull()
    expect(screen.queryByText(/Fictional calendar/)).toBeNull()
    expect(
      screen.getAllByRole('link', { name: /Connected stable appointment/ })
        .length,
    ).toBeGreaterThan(0)
    expect(
      screen.queryByRole('link', { name: /Other stable appointment/ }),
    ).toBeNull()
    expect(
      screen.getByRole('link', { name: 'Add event' }).getAttribute('href'),
    ).toContain(`/stables/${data.stable._id}/events/create`)
  })
})
