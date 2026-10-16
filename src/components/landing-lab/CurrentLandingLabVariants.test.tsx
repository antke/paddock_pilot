// @vitest-environment jsdom
import type { ComponentProps } from 'react'
import type * as ButtonModule from '#/components/ui/button'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { GUEST_LOCALE_KEY, LocaleProvider } from '#/i18n/LocaleProvider'
import { forbiddenLandingClaims } from './landingLabContent'
import FieldJournal from './variants/FieldJournal'
import YardEditorial from './variants/YardEditorial'
import OpenPaddock from './variants/OpenPaddock'
import WorkingJournal from './variants/WorkingJournal'
import PineStatement from './variants/PineStatement'

vi.mock('#/components/ui/button', async (importOriginal) => ({
  ...(await importOriginal<typeof ButtonModule>()),
  ButtonLink: ({
    to,
    variant: _variant,
    size: _size,
    ...props
  }: ComponentProps<'a'> & { to: string; variant?: string; size?: string }) => (
    <a href={to} {...props} />
  ),
}))

const directions = [
  { name: 'Field Journal', Direction: FieldJournal },
  { name: 'Yard Editorial', Direction: YardEditorial },
  { name: 'Open Paddock', Direction: OpenPaddock },
  { name: 'Working Journal', Direction: WorkingJournal },
  { name: 'Pine Statement', Direction: PineStatement },
]

afterEach(() => {
  cleanup()
  window.localStorage.removeItem(GUEST_LOCALE_KEY)
})

describe('current landing directions', () => {
  it.each(directions)(
    '$name renders a complete factual public page',
    ({ Direction }) => {
      const { container } = render(<Direction />)
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
      expect(screen.getByRole('main').id).toBe('main-content')
      expect(screen.getByRole('banner')).toBeTruthy()
      expect(screen.getByRole('contentinfo')).toBeTruthy()
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2)
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4)
      expect(screen.getByText('Make yourself at home.')).toBeTruthy()
      expect(
        screen.getByText(/Invite a carer without joining a stable/),
      ).toBeTruthy()
      expect(
        screen.getByText(/even when your horse moves to another stable/),
      ).toBeTruthy()
      expect(
        screen
          .getByRole('link', { name: 'Skip to content' })
          .getAttribute('href'),
      ).toBe('#main-content')
      expect(
        screen.getAllByRole('link', { name: 'Create your account' }),
      ).toHaveLength(2)
      for (const link of screen.getAllByRole('link', {
        name: 'Create your account',
      })) {
        expect(link.getAttribute('href')).toBe('/sign-up/$')
      }
      expect(
        screen.getByRole('link', { name: 'Plans' }).getAttribute('href'),
      ).toBe('/pricing')
      for (const link of screen.getAllByRole('link', { name: 'Sign in' })) {
        expect(link.getAttribute('href')).toBe('/sign-in/$')
      }
      expect(screen.getByRole('combobox', { name: 'Language' })).toBeTruthy()
      const copy = container.textContent?.toLowerCase() ?? ''
      for (const claim of forbiddenLandingClaims)
        expect(copy).not.toContain(claim)
    },
  )

  it.each(directions)(
    '$name translates through the shared footer language selector',
    async ({ Direction }) => {
      render(
        <LocaleProvider>
          <Direction theme="dark" />
        </LocaleProvider>,
      )
      const selector = screen.getByRole('combobox', { name: 'Language' })
      await waitFor(() => expect(selector.hasAttribute('disabled')).toBe(false))
      fireEvent.change(selector, { target: { value: 'pl' } })
      expect(await screen.findByText('Poczuj się jak u siebie.')).toBeTruthy()
      expect(screen.getByText('Historia, która zostaje z koniem.')).toBeTruthy()
      expect(screen.getAllByRole('link', { name: 'Załóż konto' })).toHaveLength(
        2,
      )
      expect(document.documentElement.lang).toBe('pl')
      expect(window.localStorage.getItem(GUEST_LOCALE_KEY)).toBe('pl')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      fireEvent.change(selector, { target: { value: 'en' } })
      expect(await screen.findByText('Make yourself at home.')).toBeTruthy()
    },
  )

  it('retains the refined hero and responsive eager photographic source', () => {
    const { container } = render(<FieldJournal />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'A little less admin. A little more time at the yard.',
    )
    const image = screen.getByRole('img')
    expect(image.getAttribute('fetchpriority')).toBe('high')
    expect(image.getAttribute('loading')).toBe('eager')
    expect(image.getAttribute('width')).toBe('1600')
    expect(
      container.querySelector('source[media="(max-width: 699px)"]'),
    ).toBeTruthy()
  })

  it('loads editorial imagery lazily and keeps type-only directions free of imagery', () => {
    const editorial = render(<YardEditorial />)
    expect(screen.getByRole('img').getAttribute('loading')).toBe('lazy')
    editorial.unmount()
    for (const Direction of [WorkingJournal, PineStatement]) {
      const view = render(<Direction />)
      expect(screen.queryByRole('img')).toBeNull()
      view.unmount()
    }
  })
})
