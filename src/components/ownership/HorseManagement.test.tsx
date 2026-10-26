// @vitest-environment jsdom
import {
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
import type { ReactNode } from 'react'
import type { ManagementProps } from './HorseManagement'
import { HorseManagementView, DepartureReviewView } from './HorseManagement'
import type { Id } from 'convex/_generated/dataModel'

afterEach(cleanup)
async function mount(view: ReactNode) {
  const router = createRouter({
    routeTree: createRootRoute({ component: () => view }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
}
const horseId = 'horse' as Id<'horses'>
const stableId = 'willow' as Id<'stables'>
const targetId = 'meadow' as Id<'stables'>
const ownerId = 'owner' as Id<'users'>
function fixture(): ManagementProps {
  return {
    horseId,
    data: {
      horseName: 'Juniper',
      ownerName: 'Taylor Evans',
      stableAdminName: 'Robin Brooks',
      access: {
        userId: ownerId,
        stable: { _id: stableId, name: 'Willow Stables' },
        isOwner: true,
        isAdmin: false,
        isCustodian: false,
        carerRole: undefined,
        role: 'member',
        canRead: true,
        canEditProfile: true,
        canAddRecords: true,
        canEditPersonalRecords: true,
        canManageAccess: true,
        canMove: true,
        canTransfer: true,
        canDelete: true,
      },
      placements: [],
      carers: [],
      invitations: [],
      audit: [],
    },
    stables: [
      { _id: stableId, name: 'Willow Stables' },
      { _id: targetId, name: 'Meadowbrook' },
    ],
    invite: vi.fn().mockResolvedValue(undefined),
    updateCarer: vi.fn(),
    revoke: vi.fn(),
    connect: vi.fn(),
    archive: vi.fn(),
  }
}
it('names account ownership and stable access, and separates ownership transfer from carers', async () => {
  await mount(<HorseManagementView {...fixture()} />)
  expect(screen.getByText('Taylor Evans')).toBeTruthy()
  expect(screen.getByText('Willow Stables · Robin Brooks')).toBeTruthy()
  expect(
    screen.getByText(/Stable access ends when the horse leaves/),
  ).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Send invitation' })).toBeTruthy()
  expect(
    screen.getByRole('button', { name: 'Send ownership transfer invitation' }),
  ).toBeTruthy()
  expect(screen.queryByLabelText('Horse invitation')).toBeNull()
})
it('retains invitation input after an actionable error and reports success beside its form', async () => {
  const props = fixture()
  props.invite = vi
    .fn()
    .mockRejectedValueOnce({
      data: 'Enter another person’s valid email address',
    })
    .mockResolvedValue(undefined)
  await mount(<HorseManagementView {...props} />)
  const email = screen.getAllByLabelText<HTMLInputElement>('Email address')[0]
  fireEvent.change(email, { target: { value: 'friend@example.com' } })
  fireEvent.click(screen.getByRole('button', { name: 'Send invitation' }))
  expect(await screen.findByRole('alert')).toHaveProperty(
    'textContent',
    'Enter the other person’s email address. You cannot invite your own account.',
  )
  expect(email.value).toBe('friend@example.com')
  fireEvent.click(screen.getByRole('button', { name: 'Send invitation' }))
  expect(
    await screen.findByText(
      'Invitation sent to friend@example.com. Access changes after they accept.',
    ),
  ).toBeTruthy()
  expect(email.value).toBe('')
})
it('requires a horse-specific deletion confirmation and Cancel leaves the horse untouched', async () => {
  const props = fixture()
  await mount(<HorseManagementView {...props} />)
  fireEvent.click(screen.getByRole('button', { name: 'Delete horse' }))
  const dialog = await screen.findByRole('alertdialog')
  expect(within(dialog).getByText('Delete Juniper?')).toBeTruthy()
  expect(within(dialog).getByText(/14 days.*permanently removed/)).toBeTruthy()
  expect(props.archive).not.toHaveBeenCalled()
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
  expect(props.archive).not.toHaveBeenCalled()
})
it('makes source, destination, access consequences and task choices explicit before moving', async () => {
  const props = fixture()
  const submit = vi.fn().mockResolvedValue(undefined)
  props.renderDeparture = (context) => (
    <DepartureReviewView
      {...context}
      submit={submit}
      preview={{
        revision: 'v1',
        events: [],
        reminders: [
          { _id: 'task' as Id<'careReminders'>, title: 'Dental check' },
        ],
      }}
    />
  )
  await mount(<HorseManagementView {...props} />)
  fireEvent.change(screen.getByLabelText('Where will this horse live?'), {
    target: { value: targetId },
  })
  const review = screen.getByRole('button', { name: 'Review this move' })
  expect(review.getAttribute('aria-expanded')).toBe('false')
  fireEvent.click(review)
  expect(review.getAttribute('aria-expanded')).toBe('true')
  expect(screen.getByText('Move Juniper')).toBeTruthy()
  expect(screen.getByText(/Unchecked tasks are dismissed/)).toBeTruthy()
  expect(
    screen.getByText(/You choose which existing records to share/),
  ).toBeTruthy()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Dental check' }))
  fireEvent.click(screen.getByRole('button', { name: 'Move to Meadowbrook' }))
  await screen.findByText(/The move to Meadowbrook has started/)
  expect(submit).toHaveBeenCalledWith('v1', ['task'])
  expect(document.activeElement).toBe(review)
})
it('keeps task selection and offers a fresh review after a stale plan error', async () => {
  const submit = vi
    .fn()
    .mockRejectedValue({ data: 'Care plans changed. Review departure again.' })
  render(
    <DepartureReviewView
      horseName="Juniper"
      sourceStableName="Willow"
      targetStableName="Meadowbrook"
      preview={{
        revision: 'v1',
        events: [],
        reminders: [
          { _id: 'task' as Id<'careReminders'>, title: 'Dental check' },
        ],
      }}
      submit={submit}
      onCancel={vi.fn()}
      onDone={vi.fn()}
    />,
  )
  const checkbox = screen.getByRole('checkbox', { name: 'Dental check' })
  fireEvent.click(checkbox)
  fireEvent.click(screen.getByRole('button', { name: 'Move to Meadowbrook' }))
  await screen.findByText(/The care plan changed while you were reviewing it/)
  expect(checkbox.getAttribute('aria-checked')).toBe('true')
})
