// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import type { ComponentProps, ReactNode } from 'react'
import { PersonalContactsView } from './PersonalContacts'

afterEach(cleanup)
async function mount(view: ReactNode) {
  const router = createRouter({
    routeTree: createRootRoute({ component: () => view }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
}
const providers = [
  {
    _id: 'vet',
    _creationTime: 0,
    userId: 'owner',
    createdAt: 0,
    name: 'Dr Green',
    phone: '+48 123 456',
    type: 'vet',
  },
] as ComponentProps<typeof PersonalContactsView>['providers']
it('edits the selected contact, retains failed values, and restores focus after successful retry', async () => {
  const save = vi
    .fn()
    .mockRejectedValueOnce(new Error('Temporary failure'))
    .mockResolvedValue(undefined)
  await mount(
    <PersonalContactsView providers={providers} save={save} remove={vi.fn()} />,
  )
  expect(
    screen.getByRole('link', { name: '+48 123 456' }).getAttribute('href'),
  ).toBe('tel:+48123456')
  fireEvent.click(screen.getByRole('button', { name: 'Edit contact' }))
  const form = screen.getByRole('form', { name: 'Edit contact' })
  const phone = within(form).getByLabelText<HTMLInputElement>(
    'Phone number (optional)',
  )
  fireEvent.change(phone, { target: { value: '+48 999 888' } })
  fireEvent.submit(form)
  expect(await screen.findByRole('alert')).toBeTruthy()
  expect(phone.value).toBe('+48 999 888')
  expect(save).toHaveBeenLastCalledWith({
    id: 'vet',
    name: 'Dr Green',
    phone: '+48 999 888',
    type: 'vet',
  })
  fireEvent.submit(form)
  expect(await screen.findByText('Contact updated.')).toBeTruthy()
  expect(document.activeElement).toBe(
    screen.getByRole('button', { name: 'Edit contact' }),
  )
})
it('requires an explicit confirmation before deleting and retains retry inside the dialog on failure', async () => {
  const remove = vi
    .fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValue(undefined)
  await mount(
    <PersonalContactsView
      providers={providers}
      save={vi.fn()}
      remove={remove}
    />,
  )
  fireEvent.click(
    screen.getByRole('button', { name: 'Delete contact: Dr Green' }),
  )
  const dialog = await screen.findByRole('alertdialog')
  expect(remove).not.toHaveBeenCalled()
  expect(within(dialog).getByText(/cannot be undone/)).toBeTruthy()
  fireEvent.click(
    within(dialog).getByRole('button', { name: 'Delete contact' }),
  )
  expect(await within(dialog).findByRole('alert')).toBeTruthy()
  fireEvent.click(
    within(dialog).getByRole('button', { name: 'Delete contact' }),
  )
  expect(await screen.findByText('Contact deleted.')).toBeTruthy()
  expect(remove).toHaveBeenCalledTimes(2)
})
it('prevents duplicate saves and clears a new draft only after acknowledgement', async () => {
  let resolve!: () => void
  const save = vi.fn(
    () =>
      new Promise<void>((yes) => {
        resolve = yes
      }),
  )
  await mount(
    <PersonalContactsView providers={[]} save={save} remove={vi.fn()} />,
  )
  const form = screen.getByRole('form', { name: 'Add a care contact' })
  const name = within(form).getByLabelText<HTMLInputElement>('Provider name')
  fireEvent.change(name, { target: { value: 'New vet' } })
  fireEvent.submit(form)
  fireEvent.submit(form)
  expect(save).toHaveBeenCalledTimes(1)
  expect(name.value).toBe('New vet')
  await act(async () => resolve())
  expect(name.value).toBe('')
  expect(screen.getByRole('status').textContent).toBe('Contact saved.')
})
