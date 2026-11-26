// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { CountryCareExample } from './CountryLandingHero'

afterEach(cleanup)

describe('CountryCareExample', () => {
  it('lets a visitor explore the same visit before and after completion', () => {
    render(<CountryCareExample />)

    const completed = screen.getByRole('button', { name: 'Completed' })
    const planned = screen.getByRole('button', { name: 'Planned' })

    expect(completed.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByText('Trim done. Next visit to book.')).toBeTruthy()

    fireEvent.click(planned)

    expect(planned.getAttribute('aria-pressed')).toBe('true')
    expect(completed.getAttribute('aria-pressed')).toBe('false')
    expect(screen.queryByText('Trim done. Next visit to book.')).toBeNull()
    expect(screen.getByText('Sam Taylor, farrier.')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Farrier visit' })).toBeTruthy()

    fireEvent.click(completed)

    expect(completed.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByText('Trim done. Next visit to book.')).toBeTruthy()
    expect(screen.getByText('Example')).toBeTruthy()
  })
})
