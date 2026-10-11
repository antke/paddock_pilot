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
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, expect, it } from 'vitest'
import { DashboardCreateMenu } from './DashboardCreateMenu'

afterEach(cleanup)

async function openMenu(stableId?: string) {
  const root = createRootRoute({
    component: () => <DashboardCreateMenu stableId={stableId} />,
  })
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
  const trigger = await screen.findByRole('button', {
    name: 'Add event, training log or horse',
  })
  fireEvent.click(trigger)
  await screen.findByRole('menu')
  return { trigger, router }
}

it.each([
  [
    undefined,
    '/events/create',
    '/events/create?intent=record&training=true',
    '/horses/create',
  ],
  [
    'stable-1',
    '/stables/stable-1/events/create',
    '/stables/stable-1/training/create?intent=record',
    '/stables/stable-1/horses/create',
  ],
])(
  'keeps creation destinations in the current workspace (%s)',
  async (stableId, eventHref, trainingHref, horseHref) => {
    const { trigger, router } = await openMenu(stableId)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(
      screen.getByRole('menuitem', { name: 'Add event' }).getAttribute('href'),
    ).toBe(eventHref)
    const training = screen.getByRole('menuitem', { name: 'Add training log' })
    expect(training.getAttribute('href')).toBe(trainingHref)
    fireEvent.click(training)
    await waitFor(() => expect(router.state.location.href).toBe(trainingHref))
    expect(router.state.location.state.taskOrigin).toMatchObject({
      href: '/',
      index: 0,
      scrollY: 0,
    })
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    fireEvent.click(trigger)
    const horse = await screen.findByRole('menuitem', { name: 'Add a horse' })
    expect(horse.getAttribute('href')).toBe(horseHref)
    fireEvent.click(horse)
    await waitFor(() => expect(router.state.location.href).toBe(horseHref))
    expect(router.state.location.state.taskOrigin?.href).toBe(trainingHref)
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  },
)

it('dismisses with Escape and returns keyboard focus to the add button', async () => {
  const { trigger } = await openMenu()
  fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  await waitFor(() => expect(document.activeElement).toBe(trigger))
})
