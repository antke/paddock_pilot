// @vitest-environment jsdom

import type { ComponentProps } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PublicLandingPage } from './PublicLandingPage'

vi.mock('#/components/ui/button', () => ({
  ButtonAnchor: (props: ComponentProps<'a'>) => <a {...props} />,
  ButtonLink: ({
    size,
    to,
    variant,
    ...props
  }: ComponentProps<'a'> & {
    size?: string
    to: string
    variant?: string
  }) => {
    void size
    void variant
    return <a href={to} {...props} />
  },
}))

afterEach(cleanup)

describe('PublicLandingPage', () => {
  it('presents a complete and auditable product story', () => {
    const { container } = render(<PublicLandingPage />)

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(
      screen.getByRole('heading', {
        name: 'The whole yard, without the whiteboard scramble.',
      }),
    ).toBeTruthy()
    expect(
      screen.getAllByRole('link', { name: 'Create your account' }),
    ).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: 'Compare plans' })).toHaveLength(
      2,
    )
    expect(container.querySelectorAll('figure')).toHaveLength(4)
    expect(container.querySelectorAll('figcaption')).toHaveLength(4)
    expect(container.querySelectorAll('details')).toHaveLength(5)

    const copy = container.textContent?.toLowerCase() ?? ''
    expect(copy).not.toContain('free trial')
    expect(copy).not.toContain('no card')
    expect(copy).not.toContain('cancel anytime')
  })
})
