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
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { StableFormPageLab } from './StableFormPageLab'

const access = vi.hoisted(() => ({ enabled: true }))
vi.mock('#/lib/devAuthBypass', () => ({
  useDevAuthBypassEnabled: () => access.enabled,
}))
vi.mock('convex/react', () => ({
  useMutation: () => {
    throw new Error('Live mutation used by sample')
  },
  useQuery: () => {
    throw new Error('Live query used by sample')
  },
}))
afterEach(() => {
  cleanup()
  access.enabled = true
})

function nameInput() {
  return screen.getByLabelText<HTMLInputElement>('Stable name', { exact: true })
}
function submit() {
  fireEvent.submit(nameInput().closest('form')!)
}

describe('stable form sample validation and outcomes', () => {
  it('uses the production create/edit labels, section hierarchy and dirty discard policy', async () => {
    const data = createDashboardLabFixtureData()
    render(<StableFormPageLab data={data} />)
    expect(
      screen.getByRole('heading', { name: 'Edit stable', level: 1 }),
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: 'Stable details', level: 2 }),
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: 'Stable basics', level: 3 }),
    ).toBeTruthy()
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Update stable' })
        .disabled,
    ).toBe(true)
    fireEvent.change(nameInput(), { target: { value: 'Temporary sample' } })
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }))
    const dialog = await screen.findByRole('alertdialog')
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Discard changes' }),
    )
    await waitFor(() => expect(nameInput().value).toBe(data.stable.name))
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Update stable' })
        .disabled,
    ).toBe(true)
    fireEvent.change(screen.getByLabelText('Sample form'), {
      target: { value: 'create' },
    })
    expect(
      screen.getByRole('heading', { name: 'Create stable', level: 1 }),
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: 'Stable basics', level: 2 }),
    ).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Stable details' })).toBeNull()
    expect(nameInput().value).toBe('')
    fireEvent.change(nameInput(), { target: { value: 'Uncreated sample' } })
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    const reset = await screen.findByRole('alertdialog')
    fireEvent.click(
      within(reset).getByRole('button', { name: 'Reset changes' }),
    )
    await waitFor(() => expect(nameInput().value).toBe(''))
  })

  it('shows linked required-field errors in the empty create form', async () => {
    render(<StableFormPageLab data={createDashboardLabFixtureData()} />)
    fireEvent.change(screen.getByLabelText('Sample form'), {
      target: { value: 'create' },
    })
    submit()
    await waitFor(() =>
      expect(nameInput().getAttribute('aria-invalid')).toBe('true'),
    )
    for (const label of ['Stable name', 'Location']) {
      const input = screen.getByLabelText(label, { exact: true })
      expect(input.getAttribute('aria-required')).toBe('true')
      expect(
        document.getElementById(input.getAttribute('aria-describedby')!)
          ?.textContent?.length,
      ).toBeGreaterThan(0)
    }
    expect(document.activeElement).toBe(nameInput())
  })

  it('retains edits after failure, allows retry, and reports success only after completion', async () => {
    render(<StableFormPageLab data={createDashboardLabFixtureData()} />)
    fireEvent.change(nameInput(), { target: { value: 'Stajnia Łąka' } })
    fireEvent.change(screen.getByLabelText('Next sample result'), {
      target: { value: 'failure' },
    })
    submit()
    await waitFor(() => expect(nameInput().disabled).toBe(true))
    expect(nameInput().disabled).toBe(true)
    expect(screen.queryByText('Sample continuation complete')).toBeNull()
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain(
        'Could not save this stable',
      ),
    )
    expect(nameInput().value).toBe('Stajnia Łąka')
    expect(nameInput().disabled).toBe(false)
    submit()
    await screen.findByText('Sample continuation complete')
    fireEvent.click(screen.getByRole('button', { name: 'Restart sample' }))
    expect(nameInput().value).toBe(createDashboardLabFixtureData().stable.name)
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Update stable' })
        .disabled,
    ).toBe(true)
  })

  it('does not apply an interrupted edit request to a newly opened create sample', async () => {
    render(<StableFormPageLab data={createDashboardLabFixtureData()} />)
    fireEvent.change(nameInput(), { target: { value: 'Interrupted stable' } })
    submit()
    await waitFor(() => expect(nameInput().disabled).toBe(true))
    fireEvent.change(screen.getByLabelText('Sample form'), {
      target: { value: 'create' },
    })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200))
    })
    expect(nameInput().value).toBe('')
    expect(screen.queryByRole('status')).toBeNull()
  })
  it('retries local continuation without consuming another save outcome', async () => {
    render(<StableFormPageLab data={createDashboardLabFixtureData()} />)
    fireEvent.change(screen.getByLabelText('Sample form'), {
      target: { value: 'create' },
    })
    fireEvent.change(nameInput(), { target: { value: 'Created once' } })
    fireEvent.change(screen.getByLabelText('Location', { exact: true }), {
      target: { value: 'Łódź' },
    })
    fireEvent.change(screen.getByLabelText('Next sample result'), {
      target: { value: 'continuation-failure' },
    })
    submit()
    await screen.findByText(/Your stable was created, but setup could not open/)
    expect(nameInput().disabled).toBe(true)
    fireEvent.change(screen.getByLabelText('Next sample result'), {
      target: { value: 'failure' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Continue to setup' }))
    await screen.findByText('Sample continuation complete')
    expect(
      screen.getByLabelText<HTMLSelectElement>('Next sample result').value,
    ).toBe('failure')
  })

  it('does not mount a simulation outside development sample access', () => {
    access.enabled = false
    render(<StableFormPageLab data={createDashboardLabFixtureData()} />)
    expect(
      screen.getByText('Stable form samples require development sample data.'),
    ).toBeTruthy()
    expect(screen.queryByLabelText('Stable name', { exact: true })).toBeNull()
  })
})
