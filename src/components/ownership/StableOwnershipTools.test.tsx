// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { Id } from 'convex/_generated/dataModel'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import type * as ReactRouter from '@tanstack/react-router'
import type { ReactNode } from 'react'
import {
  StableHorseHistoryUnavailable,
  StableOwnershipTools,
  UnclaimedHorseForm,
} from './StableOwnershipTools'

const add = vi.hoisted(() => vi.fn())
const convex = vi.hoisted(() => ({
  access: undefined as undefined | { role: 'owner' | 'member' },
  usePaginatedQuery: vi.fn(),
  useQuery: vi.fn(),
}))
vi.mock('convex/react', () => ({
  usePaginatedQuery: convex.usePaginatedQuery,
  useMutation: () => add,
  useQuery: convex.useQuery,
}))
vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof ReactRouter>()),
  useNavigate: () => vi.fn(),
}))
const stableId = 'stable' as Id<'stables'>
beforeEach(() => {
  convex.access = undefined
  convex.useQuery.mockImplementation(() => convex.access)
})
afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.clearAllMocks()
})

async function renderWithRouter(element: ReactNode) {
  const root = createRootRoute({ component: () => element })
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
}

it('no longer offers the obsolete Horse history entry to stable owners', async () => {
  convex.access = { role: 'owner' }
  await renderWithRouter(<StableOwnershipTools stableId={stableId} />)
  expect(
    (
      await screen.findByRole('link', { name: 'Add a horse for an owner' })
    ).getAttribute('href'),
  ).toBe('/stables/stable/horses/unclaimed')
  expect(screen.queryByRole('link', { name: 'Former horses' })).toBeNull()
  expect(document.querySelector('a[href$="/horses/history"]')).toBeNull()
})

it('explains that former horse records are unavailable without loading any horse data', async () => {
  await renderWithRouter(<StableHorseHistoryUnavailable stableId={stableId} />)
  expect(
    await screen.findByRole('heading', {
      name: 'Former horse records are not available',
    }),
  ).toBeTruthy()
  expect(convex.usePaginatedQuery).not.toHaveBeenCalled()
  expect(convex.useQuery).not.toHaveBeenCalled()
})

it('prevents duplicate creation while pending and preserves the draft after a localized failure', async () => {
  let reject!: (error: Error) => void
  add.mockImplementation(
    () =>
      new Promise((_, fail) => {
        reject = fail
      }),
  )
  render(<UnclaimedHorseForm stableId={stableId} />)
  fireEvent.change(screen.getByLabelText('Horse name'), {
    target: { value: 'Maple' },
  })
  fireEvent.change(screen.getByLabelText('Age'), { target: { value: '12' } })
  const form = screen.getByLabelText('Horse name').closest('form')!
  fireEvent.submit(form)
  fireEvent.submit(form)
  expect(add).toHaveBeenCalledTimes(1)
  expect(
    screen
      .getByRole('button', { name: 'Creating horse…' })
      .hasAttribute('disabled'),
  ).toBe(true)
  await act(async () => reject(new Error('Enter a valid age')))
  await waitFor(() =>
    expect(screen.getByRole('alert').textContent).toContain(
      'Enter the horse’s name and an age between 0 and 100.',
    ),
  )
  expect(screen.getByLabelText<HTMLInputElement>('Horse name').value).toBe(
    'Maple',
  )
  expect(screen.getByLabelText<HTMLInputElement>('Age').value).toBe('12')
})
