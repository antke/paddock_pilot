// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FormGroup, FormSection } from './FormLayout'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function ValidationSection({
  invalid,
  validationAttempt,
}: {
  invalid: boolean
  validationAttempt: number
}) {
  return (
    <form>
      <FormSection
        invalid={invalid}
        number={1}
        title="Required details"
        validationAttempt={validationAttempt}
      >
        <label htmlFor="required-name">Name</label>
        <input id="required-name" aria-invalid={invalid} />
        {invalid && <p>Name is required.</p>}
      </FormSection>
    </form>
  )
}

describe('FormSection validation behavior', () => {
  it('opens a closed section when a save attempt finds invalid fields', () => {
    const { rerender } = render(
      <ValidationSection invalid={false} validationAttempt={0} />,
    )
    const sectionTrigger = screen.getByRole('button', {
      name: /required details/i,
    })

    expect(sectionTrigger.getAttribute('aria-expanded')).toBe('false')

    rerender(<ValidationSection invalid validationAttempt={1} />)

    expect(sectionTrigger.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText('Name is required.')).toBeTruthy()
  })

  it('reopens an invalid section on every later save attempt', () => {
    const { rerender } = render(
      <ValidationSection invalid validationAttempt={1} />,
    )
    const sectionTrigger = screen.getByRole('button', {
      name: /required details/i,
    })

    fireEvent.click(sectionTrigger)
    expect(sectionTrigger.getAttribute('aria-expanded')).toBe('false')

    rerender(<ValidationSection invalid validationAttempt={2} />)

    expect(sectionTrigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('focuses the first invalid control after the section expands', async () => {
    vi.useFakeTimers()
    const { rerender } = render(
      <ValidationSection invalid={false} validationAttempt={0} />,
    )

    rerender(<ValidationSection invalid validationAttempt={1} />)

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(document.activeElement).toBe(
      screen.getByRole('textbox', { name: 'Name' }),
    )
  })
})

describe('FormGroup', () => {
  it('adds visible structure without hiding manageable form fields', () => {
    const { container } = render(
      <FormGroup
        title="Contact details"
        description="Keep the main contact information together."
      >
        <label htmlFor="contact-name">Contact name</label>
        <input id="contact-name" />
      </FormGroup>,
    )

    expect(
      screen.getByRole('heading', { level: 3, name: 'Contact details' }),
    ).toBeTruthy()
    expect(
      screen.getByText('Keep the main contact information together.'),
    ).toBeTruthy()
    expect(screen.getByRole('textbox', { name: 'Contact name' })).toBeTruthy()
    expect(container.querySelector('[data-slot="form-group"]')).toBeTruthy()
    expect(screen.queryByRole('button')).toBeNull()
  })
})
