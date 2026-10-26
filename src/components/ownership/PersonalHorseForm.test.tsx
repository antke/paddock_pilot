// @vitest-environment jsdom
import {
  act,
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
import { getFunctionName } from 'convex/server'
import { afterEach, expect, it, vi } from 'vitest'
import { PersonalHorseForm } from './PersonalHorseForm'

const { save } = vi.hoisted(() => ({ save: vi.fn() }))
vi.mock('convex/react', () => ({
  useConvex: () => undefined,
  useMutation: () => save,
  useQuery: (query: Parameters<typeof getFunctionName>[0]) => {
    switch (getFunctionName(query)) {
      case 'horses:get':
        return {
          _id: 'sample-horse',
          name: 'Maple',
          ownerName: 'Alex',
          age: 10,
        }
      case 'horses:getPermissions':
        return { canEditProfile: true }
      default:
        return []
    }
  },
}))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  save.mockReset()
})

it.each(['/horses/$horseId/edit', '/stables/$stableId/horses/$horseId/edit'])(
  'does not reopen the completed %s form on Back or Forward',
  async (editPath) => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    save.mockResolvedValue(undefined)
    const root = createRootRoute({ component: Outlet })
    const previous = createRoute({
      getParentRoute: () => root,
      path: '/previous',
      component: () => <h1>Previous screen</h1>,
    })
    const edit = createRoute({
      getParentRoute: () => root,
      path: editPath,
      component: () => <PersonalHorseForm horseId="sample-horse" />,
    })
    const profile = createRoute({
      getParentRoute: () => root,
      path: '/horses/$horseId',
      component: () => <h1>Saved horse profile</h1>,
    })
    const history = createMemoryHistory({
      initialEntries: [
        '/previous',
        editPath
          .replace('$stableId', 'sample-stable')
          .replace('$horseId', 'sample-horse'),
      ],
    })
    const router = createRouter({
      history,
      routeTree: root.addChildren([previous, edit, profile]),
    })
    await router.load()
    render(<RouterProvider router={router} />)
    fireEvent.change(await screen.findByLabelText('Horse name'), {
      target: { value: 'Maple revised' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await screen.findByRole('heading', { name: 'Saved horse profile' })
    expect(save).toHaveBeenCalledTimes(1)

    act(() => history.back())
    await screen.findByRole('heading', { name: 'Previous screen' })
    act(() => history.forward())
    await screen.findByRole('heading', { name: 'Saved horse profile' })
    await waitFor(() => expect(router.state.status).toBe('idle'))
    expect(history.length).toBe(2)
    expect(save).toHaveBeenCalledTimes(1)
  },
)
