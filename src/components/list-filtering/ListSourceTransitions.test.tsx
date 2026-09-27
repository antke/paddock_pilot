// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { HorseList } from '#/components/horses/HorseList'
import { EventTable } from '#/components/events/EventList'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

async function openList(kind: 'horses' | 'events', initiallyEmpty = false) {
  const data = createDashboardLabFixtureData()
  let changeSource = (_empty: boolean) => {}
  function Sample() {
    const [empty, setEmpty] = useState(initiallyEmpty)
    changeSource = setEmpty
    return (
      <>
        {kind === 'horses' ? (
          <HorseList
            stableId={data.stable._id}
            horses={empty ? [] : data.horses}
          />
        ) : (
          <EventTable
            stableId={data.stable._id}
            events={empty ? [] : data.events}
            emptyTitle="No stable appointments."
            emptyDescription="Plan the first visit."
          />
        )}
        <input aria-label="Outside list" />
      </>
    )
  }
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  const root = createRootRoute({ component: Sample })
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
  await screen.findByLabelText('Outside list')
  return { changeSource: (empty: boolean) => act(() => changeSource(empty)) }
}

describe.each(['horses', 'events'] as const)(
  '%s source transitions',
  (kind) => {
    const emptyTitle =
      kind === 'horses' ? 'No horses added yet.' : 'No stable appointments.'
    it('retains the genuine initial empty prompt without redundant filter controls', async () => {
      await openList(kind, true)
      expect(screen.getByText(emptyTitle)).toBeTruthy()
      expect(
        screen.getByText(
          kind === 'horses'
            ? 'Add a horse to start building this stable roster.'
            : 'Plan the first visit.',
        ),
      ).toBeTruthy()
      expect(screen.queryByRole('searchbox')).toBeNull()
    })
    it('retains focused search across source disappearance and hides only after focus leaves', async () => {
      const sample = await openList(kind)
      const search = screen.getByRole('searchbox')
      act(() => search.focus())
      sample.changeSource(true)
      expect(document.activeElement).toBe(search)
      expect(screen.getByText(emptyTitle)).toBeTruthy()
      const outside = screen.getByLabelText('Outside list')
      act(() => outside.focus())
      expect(screen.queryByRole('searchbox')).toBeNull()
      expect(document.activeElement).toBe(outside)
      sample.changeSource(false)
      expect(screen.getByRole('searchbox')).toBeTruthy()
      expect(document.activeElement).toBe(outside)
    })
    it('keeps active zero-result filters clearable and restores the unfiltered prompt after reset', async () => {
      const sample = await openList(kind)
      fireEvent.change(screen.getByRole('searchbox'), {
        target: { value: 'No such sample record' },
      })
      expect(
        screen.getByText(
          kind === 'horses'
            ? 'No horses match these filters.'
            : 'No events match these filters.',
        ),
      ).toBeTruthy()
      sample.changeSource(true)
      const clear = screen.getByRole('button', { name: 'Clear all' })
      act(() => clear.focus())
      fireEvent.click(clear)
      expect(document.activeElement).toBe(screen.getByRole('searchbox'))
      expect(screen.getByRole<HTMLInputElement>('searchbox').value).toBe('')
      expect(screen.getByText(emptyTitle)).toBeTruthy()
    })
  },
)
