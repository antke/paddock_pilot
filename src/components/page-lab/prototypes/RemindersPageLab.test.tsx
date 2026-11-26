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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useMutation } from 'convex/react'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { RemindersPageLab } from './RemindersPageLab'

vi.mock('convex/react', () => ({
  useMutation: vi.fn(() => {
    throw new Error('Sample must not mount live mutations')
  }),
}))
beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
async function openSample(emptyHorses = false) {
  const data = createDashboardLabFixtureData()
  if (emptyHorses) data.horses = []
  const root = createRootRoute({
    component: () => <RemindersPageLab data={data} />,
  })
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
  await screen.findByLabelText('Sample reminders')
}
const title = 'Follow up on lameness notes after turnout change'

describe('care reminder production-view sample', () => {
  it('keeps failed completion pending, blocks repeat actions, and applies only successful local results', async () => {
    await openSample()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Care reminders' }),
    ).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: title })).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Next sample result'), {
      target: { value: 'failure' },
    })
    const choose = async (action: string) => {
      fireEvent.click(
        screen.getByRole('button', { name: `Actions for ${title}` }),
      )
      fireEvent.click(await screen.findByRole('menuitem', { name: action }))
    }
    const trigger = screen.getByRole<HTMLButtonElement>('button', {
      name: `Actions for ${title}`,
    })
    await choose('Complete')
    expect(trigger.disabled).toBe(true)
    await screen.findByText(/^Couldn’t update the reminder\. /)
    expect(trigger.disabled).toBe(false)
    await choose('Complete')
    await screen.findByText(
      'Sample completion applied locally. No live reminder was saved or removed.',
    )
    expect(screen.queryByRole('heading', { name: title })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Done' }))
    await screen.findByRole('heading', { name: title })
    await choose('Reopen')
    await screen.findByText(
      'Sample reopening applied locally. No live reminder was saved or removed.',
    )
    expect(screen.queryByRole('heading', { name: title })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'To do' }))
    await screen.findByRole('heading', { name: title })
    expect(useMutation).not.toHaveBeenCalled()
  })

  it('preserves read-only permissions and supports filtered-empty recovery', async () => {
    await openSample()
    fireEvent.change(screen.getByLabelText('Sample reminders'), {
      target: { value: 'read-only' },
    })
    expect(screen.queryByRole('button', { name: 'Add reminder' })).toBeNull()
    expect(screen.queryByRole('button', { name: /^Complete / })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Remove' })).toBeNull()
    expect(
      screen.queryByRole('button', { name: `Actions for ${title}` }),
    ).toBeNull()
    const search = screen.getByRole('searchbox', { name: 'Search reminders' })
    fireEvent.change(search, { target: { value: 'not-a-real-reminder' } })
    await screen.findByText('No reminders match these filters.')
    fireEvent.change(search, { target: { value: '' } })
    await screen.findByRole('heading', { name: title })
  })

  it('does not invent a horse when the stable is empty and discards interrupted local actions', async () => {
    await openSample(true)
    expect(screen.queryByText('Juniper')).toBeNull()
    fireEvent.click(
      screen.getByRole('button', { name: `Actions for ${title}` }),
    )
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Complete' }))
    fireEvent.change(screen.getByLabelText('Sample reminders'), {
      target: { value: 'empty' },
    })
    await screen.findByText('No outstanding reminders.')
    fireEvent.click(screen.getByRole('button', { name: 'All' }))
    await screen.findByText('No care reminders yet.')
    await new Promise((resolve) => setTimeout(resolve, 200))
    expect(
      screen.queryByText(
        'Sample completion applied locally. No live reminder was saved or removed.',
      ),
    ).toBeNull()
    expect(screen.queryByRole('heading', { name: title })).toBeNull()
    await waitFor(() => expect(useMutation).not.toHaveBeenCalled())
  })
})
