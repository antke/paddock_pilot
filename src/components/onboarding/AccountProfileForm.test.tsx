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
import { AccountProfileFormView } from './AccountProfileForm'

const initialValues = { displayName: 'Sample rider', phone: '123' }
function files(file: File) {
  return Object.assign([file], {
    item: (index: number) => (index === 0 ? file : null),
  }) as unknown as FileList
}
const image = () =>
  new File(['sample bytes'], 'portrait.png', { type: 'image/png' })
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
describe('account profile acknowledgement', () => {
  it('links errors and rejects non-images and oversized images before save', async () => {
    const onSave = vi.fn()
    render(
      <>
        <AccountProfileFormView
          initialValues={initialValues}
          onSave={onSave}
          onSaved={() => {}}
        />
        <AccountProfileFormView
          initialValues={initialValues}
          onSave={onSave}
          onSaved={() => {}}
        />
      </>,
    )
    const names = screen.getAllByLabelText<HTMLInputElement>('Preferred name')
    expect(names[0].id).not.toBe(names[1].id)
    fireEvent.change(names[0], { target: { value: '' } })
    fireEvent.submit(names[0].closest('form')!)
    await waitFor(() => expect(document.activeElement).toBe(names[0]))
    expect(
      document.getElementById(names[0].getAttribute('aria-describedby')!)
        ?.textContent,
    ).toContain('Add the name')
    fireEvent.change(names[0], { target: { value: 'Rider' } })
    const input = screen.getAllByLabelText('Profile image (optional)')[0]
    fireEvent.change(input, {
      target: {
        files: files(new File(['no'], 'record.txt', { type: 'text/plain' })),
      },
    })
    fireEvent.submit(names[0].closest('form')!)
    expect(await screen.findByText('Choose an image file.')).toBeTruthy()
    const large = image()
    Object.defineProperty(large, 'size', { value: 5 * 1024 * 1024 + 1 })
    fireEvent.change(input, { target: { files: files(large) } })
    fireEvent.submit(names[0].closest('form')!)
    expect(
      await screen.findByText('Choose an image no larger than 5 MB.'),
    ).toBeTruthy()
    expect(onSave).not.toHaveBeenCalled()
  })
  it('retains rejected file and draft, guards repeated submit, clears only acknowledged file', async () => {
    let reject!: (error: Error) => void
    const onSave = vi
      .fn()
      .mockReturnValueOnce(
        new Promise<void>((_, fail) => {
          reject = fail
        }),
      )
      .mockResolvedValue(undefined)
    const saved = vi.fn()
    render(
      <AccountProfileFormView
        initialValues={initialValues}
        onSave={onSave}
        onSaved={saved}
      />,
    )
    const name = screen.getByLabelText<HTMLInputElement>('Preferred name')
    fireEvent.change(name, { target: { value: 'New rider' } })
    fireEvent.change(screen.getByLabelText('Profile image (optional)'), {
      target: { files: files(image()) },
    })
    fireEvent.submit(name.closest('form')!)
    fireEvent.submit(name.closest('form')!)
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1))
    expect(saved).not.toHaveBeenCalled()
    await act(async () => reject(new Error('offline')))
    expect(screen.getByText('portrait.png')).toBeTruthy()
    expect(name.value).toBe('New rider')
    expect(document.activeElement).toBe(screen.getByRole('alert'))
    fireEvent.submit(name.closest('form')!)
    await waitFor(() => expect(saved).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(screen.queryByText('portrait.png')).toBeNull())
    fireEvent.change(screen.getByLabelText('Phone number'), {
      target: { value: '456' },
    })
    fireEvent.submit(name.closest('form')!)
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(3))
    expect(onSave.mock.calls[2][0].profileImage).toBeUndefined()
  })
  it('retries only continuation after profile acknowledgement, with truthful failure and pending state', async () => {
    const save = vi.fn().mockResolvedValue(true)
    const advance = vi
      .fn()
      .mockRejectedValueOnce(new Error('progress failed'))
      .mockResolvedValue(undefined)
    const pending = vi.fn()
    render(
      <AccountProfileFormView
        initialValues={initialValues}
        onSave={save}
        onSaved={advance}
        onPendingChange={pending}
      />,
    )
    const name = screen.getByLabelText('Preferred name')
    fireEvent.change(screen.getByLabelText('Profile image (optional)'), {
      target: { files: files(image()) },
    })
    fireEvent.submit(name.closest('form')!)
    expect(
      await screen.findByRole('button', { name: 'Retry continuing' }),
    ).toBeTruthy()
    expect(screen.getByRole('alert').textContent).toContain(
      'Your profile was saved',
    )
    expect(name.hasAttribute('disabled')).toBe(true)
    await waitFor(() => expect(screen.queryByText('portrait.png')).toBeNull())
    fireEvent.click(screen.getByRole('button', { name: 'Retry continuing' }))
    await waitFor(() => expect(advance).toHaveBeenCalledTimes(2))
    expect(save).toHaveBeenCalledTimes(1)
    expect(pending.mock.calls.map(([value]) => value)).toEqual([
      true,
      false,
      true,
      false,
    ])
    expect(name.hasAttribute('disabled')).toBe(false)
  })
})
