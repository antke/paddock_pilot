// @vitest-environment jsdom
import type { ComponentProps } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PublicLandingPage } from './PublicLandingPage'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, ...props }: ComponentProps<'a'> & { to: string }) => (
    <a href={to} {...props} />
  ),
}))
afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
})

describe('PublicLandingPage', () => {
  it('connects the shared-care story and example to working account routes', () => {
    render(<PublicLandingPage />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('main').id).toBe('country-main')
    expect(
      screen.getByText(/No more searching through old messages/),
    ).toBeTruthy()
    for (const link of screen.getAllByRole('link', {
      name: /Create (your )?account/,
    })) {
      expect(link.getAttribute('href')).toBe('/sign-up/$')
    }
    expect(
      screen.getByRole('link', { name: 'Plans' }).getAttribute('href'),
    ).toBe('/pricing')
    fireEvent.click(screen.getByRole('button', { name: 'Planned' }))
    expect(screen.getByText('Sam Taylor, farrier.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Completed' }))
    expect(
      screen.getByText('Trim completed. Next visit to be arranged.'),
    ).toBeTruthy()
  })
  it('removes rejected filler and screenshot galleries without inventing commercial proof', () => {
    const { container } = render(<PublicLandingPage />)
    const copy = container.textContent ?? ''
    for (const removed of [
      'For small stable owners and members.',
      'One record, there for the next person.',
      'Notes after completion',
      'free trial',
      'trusted by',
      'cancel anytime',
    ]) {
      expect(copy.toLowerCase()).not.toContain(removed.toLowerCase())
    }
    expect(
      container.querySelector('img[src="/landing/stable-command-center.png"]'),
    ).toBeNull()
    expect(
      container.querySelector('img[src="/landing/horse-record.png"]'),
    ).toBeNull()
    expect(
      container.querySelector('img[src="/landing/provider-visit.png"]'),
    ).toBeNull()
    expect(screen.getByText('Example')).toBeTruthy()
  })
  it('uses the requested invitation without testing-payment copy', () => {
    render(<PublicLandingPage />)
    expect(
      screen.getByText(
        'Create your stable, add your horse and invite your friends.',
      ),
    ).toBeTruthy()
    expect(screen.queryByText(/no payment is required/)).toBeNull()
  })
})
