// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { getFunctionName } from 'convex/server'
import { afterEach, expect, it, vi } from 'vitest'
import { HorseCreateForm } from './HorseCreateForm'

const { add } = vi.hoisted(() => ({ add: vi.fn() }))
vi.mock('convex/react', () => ({
  useConvex: () => undefined,
  useMutation: () => add,
  useQuery: (query: Parameters<typeof getFunctionName>[0]) => {
    switch (getFunctionName(query)) {
      case 'stables:list':
        return [
          { _id: 'oak', name: 'Oak Farm' },
          { _id: 'annex', name: 'North Annex' },
        ]
      case 'stableProviders:listForStable':
        return { providers: [] }
      default:
        return []
    }
  },
}))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  add.mockReset()
})

async function setup(initialStableId?: string) {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  add.mockResolvedValue('new-horse')
  const root = createRootRoute({ component: Outlet })
  const routes = [
    createRoute({
      getParentRoute: () => root,
      path: '/create',
      component: () => <HorseCreateForm initialStableId={initialStableId} />,
    }),
    createRoute({
      getParentRoute: () => root,
      path: '/horses/$horseId',
      component: () => <h1>Personal horse</h1>,
    }),
    createRoute({
      getParentRoute: () => root,
      path: '/stables/$stableId/horses/$horseId',
      component: () => <h1>Stable horse</h1>,
    }),
  ]
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: ['/create'] }),
    routeTree: root.addChildren(routes),
  })
  await router.load()
  render(<RouterProvider router={router} />)
  fireEvent.change(await screen.findByLabelText('Horse name'), {
    target: { value: 'Maple' },
  })
  fireEvent.change(screen.getByLabelText('Current age'), {
    target: { value: '10' },
  })
}

it('presets the stable that opened the form and says what members see', async () => {
  await setup('oak')
  const stable = screen.getByLabelText<HTMLSelectElement>('Stable')
  expect(stable.value).toBe('oak')
  expect(screen.getByText(/Stable members will see this horse/)).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Add horse' }))
  await screen.findByRole('heading', { name: 'Stable horse' })
  expect(add).toHaveBeenCalledWith(expect.objectContaining({ stableId: 'oak' }))
})

it('adds a personal horse when the stable is cleared', async () => {
  await setup('oak')
  fireEvent.change(screen.getByLabelText('Stable'), { target: { value: '' } })
  expect(screen.queryByText(/Stable members will see this horse/)).toBeNull()
  expect(screen.getByLabelText<HTMLInputElement>('Horse name').value).toBe(
    'Maple',
  )
  fireEvent.click(screen.getByRole('button', { name: 'Add horse' }))
  await screen.findByRole('heading', { name: 'Personal horse' })
  expect(add).toHaveBeenCalledWith(
    expect.objectContaining({ stableId: undefined }),
  )
})
