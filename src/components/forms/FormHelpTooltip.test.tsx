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
import { FormHelpTooltip } from './FormHelpTooltip'
import { TooltipProvider } from '#/components/ui/tooltip'

afterEach(cleanup)
function setup() {
  const submit = vi.fn((event: React.FormEvent) => event.preventDefault())
  render(
    <TooltipProvider>
      <form onSubmit={submit}>
        <FormHelpTooltip label="About weekly recurrence days">
          Choose one or more days this event repeats.
        </FormHelpTooltip>
        <button type="button">Next field</button>
      </form>
    </TooltipProvider>,
  )
  return {
    trigger: screen.getByRole('button', {
      name: 'About weekly recurrence days',
    }),
    submit,
  }
}
describe('form help access', () => {
  it('opens on keyboard focus, describes its trigger and dismisses without submitting', async () => {
    const { trigger, submit } = setup()
    act(() => trigger.focus())
    const content = await screen.findByRole('tooltip')
    expect(content.textContent).toContain('Choose one or more days')
    expect(trigger.getAttribute('aria-describedby')).toBe(content.id)
    fireEvent.keyDown(trigger, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
    expect(document.activeElement).toBe(trigger)
    expect(submit).not.toHaveBeenCalled()
  })

  it('allows explicit touch activation without hover', async () => {
    const { trigger, submit } = setup()
    const down = new Event('pointerdown', { bubbles: true })
    Object.assign(down, { pointerType: 'touch', button: 0, isPrimary: true })
    fireEvent(trigger, down)
    act(() => trigger.focus())
    const up = new Event('pointerup', { bubbles: true })
    Object.assign(up, { pointerType: 'touch', button: 0, isPrimary: true })
    fireEvent(trigger, up)
    fireEvent.click(trigger)
    expect(
      await screen.findByText('Choose one or more days this event repeats.'),
    ).toBeTruthy()
    fireEvent.click(trigger)
    expect(screen.getByRole('tooltip')).toBeTruthy()
    act(() => screen.getByRole('button', { name: 'Next field' }).focus())
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
    fireEvent.click(trigger)
    expect(await screen.findByRole('tooltip')).toBeTruthy()
    expect(submit).not.toHaveBeenCalled()
  })

  it('preserves mouse hover help without moving focus', async () => {
    const { trigger } = setup()
    const next = screen.getByRole('button', { name: 'Next field' })
    act(() => next.focus())
    fireEvent.mouseEnter(trigger)
    expect(await screen.findByRole('tooltip')).toBeTruthy()
    expect(document.activeElement).toBe(next)
    fireEvent.mouseLeave(trigger)
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
  })

  it('keeps multiple help descriptions associated with their own triggers', async () => {
    render(
      <TooltipProvider>
        <FormHelpTooltip label="About one">First explanation.</FormHelpTooltip>
        <FormHelpTooltip label="About two">Second explanation.</FormHelpTooltip>
      </TooltipProvider>,
    )
    const one = screen.getByRole('button', { name: 'About one' })
    const two = screen.getByRole('button', { name: 'About two' })
    act(() => one.focus())
    const firstId = (await screen.findByRole('tooltip')).id
    expect(one.getAttribute('aria-describedby')).toBe(firstId)
    act(() => two.focus())
    await waitFor(() =>
      expect(screen.getByRole('tooltip').textContent).toContain(
        'Second explanation.',
      ),
    )
    expect(two.getAttribute('aria-describedby')).toBe(
      screen.getByRole('tooltip').id,
    )
    expect(two.getAttribute('aria-describedby')).not.toBe(firstId)
    expect(one.hasAttribute('aria-describedby')).toBe(false)
  })
})
