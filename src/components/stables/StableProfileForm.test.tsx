// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { StableProfileForm } from './StableProfileForm'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'

vi.mock('convex/react', () => ({
  useMutation: () => {
    throw new Error('Live mutation in form view')
  },
  useQuery: () => {
    throw new Error('Live query in form view')
  },
}))
afterEach(cleanup)
const stable = createDashboardLabFixtureData().stable
it('preserves edit headings, dirty gating and discard-to-opened-record behavior', async () => {
  const save = vi.fn().mockResolvedValue(stable._id)
  render(
    <StableProfileForm
      mode="edit"
      initialValues={stable}
      save={save}
      onSaved={() => {}}
    />,
  )
  expect(
    screen.getByRole('heading', { name: 'Edit stable', level: 1 }),
  ).toBeTruthy()
  expect(
    screen.getByRole('heading', { name: 'Stable details', level: 2 }),
  ).toBeTruthy()
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'Update stable' })
      .disabled,
  ).toBe(true)
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'Discard changes' })
      .disabled,
  ).toBe(true)
  const name = screen.getByLabelText<HTMLInputElement>('Stable name', {
    exact: true,
  })
  fireEvent.submit(name.closest('form')!)
  expect(save).not.toHaveBeenCalled()
  fireEvent.change(name, { target: { value: 'Changed sample name' } })
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }))
  const dialog = await screen.findByRole('alertdialog')
  fireEvent.click(
    within(dialog).getByRole('button', { name: 'Discard changes' }),
  )
  await waitFor(() => expect(name.value).toBe(stable.name))
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'Update stable' })
      .disabled,
  ).toBe(true)
})
it('keeps acknowledgement and fields locked when opening fails, without another creation', async () => {
  const save = vi.fn().mockResolvedValue(stable._id)
  const onSaved = vi
    .fn()
    .mockRejectedValueOnce(new Error('open failed'))
    .mockResolvedValue(undefined)
  render(<StableProfileForm mode="create" save={save} onSaved={onSaved} />)
  fireEvent.change(screen.getByLabelText('Stable name', { exact: true }), {
    target: { value: 'New stable' },
  })
  fireEvent.change(screen.getByLabelText('Location', { exact: true }), {
    target: { value: 'Łódź' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Create stable' }))
  const error = await screen.findByRole('alert')
  expect(error.textContent).toContain(
    'Your stable was created, but setup could not open',
  )
  expect(document.activeElement).toBe(error)
  expect(
    screen.getByLabelText<HTMLInputElement>('Stable name', { exact: true })
      .disabled,
  ).toBe(true)
  fireEvent.click(screen.getByRole('button', { name: 'Continue to setup' }))
  await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(2))
  expect(save).toHaveBeenCalledTimes(1)
})
