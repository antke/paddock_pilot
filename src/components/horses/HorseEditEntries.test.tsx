// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { HorseCareSection } from './HorseCareSection'
import { HorseNutritionSection } from './HorseNutritionSection'
import { HorseProfileSection } from './HorseProfileSection'

vi.mock('../reminders/HorseCareRemindersCard', () => ({
  HorseCareRemindersCard: () => null,
}))
vi.mock('./HorseNutritionLogsCard', () => ({
  HorseNutritionLogsCard: () => null,
}))
beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

// A horse with no photo, identification, care contacts or feeding plan.
const fixture = createDashboardLabFixtureData()
const horse = {
  ...fixture.horses[0],
  profileImageUrl: null,
  passportNumber: undefined,
  microchipNumber: undefined,
  insuranceProvider: undefined,
  insurancePolicyNumber: undefined,
  vetName: undefined,
  vetPhone: undefined,
  farrierName: undefined,
  farrierPhone: undefined,
  emergencyNotes: undefined,
  feedingRoutine: undefined,
  nutritionNotes: undefined,
  nutritionRecommended: undefined,
  nutritionAvoid: undefined,
}

async function renderInRouter(node: ReactNode, path = '/') {
  const router = createRouter({
    routeTree: createRootRoute({ component: () => node }),
    history: createMemoryHistory({ initialEntries: [path] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
  return router
}

function sections(canManageHorse: boolean, stableId?: string) {
  const props = { horse, events: [], canManageHorse, stableId }
  return (
    <>
      <HorseProfileSection {...props} />
      <HorseCareSection {...props} />
      <HorseNutritionSection {...props} />
    </>
  )
}

describe('contextual horse edit entries', () => {
  it('offers each entry to editors when the information is missing', async () => {
    await renderInRouter(sections(true))
    const hrefs = {
      'Edit profile': 'profile',
      'Edit identification': 'identification',
      'Edit care contacts': 'care',
      'Edit feeding plan': 'feeding',
    }
    for (const [name, section] of Object.entries(hrefs))
      expect(screen.getByRole('link', { name }).getAttribute('href')).toBe(
        `/horses/${horse._id}/edit?section=${section}`,
      )
    expect(
      screen.getByRole('heading', { name: 'Identification and insurance' }),
    ).toBeTruthy()
  })

  it('puts a pencil on recorded emergency notes for editors', async () => {
    const props = {
      horse: { ...horse, emergencyNotes: 'Call the yard manager first.' },
      events: [],
      canManageHorse: true,
    }
    await renderInRouter(<HorseCareSection {...props} />)
    expect(
      screen
        .getByRole('link', { name: 'Edit emergency notes' })
        .getAttribute('href'),
    ).toBe(`/horses/${horse._id}/edit?section=care`)
  })

  it('keeps the stable scope for stable horse views', async () => {
    await renderInRouter(sections(true, fixture.stable._id))
    expect(
      screen
        .getByRole('link', { name: 'Edit feeding plan' })
        .getAttribute('href'),
    ).toBe(
      `/stables/${fixture.stable._id}/horses/${horse._id}/edit?section=feeding`,
    )
  })

  it('shows no edit entries or empty placeholders to readers', async () => {
    await renderInRouter(sections(false))
    expect(screen.queryByRole('link', { name: /^Edit / })).toBeNull()
    expect(
      screen.queryByRole('heading', { name: 'Identification and insurance' }),
    ).toBeNull()
    expect(screen.queryByRole('region', { name: 'Care contacts' })).toBeNull()
  })

  it('records the originating view so a saved edit can return to it', async () => {
    const router = await renderInRouter(
      sections(true),
      `/horses/${horse._id}/nutrition`,
    )
    screen.getByRole('link', { name: 'Edit feeding plan' }).click()
    await vi.waitFor(() =>
      expect(router.state.location.pathname).toBe(`/horses/${horse._id}/edit`),
    )
    expect(router.state.location.search).toEqual({ section: 'feeding' })
    expect(router.state.location.state.taskOrigin).toMatchObject({
      href: `/horses/${horse._id}/nutrition`,
      index: 0,
    })
  })
})
