// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { createRef } from 'react'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
} from './field'
import { Input } from './input'
import { Textarea } from './textarea'

afterEach(cleanup)

describe('FieldError message content', () => {
  it('does not announce an empty alert for sparse or blank validation results', () => {
    render(
      <FieldError
        errors={[undefined, {}, { message: '' }, { message: '  ' }]}
      />,
    )
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('deduplicates actual messages, preserves their text and removes stale errors after correction', () => {
    const { rerender } = render(
      <FieldError
        id="field-error"
        errors={[
          undefined,
          { message: 'Enter a stable name.' },
          { message: 'Enter a stable name.' },
          { message: 'Maximum 100 characters.' },
        ]}
      />,
    )
    expect(
      screen.getAllByRole('listitem').map((item) => item.textContent),
    ).toEqual(['Enter a stable name.', 'Maximum 100 characters.'])
    expect(screen.getByRole('alert').id).toBe('field-error')
    rerender(<FieldError errors={[undefined]} />)
    expect(screen.queryByRole('alert')).toBeNull()
  })
})

describe('Shared native control contracts', () => {
  it('preserves explicit label, required, error and additional description associations through Input and Textarea', () => {
    const inputRef = createRef<HTMLInputElement>()
    const textareaRef = createRef<HTMLTextAreaElement>()
    render(
      <>
        <Field data-invalid="true">
          <FieldLabel htmlFor="name">Stable name</FieldLabel>
          <Input
            id="name"
            ref={inputRef}
            required
            aria-invalid="true"
            aria-describedby="name-hint name-error"
          />
          <FieldDescription id="name-hint">
            Use the name your members know.
          </FieldDescription>
          <FieldError id="name-error">Enter the stable name.</FieldError>
        </Field>
        <Field data-invalid="true">
          <FieldLabel htmlFor="notes">Handover notes</FieldLabel>
          <Textarea
            id="notes"
            ref={textareaRef}
            aria-required="true"
            aria-invalid="true"
            aria-describedby="notes-hint notes-error"
          />
          <FieldDescription id="notes-hint">
            Keep the original line breaks.
          </FieldDescription>
          <FieldError id="notes-error">Describe the handover.</FieldError>
        </Field>
      </>,
    )
    for (const [label, ref, descriptions] of [
      ['Stable name', inputRef, 'name-hint name-error'],
      ['Handover notes', textareaRef, 'notes-hint notes-error'],
    ] as const) {
      const control = screen.getByLabelText(label)
      expect(ref.current).toBe(control)
      expect(control.getAttribute('aria-invalid')).toBe('true')
      expect(control.getAttribute('aria-describedby')).toBe(descriptions)
      for (const id of descriptions.split(' '))
        expect(document.getElementById(id)?.textContent).toBeTruthy()
      ref.current?.focus()
      expect(document.activeElement).toBe(control)
    }
    expect(inputRef.current?.validity.valueMissing).toBe(true)
    expect(textareaRef.current?.getAttribute('aria-required')).toBe('true')
  })

  it('preserves long Unicode drafts and native readonly/disabled fieldset submission semantics', () => {
    const draft = 'Żółć — Łąka, 荷兰马.\n'.repeat(30)
    const { container, rerender } = render(
      <form>
        <FieldSet>
          <Input
            name="name"
            aria-label="Stable name"
            defaultValue="Stajnia Łąka"
            readOnly
          />
          <Textarea
            name="notes"
            aria-label="Handover notes"
            defaultValue={draft}
            readOnly
          />
        </FieldSet>
      </form>,
    )
    expect(new FormData(container.querySelector('form')!).get('notes')).toBe(
      draft,
    )
    rerender(
      <form>
        <FieldSet disabled>
          <Input
            name="name"
            aria-label="Stable name"
            defaultValue="Stajnia Łąka"
            readOnly
          />
          <Textarea
            name="notes"
            aria-label="Handover notes"
            defaultValue={draft}
            readOnly
          />
        </FieldSet>
      </form>,
    )
    expect(
      Array.from(new FormData(container.querySelector('form')!).entries()),
    ).toEqual([])
    expect(screen.getByLabelText('Handover notes')).toHaveProperty(
      'value',
      draft,
    )
  })
})
