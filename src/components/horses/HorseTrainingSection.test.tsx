// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { HorseDetail } from './HorseDetail'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { createTodayTrainingSample } from '#/components/page-lab/prototypes/dashboardAnalysisFixtures'
import { getTodayDateKey } from '#/lib/dateDisplay'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

it('places Training after Activity and keeps the horse scope across calendar views and creation', async () => {
  const data = createDashboardLabFixtureData()
  const horse = data.horses[0]
  const entries = createTodayTrainingSample(data, getTodayDateKey())
  const path = `/stables/${data.stable._id}/horses/${horse._id}/training`
  const router = createRouter({
    routeTree: createRootRoute({
      component: () => (
        <HorseDetail
          stableId={data.stable._id}
          horse={horse}
          events={[]}
          canManageHorse
          trainingData={{
            horses: data.horses,
            records: [],
            events: entries.map((entry) => entry.occurrence.event),
          }}
        />
      ),
    }),
    history: createMemoryHistory({ initialEntries: [path] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
  await screen.findByRole('button', { name: 'Week' })
  const navigation = screen.getByRole('navigation', {
    name: `${horse.name} sections`,
  })
  const names = within(navigation)
    .getAllByRole('link')
    .map((link) => link.textContent)
  expect(names.slice(0, 3)).toEqual(['Profile', 'Activity', 'Training'])
  expect(
    within(navigation)
      .getByRole('link', { name: 'Training' })
      .getAttribute('href'),
  ).toBe(path)
  expect(screen.queryByLabelText('Find horses')).toBeNull()
  expect(screen.queryByRole('button', { name: 'All horses' })).toBeNull()
  for (const view of ['Week', 'Month']) {
    fireEvent.click(screen.getByRole('button', { name: view }))
    const table = screen.getByRole('table')
    expect(
      within(table).getByRole('link', { name: /Morning flatwork/ }),
    ).toBeTruthy()
    expect(
      within(table).queryByRole('link', { name: /Trainer lesson/ }),
    ).toBeNull()
  }
  const create = screen.getByRole('link', { name: 'Add training session' })
  expect(decodeURIComponent(create.getAttribute('href')!)).toContain(
    `horseIds=["${horse._id}"]`,
  )
})
