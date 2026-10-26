// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { Id } from 'convex/_generated/dataModel'
import { HorseSharingManager } from './HorseSharingManager'

const state = vi.hoisted(() => ({ shared: false, save: vi.fn() }))
vi.mock('convex/react', () => ({
  useMutation: () => state.save,
  useQuery: (_query: unknown, args: { occurrenceDate?: string }) =>
    args.occurrenceDate
      ? { shared: state.shared, stable: { name: 'Willow' } }
      : {
          stable: { name: 'Willow' },
          canManage: true,
          records: [
            {
              id: 'session',
              title: 'Schooling',
              recurring: true,
              shared: true,
              group: false,
            },
          ],
        },
}))
vi.mock('#/i18n/LocaleProvider', () => ({
  useLocale: () => ({ locale: 'en' }),
}))
afterEach(() => {
  cleanup()
  vi.resetAllMocks()
  state.shared = false
})
it('shows effective occurrence access, announces saves, and clears stale success when the date changes', async () => {
  state.save.mockImplementation(async () => {
    state.shared = true
  })
  render(<HorseSharingManager horseId={'horse' as Id<'horses'>} />)
  fireEvent.click(screen.getByText('Individual occurrence exception'))
  fireEvent.change(screen.getByLabelText('Occurrence date'), {
    target: { value: '2026-10-24' },
  })
  expect(
    screen.getByText('This occurrence is not shared with the stable.'),
  ).toBeDefined()
  fireEvent.click(screen.getByRole('button', { name: 'Share occurrence' }))
  await waitFor(() =>
    expect(screen.getByText('Sharing saved for 2026-10-24.')).toBeDefined(),
  )
  expect(screen.getByText('This occurrence is shared · Willow')).toBeDefined()
  fireEvent.change(screen.getByLabelText('Occurrence date'), {
    target: { value: '2026-10-25' },
  })
  expect(screen.queryByText('Sharing saved for 2026-10-24.')).toBeNull()
  state.save.mockRejectedValueOnce(new Error('offline'))
  fireEvent.click(
    screen.getByRole('button', { name: 'Stop sharing occurrence' }),
  )
  await waitFor(() =>
    expect(
      screen.getByText('Could not change access. Please retry.'),
    ).toBeDefined(),
  )
  expect(screen.queryByText('Sharing saved for 2026-10-25.')).toBeNull()
})
