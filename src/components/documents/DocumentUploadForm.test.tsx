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
import { DocumentUploadForm } from './DocumentUploadForm'

afterEach(cleanup)
function files() {
  const file = new File(['Sample paperwork'], 'sample-record.txt', {
    type: 'text/plain',
  })
  return Object.assign([file], {
    item: (index: number) => (index === 0 ? file : null),
  }) as unknown as FileList
}

describe('DocumentUploadForm', () => {
  it('links validation errors on names and the visible file control without duplicate field IDs', async () => {
    const { container } = render(
      <>
        <DocumentUploadForm onSubmit={async () => {}} />
        <DocumentUploadForm onSubmit={async () => {}} />
      </>,
    )
    const names = screen.getAllByLabelText<HTMLInputElement>('Document name')
    expect(names[0].id).not.toBe(names[1].id)
    fireEvent.submit(names[0].closest('form')!)
    await waitFor(() =>
      expect(names[0].getAttribute('aria-invalid')).toBe('true'),
    )
    const error = document.getElementById(
      names[0].getAttribute('aria-describedby')!,
    )
    expect(error?.textContent).toContain('Document name is required')
    const browse = screen.getAllByRole('button', {
      name: /Drop a file here or browse/,
    })[0]
    const fileError = document.getElementById(
      browse.getAttribute('aria-describedby')!,
    )
    expect(fileError?.textContent).toContain('Choose a file to upload')
    expect(
      container
        .querySelector('input[type=file]')
        ?.getAttribute('aria-describedby'),
    ).toBe(fileError?.id)
  })

  it('guards repeated submits, keeps rejected values, and acknowledges fixed-horse success before reset', async () => {
    let reject!: (reason: Error) => void
    const pending = new Promise<void>((_, fail) => {
      reject = fail
    })
    const onSubmit = vi
      .fn()
      .mockReturnValueOnce(pending)
      .mockResolvedValueOnce(undefined)
    const onPendingChange = vi.fn()
    render(
      <DocumentUploadForm
        fixedHorseId={'sample-horse' as Id<'horses'>}
        onSubmit={onSubmit}
        onPendingChange={onPendingChange}
      />,
    )
    const fileInput = screen.getByLabelText('File (required)')
    fireEvent.change(fileInput, { target: { files: files() } })
    const name = screen.getByLabelText<HTMLInputElement>('Document name')
    await waitFor(() => expect(name.value).toBe('sample-record.txt'))
    fireEvent.change(screen.getByLabelText('Notes (optional)'), {
      target: { value: 'Keep this sample note' },
    })
    fireEvent.submit(name.closest('form')!)
    fireEvent.submit(name.closest('form')!)
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(
      screen
        .getByRole('button', { name: 'Uploading…' })
        .hasAttribute('disabled'),
    ).toBe(true)
    expect(screen.queryByLabelText('Horse (optional)')).toBeNull()
    await act(async () => reject(new Error('offline')))
    expect(screen.getByRole('alert').textContent).toContain(
      'Your file and details are still here',
    )
    expect(name.value).toBe('sample-record.txt')
    expect(screen.getByText('sample-record.txt')).toBeTruthy()
    fireEvent.submit(name.closest('form')!)
    await waitFor(() => expect(name.value).toBe(''))
    expect(onSubmit).toHaveBeenLastCalledWith(
      expect.objectContaining({
        horseId: 'sample-horse',
        notes: 'Keep this sample note',
      }),
    )
    expect(onPendingChange.mock.calls.map(([value]) => value)).toEqual([
      true,
      false,
      true,
      false,
    ])
    expect(
      await screen.findByRole('button', { name: /Drop a file here or browse/ }),
    ).toBeTruthy()
  })
})
