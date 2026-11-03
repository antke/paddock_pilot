// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HorseProfileForm } from '#/components/horses/HorseProfileForm'
import { parseHorseEditSearch } from './horseEditSection'
import type { HorseEditSection } from './horseEditSection'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function renderEditor(focusSection?: HorseEditSection) {
  render(
    <HorseProfileForm
      mode="edit"
      initialValues={{ name: 'Maple', ownerName: 'Alex Rider' }}
      contactMode="copied"
      focusSection={focusSection}
      uploadImage={vi.fn()}
      save={vi.fn().mockResolvedValue('horse')}
      onSaved={vi.fn()}
    />,
  )
}

function sectionToggle(name: string) {
  return screen.getByRole('button', { name: new RegExp(`^${name}`) })
}

describe('focused horse editor entry', () => {
  it('accepts only known sections from the URL', () => {
    expect(parseHorseEditSearch({ section: 'feeding' })).toEqual({
      section: 'feeding',
    })
    for (const section of ['details', ['care'], undefined, 1])
      expect(parseHorseEditSearch({ section })).toEqual({})
  })

  it('keeps optional sections collapsed for the general editor', () => {
    renderEditor()
    for (const name of ['Care', 'Nutrition'])
      expect(sectionToggle(name).getAttribute('aria-expanded')).toBe('false')
    // Profile & health was folded into Horse details and Care & records.
    expect(screen.queryByRole('button', { name: /^Profile/ })).toBeNull()
  })

  it.each([
    { section: 'identification', expanded: 'Care', focused: 'Passport number' },
    { section: 'care', expanded: 'Care', focused: 'Vet name' },
    { section: 'feeding', expanded: 'Nutrition', focused: 'Feeding routine' },
  ] as const)(
    'opens $expanded and focuses $focused for $section',
    async ({ section, expanded, focused }) => {
      renderEditor(section)
      for (const name of ['Care', 'Nutrition'])
        expect(sectionToggle(name).getAttribute('aria-expanded')).toBe(
          String(name === expanded),
        )
      await waitFor(() =>
        expect(document.activeElement).toBe(screen.getByLabelText(focused)),
      )
    },
  )

  it('focuses the photo control in Horse details for Change photo', async () => {
    renderEditor('photo')
    const picture = screen.getByLabelText('Profile picture')
    expect(
      picture.closest('[data-horse-edit-section="details"]'),
    ).not.toBeNull()
    await waitFor(() => expect(document.activeElement?.tagName).toBe('BUTTON'))
    // The visible upload button stands in for the visually hidden file input.
    expect(picture.parentElement?.contains(document.activeElement)).toBe(true)
  })

  it('focuses the first Horse details control for Edit profile', async () => {
    renderEditor('profile')
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByLabelText('Horse name')),
    )
  })
})
