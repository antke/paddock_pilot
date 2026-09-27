// @vitest-environment jsdom
import { cleanup, isInaccessible, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { RoutePending } from './RoutePending'

afterEach(cleanup)

describe('route pending feedback', () => {
  it('explains the pending page with visible text even when the spinner is static', () => {
    render(<RoutePending />)

    const label = screen.getByText('Loading page…')
    expect(label.tagName).toBe('P')
    expect(isInaccessible(label)).toBe(false)
    expect(screen.getByRole('status', { name: 'Loading' })).toBeTruthy()
  })
})
