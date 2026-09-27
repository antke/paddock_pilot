// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { WeightRecordForm } from './WeightRecordForm'
import { NutritionLogForm } from './NutritionLogForm'

afterEach(cleanup)
const horse = createDashboardLabFixtureData().horses[0]

describe('horse weight and nutrition forms', () => {
  it('names weight units, isolates IDs and focuses a described invalid measurement', async () => {
    render(
      <>
        <WeightRecordForm onSubmit={async () => {}} />
        <WeightRecordForm onSubmit={async () => {}} />
      </>,
    )
    const weights = screen.getAllByLabelText<HTMLInputElement>('Weight')
    expect(weights[0].id).not.toBe(weights[1].id)
    expect(screen.getAllByRole('group', { name: 'Weight unit' })).toHaveLength(
      2,
    )
    fireEvent.change(weights[0], { target: { value: '0' } })
    fireEvent.submit(weights[0].closest('form')!)
    await waitFor(() =>
      expect(weights[0].getAttribute('aria-invalid')).toBe('true'),
    )
    expect(document.activeElement).toBe(weights[0])
    expect(
      document.getElementById(weights[0].getAttribute('aria-describedby')!)
        ?.textContent,
    ).toContain('Weight must be greater than 0')
  })

  it('keeps raw multiline nutrition drafts and submits normalized arrays only after acknowledgement', async () => {
    let reject!: (reason: Error) => void
    const onSubmit = vi
      .fn()
      .mockReturnValueOnce(
        new Promise<void>((_, fail) => {
          reject = fail
        }),
      )
      .mockResolvedValueOnce(undefined)
    render(<NutritionLogForm horse={horse} onSubmit={onSubmit} />)
    const summary = screen.getByLabelText('Change summary')
    const recommended = screen.getByLabelText<HTMLTextAreaElement>(
      'Recommended after change',
    )
    const avoid =
      screen.getByLabelText<HTMLTextAreaElement>('Avoid after change')
    fireEvent.change(summary, { target: { value: 'Sample new snapshot' } })
    fireEvent.change(recommended, { target: { value: 'Hay\n' } })
    expect(recommended.value).toBe('Hay\n')
    fireEvent.change(recommended, {
      target: { value: 'Hay\n\n  Beet pulp  \n' },
    })
    fireEvent.change(avoid, { target: { value: '  Sample item  \n\n' } })
    const form = summary.closest('form')!
    fireEvent.submit(form)
    fireEvent.submit(form)
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        recommendedSnapshot: ['Hay', 'Beet pulp'],
        avoidSnapshot: ['Sample item'],
      }),
    )
    await act(async () => reject(new Error('offline')))
    expect(screen.getByRole('alert').textContent).toContain(
      'Your notes are still here',
    )
    expect(recommended.value).toBe('Hay\n\n  Beet pulp  \n')
    fireEvent.submit(form)
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2))
    await waitFor(() => expect((summary as HTMLInputElement).value).toBe(''))
    expect(
      screen.getByText(/does not change the horse’s current feeding plan/),
    ).toBeTruthy()
  })

  it('surfaces list-item validation at the textarea and focuses its registered ref', async () => {
    const onSubmit = vi.fn()
    render(<NutritionLogForm horse={horse} onSubmit={onSubmit} />)
    const summary = screen.getByLabelText('Change summary')
    fireEvent.change(summary, { target: { value: 'Sample history' } })
    const recommended = screen.getByLabelText('Recommended after change')
    fireEvent.change(recommended, { target: { value: 'x'.repeat(101) } })
    fireEvent.submit(summary.closest('form')!)
    await waitFor(() =>
      expect(recommended.getAttribute('aria-invalid')).toBe('true'),
    )
    expect(document.activeElement).toBe(recommended)
    expect(
      document.getElementById(recommended.getAttribute('aria-describedby')!)
        ?.textContent,
    ).toContain('List items cannot be longer than 100 characters')
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
