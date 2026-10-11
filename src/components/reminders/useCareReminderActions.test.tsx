// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { getFunctionName } from 'convex/server'
import type { Doc } from 'convex/_generated/dataModel'
import { toast } from 'sonner'
import { Toaster } from '#/components/ui/sonner'
import { useCareReminderActions } from './useCareReminderActions'

const mutations = vi.hoisted(() => ({ complete: vi.fn(), reopen: vi.fn() }))
vi.mock('convex/react', () => ({
  useMutation: (reference: Parameters<typeof getFunctionName>[0]) =>
    getFunctionName(reference) === 'careReminders:reopen'
      ? mutations.reopen
      : mutations.complete,
}))
vi.mock('next-themes', () => ({ useTheme: () => ({ theme: 'light' }) }))
afterEach(() => {
  act(() => {
    toast.dismiss()
  })
  cleanup()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

it('acknowledges Undo, reports a failure honestly and retries only the restore', async () => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }))
  let reject!: (error: Error) => void
  mutations.complete.mockResolvedValue(undefined)
  mutations.reopen
    .mockImplementationOnce(
      () =>
        new Promise((_resolve, fail) => {
          reject = fail
        }),
    )
    .mockResolvedValueOnce(undefined)
  render(<Toaster />)
  const { result } = renderHook(useCareReminderActions)
  const reminder = {
    _id: 'reminder-1',
    title: 'Juniper’s hoof check',
  } as Doc<'careReminders'>
  await act(() => result.current.onComplete(reminder))
  const undo = await screen.findByRole('button', { name: 'Undo' })
  fireEvent.click(undo)
  fireEvent.click(undo)
  expect(mutations.reopen).toHaveBeenCalledExactlyOnceWith({ id: 'reminder-1' })
  expect(await screen.findByText('Restoring reminder…')).toBeTruthy()
  await act(async () => reject(new Error('offline')))
  expect(
    await screen.findByText('Could not restore this reminder'),
  ).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
  expect(await screen.findByText('Reminder reopened')).toBeTruthy()
  expect(mutations.reopen).toHaveBeenCalledTimes(2)
  expect(mutations.complete).toHaveBeenCalledTimes(1)
})
