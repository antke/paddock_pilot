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
import { afterEach, describe, expect, it } from 'vitest'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { TrainingCalendar } from './TrainingCalendar'

afterEach(() => {
  cleanup()
  localStorage.clear()
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
          <TrainingCalendar
            stableId="stable"
            horses={horses}
            events={events}
            records={[]}
            initialDate="2026-01-05"
            initialView="week"
          />
        ),
      }),
      history: createMemoryHistory({ initialEntries: ['/'] }),
    })
    await router.load()
    render(<RouterProvider router={router} />)
    await screen.findByRole('button', { name: 'Juniper' })
    fireEvent.click(screen.getByRole('button', { name: 'Juniper' }))
    fireEvent.click(screen.getByRole('button', { name: 'Atlas' }))
    fireEvent.click(screen.getByRole('button', { name: 'Month' }))
    let table = screen.getByRole('table', { name: 'Monthly training calendar' })
    expect(within(table).queryByText('Meadow · Meadow session')).toBeNull()
    expect(within(table).getByText('Atlas · Atlas session')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Type of work'), {
      target: { value: 'flatwork' },
    })
    expect(within(table).queryByText('Atlas · Atlas session')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Week' }))
    table = screen.getByRole('table')
    expect(within(table).getByText('Juniper session')).toBeTruthy()
    expect(within(table).queryByText('Juniper · Juniper session')).toBeNull()
    expect(within(table).queryByText('Atlas · Atlas session')).toBeNull()
    const entry = within(table).getByRole('link', { name: /Juniper session/ })
    expect(entry.textContent).toContain('Rider: Alex')
    expect(entry.textContent).toContain('10:00')
    expect(entry.textContent).not.toContain('Practise balance')
    expect(screen.queryByRole('tooltip')).toBeNull()
    act(() => entry.focus())
    const preview = await screen.findByRole('tooltip')
    expect(preview.textContent).toContain('Transitions and rhythm')
    expect(preview.textContent).toContain('Next focus')
    expect(preview.textContent).toContain('Practise balance')
    expect(entry.getAttribute('aria-describedby')).toBe(preview.id)
    expect(entry.getAttribute('href')).toContain(
      '/training/event-0?date=2026-01-05',
    )
    fireEvent.keyDown(entry, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
    expect(
      screen
        .getByRole('button', { name: 'Atlas' })
        .getAttribute('aria-pressed'),
    ).toBe('true')
    expect(localStorage.getItem('training-calendar-view')).toBe('week')
  })
})
