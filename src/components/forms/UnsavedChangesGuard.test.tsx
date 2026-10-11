// @vitest-environment jsdom
import { useRef, useState } from 'react'
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
  Link,
  Outlet,
  RouterProvider,
  useNavigate,
} from '@tanstack/react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { UnsavedChangesGuard } from './UnsavedChangesGuard'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function Editor() {
  const [value, setValue] = useState('')
  const saved = useRef(false)
  const navigate = useNavigate()
  return (
    <>
      <UnsavedChangesGuard
        shouldBlock={() => Boolean(value) && !saved.current}
      />
      <input
        aria-label="Draft"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <Link to="/pricing">Other page</Link>
      <button
        onClick={() => {
          saved.current = true
          void navigate({ to: '/pricing' })
        }}
      >
        Save and leave
      </button>
    </>
  )
}

async function openEditor() {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  const root = createRootRoute({ component: Outlet })
  const edit = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: Editor,
  })
  const other = createRoute({
    getParentRoute: () => root,
    path: '/pricing',
    component: () => <p>Destination</p>,
  })
  const router = createRouter({
    routeTree: root.addChildren([edit, other]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
  await screen.findByLabelText('Draft')
}

describe('shared unsaved form guard', () => {
  it('retains the draft when navigation is cancelled, then allows explicit discard', async () => {
    await openEditor()
    fireEvent.change(screen.getByLabelText('Draft'), {
      target: { value: 'Keep this' },
    })
    fireEvent.click(screen.getByRole('link', { name: 'Other page' }))
    await screen.findByRole('alertdialog')
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    expect(screen.getByLabelText<HTMLInputElement>('Draft').value).toBe(
      'Keep this',
    )
    fireEvent.click(screen.getByRole('link', { name: 'Other page' }))
    await screen.findByRole('alertdialog')
    fireEvent.click(
      screen.getByRole('button', { name: 'Leave without saving' }),
    )
    await screen.findByText('Destination')
  })

  it('warns on reload only when dirty and lets a synchronously acknowledged save navigate', async () => {
    await openEditor()
    const clean = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(clean)
    expect(clean.defaultPrevented).toBe(false)
    fireEvent.change(screen.getByLabelText('Draft'), {
      target: { value: 'Saved next' },
    })
    const dirty = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(dirty)
    expect(dirty.defaultPrevented).toBe(true)
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Save and leave' })),
    )
    await screen.findByText('Destination')
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })
})
