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
import { StableBasicsStepView } from './StableBasicsStep'
import { StableOperationsStepView } from './StableOperationsStep'
import { OnboardingPageLab } from '#/components/page-lab/prototypes/OnboardingPageLab'

const fixtureMode = vi.hoisted(() => ({ enabled: true }))
vi.mock('#/lib/devAuthBypass', () => ({
  useDevAuthBypassEnabled: () => fixtureMode.enabled,
}))
vi.mock('convex/react', () => ({
  useMutation: () => {
    throw new Error('Live mutation used by sample')
  },
  useQuery: () => {
    throw new Error('Live query used by sample')
  },
}))
const data = createDashboardLabFixtureData()
afterEach(() => {
  cleanup()
  fixtureMode.enabled = true
})
function submit(label: string) {
  fireEvent.submit(
    screen.getByLabelText(label, { exact: true }).closest('form')!,
  )
}
function choose(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

describe('onboarding real forms and local controller', () => {
  it('renders the first-account composition and retains acknowledged creation while retrying continuation', async () => {
    render(<OnboardingPageLab data={data} />)
    choose('Sample workflow', 'first')
    await screen.findByRole('heading', { name: 'Tell us about yourself' })
    choose('Next sample response', 'save-failure')
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }))
    await screen.findByText(/Could not save your profile/)
    expect(screen.queryByLabelText('Stable name')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }))
    await screen.findByLabelText('Stable name')
    expect(screen.getByLabelText<HTMLInputElement>('Stable name').value).toBe(
      '',
    )
    choose('Stable name', 'Sample New Stable')
    choose('Location', 'Łódź')
    choose('Next sample response', 'save-failure')
    submit('Stable name')
    await screen.findByText(/Could not create the stable/)
    expect(screen.getByLabelText<HTMLInputElement>('Stable name').value).toBe(
      'Sample New Stable',
    )
    choose('Next sample response', 'advance-failure')
    submit('Stable name')
    await screen.findByText(/Your changes were saved, but/)
    expect(
      screen.getByLabelText<HTMLInputElement>('Stable name').disabled,
    ).toBe(true)
    // A new save failure must remain unconsumed: this retries continuation only.
    choose('Next sample response', 'save-failure')
    fireEvent.click(
      screen.getByRole('button', { name: 'Continue without saving again' }),
    )
    await screen.findByText('Sample stable created')
    expect(
      screen.getByLabelText<HTMLSelectElement>('Next sample response').value,
    ).toBe('save-failure')
  })

  it('exposes already-connected actions locally and cancels first-profile advancement on restart', async () => {
    render(<OnboardingPageLab data={data} />)
    choose('Sample workflow', 'first')
    choose('Sample response delay', '1800')
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }))
    await waitFor(() =>
      expect(
        screen.getByLabelText<HTMLSelectElement>('Next sample response')
          .disabled,
      ).toBe(true),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Restart sample' }))
    await screen.findByRole('heading', { name: 'Tell us about yourself' })
    choose('Sample workflow', 'connected')
    expect(screen.getByText('Your account is already connected')).toBeTruthy()
    expect(screen.queryByLabelText('Next sample response')).toBeNull()
    for (const [name, destination] of [
      ['Open Sample Cedar Ridge', 'stable overview'],
      ['Edit profile', 'account profile'],
      ['Create my own stable', 'create stable'],
    ]) {
      fireEvent.click(screen.getByRole('button', { name }))
      expect(screen.getByRole('status').textContent).toContain(
        `Sample destination: ${destination}`,
      )
    }
    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })

  it('uses shared stable limits and linked errors, including Polish names', async () => {
    const onSave = vi.fn().mockResolvedValue(data.stable._id)
    render(<StableBasicsStepView onSave={onSave} onSaved={() => {}} />)
    choose('Stable name', 'a')
    choose('Location', 'Łódź')
    submit('Stable name')
    const name = screen.getByLabelText<HTMLInputElement>('Stable name')
    await waitFor(() => expect(name.getAttribute('aria-invalid')).toBe('true'))
    expect(
      document.getElementById(name.getAttribute('aria-describedby')!)
        ?.textContent,
    ).toContain('3 characters')
    expect(onSave).not.toHaveBeenCalled()
    choose('Stable name', 'Stajnia Łąka')
    submit('Stable name')
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        name: 'Stajnia Łąka',
        location: 'Łódź',
      }),
    )
  })

  it('shows operation validation errors instead of silently refusing a save', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(
      <StableOperationsStepView
        stable={data.stable}
        onSave={onSave}
        onSaved={() => {}}
        onDeferred={() => {}}
      />,
    )
    choose('Primary contact', 'a'.repeat(101))
    submit('Primary contact')
    const input = screen.getByLabelText('Primary contact')
    await waitFor(() => expect(input.getAttribute('aria-invalid')).toBe('true'))
    expect(
      document.getElementById(input.getAttribute('aria-describedby')!)
        ?.textContent,
    ).toContain('shorter')
    expect(document.activeElement).toBe(input)
    choose('Primary contact', 'Anna')
    submit('Primary contact')
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1))
  })

  it('guards repeated creation and retries only continuation after acknowledged save', async () => {
    let acknowledge!: (value: typeof data.stable._id) => void
    const onSave = vi.fn(
      () =>
        new Promise<typeof data.stable._id>((resolve) => {
          acknowledge = resolve
        }),
    )
    const onSaved = vi
      .fn()
      .mockRejectedValueOnce(new Error('navigation failed'))
      .mockResolvedValue(undefined)
    render(<StableBasicsStepView onSave={onSave} onSaved={onSaved} />)
    choose('Stable name', 'Sample Cedar Ridge')
    choose('Location', 'Łódź')
    submit('Stable name')
    submit('Stable name')
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1))
    await act(async () => {
      acknowledge(data.stable._id)
    })
    await screen.findByText(/Your changes were saved, but/)
    expect(
      screen.getByLabelText<HTMLInputElement>('Stable name').disabled,
    ).toBe(true)
    fireEvent.click(
      screen.getByRole('button', { name: 'Continue without saving again' }),
    )
    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(2))
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('blocks back/step navigation while saving and retries only progress after failure', async () => {
    render(<OnboardingPageLab data={data} />)
    choose('Next sample response', 'advance-failure')
    choose('Primary contact', 'Sample Anna')
    submit('Primary contact')
    await waitFor(() =>
      expect(
        screen.getByRole<HTMLButtonElement>('button', { name: 'Back' })
          .disabled,
      ).toBe(true),
    )
    const progress = screen.getByRole('navigation', {
      name: 'Onboarding progress',
    })
    expect(
      within(progress)
        .getAllByRole<HTMLButtonElement>('button')
        .every((button) => button.disabled),
    ).toBe(true)
    await screen.findByText(/Could not continue. Your saved details are safe/)
    expect(
      screen.getByLabelText('Primary contact').closest('fieldset')?.disabled,
    ).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    await screen.findByRole('heading', { name: 'Add your first horse' })
    expect(screen.getByRole('status').textContent).toContain(
      'progress applied locally',
    )
  })

  it('runs the real member flow with deferred steps and no live hooks', async () => {
    render(<OnboardingPageLab data={data} />)
    choose('Sample workflow', 'member')
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByRole('heading', { name: 'Your details at this stable' })
    fireEvent.click(screen.getByRole('button', { name: 'Do this later' }))
    await screen.findByRole('heading', { name: 'Add your first horse' })
    fireEvent.click(screen.getByRole('button', { name: 'Do this later' }))
    await screen.findByRole('heading', { name: 'Review and finish' })
    choose('Next sample response', 'open-failure')
    fireEvent.click(
      screen.getByRole('button', { name: 'Open Sample Cedar Ridge' }),
    )
    await screen.findByText(/Could not open the stable/)
    choose('Next sample response', 'advance-failure')
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    await screen.findByText('Sample setup complete')
  })

  it('adds a horse and invitation through actual local forms without live hooks', async () => {
    render(<OnboardingPageLab data={data} />)
    fireEvent.click(screen.getByRole('button', { name: 'Do this later' }))
    await screen.findByRole('heading', { name: 'Add your first horse' })
    choose('Horse name', 'Sample Maple')
    choose('Or current age', '8')
    submit('Horse name')
    await screen.findByRole('heading', { name: 'Bring in your team' })
    choose('Email address', 'new@example.test')
    fireEvent.click(screen.getByRole('button', { name: 'Invite' }))
    await screen.findByText('new@example.test')
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByRole('heading', { name: 'Review and finish' })
    expect(screen.getByText('Sample Maple')).toBeTruthy()
    expect(screen.getByText('new@example.test')).toBeTruthy()
  })

  it('keeps an interrupted sample response out of the newly selected workflow', async () => {
    render(<OnboardingPageLab data={data} />)
    submit('Primary contact')
    await waitFor(() =>
      expect(
        screen.getByRole<HTMLButtonElement>('button', { name: 'Back' })
          .disabled,
      ).toBe(true),
    )
    choose('Sample workflow', 'member')
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350))
    })
    expect(
      screen.getByRole('heading', { name: 'Meet Sample Cedar Ridge' }),
    ).toBeTruthy()
    expect(
      screen.queryByText('Sample stable details applied locally.'),
    ).toBeNull()
    expect(
      screen.queryByRole('heading', { name: 'Add your first horse' }),
    ).toBeNull()
  })

  it('reviews only effective pending invitations and gates simulations', async () => {
    const view = render(<OnboardingPageLab data={data} />)
    choose('Sample workflow', 'review')
    expect(screen.getByText('pending@example.test')).toBeTruthy()
    expect(screen.queryByText('accepted@example.test')).toBeNull()
    expect(screen.queryByText('expired@example.test')).toBeNull()
    view.unmount()
    fixtureMode.enabled = false
    render(<OnboardingPageLab data={data} />)
    expect(screen.getByText(/only with development sample data/)).toBeTruthy()
    expect(screen.queryByLabelText('Sample workflow')).toBeNull()
  })
})
