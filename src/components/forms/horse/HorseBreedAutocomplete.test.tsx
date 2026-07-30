// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { HorseBreedAutocomplete } from './HorseBreedAutocomplete'

afterEach(cleanup)

function BreedAutocompleteHarness() {
  const [value, setValue] = useState('')

  return (
    <HorseBreedAutocomplete
      id="breed"
      name="breed"
      value={value}
      onBlur={() => undefined}
      onValueChange={setValue}
    />
  )
}

describe('HorseBreedAutocomplete', () => {
  it('commits an exact breed from the controlled list', () => {
    render(<BreedAutocompleteHarness />)

    const input = screen.getByRole<HTMLInputElement>('combobox')
    fireEvent.change(input, { target: { value: 'Arabian' } })
    fireEvent.blur(input)

    expect(input.value).toBe('Arabian')
  })

  it('clears free text that is not a known breed', () => {
    render(<BreedAutocompleteHarness />)

    const input = screen.getByRole<HTMLInputElement>('combobox')
    fireEvent.change(input, { target: { value: 'Imaginary horse' } })
    fireEvent.blur(input)

    expect(input.value).toBe('')
  })
})
