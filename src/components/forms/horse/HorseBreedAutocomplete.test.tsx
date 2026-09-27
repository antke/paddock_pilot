// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { HorseBreedAutocomplete } from './HorseBreedAutocomplete'

afterEach(cleanup)

function BreedAutocompleteHarness() {
  const [value, setValue] = useState('')
  const [breeds, setBreeds] = useState<Array<string>>([])

  return (
    <HorseBreedAutocomplete
      id="breed"
      name="breed"
      value={value}
      additionalBreeds={breeds}
      onAddBreed={(breed) => setBreeds((current) => [...current, breed])}
      onBlur={() => undefined}
      onValueChange={setValue}
    />
  )
}

describe('HorseBreedAutocomplete', () => {
  it('adds a trimmed local breed without submitting the horse form and rejects blank names', async () => {
    render(<BreedAutocompleteHarness />)
    fireEvent.click(screen.getByRole('button', { name: 'Add breed' }))
    fireEvent.click(screen.getByRole('button', { name: 'Use breed' }))
    expect(await screen.findByText('Enter a breed name.')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('New breed name'), {
      target: { value: '  Local mountain pony  ' },
    })
    fireEvent.keyDown(screen.getByLabelText('New breed name'), { key: 'Enter' })
    expect(screen.queryByLabelText('New breed name')).toBeNull()
    expect(screen.getByRole<HTMLInputElement>('combobox').value).toBe(
      'Local mountain pony',
    )
    fireEvent.blur(screen.getByRole('combobox'))
    expect(screen.getByRole<HTMLInputElement>('combobox').value).toBe(
      'Local mountain pony',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add breed' }))
    fireEvent.change(screen.getByLabelText('New breed name'), {
      target: { value: 'Not added' },
    })
    fireEvent.keyDown(screen.getByLabelText('New breed name'), {
      key: 'Escape',
    })
    expect(screen.getByRole<HTMLInputElement>('combobox').value).toBe(
      'Local mountain pony',
    )
  })

  it('commits an exact breed from the controlled list', () => {
    render(<BreedAutocompleteHarness />)

    const input = screen.getByRole<HTMLInputElement>('combobox')
    fireEvent.change(input, { target: { value: 'Arabian' } })
    fireEvent.blur(input)

    expect(input.value).toBe('Arabian')
  })

  it('keeps unresolved text visible on blur for form validation', () => {
    render(<BreedAutocompleteHarness />)

    const input = screen.getByRole<HTMLInputElement>('combobox')
    fireEvent.change(input, { target: { value: 'Imaginary horse' } })
    fireEvent.blur(input)

    expect(input.value).toBe('Imaginary horse')
  })

  it('tracks resets and newly supplied legacy options without clearing stored data', () => {
    const onChange = vi.fn()
    const props = {
      id: 'breed',
      name: 'breed',
      onBlur: () => undefined,
      onAddBreed: vi.fn(),
      onValueChange: onChange,
    }
    const view = render(
      <HorseBreedAutocomplete
        {...props}
        value="Historic breed"
        existingBreed="Historic breed"
      />,
    )
    const input = screen.getByRole<HTMLInputElement>('combobox')
    fireEvent.blur(input)
    expect(input.value).toBe('Historic breed')
    view.rerender(
      <HorseBreedAutocomplete
        {...props}
        value="Another local breed"
        existingBreed="Another local breed"
      />,
    )
    fireEvent.blur(input)
    expect(input.value).toBe('Another local breed')
    expect(onChange).not.toHaveBeenCalled()
    view.rerender(<HorseBreedAutocomplete {...props} value="Arabian" />)
    expect(input.value).toBe('Arabian')
    view.rerender(<HorseBreedAutocomplete {...props} value="" />)
    expect(input.value).toBe('')
  })

  it('selects a suggestion with the keyboard and keeps it on blur', async () => {
    render(<BreedAutocompleteHarness />)
    const input = screen.getByRole<HTMLInputElement>('combobox')
    act(() => input.focus())
    fireEvent.change(input, { target: { value: 'Thorough' } })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    await screen.findByRole('option', { name: 'Thoroughbred' })
    fireEvent.keyDown(input, { key: 'Enter' })
    await waitFor(() => expect(input.value).toBe('Thoroughbred'))
    fireEvent.blur(input)
    expect(input.value).toBe('Thoroughbred')
  })
})
