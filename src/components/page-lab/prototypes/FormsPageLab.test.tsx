// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { FormsPageLab } from './FormsPageLab'

const fixtureAccess = vi.hoisted(() => ({ enabled: true }))
vi.mock('#/lib/devAuthBypass', () => ({
  useDevAuthBypassEnabled: () => fixtureAccess.enabled,
}))

afterEach(() => {
  cleanup()
  fixtureAccess.enabled = true
})

describe('FormsPageLab', () => {
  it('uses the production editor to validate, save locally and lock acknowledged values', async () => {
    render(<FormsPageLab data={createDashboardLabFixtureData()} />)
    const title = screen.getByLabelText<HTMLInputElement>('Title', {
      exact: true,
    })
    const form = title.closest('form')!
    fireEvent.change(title, { target: { value: '' } })
    fireEvent.submit(form)
    await waitFor(() => expect(title.getAttribute('aria-invalid')).toBe('true'))
    fireEvent.change(title, {
      target: { value: 'Sample autumn farrier visit' },
    })
    fireEvent.submit(form)
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain(
        'Sample changes applied locally',
      ),
    )
    expect(title.disabled).toBe(true)
    expect(screen.queryByRole('button', { name: 'Reset' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Restart sample' }))
    expect(
      screen.getByLabelText<HTMLInputElement>('Title', { exact: true }).value,
    ).toBe('Summer shoeing visit')
  })
  it('switches to an empty sample stable without retaining the previous horse', async () => {
    const populated = createDashboardLabFixtureData()
    const empty = createDashboardLabFixtureData(populated.stables[1]._id)
    const { rerender } = render(<FormsPageLab data={populated} />)
    fireEvent.change(screen.getByLabelText('Title', { exact: true }), {
      target: { value: 'Previous stable event' },
    })
    rerender(<FormsPageLab data={empty} />)
    const title = screen.getByLabelText<HTMLInputElement>('Title', {
      exact: true,
    })
    expect(title.value).toBe('Summer shoeing visit')
    fireEvent.submit(title.closest('form')!)
    await waitFor(() =>
      expect(screen.getByRole('group', { name: 'Horses' })).toBeTruthy(),
    )
    expect(screen.getByText(/No horses are available/)).toBeTruthy()
    expect(screen.queryByRole('status')).toBeNull()
  })
  it('fills provider contact details when selecting a saved provider with the keyboard', async () => {
    render(<FormsPageLab data={createDashboardLabFixtureData()} />)
    fireEvent.click(screen.getByRole('button', { name: /Place & provider/ }))
    const name = screen.getByLabelText<HTMLInputElement>('Provider', {
      exact: true,
    })
    const phone = screen.getByLabelText<HTMLInputElement>('Provider phone', {
      exact: true,
    })
    fireEvent.change(phone, { target: { value: '' } })
    name.focus()
    fireEvent.change(name, { target: { value: 'Halley' } })
    fireEvent.click(
      screen.getByRole('button', { name: 'Show saved providers' }),
    )
    await waitFor(() =>
      expect(
        screen.getByRole('option', { name: /Dr. Halley Morse/ }),
      ).toBeTruthy(),
    )
    fireEvent.keyDown(name, { key: 'ArrowDown' })
    fireEvent.keyDown(name, { key: 'Enter' })
    await waitFor(() => expect(phone.value).toBe('(555) 014-3300'))
    expect(name.value).toBe('Dr. Halley Morse')
  })
  it('uses empty production create defaults and offers acknowledged-open recovery locally', async () => {
    render(<FormsPageLab data={createDashboardLabFixtureData()} />)
    fireEvent.change(screen.getByLabelText('Sample form'), {
      target: { value: 'create' },
    })
    expect(screen.getByRole('button', { name: 'Create event' })).toBeTruthy()
    expect(
      screen.getByLabelText<HTMLInputElement>('Title', { exact: true }).value,
    ).toBe('')
    fireEvent.change(screen.getByLabelText('Sample form'), {
      target: { value: 'edit' },
    })
    fireEvent.change(screen.getByLabelText('Next sample result'), {
      target: { value: 'open' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Update event' }))
    await screen.findByText(/Event saved, but its page could not be opened/)
    fireEvent.click(screen.getByRole('button', { name: 'Open event' }))
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain(
        'Opening was simulated',
      ),
    )
  })
  it('keeps save failure editable and permits a successful local retry', async () => {
    render(<FormsPageLab data={createDashboardLabFixtureData()} />)
    const title = screen.getByLabelText<HTMLInputElement>('Title', {
      exact: true,
    })
    fireEvent.change(title, { target: { value: 'Local retry visit' } })
    fireEvent.change(screen.getByLabelText('Next sample result'), {
      target: { value: 'save' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Update event' }))
    await screen.findByText(/Could not save event/)
    expect(title.value).toBe('Local retry visit')
    expect(title.disabled).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: 'Update event' }))
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain(
        'Sample changes applied locally',
      ),
    )
  })

  it('does not clone live context into a simulation outside development fixture access', () => {
    fixtureAccess.enabled = false
    render(<FormsPageLab data={createDashboardLabFixtureData()} />)
    expect(
      screen.getByText(/available only with development sample data/),
    ).toBeTruthy()
    expect(screen.queryByLabelText('Title', { exact: true })).toBeNull()
    expect(screen.queryByText('Juniper')).toBeNull()
  })
})
