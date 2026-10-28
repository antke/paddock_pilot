// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { EventDateBadge } from './EventDateBadge'

afterEach(cleanup)
it('uses a date-only machine value for whole-day entries and preserves midnight as a real time', () => {
  const { container, rerender } = render(
    <EventDateBadge date="2026-09-29" time="all-day" />,
  )
  expect(screen.getByText('Whole day')).toBeTruthy()
  expect(container.querySelector('time')?.getAttribute('datetime')).toBe(
    '2026-09-29',
  )
  rerender(<EventDateBadge date="2026-09-29" time="00:00" />)
  expect(screen.getByText('00:00')).toBeTruthy()
  expect(container.querySelector('time')?.getAttribute('datetime')).toBe(
    '2026-09-29T00:00',
  )
})
