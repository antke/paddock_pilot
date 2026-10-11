// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { TrainingCalendar } from './TrainingCalendar'
import { LocaleProvider } from '#/i18n/LocaleProvider'
import { LanguageSelector } from '#/i18n/LanguageSelector'

vi.mock('convex/react', () => ({ useMutation: () => vi.fn() }))

const originalScrollIntoView = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  'scrollIntoView',
)

afterEach(() => {
  cleanup()
  localStorage.clear()
  sessionStorage.clear()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  if (originalScrollIntoView) {
    Object.defineProperty(
      HTMLElement.prototype,
      'scrollIntoView',
      originalScrollIntoView,
    )
  } else {
    Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView')
  }
})

async function openMobileTraining({
  stableId,
  fixedHorseId,
  canRecord = true,
  eventOverrides,
}: {
  stableId?: string
  fixedHorseId?: string
  canRecord?: boolean
  eventOverrides?: Partial<Doc<'events'>>
} = {}) {
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  const horse = { _id: 'atlas' as Id<'horses'>, name: 'Atlas', canRecord }
  const event = {
    _id: 'training' as Id<'events'>,
    _creationTime: 0,
    createdBy: 'owner' as Id<'users'>,
    horseIds: [horse._id],
    title: 'Flatwork school',
    date: '2026-01-05',
    time: '10:00',
    type: 'training',
    training: { activities: ['flatwork'], format: 'regular' },
    ...eventOverrides,
  } as Doc<'events'>
  const router = createRouter({
    routeTree: createRootRoute({
      component: () => (
        <LocaleProvider>
          <TrainingCalendar
            stableId={stableId}
            fixedHorseId={fixedHorseId}
            horses={[horse]}
            events={[event]}
            records={[]}
            initialDate="2026-01-05"
            initialView="week"
          />
        </LocaleProvider>
      ),
    }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
  await screen.findByRole('heading', { name: '5 Jan – 11 Jan' })
}

describe('mobile training controls', () => {
  it.each([
    { props: {}, href: '/events/create?training=true&intent=record' },
    {
      props: { stableId: 'stable' },
      href: '/stables/stable/training/create?intent=record',
    },
    {
      props: { stableId: 'stable', fixedHorseId: 'atlas' },
      href: '/events/create?horseId=atlas&training=true&intent=record',
    },
  ])(
    'keeps only the bottom recording action for $props',
    async ({ props, href }) => {
      await openMobileTraining(props)
      const actions = screen.getAllByRole('link', { name: 'Add training log' })
      expect(actions).toHaveLength(1)
      expect(actions[0].getAttribute('href')).toBe(href)
      expect(actions[0].closest('[data-slot="mobile-action-bar"]')).toBeTruthy()
      expect(
        screen.queryByRole('link', { name: 'Add training session' }),
      ).toBeNull()
      fireEvent.click(screen.getByRole('button', { name: 'Next week' }))
      expect(
        screen.getByRole('heading', { name: '12 Jan – 18 Jan' }),
      ).toBeTruthy()
      fireEvent.click(screen.getByRole('button', { name: 'Previous week' }))
      fireEvent.click(screen.getByRole('button', { name: 'Month' }))
      expect(screen.getByRole('heading', { name: 'January 2026' })).toBeTruthy()
      expect(screen.getByRole('group', { name: 'Calendar view' })).toBeTruthy()
      expect(
        within(
          screen.getByRole('region', { name: 'Training agenda' }),
        ).getByText('Atlas · Flatwork school', {
          selector: '[data-slot="training-entry-title"]',
        }),
      ).toBeTruthy()
    },
  )

  it('returns to filtered results without clearing selections and retains Escape recovery', async () => {
    const scrollIntoView = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    })
    await openMobileTraining()
    fireEvent.click(screen.getByRole('button', { name: 'Filters' }))
    fireEvent.change(screen.getByLabelText('Type of work'), {
      target: { value: 'jumping' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Show results' }))
    const results = screen.getByRole('region', { name: 'Training agenda' })
    expect(document.activeElement).toBe(results)
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' })
    expect(
      within(results).getByText(
        'No training matches this period and these filters.',
      ),
    ).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Show results' })).toBeNull()
    const filter = screen.getByRole('button', { name: 'Filters (1)' })
    expect(filter.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(screen.getByRole('button', { name: 'Month' }))
    fireEvent.click(filter)
    expect(screen.getByLabelText<HTMLSelectElement>('Type of work').value).toBe(
      'jumping',
    )
    fireEvent.keyDown(screen.getByLabelText('Find horses'), { key: 'Escape' })
    expect(document.activeElement).toBe(filter)
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(
      within(results).getByText('Atlas · Flatwork school', {
        selector: '[data-slot="training-entry-title"]',
      }),
    ).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Filters' })).toBeTruthy()
  })

  it('keeps the agenda available without a creation action for viewers', async () => {
    await openMobileTraining({ canRecord: false })
    expect(screen.queryByRole('link', { name: 'Add training log' })).toBeNull()
    expect(
      screen.queryByRole('link', { name: 'Add training session' }),
    ).toBeNull()
    expect(screen.getByRole('region', { name: 'Training agenda' })).toBeTruthy()
  })

  it('shows a real mobile month calendar with selected-day records, empty days and month navigation', async () => {
    await openMobileTraining()
    fireEvent.click(screen.getByRole('button', { name: 'Month' }))
    const calendar = screen.getByRole('table', {
      name: 'Monthly training calendar',
    })
    expect(within(calendar).getAllByRole('columnheader')).toHaveLength(7)
    expect(within(calendar).getAllByRole('button')).toHaveLength(31)
    const fifth = within(calendar).getByRole('button', {
      name: '5 January 2026, 1 training entry',
    })
    expect(fifth.getAttribute('aria-pressed')).toBe('true')
    expect(
      screen
        .getByRole('link', { name: /Atlas · Flatwork school/ })
        .getAttribute('href'),
    ).toContain('date=2026-01-05')
    fireEvent.click(
      within(calendar).getByRole('button', {
        name: '6 January 2026, 0 training entries',
      }),
    )
    expect(screen.getByText('No training matches this date.')).toBeTruthy()
    expect(
      screen.queryByRole('link', { name: /Atlas · Flatwork school/ }),
    ).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }))
    expect(screen.getByRole('heading', { name: 'February 2026' })).toBeTruthy()
    expect(within(calendar).getAllByRole('button')).toHaveLength(28)
    expect(
      within(calendar)
        .getByRole('button', { name: '1 February 2026, 0 training entries' })
        .getAttribute('aria-pressed'),
    ).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }))
    fireEvent.click(
      within(calendar).getByRole('button', {
        name: '5 January 2026, 1 training entry',
      }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Week' }))
    expect(
      screen.queryByRole('table', { name: 'Monthly training calendar' }),
    ).toBeNull()
    expect(screen.getByRole('heading', { name: '5 Jan – 11 Jan' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Month' }))
    expect(
      screen
        .getByRole('button', { name: '5 January 2026, 1 training entry' })
        .getAttribute('aria-pressed'),
    ).toBe('true')
  })

  it('counts recurring and multi-day training on each date and keeps the occurrence start in record links', async () => {
    await openMobileTraining({
      eventOverrides: {
        endDate: '2026-01-07',
        recurrence: { frequency: 'weekly', interval: 1, daysOfWeek: [1] },
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Month' }))
    const calendar = screen.getByRole('table', {
      name: 'Monthly training calendar',
    })
    fireEvent.click(
      within(calendar).getByRole('button', {
        name: '13 January 2026, 1 training entry',
      }),
    )
    expect(
      screen
        .getByRole('link', { name: /Atlas · Flatwork school/ })
        .getAttribute('href'),
    ).toContain('date=2026-01-12')
    fireEvent.click(screen.getByRole('button', { name: 'Filters' }))
    fireEvent.change(screen.getByLabelText('Type of work'), {
      target: { value: 'jumping' },
    })
    expect(
      within(calendar)
        .getByRole('button', { name: '13 January 2026, 0 training entries' })
        .getAttribute('aria-pressed'),
    ).toBe('true')
    expect(screen.getByText('No training matches this date.')).toBeTruthy()
    expect(
      screen.queryByRole('link', { name: /Atlas · Flatwork school/ }),
    ).toBeNull()
  })
})
describe('training calendar controls', () => {
  it('preserves multiple horses and activity filters across month/week switches', async () => {
    const horses = ['Juniper', 'Atlas', 'Meadow'].map((name) => ({
      _id: name as Id<'horses'>,
      name,
    }))
    const events: Array<Doc<'events'>> = horses.map((horse, i) => ({
      _id: `event-${i}` as Id<'events'>,
      _creationTime: 0,
      stableId: 'stable' as Id<'stables'>,
      createdBy: 'owner' as Id<'users'>,
      horseIds: [horse._id],
      title: `${horse.name} session`,
      date: '2026-01-05',
      time: '10:00',
      type: 'training',
      training: {
        activities: [i === 0 ? 'flatwork' : 'jumping'],
        format: 'regular',
        rider: 'Alex',
        focus: 'Transitions and rhythm',
        nextFocus: i === 0 ? 'Practise balance' : undefined,
      },
    }))
    const router = createRouter({
      routeTree: createRootRoute({
        component: () => (
          <LocaleProvider>
            <LanguageSelector />
            <TrainingCalendar
              stableId="stable"
              horses={horses}
              events={events}
              records={[]}
              initialDate="2026-01-05"
              initialView="week"
            />
          </LocaleProvider>
        ),
      }),
      history: createMemoryHistory({ initialEntries: ['/'] }),
    })
    await router.load()
    render(<RouterProvider router={router} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Month' }))
    const month = screen.getByRole('table', {
      name: 'Monthly training calendar',
    })
    const monthEntries = within(month).getAllByRole('link')
    expect(monthEntries).toHaveLength(2)
    expect(within(monthEntries[0]).getByText('Atlas')).toBeTruthy()
    expect(within(monthEntries[0]).getByText('Atlas session')).toBeTruthy()
    expect(within(monthEntries[0]).getByText('10:00')).toBeTruthy()
    expect(monthEntries[0].getAttribute('aria-label')).toContain('Jumping')
    act(() => monthEntries[0].focus())
    const monthPreview = await screen.findByRole('dialog')
    expect(monthPreview.textContent).toContain('5 Jan 2026 at 10:00')
    expect(monthPreview.textContent).toContain('Rider: Alex')
    expect(monthPreview.textContent).toContain('Transitions and rhythm')
    fireEvent.keyDown(monthEntries[0], { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    fireEvent.click(within(month).getByRole('button', { name: /\+1 more/ }))
    expect(
      within(screen.getByRole('table')).getByText('Meadow session'),
    ).toBeTruthy()
    fireEvent.click(await screen.findByRole('button', { name: 'Filters' }))
    await screen.findByRole('button', { name: 'Juniper' })
    fireEvent.click(screen.getByRole('button', { name: 'Juniper' }))
    fireEvent.click(screen.getByRole('button', { name: 'Atlas' }))
    fireEvent.click(screen.getByRole('button', { name: 'Month' }))
    let table = screen.getByRole('table', { name: 'Monthly training calendar' })
    expect(
      within(table).queryByRole('link', { name: /Meadow · Meadow session/ }),
    ).toBeNull()
    expect(
      within(table).getByRole('link', { name: /Atlas · Atlas session/ }),
    ).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Type of work'), {
      target: { value: 'flatwork' },
    })
    expect(
      within(table).queryByRole('link', { name: /Atlas · Atlas session/ }),
    ).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Week' }))
    table = screen.getByRole('table')
    expect(within(table).getByText('Juniper session')).toBeTruthy()
    expect(within(table).queryByText('Juniper · Juniper session')).toBeNull()
    expect(
      within(table).queryByRole('link', { name: /Atlas session/ }),
    ).toBeNull()
    const entry = within(table).getByRole('link', { name: /Juniper session/ })
    expect(entry.textContent).toContain('Rider: Alex')
    expect(entry.textContent).toContain('10:00')
    expect(entry.textContent).not.toContain('Practise balance')
    expect(screen.queryByRole('dialog')).toBeNull()
    act(() => entry.focus())
    const preview = await screen.findByRole('dialog')
    expect(preview.textContent).toContain('Transitions and rhythm')
    expect(preview.textContent).toContain('Next focus')
    expect(preview.textContent).toContain('Practise balance')
    expect(entry.getAttribute('aria-describedby')).toBe(preview.id)
    expect(entry.getAttribute('href')).toContain(
      '/events/event-0?date=2026-01-05',
    )
    fireEvent.keyDown(entry, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(
      screen
        .getByRole('button', { name: 'Atlas' })
        .getAttribute('aria-pressed'),
    ).toBe('true')
    expect(localStorage.getItem('training-calendar-view')).toBe('week')
    fireEvent.change(screen.getByRole('combobox', { name: 'Language' }), {
      target: { value: 'pl' },
    })
    expect(screen.getByLabelText<HTMLSelectElement>('Rodzaj pracy').value).toBe(
      'flatwork',
    )
    expect(
      screen
        .getByRole('button', { name: 'Atlas' })
        .getAttribute('aria-pressed'),
    ).toBe('true')
    expect(screen.getByRole('table').textContent).toContain('Juniper session')
    expect(screen.getByRole('table').textContent).not.toContain('Atlas session')
    expect(
      screen.getByRole('table', {
        name: '5 sty – 11 sty — treningi według konia i dnia',
      }),
    ).toBeTruthy()
    expect(screen.getByRole('heading', { name: '5 sty – 11 sty' })).toBeTruthy()
    expect(localStorage.getItem('training-calendar-view')).toBe('week')
  })
})
