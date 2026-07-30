// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FileUploadField } from './FileUploadField'

afterEach(cleanup)

describe('FileUploadField', () => {
  it('shows a selected image as an attachment and allows removing it', () => {
    const onFilesChange = vi.fn()
    const { container } = render(
      <FileUploadField
        id="profile-image"
        label="Profile picture"
        kind="image"
        onFilesChange={onFilesChange}
      />,
    )
    const input =
      container.querySelector<HTMLInputElement>('input[type="file"]')
    const image = new File(['image'], 'maple-profile.png', {
      type: 'image/png',
    })

    fireEvent.change(input!, { target: { files: [image] } })

    expect(screen.getByText('maple-profile.png')).toBeTruthy()
    expect(screen.getByText(/PNG · 5 B · Ready to upload/)).toBeTruthy()
    expect(onFilesChange).toHaveBeenLastCalledWith([image])

    fireEvent.click(
      screen.getByRole('button', { name: 'Remove maple-profile.png' }),
    )

    expect(onFilesChange).toHaveBeenLastCalledWith(null)
    expect(
      screen.getByRole('button', { name: /drop an image here or browse/i }),
    ).toBeTruthy()
  })

  it('accepts a file dropped onto the upload target', () => {
    const onFilesChange = vi.fn()
    render(
      <FileUploadField
        id="document"
        label="File"
        onFilesChange={onFilesChange}
      />,
    )
    const file = new File(['record'], 'passport.pdf', {
      type: 'application/pdf',
    })

    fireEvent.drop(
      screen.getByRole('button', { name: /drop a file here or browse/i }),
      { dataTransfer: { files: [file] } },
    )

    expect(screen.getByText('passport.pdf')).toBeTruthy()
    expect(onFilesChange).toHaveBeenCalledWith([file])
  })

  it('clears the attachment preview when the parent form resets', () => {
    const file = new File(['record'], 'passport.pdf', {
      type: 'application/pdf',
    })
    const files = [file] as unknown as FileList
    const { rerender } = render(
      <FileUploadField
        id="document"
        label="File"
        files={files}
        onFilesChange={() => undefined}
      />,
    )

    expect(screen.getByText('passport.pdf')).toBeTruthy()

    rerender(
      <FileUploadField
        id="document"
        label="File"
        files={null}
        onFilesChange={() => undefined}
      />,
    )

    expect(
      screen.getByRole('button', { name: /drop a file here or browse/i }),
    ).toBeTruthy()
  })
})
