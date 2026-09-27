// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Id } from 'convex/_generated/dataModel'
import { HorseProfileForm } from './HorseProfileForm'

const horseId = 'sample-horse' as Id<'horses'>
const imageId = 'sample-image' as Id<'_storage'>
const initialValues = { name: 'Maple', ownerName: 'Alex Rider', age: 10 }
function files(file: File) {
  return Object.assign([file], {
    item: (index: number) => (index === 0 ? file : null),
  }) as unknown as FileList
}
function photo(name = 'maple.png') {
  return new File(['sample image'], name, { type: 'image/png' })
}
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: Error) => void
  const promise = new Promise<T>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
function setup(
  overrides: Partial<React.ComponentProps<typeof HorseProfileForm>> = {},
) {
  const props = {
    mode: 'edit' as const,
    initialValues,
    uploadImage: vi.fn().mockResolvedValue(imageId),
    save: vi.fn().mockResolvedValue(horseId),
    onSaved: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
  const view = render(<HorseProfileForm {...props} />)
  const name = screen.getByLabelText<HTMLInputElement>('Horse name')
  const form = name.closest('form')!
  const imageInput = screen.getByLabelText('Profile picture')
  return { ...view, props, name, form, imageInput }
}
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('linked birth date and age fields', () => {
  function setToday() {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 8, 27))
  }
  function change(label: string, nextValue: string) {
    fireEvent.change(screen.getByLabelText(label), {
      target: { value: nextValue },
    })
  }
  function value(label: string) {
    return screen.getByLabelText<HTMLInputElement>(label).value
  }

  it('initializes linked fields and recalculates when year, month or day changes', () => {
    setToday()
    setup()
    expect(value('Year')).toBe('2016')
    change('Year', '2020')
    expect(value('Or current age')).toBe('6')
    change('Month', '10')
    expect(value('Or current age')).toBe('5')
    change('Month', '9')
    expect(value('Or current age')).toBe('6')
    change('Day', '28')
    expect(value('Or current age')).toBe('5')
    change('Day', '27')
    expect(value('Or current age')).toBe('6')
    fireEvent.blur(screen.getByLabelText('Month'))
    expect(value('Month')).toBe('09')
  })

  it('updates the year from age, keeps a known birthday, and submits consistent values', async () => {
    setToday()
    const { form, props } = setup({
      initialValues: { ...initialValues, dateOfBirth: '2017-10-12' },
    })
    expect(value('Or current age')).toBe('8')
    change('Or current age', '12')
    expect(value('Year')).toBe('2013')
    expect(value('Month')).toBe('10')
    expect(value('Day')).toBe('12')
    fireEvent.submit(form)
    await waitFor(() => expect(props.save).toHaveBeenCalledTimes(1))
    expect(vi.mocked(props.save).mock.calls[0][0]).toMatchObject({
      age: 12,
      dateOfBirth: '2013-10-12',
    })
  })

  it('clears stale derived values while a date is incomplete or invalid', () => {
    setToday()
    setup()
    change('Year', '20')
    expect(value('Or current age')).toBe('')
    change('Year', '2020')
    change('Month', '13')
    expect(value('Or current age')).toBe('')
    change('Month', '')
    expect(value('Or current age')).toBe('6')
    change('Year', '')
    expect(value('Or current age')).toBe('')
    change('Or current age', '0')
    expect(value('Year')).toBe('2026')
    expect(value('Month')).toBe('')
    change('Or current age', '')
    expect(value('Year')).toBe('')
  })
})

describe('horse profile lifecycle', () => {
  it.each(['create', 'edit'] as const)(
    'saves an explicitly added custom breed in %s mode',
    async (mode) => {
      const { props, form } = setup({ mode })
      fireEvent.click(screen.getByRole('button', { name: /Profile & health/ }))
      fireEvent.click(screen.getByRole('button', { name: 'Add breed' }))
      fireEvent.change(screen.getByLabelText('New breed name'), {
        target: { value: '  Local mountain pony  ' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Use breed' }))
      expect(props.save).not.toHaveBeenCalled()
      fireEvent.submit(form)
      await waitFor(() => expect(props.save).toHaveBeenCalledTimes(1))
      expect(vi.mocked(props.save).mock.calls[0][0].breed).toBe(
        'Local mountain pony',
      )
    },
  )

  it('accepts a saved stable breed and canonicalizes case without adding a duplicate', async () => {
    const { props, form } = setup({
      breedSuggestions: ['Local mountain pony'],
      initialValues: { ...initialValues, breed: 'local MOUNTAIN pony' },
    })
    fireEvent.submit(form)
    await waitFor(() => expect(props.save).toHaveBeenCalledTimes(1))
    expect(vi.mocked(props.save).mock.calls[0][0].breed).toBe(
      'Local mountain pony',
    )
  })

  it.each([false, true])(
    'retains an unmatched breed and blocks saving (blur: %s)',
    async (blur) => {
      const save = vi.fn().mockResolvedValue(horseId)
      const { props, form } = setup({
        save,
        initialValues: { ...initialValues, breed: 'Arabian' },
      })
      fireEvent.click(screen.getByRole('button', { name: /Profile & health/ }))
      const breed = screen.getByLabelText<HTMLInputElement>('Breed')
      fireEvent.change(breed, { target: { value: 'Imaginary horse' } })
      if (blur) fireEvent.blur(breed)
      fireEvent.submit(form)
      await screen.findByText(
        'Choose a breed from the list, add a new breed, or clear this field.',
      )
      expect(breed.value).toBe('Imaginary horse')
      expect(props.save).not.toHaveBeenCalled()
      expect(props.uploadImage).not.toHaveBeenCalled()
      expect(breed.getAttribute('aria-invalid')).toBe('true')
      expect(
        document.getElementById(breed.getAttribute('aria-describedby')!)
          ?.textContent,
      ).toContain('Choose a breed')
      await waitFor(() => expect(document.activeElement).toBe(breed))
      fireEvent.change(breed, { target: { value: '  arabian  ' } })
      fireEvent.submit(form)
      await waitFor(() => expect(props.save).toHaveBeenCalledTimes(1))
      expect(save.mock.calls[0][0].breed).toBe('Arabian')
    },
  )

  it('preserves an existing legacy breed while rejecting new unmatched text and allowing a clear', async () => {
    const save = vi.fn().mockRejectedValue(new Error('local save failure'))
    const { form } = setup({
      save,
      initialValues: { ...initialValues, breed: 'Historic local breed' },
    })
    fireEvent.submit(form)
    await waitFor(() => expect(save).toHaveBeenCalledTimes(1))
    expect(save.mock.calls[0][0].breed).toBe('Historic local breed')
    fireEvent.click(screen.getByRole('button', { name: /Profile & health/ }))
    const breed = screen.getByLabelText<HTMLInputElement>('Breed')
    fireEvent.change(breed, { target: { value: 'A different unknown breed' } })
    fireEvent.submit(form)
    await screen.findByText(
      'Choose a breed from the list, add a new breed, or clear this field.',
    )
    expect(save).toHaveBeenCalledTimes(1)
    fireEvent.change(breed, { target: { value: '' } })
    fireEvent.submit(form)
    await waitFor(() => expect(save).toHaveBeenCalledTimes(2))
    expect(save.mock.calls[1][0].breed).toBe('')
  })

  it.each(['create', 'edit'] as const)(
    'guards rapid %s submissions, retains the draft on rejected save, and reuses the acknowledged upload',
    async (mode) => {
      const upload = deferred<Id<'_storage'>>()
      const mutation = deferred<Id<'horses'>>()
      const uploadImage = vi.fn().mockReturnValue(upload.promise)
      const save = vi
        .fn()
        .mockReturnValueOnce(mutation.promise)
        .mockResolvedValue(horseId)
      const onSaved = vi.fn()
      const { form, name, imageInput } = setup({
        mode,
        uploadImage,
        save,
        onSaved,
      })
      fireEvent.change(name, { target: { value: 'Maple revised' } })
      fireEvent.change(imageInput, { target: { files: files(photo()) } })
      fireEvent.submit(form)
      fireEvent.submit(form)
      await waitFor(() => expect(uploadImage).toHaveBeenCalledTimes(1))
      expect(
        screen
          .getByRole('button', { name: 'Uploading photo…' })
          .hasAttribute('disabled'),
      ).toBe(true)
      expect(name.disabled).toBe(true)
      expect(save).not.toHaveBeenCalled()
      expect(onSaved).not.toHaveBeenCalled()
      await act(async () => upload.resolve(imageId))
      expect(
        screen
          .getByRole('button', { name: 'Saving horse…' })
          .getAttribute('aria-busy'),
      ).toBe('true')
      fireEvent.submit(form)
      expect(save).toHaveBeenCalledTimes(1)
      await act(async () => mutation.reject(new Error('offline')))
      expect(screen.getByRole('alert').textContent).toContain(
        'Could not save this horse',
      )
      expect(name.value).toBe('Maple revised')
      expect(name.disabled).toBe(false)
      expect(screen.getByText('maple.png')).toBeTruthy()
      fireEvent.submit(form)
      await waitFor(() => expect(onSaved).toHaveBeenCalledWith(horseId))
      expect(uploadImage).toHaveBeenCalledTimes(1)
      expect(save).toHaveBeenCalledTimes(2)
      expect(save.mock.calls[1][1]).toBe(imageId)
    },
  )

  it('uploads a replacement file instead of reusing the old image after a failed mutation', async () => {
    const uploadImage = vi
      .fn()
      .mockResolvedValueOnce(imageId)
      .mockResolvedValue('replacement-image')
    const save = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(horseId)
    const { form, imageInput, props } = setup({ uploadImage, save })
    fireEvent.change(imageInput, { target: { files: files(photo()) } })
    fireEvent.submit(form)
    await screen.findByText(/Could not save this horse/)
    const replacement = photo('new-photo.png')
    fireEvent.change(imageInput, { target: { files: files(replacement) } })
    fireEvent.submit(form)
    await waitFor(() => expect(props.onSaved).toHaveBeenCalledWith(horseId))
    expect(uploadImage).toHaveBeenCalledTimes(2)
    expect(uploadImage).toHaveBeenLastCalledWith(replacement)
    expect(save.mock.calls[1][1]).toBe('replacement-image')
  })

  it('retains an upload failure and allows removing the file before retrying without an upload', async () => {
    const uploadImage = vi.fn().mockRejectedValue(new Error('upload offline'))
    const { form, imageInput, name, props } = setup({ uploadImage })
    fireEvent.change(name, { target: { value: 'Maple revised' } })
    fireEvent.change(imageInput, { target: { files: files(photo()) } })
    fireEvent.submit(form)
    expect(
      await screen.findByText(/Could not upload the horse photo/),
    ).toBeTruthy()
    expect(name.value).toBe('Maple revised')
    expect(screen.getByText('maple.png')).toBeTruthy()
    expect(props.save).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Remove maple.png' }))
    fireEvent.submit(form)
    await waitFor(() => expect(props.onSaved).toHaveBeenCalledWith(horseId))
    expect(uploadImage).toHaveBeenCalledTimes(1)
    expect(props.save).toHaveBeenCalledWith(
      expect.objectContaining({ profileImage: undefined }),
      undefined,
    )
  })

  it('retries only opening after acknowledged save and failed navigation', async () => {
    const opening = deferred<void>()
    const onSaved = vi
      .fn()
      .mockRejectedValueOnce(new Error('route failed'))
      .mockReturnValue(opening.promise)
    const { form, name, imageInput, props } = setup({ onSaved })
    fireEvent.change(imageInput, { target: { files: files(photo()) } })
    fireEvent.submit(form)
    expect(
      await screen.findByText(
        /Your horse was saved, but the profile could not open/,
      ),
    ).toBeTruthy()
    expect(screen.getByText('Horse saved.')).toBeTruthy()
    expect(name.disabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Open horse profile' }))
    fireEvent.submit(form)
    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(2))
    expect(
      screen
        .getByRole('button', { name: 'Opening profile…' })
        .hasAttribute('disabled'),
    ).toBe(true)
    expect(props.save).toHaveBeenCalledTimes(1)
    expect(props.uploadImage).toHaveBeenCalledTimes(1)
    await act(async () => opening.resolve())
    expect(props.save).toHaveBeenCalledTimes(1)
  })

  it('does not save or navigate if the form unmounts while a photo upload is pending', async () => {
    const upload = deferred<Id<'_storage'>>()
    const uploadImage = vi.fn().mockReturnValue(upload.promise)
    const onPendingChange = vi.fn()
    const { form, imageInput, props, unmount } = setup({
      uploadImage,
      onPendingChange,
    })
    fireEvent.change(imageInput, { target: { files: files(photo()) } })
    fireEvent.submit(form)
    await waitFor(() => expect(uploadImage).toHaveBeenCalledTimes(1))
    unmount()
    await act(async () => upload.resolve(imageId))
    expect(props.save).not.toHaveBeenCalled()
    expect(props.onSaved).not.toHaveBeenCalled()
    expect(onPendingChange).toHaveBeenLastCalledWith(false)
  })

  it('rejects invalid details and dropped images, linking the photo error to its visible focus target', async () => {
    const { form, name, imageInput, props } = setup()
    fireEvent.change(name, { target: { value: '' } })
    fireEvent.submit(form)
    await waitFor(() => expect(name.getAttribute('aria-invalid')).toBe('true'))
    expect(props.save).not.toHaveBeenCalled()
    fireEvent.change(name, { target: { value: 'Maple' } })
    fireEvent.drop(
      screen.getByRole('button', { name: /Drop an image here or browse/ }),
      {
        dataTransfer: {
          files: files(
            new File(['notes'], 'notes.txt', { type: 'text/plain' }),
          ),
        },
      },
    )
    fireEvent.submit(form)
    const error = await screen.findByText('Choose an image file.')
    const replace = screen.getByRole('button', { name: 'Replace notes.txt' })
    expect(replace.getAttribute('aria-describedby')?.split(' ')).toContain(
      error.id,
    )
    expect(imageInput.getAttribute('aria-describedby')?.split(' ')).toContain(
      error.id,
    )
    await waitFor(() => expect(document.activeElement).toBe(replace))
    const large = photo('large.png')
    Object.defineProperty(large, 'size', { value: 5 * 1024 * 1024 + 1 })
    fireEvent.change(imageInput, { target: { files: files(large) } })
    fireEvent.submit(form)
    expect(
      await screen.findByText('Choose an image no larger than 5 MB.'),
    ).toBeTruthy()
    expect(props.uploadImage).not.toHaveBeenCalled()
    expect(props.save).not.toHaveBeenCalled()
  })

  it('requires confirmation before resetting a dirty draft and clears its selected photo on confirmation', async () => {
    const { name, imageInput, props } = setup()
    fireEvent.change(name, { target: { value: 'Maple revised' } })
    fireEvent.change(imageInput, { target: { files: files(photo()) } })
    fireEvent.click(screen.getByRole('button', { name: 'Reset form' }))
    expect(
      await screen.findByRole('alertdialog', { name: 'Discard your changes?' }),
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }))
    expect(name.value).toBe('Maple revised')
    expect(screen.getByText('maple.png')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Reset form' }))
    fireEvent.click(
      await screen.findByRole('button', { name: 'Discard changes' }),
    )
    await waitFor(() => expect(name.value).toBe('Maple'))
    expect(screen.queryByText('maple.png')).toBeNull()
    expect(props.save).not.toHaveBeenCalled()
  })
})
