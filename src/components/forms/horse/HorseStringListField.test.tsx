// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { HorseStringListField } from './HorseStringListField'
import type { HorseFormInput, HorseFormSchema } from './horseFormSchema'

afterEach(cleanup)

function Harness({
  onSubmit = () => undefined,
}: {
  onSubmit?: (values: HorseFormSchema) => void
}) {
  const form = useForm<HorseFormInput, unknown, HorseFormSchema>({
    defaultValues: { allergies: ['Penicillin'] },
  })
  const [revision, setRevision] = useState(0)

  return (
    <form aria-label="Horse" onSubmit={form.handleSubmit(onSubmit)}>
      <HorseStringListField
        control={form.control}
        name="allergies"
        label="Allergies"
        placeholder="One item per line"
      />
      <button type="button" onClick={() => setRevision(revision + 1)}>
        Rerender {revision}
      </button>
      <button type="button" onClick={() => form.reset()}>
        Reset
      </button>
      <button
        type="button"
        onClick={() => form.reset({ allergies: ['Dusty hay'] })}
      >
        Load another horse
      </button>
      <button type="submit">Save</button>
    </form>
  )
}

describe('HorseStringListField', () => {
  it('preserves spaces and newlines while typing and through rerenders', () => {
    render(<Harness />)
    const input = screen.getByRole<HTMLTextAreaElement>('textbox')

    for (const value of [
      'Penicillin\n',
      'Penicillin\nBee ',
      'Penicillin\nBee stings\n',
    ]) {
      fireEvent.change(input, { target: { value } })
      expect(input.value).toBe(value)
    }

    fireEvent.click(screen.getByRole('button', { name: 'Rerender 0' }))
    expect(input.value).toBe('Penicillin\nBee stings\n')

    fireEvent.blur(input)
    expect(input.value).toBe('Penicillin\nBee stings')
  })

  it('submits normalized pasted items even without a blur event', async () => {
    const onSubmit = vi.fn()
    render(<Harness onSubmit={onSubmit} />)
    const input = screen.getByRole<HTMLTextAreaElement>('textbox')
    const pasted = '  Penicillin  \n\n Bee stings \n  Dusty hay\n'

    fireEvent.change(input, { target: { value: pasted } })
    expect(input.value).toBe(pasted)
    fireEvent.submit(screen.getByRole('form', { name: 'Horse' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0][0].allergies).toEqual([
      'Penicillin',
      'Bee stings',
      'Dusty hay',
    ])
  })

  it('reflects reset even when the normalized array is unchanged', () => {
    render(<Harness />)
    const input = screen.getByRole<HTMLTextAreaElement>('textbox')

    fireEvent.change(input, { target: { value: 'Penicillin \n' } })
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(input.value).toBe('Penicillin')

    fireEvent.change(input, { target: { value: 'New allergy\n' } })
    fireEvent.click(screen.getByRole('button', { name: 'Load another horse' }))
    expect(input.value).toBe('Dusty hay')
  })
})
