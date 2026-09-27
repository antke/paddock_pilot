// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { UserAvatar } from './UserAvatar'

afterEach(cleanup)

it('falls back after a broken image and tries a changed URL without duplicating the visible name', () => {
  const view = render(<UserAvatar name="Mae Turner" photoUrl="/broken.jpg" />)
  fireEvent.error(view.container.querySelector('img')!)
  expect(view.container.querySelector('img')).toBeNull()
  expect(view.container.textContent).toBe('MT')
  expect(view.container.firstElementChild?.getAttribute('aria-hidden')).toBe(
    'true',
  )
  view.rerender(<UserAvatar name="Mae Turner" photoUrl="/new.jpg" />)
  expect(view.container.querySelector('img')?.getAttribute('src')).toBe(
    '/new.jpg',
  )
  view.rerender(<UserAvatar name="Rae Smith" />)
  expect(view.container.textContent).toBe('RS')
})

it('keeps Unicode code points intact and supplies a visible fallback for blank names', () => {
  const view = render(<UserAvatar name="𠮷野 花子" />)
  expect(view.container.textContent).toBe('𠮷花')
  view.rerender(<UserAvatar name="   " />)
  expect(view.container.textContent).toBe('?')
})
