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
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChoiceButtonGroup } from './choice-button-group'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'
import { RadioGroup, RadioGroupItem } from './radio-group'
import { Field, FieldLabel } from './field'

afterEach(cleanup)

function ChoiceSample({
  layout,
  disabled = false,
}: {
  layout: 'compact' | 'cards'
  disabled?: boolean
}) {
  const [value, setValue] = useState('planned')
  return (
    <>
      <ChoiceButtonGroup
        aria-label="Visit status"
        aria-invalid
        aria-describedby="status-error"
        layout={layout}
        disabled={disabled}
        value={value}
        onValueChange={setValue}
        options={[
          {
            value: 'planned',
            label: 'Planned',
            description: 'Keep this visit on the calendar.',
          },
          {
            value: 'done',
            label: 'Completed',
            description: 'Keep an acknowledged record of the visit.',
          },
        ]}
      />
      <p id="status-error">Choose the correct visit status.</p>
    </>
  )
}

describe('choice button semantics', () => {
  it.each(['compact', 'cards'] as const)(
    'keeps %s choices single and persistent with named error association',
    async (layout) => {
      render(<ChoiceSample layout={layout} />)
      const group = screen.getByRole('group', { name: 'Visit status' })
      expect(group.getAttribute('aria-invalid')).toBe('true')
      expect(
        document.getElementById(group.getAttribute('aria-describedby')!)
          ?.textContent,
      ).toBe('Choose the correct visit status.')
      const planned = within(group).getByRole('button', { name: /^Planned/ })
      const done = within(group).getByRole('button', { name: /^Completed/ })
      expect(planned.getAttribute('aria-pressed')).toBe('true')
      act(() => planned.focus())
      fireEvent.keyDown(planned, { key: 'ArrowRight' })
      await waitFor(() => expect(document.activeElement).toBe(done))
      expect(planned.getAttribute('aria-pressed')).toBe('true')
      fireEvent.click(done)
      expect(done.getAttribute('aria-pressed')).toBe('true')
      expect(planned.getAttribute('aria-pressed')).toBe('false')
      fireEvent.click(done)
      expect(done.getAttribute('aria-pressed')).toBe('true')
      if (layout === 'cards')
        expect(
          within(group).getByText('Keep this visit on the calendar.'),
        ).toBeTruthy()
    },
  )

  it('does not change a disabled choice', () => {
    render(<ChoiceSample layout="compact" disabled />)
    const done = screen.getByRole('button', { name: 'Completed' })
    expect(done.hasAttribute('disabled')).toBe(true)
    fireEvent.click(done)
    expect(done.getAttribute('aria-pressed')).toBe('false')
  })
})

describe('toggle group keyboard ownership', () => {
  it('uses up/down for vertical navigation, skips disabled items and supports Home/End', async () => {
    render(
      <ToggleGroup orientation="vertical" aria-label="Periods">
        <ToggleGroupItem value="one">One</ToggleGroupItem>
        <ToggleGroupItem value="two" disabled>
          Two
        </ToggleGroupItem>
        <ToggleGroupItem value="three">Three</ToggleGroupItem>
      </ToggleGroup>,
    )
    const one = screen.getByRole('button', { name: 'One' })
    const three = screen.getByRole('button', { name: 'Three' })
    act(() => one.focus())
    fireEvent.keyDown(one, { key: 'ArrowDown' })
    await waitFor(() => expect(document.activeElement).toBe(three))
    fireEvent.keyDown(three, { key: 'Home' })
    await waitFor(() => expect(document.activeElement).toBe(one))
    fireEvent.keyDown(one, { key: 'End' })
    await waitFor(() => expect(document.activeElement).toBe(three))
    fireEvent.keyDown(three, { key: 'ArrowUp' })
    await waitFor(() => expect(document.activeElement).toBe(one))
  })

  it('preserves independent selections for recurrence weekdays', () => {
    const change = vi.fn()
    render(
      <ToggleGroup
        multiple
        defaultValue={['mon']}
        aria-label="Days of week"
        onValueChange={change}
      >
        <ToggleGroupItem value="mon">Monday</ToggleGroupItem>
        <ToggleGroupItem value="wed">Wednesday</ToggleGroupItem>
      </ToggleGroup>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Wednesday' }))
    expect(change.mock.calls.at(-1)?.[0]).toEqual(['mon', 'wed'])
    fireEvent.click(screen.getByRole('button', { name: 'Monday' }))
    expect(change.mock.calls.at(-1)?.[0]).toEqual(['wed'])
  })
})

describe('radio choice semantics', () => {
  it('uses real labels and arrow selection, skips disabled options and submits the selected value', async () => {
    const { container } = render(
      <form>
        <RadioGroup
          name="repeatBy"
          defaultValue="day"
          aria-label="Repeat by"
          aria-invalid
          aria-describedby="repeat-error"
        >
          <Field>
            <RadioGroupItem id="repeat-day" value="day" />
            <FieldLabel htmlFor="repeat-day">Day of month</FieldLabel>
          </Field>
          <Field>
            <RadioGroupItem id="repeat-disabled" value="disabled" disabled />
            <FieldLabel htmlFor="repeat-disabled">Disabled pattern</FieldLabel>
          </Field>
          <Field>
            <RadioGroupItem id="repeat-weekday" value="weekday" />
            <FieldLabel htmlFor="repeat-weekday">Weekday pattern</FieldLabel>
          </Field>
        </RadioGroup>
        <p id="repeat-error">Choose a repeat pattern.</p>
      </form>,
    )
    const day = screen.getByRole('radio', { name: 'Day of month' })
    const weekday = screen.getByRole('radio', { name: 'Weekday pattern' })
    const group = screen.getByRole('radiogroup', { name: 'Repeat by' })
    expect(group.getAttribute('aria-describedby')).toBe('repeat-error')
    act(() => day.focus())
    fireEvent.keyDown(day, { key: 'ArrowRight' })
    await waitFor(() => expect(document.activeElement).toBe(weekday))
    expect(weekday.getAttribute('aria-checked')).toBe('true')
    expect(new FormData(container.querySelector('form')!).get('repeatBy')).toBe(
      'weekday',
    )
    fireEvent.click(screen.getByText('Day of month'))
    expect(day.getAttribute('aria-checked')).toBe('true')
  })

  it('does not change a disabled radio group', () => {
    const change = vi.fn()
    render(
      <RadioGroup
        disabled
        defaultValue="one"
        aria-label="Disabled choice"
        onValueChange={change}
      >
        <RadioGroupItem value="one" aria-label="One" />
        <RadioGroupItem value="two" aria-label="Two" />
      </RadioGroup>,
    )
    fireEvent.click(screen.getByRole('radio', { name: 'Two' }))
    expect(change).not.toHaveBeenCalled()
    expect(
      screen.getByRole('radio', { name: 'One' }).getAttribute('aria-checked'),
    ).toBe('true')
  })
})
