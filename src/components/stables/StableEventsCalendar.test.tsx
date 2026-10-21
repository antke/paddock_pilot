// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { useState } from 'react'
import { LocaleProvider } from '#/i18n/LocaleProvider'
import { LanguageSelector } from '#/i18n/LanguageSelector'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Id } from 'convex/_generated/dataModel'
import { StableEventsCalendar } from './StableEventsCalendar'
import type { StableDashboardEvent } from './stableDashboardDates'

const august = new Date(2026, 7, 1)
let desktop = true
let listeners: Set<() => void>
beforeEach(() => {
  localStorage.clear()
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-GB'])
  desktop = true
  listeners = new Set()
  vi.stubGlobal('matchMedia', () => ({
    get matches() {
      return desktop
    },
    addEventListener: (_event: string, listener: () => void) =>
      listeners.add(listener),
    removeEventListener: (_event: string, listener: () => void) =>
      listeners.delete(listener),
  }))
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockImplementation(
    function (this: HTMLElement) {
      const view = this.closest('[data-calendar-view]')?.getAttribute(
        'data-calendar-view',
      )
      const hidden = desktop
        ? view === 'mobile'
        : view === 'month' || view === 'selected'
      return (this.isConnected && !hidden
        ? [new DOMRect(0, 0, 100, 40)]
        : []) as unknown as DOMRectList
    },
  )
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
function event(
  index: number,
  overrides: Partial<StableDashboardEvent> = {},
): StableDashboardEvent {
  return {
    _id: `event-${index}` as Id<'events'>,
    _creationTime: 0,
    stableId: 'sample-stable' as Id<'stables'>,
    createdBy: 'sample-user' as Id<'users'>,
    title: `Visit ${index}`,
    date: '2026-08-12',
    time: `${String(8 + index).padStart(2, '0')}:00`,
    type: 'hoof_trimming',
    horseIds: [],
    ...overrides,
  }
}
async function setup(
  initial = Array.from({ length: 6 }, (_, index) => event(index)),
  localized = false,
) {
  let update!: (events: Array<StableDashboardEvent>) => void
  let month!: (date: Date) => void
  function Harness() {
    const [events, setEvents] = useState(initial)
    const [initialMonth, setMonth] = useState(august)
    update = setEvents
    month = setMonth
    return (
      <>
        <button>Outside calendar</button>
        <StableEventsCalendar events={events} initialMonth={initialMonth} />
      </>
    )
  }
  const root = createRootRoute({ component: Harness })
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(
    localized ? (
      <LocaleProvider>
        <LanguageSelector />
        <RouterProvider router={router} />
      </LocaleProvider>
    ) : (
      <RouterProvider router={router} />
    ),
  )
  return {
    update: (events: Array<StableDashboardEvent>) => act(() => update(events)),
    month: (date: Date) => act(() => month(date)),
  }
}

it('opens frozen participations from both the desktop calendar and selected mobile day', async () => {
  await setup([
    event(0),
    event(0, {
      title: 'Juniper history',
      contextHorseId: 'juniper',
      contextParticipationId: 'former-participation',
    }),
  ])
  const monthLink = within(table()).getByRole('link', {
    name: /Juniper history/,
  })
  const mobile = document.querySelector(
    '[data-calendar-view="mobile"]',
  ) as HTMLElement
  fireEvent.click(within(mobile).getByRole('button', { name: /^12 Aug 2026,/ }))
  const mobileLink = within(mobile).getByRole('link', {
    name: /Juniper history/,
  })
  for (const link of [monthLink, mobileLink]) {
    const url = new URL(link.getAttribute('href')!, 'http://localhost')
    expect(url.pathname).toBe('/events/event-0')
    expect(url.searchParams.get('horseId')).toBe('juniper')
    expect(url.searchParams.get('participationId')).toBe('former-participation')
  }
  expect(
    within(table())
      .getByRole('link', { name: /^Visit 0/ })
      .getAttribute('href'),
  ).toBe('/events/event-0')
})
function table() {
  return screen.getByRole('table', { name: 'August 2026 event calendar' })
}
function trigger() {
  return within(table()).getByRole('button', { name: /additional events on/ })
}
function open() {
  const button = trigger()
  button.focus()
  fireEvent.click(button)
  return button
}
function agenda() {
  return screen.getByRole('region', { name: 'Events on 12 Aug 2026' })
}
function fallback() {
  return screen.getByRole('region', { name: 'August 2026 calendar' })
}
function resize(matches: boolean) {
  act(() => {
    desktop = matches
    for (const listener of listeners) listener()
  })
}

describe('read-only month calendar', () => {
  it('previews an occurrence on hover and keyboard focus without replacing its navigation link', async () => {
    await setup([
      event(0, {
        description: 'Check comfort after turnout.',
        providerName: 'Ben Carter',
        location: 'Wash bay',
        notesAfterCompletion: 'Trim completed without concerns.',
        status: 'completed',
        recurrence: { frequency: 'weekly', interval: 1, daysOfWeek: [3] },
      }),
    ])
    const link = within(table()).getByRole('link', {
      name: /Visit 0, 19 Aug 2026/,
    })
    expect(link.textContent).toBe('Visit 0')
    fireEvent.mouseEnter(link)
    fireEvent.mouseMove(link)
    const preview = await screen.findByRole('tooltip')
    expect(preview.textContent).toContain('19 Aug 2026 at 08:00')
    expect(preview.textContent).toContain('Ben Carter')
    expect(preview.textContent).toContain('Wash bay')
    expect(preview.textContent).toContain('Check comfort after turnout.')
    expect(preview.textContent).toContain('Trim completed without concerns.')
    expect(link.getAttribute('aria-describedby')).toBe(preview.id)
    expect(link.getAttribute('href')).toBe('/events/event-0')
    fireEvent.keyDown(link, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
    const nextOccurrence = within(table()).getByRole('link', {
      name: /Visit 0, 26 Aug 2026/,
    })
    act(() => nextOccurrence.focus())
    expect(await screen.findByRole('tooltip')).toBeTruthy()
    act(() => screen.getByRole('button', { name: 'Outside calendar' }).focus())
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
  })

  it('exposes a seven-column table with empty cells and full date labels, preserving links', async () => {
    await setup()
    expect(screen.queryByRole('grid')).toBeNull()
    const rows = within(table()).getAllByRole('row')
    expect(
      within(rows[0])
        .getAllByRole('columnheader')
        .map((node) => node.textContent),
    ).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
    for (const row of rows.slice(1))
      expect(within(row).getAllByRole('cell')).toHaveLength(7)
    const firstWeek = within(rows[1]).getAllByRole('cell')
    expect(
      firstWeek
        .slice(0, 5)
        .every(
          (cell) =>
            cell.textContent === '' && !cell.hasAttribute('aria-hidden'),
        ),
    ).toBe(true)
    expect(firstWeek[5].getAttribute('aria-label')).toBe('1 Aug 2026')
    const date = within(table()).getByRole('cell', { name: '12 Aug 2026' })
    const links = within(date).getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0].getAttribute('href')).toBe('/events/event-0')
    expect(links[0].hasAttribute('tabindex')).toBe(false)
  })

  it('opens the real day agenda and returns Escape to its visible connected disclosure', async () => {
    await setup()
    const original = open()
    expect(document.activeElement).toBe(agenda())
    expect(within(agenda()).getAllByRole('link')).toHaveLength(6)
    fireEvent.keyDown(agenda(), { key: 'Escape' })
    expect(document.activeElement).toBe(original)
    expect(
      screen.queryByRole('region', { name: 'Events on 12 Aug 2026' }),
    ).toBeNull()
  })

  it('uses the persistent fallback when a selected day loses its disclosure but retains records', async () => {
    const { update } = await setup()
    const original = open()
    update([event(0), event(1)])
    expect(original.isConnected).toBe(false)
    fireEvent.click(within(agenda()).getByRole('button', { name: 'Close' }))
    expect(document.activeElement).toBe(fallback())
  })

  it('does not return focus to a connected disclosure that is no longer rendered', async () => {
    await setup()
    const original = open()
    vi.spyOn(original, 'getClientRects').mockReturnValue(
      [] as unknown as DOMRectList,
    )
    fireEvent.click(within(agenda()).getByRole('button', { name: 'Close' }))
    expect(original.isConnected).toBe(true)
    expect(document.activeElement).toBe(fallback())
  })

  it('recovers only affected focus when reactive data removes an agenda or trigger', async () => {
    const { update } = await setup()
    open()
    within(agenda()).getAllByRole('link')[0].focus()
    update([])
    expect(document.activeElement).toBe(fallback())
    update(Array.from({ length: 6 }, (_, index) => event(index)))
    trigger().focus()
    update([event(0), event(1)])
    expect(document.activeElement).toBe(fallback())
    update(Array.from({ length: 6 }, (_, index) => event(index)))
    open()
    const outside = screen.getByRole('button', { name: 'Outside calendar' })
    outside.focus()
    update([])
    expect(document.activeElement).toBe(outside)
  })

  it('recovers a hidden presentation on breakpoint changes without stealing unrelated focus', async () => {
    await setup()
    open()
    within(agenda()).getAllByRole('link')[0].focus()
    resize(false)
    expect(document.activeElement).toBe(fallback())
    const mobile = document.querySelector('[data-calendar-view="mobile"]')!
    within(mobile as HTMLElement)
      .getByRole('button', { name: /^12 Aug 2026,/ })
      .focus()
    resize(true)
    expect(document.activeElement).toBe(fallback())
    const outside = screen.getByRole('button', { name: 'Outside calendar' })
    outside.focus()
    resize(false)
    expect(document.activeElement).toBe(outside)
  })

  it('uses initialMonth only once and preserves month-button focus when clearing selection', async () => {
    const { month } = await setup()
    month(new Date(2027, 0, 1))
    expect(table()).toBeTruthy()
    open()
    const next = screen.getByRole('button', { name: 'Next' })
    next.focus()
    fireEvent.click(next)
    expect(document.activeElement).toBe(next)
    expect(
      screen.getByRole('table', { name: 'September 2026 event calendar' }),
    ).toBeTruthy()
    expect(
      screen.queryByRole('region', { name: 'Events on 12 Aug 2026' }),
    ).toBeNull()
    expect(
      screen.getByText('September 2026, 0 events this month.'),
    ).toBeTruthy()
  })
})

it('offers a mobile month grid and shows only the selected date, including repeat and multi-day occurrences', async () => {
  desktop = false
  await setup([
    event(0, {
      title: 'Weekly visit',
      recurrence: { frequency: 'weekly', interval: 1, daysOfWeek: [3] },
    }),
    event(1, {
      title: 'Three-day event',
      date: '2026-08-11',
      endDate: '2026-08-13',
    }),
  ])
  const mobile = document.querySelector(
    '[data-calendar-view="mobile"]',
  ) as HTMLElement
  const month = within(mobile).getByRole('table', {
    name: 'Choose a day in August 2026',
  })
  for (const row of within(month).getAllByRole('row').slice(1)) {
    expect(within(row).getAllByRole('cell')).toHaveLength(7)
  }
  expect(within(mobile).getByText('No events on this date.')).toBeTruthy()
  const day = within(month).getByRole('button', {
    name: '12 Aug 2026, 2 events',
  })
  day.focus()
  fireEvent.click(day)
  expect(day.getAttribute('aria-pressed')).toBe('true')
  expect(document.activeElement).toBe(day)
  expect(within(mobile).getAllByRole('link')).toHaveLength(2)
  expect(
    within(mobile).getByRole('heading', { name: 'Events on 12 Aug 2026' }),
  ).toBeTruthy()
  fireEvent.click(
    within(month).getByRole('button', { name: '13 Aug 2026, 1 event' }),
  )
  expect(within(mobile).getAllByRole('link')).toHaveLength(1)
  expect(within(mobile).getByText('Ends today')).toBeTruthy()
  fireEvent.click(
    within(month).getByRole('button', { name: '19 Aug 2026, 1 event' }),
  )
  expect(
    within(mobile).getByRole('link', { name: /Weekly visit/ }),
  ).toBeTruthy()
  expect(
    within(mobile).queryByRole('link', { name: /Three-day event/ }),
  ).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Next' }))
  expect(
    within(mobile).getByRole('table', {
      name: 'Choose a day in September 2026',
    }),
  ).toBeTruthy()
  expect(
    within(mobile).getByRole('heading', { name: 'Events on 1 Sept 2026' }),
  ).toBeTruthy()
})

it('switches the selected agenda, weekday labels, counts, and announcements without losing the selected date or focus', async () => {
  await setup(undefined, true)
  open()
  const englishAgenda = agenda()
  const selector = screen.getByRole('combobox')
  selector.focus()
  fireEvent.change(selector, { target: { value: 'pl' } })
  const polishAgenda = screen.getByRole('region', {
    name: 'Wydarzenia w dniu 12 sie 2026',
  })
  expect(polishAgenda).toBe(englishAgenda)
  expect(document.activeElement).toBe(selector)
  const polishTable = screen.getByRole('table', {
    name: 'Kalendarz wydarzeń: sierpień 2026',
  })
  expect(
    within(polishTable)
      .getAllByRole('columnheader')
      .map((node) => node.textContent),
  ).toEqual(['pon.', 'wt.', 'śr.', 'czw.', 'pt.', 'sob.', 'niedz.'])
  expect(within(polishAgenda).getAllByRole('link')).toHaveLength(6)
  expect(
    screen
      .getByRole('button', {
        name: 'Ukryj 5 dodatkowych wydarzeń w dniu 12 sie 2026',
      })
      .getAttribute('aria-expanded'),
  ).toBe('true')
  fireEvent.click(screen.getByRole('button', { name: 'Następny' }))
  expect(
    screen.queryByRole('region', { name: 'Wydarzenia w dniu 12 sie 2026' }),
  ).toBeNull()
  expect(
    screen.getByText('wrzesień 2026 — 0 wydarzeń w tym miesiącu.', {
      exact: true,
    }),
  ).toBeTruthy()
  fireEvent.change(selector, { target: { value: 'en' } })
  expect(
    screen.getByText('September 2026, 0 events this month.', { exact: true }),
  ).toBeTruthy()
})
