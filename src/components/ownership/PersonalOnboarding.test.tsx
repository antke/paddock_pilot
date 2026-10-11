// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { ComponentProps } from 'react'
import type * as ReactRouter from '@tanstack/react-router'
import type * as ProfileModule from '#/components/onboarding/AccountProfileForm'
import { PersonalOnboarding } from './PersonalOnboarding'
import type { AccountProfileFormView } from '#/components/onboarding/AccountProfileForm'

const state = vi.hoisted(() => ({
  navigate: vi.fn(),
  save: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('convex/react', () => ({
  useQuery: () => ({ displayName: 'Original rider', phone: '123' }),
  useMutation: () => vi.fn(),
}))
vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof ReactRouter>()),
  useNavigate: () => state.navigate,
}))
vi.mock('#/components/onboarding/OnboardingPage', () => ({
  OnboardingPage: () => <p>Stable setup form</p>,
}))
vi.mock(
  '#/components/onboarding/AccountProfileForm',
  async (importOriginal) => {
    const original = await importOriginal<typeof ProfileModule>()
    return {
      ...original,
      AccountProfileForm: (
        props: Omit<ComponentProps<typeof AccountProfileFormView>, 'onSave'>,
      ) => <original.AccountProfileFormView {...props} onSave={state.save} />,
    }
  },
)
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
it('keeps a typed profile draft when going back and switching between personal and stable setup', async () => {
  render(<PersonalOnboarding />)
  fireEvent.click(screen.getByRole('button', { name: 'Manage my horses' }))
  fireEvent.change(screen.getByLabelText('Preferred name'), {
    target: { value: 'Changed rider' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Back to start options' }))
  fireEvent.click(screen.getByRole('button', { name: 'Set up a stable' }))
  expect(screen.getByLabelText<HTMLInputElement>('Preferred name').value).toBe(
    'Changed rider',
  )
  expect(
    screen.getByRole('button', { name: 'Save profile and set up a stable' }),
  ).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Back to start options' }))
  fireEvent.click(screen.getByRole('button', { name: 'Manage my horses' }))
  fireEvent.submit(screen.getByLabelText('Preferred name').closest('form')!)
  await waitFor(() =>
    expect(state.navigate).toHaveBeenCalledWith({ to: '/horses/create' }),
  )
  expect(state.save).toHaveBeenCalledWith(
    expect.objectContaining({ preferredName: 'Changed rider' }),
  )
})
it('lets the stable choice return to start options after saving the account profile', async () => {
  render(<PersonalOnboarding />)
  fireEvent.click(screen.getByRole('button', { name: 'Set up a stable' }))
  fireEvent.submit(screen.getByLabelText('Preferred name').closest('form')!)
  expect(await screen.findByText('Stable setup form')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Back to start options' }))
  expect(screen.getByRole('button', { name: 'Manage my horses' })).toBeTruthy()
  expect(screen.queryByText('Stable setup form')).toBeNull()
})
