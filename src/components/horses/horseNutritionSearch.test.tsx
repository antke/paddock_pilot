// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { HorseDetail } from './HorseDetail'
import { parseHorseNutritionSearch } from './horseNutritionSearch'

vi.mock('./HorseNutritionCard', () => ({ HorseNutritionCard: () => null }))
vi.mock('./HorseNutritionLogsCard', () => ({
  HorseNutritionLogsCard: () => <p>Nutrition source records</p>,
}))
vi.mock('./HorseWeightRecordsCard', () => ({
  HorseWeightRecordsCard: () => <p>Weight source records</p>,
}))
vi.mock('./HorseMedicationRecordsCard', () => ({
  HorseMedicationRecordsCard: () => <p>Medication source records</p>,
}))

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('nutrition source destinations', () => {
  it('rejects unknown or malformed section values', () => {
    for (const nutritionView of ['unknown', ['weight'], null, undefined]) {
      expect(parseHorseNutritionSearch({ nutritionView })).toEqual({})
    }
  })

  it.each(['weight', 'medication'] as const)(
    'opens the requested %s source section and keeps tab navigation in the URL',
    async (nutritionView) => {
      const data = createDashboardLabFixtureData()
      const horse = data.horses[0]
      const root = createRootRoute()
      const route = createRoute({
        getParentRoute: () => root,
        path: '/horses/$horseId/nutrition',
        validateSearch: parseHorseNutritionSearch,
        component: () => (
          <HorseDetail
            stableId={data.stable._id}
            horse={horse}
            events={[]}
            canManageHorse={false}
          />
        ),
      })
      const router = createRouter({
        routeTree: root.addChildren([route]),
        history: createMemoryHistory({
          initialEntries: [
            `/horses/${horse._id}/nutrition?nutritionView=${nutritionView}`,
          ],
        }),
      })
      await router.load()
      render(<RouterProvider router={router} />)
      const label = nutritionView === 'weight' ? 'Weight' : 'Medication'
      expect(await screen.findByText(`${label} source records`)).toBeTruthy()
      expect(
        screen.getByRole('tab', { name: label }).getAttribute('aria-selected'),
      ).toBe('true')
      fireEvent.click(screen.getByRole('tab', { name: 'Nutrition' }))
      expect(await screen.findByText('Nutrition source records')).toBeTruthy()
      await waitFor(() => expect(router.state.location.search).toEqual({}))
      fireEvent.click(screen.getByRole('tab', { name: label }))
      expect(await screen.findByText(`${label} source records`)).toBeTruthy()
      expect(router.state.location.search).toEqual({ nutritionView })
    },
  )
})
