// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, expect, it } from 'vitest'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { createDashboardCommandData } from './dashboardData'
import { HorseRosterCard } from './HorseRosterCard'

afterEach(cleanup)

it('bounds the mobile roster, preserves stable navigation and leaves inaccessible horses unlinked', async () => {
  const fixture = createDashboardLabFixtureData()
  const horses = Array.from({ length: 50 }, (_, index) => ({
    ...fixture.horses[0],
    _id: `horse-${index}` as (typeof fixture.horses)[number]['_id'],
    name:
      index === 0
        ? 'Bardzo długa nazwa konia z naszej stajni'
        : `Horse ${index}`,
    canRead: index !== 1,
  }))
  const data = createDashboardCommandData({
    ...fixture,
    horses,
    todayKey: '2026-10-26',
  })
  const root = createRootRoute({
    component: () => (
      <HorseRosterCard data={data} compact visibleItemLimit={3} />
    ),
  })
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
  const rows = screen.getAllByRole('listitem')
  expect(rows).toHaveLength(3)
  expect(within(rows[0]).getByRole('link').getAttribute('href')).toBe(
    `/stables/${fixture.stable._id}/horses/horse-0`,
  )
  expect(within(rows[0]).getByText(horses[0].name)).toBeTruthy()
  expect(within(rows[1]).queryByRole('link')).toBeNull()
  expect(screen.queryByText('Horse 3')).toBeNull()
  expect(
    screen.getByRole('link', { name: /\(50\)/ }).getAttribute('href'),
  ).toBe(`/stables/${fixture.stable._id}/horses`)
})
