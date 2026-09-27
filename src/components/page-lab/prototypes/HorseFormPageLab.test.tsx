// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { HorseFormPageLab } from './HorseFormPageLab'

vi.mock('convex/react', () => ({
  useMutation: () => {
    throw new Error('Horse form specimens cannot mount live mutations')
  },
  useQuery: () => {
    throw new Error('Horse form specimens cannot mount live queries')
  },
}))
const data = createDashboardLabFixtureData()
beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})
async function advance(ms = 700) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}
async function submit() {
  await act(async () => {
    fireEvent.submit(screen.getByLabelText('Horse name').closest('form')!)
  })
}
function fillCreate() {
  fireEvent.change(screen.getByLabelText('Horse name'), {
    target: { value: 'Sample Rowan' },
  })
  fireEvent.change(screen.getByLabelText('Owner name'), {
    target: { value: 'Sample rider' },
  })
  fireEvent.change(screen.getByLabelText('Or current age'), {
    target: { value: '8' },
  })
}
function outcome(value: string) {
  fireEvent.change(screen.getByLabelText('Next sample result'), {
    target: { value },
  })
}

describe('actual horse form local specimen', () => {
  it('validates create, retains a failed save, and retries only opening after local acknowledgement', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch')
    render(<HorseFormPageLab data={{ ...data, horses: [] }} />)
    await submit()
    expect(
      screen.getByLabelText('Horse name').getAttribute('aria-invalid'),
    ).toBe('true')
    expect(screen.queryByText(/Sample save pending/)).toBeNull()
    fillCreate()
    outcome('save')
    await submit()
    expect(
      screen
        .getByRole('button', { name: 'Saving horse…' })
        .getAttribute('aria-busy'),
    ).toBe('true')
    await advance()
    expect(screen.getByRole('alert').textContent).toContain(
      'Could not save this horse',
    )
    expect(screen.getByLabelText<HTMLInputElement>('Horse name').value).toBe(
      'Sample Rowan',
    )
    outcome('open')
    await submit()
    await advance()
    expect(
      screen.getByRole('button', { name: 'Opening profile…' }),
    ).toBeTruthy()
    expect(screen.getByLabelText<HTMLInputElement>('Horse name').disabled).toBe(
      true,
    )
    await advance()
    expect(screen.getByRole('alert').textContent).toContain(
      'Your horse was saved',
    )
    expect(
      screen.getByText('Sample horse saved locally. No live record changed.'),
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Open horse profile' }))
    expect(screen.queryByText(/Sample save pending/)).toBeNull()
    expect(screen.getByText(/Sample open pending/)).toBeTruthy()
    await advance()
    expect(
      screen.getByText(
        'Sample profile opened locally. No live route was followed.',
      ),
    ).toBeTruthy()
    expect(fetch).not.toHaveBeenCalled()
  })
  it('keeps the profile disabled after delete acknowledgement while continuation fails and retries', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch')
    render(<HorseFormPageLab data={data} />)
    outcome('return')
    fireEvent.click(
      screen.getByRole('button', { name: 'Move to deleted horses' }),
    )
    const dialog = screen.getByRole('alertdialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Move horse' }))
    expect(screen.getByLabelText<HTMLInputElement>('Horse name').disabled).toBe(
      true,
    )
    await advance()
    expect(
      within(dialog).getByRole('button', { name: 'Continuing…' }),
    ).toBeTruthy()
    await advance()
    expect(within(dialog).getByRole('alert').textContent).toContain(
      'was moved to deleted horses',
    )
    expect(screen.getByLabelText<HTMLInputElement>('Horse name').disabled).toBe(
      true,
    )
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }))
    await advance(200)
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(screen.getByLabelText<HTMLInputElement>('Horse name').disabled).toBe(
      true,
    )
    expect(
      screen
        .getByRole('button', { name: 'Save changes' })
        .hasAttribute('disabled'),
    ).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Retry continuing' }))
    expect(screen.queryByText(/Sample delete pending/)).toBeNull()
    expect(screen.getByText(/Sample return pending/)).toBeTruthy()
    await advance()
    expect(
      screen.getByText(
        'The sample returned to the horse list. No live horse was deleted.',
      ),
    ).toBeTruthy()
    expect(screen.queryByLabelText('Horse name')).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })
  it('cancels outstanding work when restarting or switching form mode without late updates', async () => {
    render(<HorseFormPageLab data={data} />)
    fireEvent.change(screen.getByLabelText('Sample form'), {
      target: { value: 'create' },
    })
    fillCreate()
    await submit()
    expect(screen.getByText(/Sample save pending/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Restart sample' }))
    await advance(2000)
    expect(screen.getByLabelText<HTMLInputElement>('Horse name').value).toBe('')
    expect(screen.getByLabelText<HTMLInputElement>('Horse name').disabled).toBe(
      false,
    )
    expect(screen.queryByText(/Sample profile opened/)).toBeNull()
    fillCreate()
    await submit()
    fireEvent.change(screen.getByLabelText('Sample form'), {
      target: { value: 'edit' },
    })
    await advance(2000)
    expect(screen.getByLabelText<HTMLInputElement>('Horse name').value).toBe(
      data.horses[0].name,
    )
    expect(screen.queryByText(/Sample profile opened/)).toBeNull()
    expect(
      screen
        .getByRole('button', { name: 'Move to deleted horses' })
        .hasAttribute('disabled'),
    ).toBe(false)
  })
})
