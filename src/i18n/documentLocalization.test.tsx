// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { LocaleProvider } from './LocaleProvider'
import { LanguageSelector } from './LanguageSelector'
import { DocumentUploadForm } from '#/components/documents/DocumentUploadForm'

beforeEach(() => {
  localStorage.clear()
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-GB'])
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
it('retains the chosen file, document type and notes through translated validation and a failed upload', async () => {
  const save = vi
    .fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce(undefined)
  render(
    <LocaleProvider>
      <LanguageSelector />
      <DocumentUploadForm onSubmit={save} />
    </LocaleProvider>,
  )
  const name = screen.getByLabelText<HTMLInputElement>('Document name')
  fireEvent.submit(name.closest('form')!)
  await screen.findByText('Choose a file to upload.')
  const file = new File(['test'], 'Paszport Łąki.txt', { type: 'text/plain' })
  const files = Object.assign([file], {
    item: (index: number) => (index === 0 ? file : null),
  })
  fireEvent.change(screen.getByLabelText('File (required)'), {
    target: { files },
  })
  await waitFor(() => expect(name.value).toBe(file.name))
  fireEvent.change(name, { target: { value: 'a'.repeat(181) } })
  fireEvent.blur(name)
  fireEvent.change(screen.getByLabelText('Type'), {
    target: { value: 'passport' },
  })
  fireEvent.change(screen.getByLabelText('Notes (optional)'), {
    target: { value: 'Własna notatka' },
  })
  await screen.findByText('Document name cannot be longer than 180 characters.')
  const selector = screen.getByRole('combobox', { name: 'Language' })
  act(() => selector.focus())
  fireEvent.change(selector, { target: { value: 'pl' } })
  await screen.findByText('Nazwa dokumentu może mieć maksymalnie 180 znaków.')
  expect(document.activeElement).toBe(selector)
  expect(name.value).toHaveLength(181)
  expect(screen.getByText(file.name)).toBeTruthy()
  expect(screen.getByLabelText<HTMLSelectElement>('Typ').value).toBe('passport')
  fireEvent.change(name, { target: { value: file.name } })
  fireEvent.submit(name.closest('form')!)
  await screen.findByText(
    'Nie udało się dodać dokumentu. Plik i wprowadzone dane zostały zachowane. Spróbuj ponownie.',
  )
  fireEvent.change(screen.getByRole('combobox', { name: 'Język' }), {
    target: { value: 'en' },
  })
  expect(
    screen.getByText(
      'Could not add this document. Your file and details are still here. Please try again.',
    ),
  ).toBeTruthy()
  expect(save).toHaveBeenCalledTimes(1)
  fireEvent.submit(name.closest('form')!)
  await waitFor(() => expect(save).toHaveBeenCalledTimes(2))
  expect(save).toHaveBeenLastCalledWith(
    expect.objectContaining({
      file: files,
      type: 'passport',
      notes: 'Własna notatka',
      fileName: file.name,
    }),
  )
})
