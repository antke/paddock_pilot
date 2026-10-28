// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useDashboardData } from './useDashboardData'

const state = vi.hoisted(
  (): { stables: Array<{ _id: string; name: string }> | undefined } => ({
    stables: [],
  }),
)
vi.mock('convex/react', () => ({ useQuery: () => state.stables }))
const clients: QueryClient[] = []
beforeEach(() => {
  sessionStorage.clear()
  localStorage.clear()
  state.stables = [{ _id: 'stable-a', name: 'Stable A' }]
  localStorage.setItem(
    'paddock:calendar-selection:anonymous',
    JSON.stringify(['mine', 'stable-a']),
  )
})
afterEach(() => {
  cleanup()
  clients.splice(0).forEach((client) => client.clear())
})

function setup() {
  const stable = { marker: 'stable snapshot' }
  let finish!: (value: { marker: string }) => void
  const personal = new Promise<{ marker: string }>((resolve) => {
    finish = resolve
  })
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        queryFn: ({ queryKey }) =>
          (queryKey[2] as { stableIds: string[] }).stableIds.length
            ? stable
            : personal,
      },
    },
  })
  clients.push(client)
  const view = renderHook(() => useDashboardData('2026-01-05'), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  })
  return { ...view, stable, finish }
}

it('keeps the entire previous snapshot while a filter selection loads', async () => {
  const view = setup()
  await waitFor(() => expect(view.result.current.data).toBe(view.stable))
  act(() => view.result.current.setSelected(['mine']))
  expect(view.result.current.data).toBe(view.stable)
  expect(view.result.current.loading).toBe(true)
  const personal = { marker: 'personal snapshot' }
  await act(async () => view.finish(personal))
  await waitFor(() => expect(view.result.current.data).toBe(personal))
})

it('does not retain stable data after membership is removed', async () => {
  const view = setup()
  await waitFor(() => expect(view.result.current.data).toBe(view.stable))
  state.stables = []
  view.rerender()
  expect(view.result.current.data).toBeUndefined()
  expect(view.result.current.stableIds).toEqual([])
})
