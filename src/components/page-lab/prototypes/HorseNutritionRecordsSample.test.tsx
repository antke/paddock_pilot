// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Id } from 'convex/_generated/dataModel'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { HorseNutritionCard } from '#/components/horses/HorseNutritionCard'
import {
  WeightRecordsSample,
  NutritionLogsSample,
} from './HorseNutritionRecordsSample'

vi.mock('#/lib/devAuthBypass', () => ({ useDevAuthBypassEnabled: () => true }))
afterEach(cleanup)
const horse = {
  ...createDashboardLabFixtureData().horses[0],
  feedingRoutine: 'Current baseline feeding plan',
}
function WeightHost() {
  const [action, setAction] = useState<ReactNode>(null)
  return (
    <>
      {action}
      <WeightRecordsSample horse={horse} onCreateActionChange={setAction} />
    </>
  )
}
function quick() {
  fireEvent.change(screen.getByLabelText('Sample response time'), {
    target: { value: '100' },
  })
}

describe('actual weight and nutrition sample views', () => {
  it('updates the real latest-weight summary when a second measurement shares the fixture date', async () => {
    render(<WeightHost />)
    quick()
    expect(
      screen.getByText('Latest record').parentElement?.textContent,
    ).toContain('500 kg')
    fireEvent.click(screen.getAllByRole('button', { name: 'Add weight' })[0])
    const input = await screen.findByLabelText('Weight')
    fireEvent.change(input, { target: { value: '512' } })
    fireEvent.change(screen.getByLabelText('Measured date'), {
      target: { value: '2026-09-18' },
    })
    fireEvent.submit(input.closest('form')!)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(
      screen.getByText('Latest record').parentElement?.textContent,
    ).toContain('512 kg')
    expect(screen.getAllByRole('heading', { level: 3 })[0].textContent).toBe(
      '512 kg',
    )
  })

  it('supports a stable header action, delayed weight failure/retry, and focus after last record removal', async () => {
    render(<WeightHost />)
    quick()
    fireEvent.click(screen.getByRole('button', { name: 'Show empty sample' }))
    fireEvent.change(screen.getByLabelText('Next sample request'), {
      target: { value: 'failure' },
    })
    fireEvent.click(screen.getAllByRole('button', { name: 'Add weight' })[0])
    const input = await screen.findByLabelText<HTMLInputElement>('Weight')
    fireEvent.change(input, { target: { value: '512' } })
    fireEvent.submit(input.closest('form')!)
    await waitFor(() =>
      expect(
        screen
          .getByRole('button', { name: 'Adding...' })
          .hasAttribute('disabled'),
      ).toBe(true),
    )
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
    await screen.findByText(
      'Could not add this weight record. Your measurement is still here. Please try again.',
    )
    expect(input.value).toBe('512')
    fireEvent.submit(input.closest('form')!)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    const record = within(
      screen
        .getByRole('heading', { name: '512 kg' })
        .closest('[data-slot="dashboard-item-card"]') as HTMLElement,
    )
    expect(screen.getByText('Latest record')).toBeTruthy()
    fireEvent.click(record.getByRole('button', { name: 'Remove' }))
    fireEvent.click(
      await screen.findByRole('button', { name: 'Remove record' }),
    )
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    expect(
      screen.getByText('No weight records have been added for this horse yet.'),
    ).toBeTruthy()
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('group', { name: 'Weight records' }),
      ),
    )
  })

  it('adds a multiline history snapshot without changing the current plan and supports viewer/long-history states', async () => {
    render(
      <>
        <HorseNutritionCard horse={horse} />
        <NutritionLogsSample horse={horse} />
      </>,
    )
    quick()
    fireEvent.click(screen.getByRole('button', { name: 'Show empty sample' }))
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Add nutrition log' })[0],
    )
    const summary = await screen.findByLabelText('Change summary')
    fireEvent.change(summary, { target: { value: 'Sample historical entry' } })
    fireEvent.change(screen.getByLabelText('Feeding routine snapshot'), {
      target: { value: 'A different historical routine' },
    })
    fireEvent.change(screen.getByLabelText('Recommended after change'), {
      target: { value: 'First sample item\n\nSecond sample item\n' },
    })
    fireEvent.submit(summary.closest('form')!)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(screen.getByText('Current baseline feeding plan')).toBeTruthy()
    expect(screen.getByText('A different historical routine')).toBeTruthy()
    expect(screen.getByText('First sample item')).toBeTruthy()
    expect(screen.getByText('Second sample item')).toBeTruthy()
    expect(horse.feedingRoutine).toBe('Current baseline feeding plan')
    fireEvent.click(screen.getByRole('button', { name: 'Show long history' }))
    expect(screen.getAllByRole('button', { name: 'Remove' })).toHaveLength(12)
    fireEvent.change(screen.getByLabelText('Sample permissions'), {
      target: { value: 'viewer' },
    })
    expect(screen.queryByRole('button', { name: 'Remove' })).toBeNull()
    expect(
      screen.queryByRole('button', { name: 'Add nutrition log' }),
    ).toBeNull()
  })

  it('drops a late pending snapshot when the sample horse changes', async () => {
    const { rerender } = render(<NutritionLogsSample horse={horse} />)
    quick()
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Add nutrition log' })[0],
    )
    const summary = await screen.findByLabelText('Change summary')
    fireEvent.change(summary, { target: { value: 'Old horse late entry' } })
    fireEvent.submit(summary.closest('form')!)
    await screen.findByRole('button', { name: 'Adding...' })
    rerender(
      <NutritionLogsSample
        horse={{ ...horse, _id: 'sample-other-horse' as Id<'horses'> }}
      />,
    )
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150))
    })
    expect(screen.queryByText('Old horse late entry')).toBeNull()
    expect(screen.getByText('Sample autumn feeding review')).toBeTruthy()
  })
})
