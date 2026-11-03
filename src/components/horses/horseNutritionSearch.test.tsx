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
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { HorseDetail } from './HorseDetail'
import { parseHorseCareSearch } from './horseCareSearch'
import {
  parseHorseNutritionSearch,
  redirectLegacyMedicationView,
} from './horseNutritionSearch'

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
vi.mock('../reminders/HorseCareRemindersCard', () => ({
  HorseCareRemindersCard: () => <p>Reminder source records</p>,
}))

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function createHorseRouter(initialEntries: Array<string>) {
  const data = createDashboardLabFixtureData()
  const horse = data.horses[0]
  const root = createRootRoute()
  const detail = (stableId?: string) => (
    <HorseDetail
      stableId={stableId}
      horse={horse}
      events={[]}
      canManageHorse={false}
    >
      <Outlet />
    </HorseDetail>
  )
  const personal = createRoute({
    getParentRoute: () => root,
    path: '/horses/$horseId',
    component: () => detail(),
  })
  const stable = createRoute({
    getParentRoute: () => root,
    path: '/stables/$stableId/horses/$horseId',
    component: () => detail(data.stable._id),
  })
  const sections = (parent: typeof personal | typeof stable) => [
    createRoute({
      getParentRoute: () => parent,
      path: 'nutrition',
      validateSearch: parseHorseNutritionSearch,
      beforeLoad: redirectLegacyMedicationView,
      component: () => null,
    }),
    createRoute({
      getParentRoute: () => parent,
      path: 'care',
      validateSearch: parseHorseCareSearch,
      component: () => null,
    }),
  ]
  const router = createRouter({
    routeTree: root.addChildren([
      personal.addChildren(sections(personal)),
      stable.addChildren(sections(stable)),
    ]),
    history: createMemoryHistory({ initialEntries }),
  })
  return { router, horse, stableId: data.stable._id }
}

describe('nutrition source destinations', () => {
  it('rejects unknown, malformed or relocated section values', () => {
    for (const nutritionView of [
      'unknown',
      ['weight'],
      null,
      undefined,
      'medication',
    ]) {
      expect(parseHorseNutritionSearch({ nutritionView })).toEqual({})
    }
    expect(parseHorseNutritionSearch({ nutritionView: 'weight' })).toEqual({
      nutritionView: 'weight',
    })
  })

  it('keeps feeding and weight together without a medication tab', async () => {
    const data = createDashboardLabFixtureData()
    const { router, horse } = createHorseRouter([
      `/horses/${data.horses[0]._id}/nutrition?nutritionView=weight`,
    ])
    await router.load()
    render(<RouterProvider router={router} />)
    expect(await screen.findByText('Weight source records')).toBeTruthy()
    expect(
      screen.getByRole('tab', { name: 'Weight' }).getAttribute('aria-selected'),
    ).toBe('true')
    expect(screen.queryByRole('tab', { name: 'Medication' })).toBeNull()
    fireEvent.click(screen.getByRole('tab', { name: 'Nutrition' }))
    expect(await screen.findByText('Nutrition source records')).toBeTruthy()
    await waitFor(() => expect(router.state.location.search).toEqual({}))
    fireEvent.click(screen.getByRole('tab', { name: 'Weight' }))
    expect(await screen.findByText('Weight source records')).toBeTruthy()
    expect(router.state.location.search).toEqual({ nutritionView: 'weight' })
    expect(router.state.location.pathname).toBe(
      `/horses/${horse._id}/nutrition`,
    )
  })

  it.each([false, true])(
    'redirects old medication links to Care without trapping Back (stable: %s)',
    async (inStable) => {
      const data = createDashboardLabFixtureData()
      const horseId = data.horses[0]._id
      const base = inStable
        ? `/stables/${data.stable._id}/horses/${horseId}`
        : `/horses/${horseId}`
      const { router } = createHorseRouter([
        `${base}/care`,
        `${base}/nutrition?nutritionView=medication`,
      ])
      await router.load()
      render(<RouterProvider router={router} />)
      expect(await screen.findByText('Medication source records')).toBeTruthy()
      expect(router.state.location.pathname).toBe(`${base}/care`)
      expect(router.state.location.search).toEqual({ careView: 'medication' })
      expect(
        screen
          .getByRole('tab', { name: 'Medication' })
          .getAttribute('aria-selected'),
      ).toBe('true')
      // The old entry was replaced, so Back returns to the previous view.
      router.history.back()
      await waitFor(() =>
        expect(router.state.location.href).toBe(`${base}/care`),
      )
      expect(await screen.findByText('Reminder source records')).toBeTruthy()
    },
  )

  it('keeps an old medication creation intent through the redirect', async () => {
    const data = createDashboardLabFixtureData()
    const horseId = data.horses[0]._id
    const { router } = createHorseRouter([`/horses/${horseId}/nutrition`])
    await router.load()
    await router.navigate({
      to: '/horses/$horseId/nutrition',
      params: { horseId },
      // Old intents used a value that typed links can no longer produce.
      search: { nutritionView: 'medication' } as never,
      state: { horseCreateAction: 'medication' },
    })
    expect(router.state.location.pathname).toBe(`/horses/${horseId}/care`)
    expect(router.state.location.search).toEqual({ careView: 'medication' })
    expect(router.state.location.state.horseCreateAction).toBe('medication')
  })
})
