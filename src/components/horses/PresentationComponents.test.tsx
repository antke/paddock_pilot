// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { HorseAvatar } from './HorseAvatar'
import { HorseSelectionCard } from './HorseCard'
import { HealthIssueStatusBadge } from './HorseCareBadges'
import { CareReminderStatusBadge } from '#/components/reminders/CareReminderBadges'
import { EventDateBadge } from '#/components/events/EventDateBadge'

afterEach(cleanup)

it('preserves horse image failure fallback and restores images for a changed source', () => {
  const view = render(<HorseAvatar name="𠮷野" profileImageUrl="/old.jpg" />)
  fireEvent.error(view.container.querySelector('img')!)
  expect(view.container.textContent).toBe('𠮷')
  expect(view.container.querySelector('img')).toBeNull()
  view.rerender(<HorseAvatar name="Juniper" profileImageUrl="/new.jpg" />)
  expect(view.container.querySelector('img')?.getAttribute('src')).toBe(
    '/new.jpg',
  )
  expect(view.container.querySelector('img')?.getAttribute('alt')).toBe('')
})

it('keeps whole-card horse selection a named native checkbox with controlled value and disabled state', () => {
  const change = vi.fn()
  function Sample({ disabled = false }: { disabled?: boolean }) {
    const [checked, setChecked] = useState(false)
    return (
      <HorseSelectionCard
        id="sample-juniper"
        name="horses"
        value="juniper"
        horse={{ name: 'Juniper', ownerName: 'Mae Turner' }}
        checked={checked}
        disabled={disabled}
        invalid
        onCheckedChange={(next) => {
          change(next)
          setChecked(next)
        }}
      />
    )
  }
  const view = render(<Sample />)
  const checkbox = screen.getByRole<HTMLInputElement>('checkbox', {
    name: /Juniper/,
  })
  expect(checkbox.value).toBe('juniper')
  expect(checkbox.getAttribute('aria-invalid')).toBe('true')
  fireEvent.click(screen.getByText('Juniper'))
  expect(checkbox.checked).toBe(true)
  expect(change).toHaveBeenCalledExactlyOnceWith(true)
  view.rerender(<Sample disabled />)
  expect(checkbox.disabled).toBe(true)
  fireEvent.click(screen.getByText('Juniper'))
  expect(change).toHaveBeenCalledTimes(1)
})

it('retains a complete machine-readable date and accessible year/time when the visible tile is compact', () => {
  const view = render(<EventDateBadge date="2024-02-29" time="09:30" />)
  const time = view.container.querySelector('time')!
  expect(time.dateTime).toBe('2024-02-29T09:30')
  expect(time.getAttribute('aria-label')).toContain('2024')
  expect(time.getAttribute('aria-label')).toContain('09:30')
  expect(screen.getByText('29')).toBeTruthy()
  view.rerender(<EventDateBadge date="2027-01-01" />)
  expect(time.dateTime).toBe('2027-01-01')
  expect(time.getAttribute('aria-label')).toContain('2027')
})

it('keeps textual status meaning and hides redundant decorative status graphics', () => {
  const view = render(
    <>
      <HealthIssueStatusBadge status="resolved" />
      <CareReminderStatusBadge status="pending" overdue />
    </>,
  )
  expect(screen.getByText('Resolved')).toBeTruthy()
  expect(screen.getByText('Overdue')).toBeTruthy()
  for (const icon of view.container.querySelectorAll('svg'))
    expect(icon.getAttribute('aria-hidden')).toBe('true')
})
