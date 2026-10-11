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
import type * as ReactRouter from '@tanstack/react-router'
import { LocaleProvider, GUEST_LOCALE_KEY } from '#/i18n/LocaleProvider'
import { StableHorseHistory, UnclaimedHorseForm } from './StableOwnershipTools'

const query = vi.hoisted(() => ({
  results: [] as Array<Record<string, unknown>>,
  status: 'CanLoadMore',
  loadMore: vi.fn(),
}))
const add = vi.hoisted(() => vi.fn())
vi.mock('convex/react', () => ({
  usePaginatedQuery: () => query,
  useMutation: () => add,
  useQuery: () => undefined,
}))
vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof ReactRouter>()),
  useNavigate: () => vi.fn(),
}))
const stableId = 'stable' as Id<'stables'>
const retainedAt = new Date(2026, 9, 6, 12).getTime()
const record = (
  id: string,
  horseId: string,
  horseName: string,
  kind: string,
  title: string,
) => ({
  _id: id,
  horseId,
  horseName,
  kind,
  createdAt: retainedAt,
  data: { title, date: '2026-10-02' },
})
beforeEach(() => {
  query.status = 'CanLoadMore'
  query.results = [
    record('a', 'maple', 'Maple', 'event', 'Farrier visit'),
    record('b', 'maple', 'Maple', 'horseWeightRecords', 'Autumn weight'),
    record('c', 'juniper', 'Juniper', 'event', 'Vet visit'),
  ]
})
afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.clearAllMocks()
})

it('filters loaded records by horse and kind while keeping pagination available', () => {
  const view = render(<StableHorseHistory stableId={stableId} />)
  fireEvent.change(screen.getByLabelText('Horse'), {
    target: { value: 'maple' },
  })
  fireEvent.change(screen.getByLabelText('Record type'), {
    target: { value: 'event' },
  })
  expect(
    screen.getByRole('heading', { name: 'Maple · Farrier visit' }),
  ).toBeTruthy()
  expect(
    screen.queryByRole('heading', { name: /Autumn weight|Vet visit/ }),
  ).toBeNull()
  expect(screen.getByText(/Filters apply to loaded records/)).toBeTruthy()

  fireEvent.click(screen.getByRole('button', { name: 'Load more' }))
  expect(query.loadMore).toHaveBeenCalledWith(50)
  query.results = [
    ...query.results,
    record('d', 'maple', 'Maple', 'event', 'Dental visit'),
  ]
  query.status = 'Exhausted'
  view.rerender(<StableHorseHistory stableId={stableId} />)
  expect(
    screen.getByRole('heading', { name: 'Maple · Dental visit' }),
  ).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Load more' })).toBeNull()

  fireEvent.change(screen.getByLabelText('Horse'), {
    target: { value: 'juniper' },
  })
  fireEvent.change(screen.getByLabelText('Record type'), {
    target: { value: 'horseWeightRecords' },
  })
  expect(
    screen.getByText('No loaded records match these filters.'),
  ).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
  expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4)
})

it.each([
  ['en', 'Retained on 6 Oct 2026', 'Appointment', '2 Oct 2026'],
  ['pl', 'Zachowano 6 paź 2026', 'Wizyta', '2 paź 2026'],
] as const)(
  'formats retained and source dates and record kinds using the %s app locale',
  (locale, retained, kind, sourceDate) => {
    localStorage.setItem(GUEST_LOCALE_KEY, locale)
    query.results = [query.results[0]]
    render(
      <LocaleProvider initialLocale={locale}>
        <StableHorseHistory stableId={stableId} />
      </LocaleProvider>,
    )
    expect(screen.getByText(retained)).toBeTruthy()
    expect(screen.getByText(kind, { selector: 'span' })).toBeTruthy()
    expect(screen.getByText(sourceDate)).toBeTruthy()
  },
)

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
