// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DocumentDownloadAction } from './DocumentDownloadAction'

const toastMocks = vi.hoisted(() => ({
  showAppErrorToast: vi.fn(),
}))

vi.mock('#/components/ui/sonner', () => toastMocks)

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  Reflect.deleteProperty(URL, 'createObjectURL')
  Reflect.deleteProperty(URL, 'revokeObjectURL')
  toastMocks.showAppErrorToast.mockReset()
})

describe('DocumentDownloadAction', () => {
  it('downloads the stored file with its displayed filename', async () => {
    const file = new Blob(['passport'], { type: 'application/pdf' })
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      blob: vi.fn().mockResolvedValue(file),
    })
    vi.stubGlobal('fetch', fetchMock)

    const createObjectUrl = vi.fn().mockReturnValue('blob:downloaded-passport')
    const revokeObjectUrl = vi.fn()
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: createObjectUrl,
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectUrl,
    })
    let activatedLink: HTMLAnchorElement | undefined
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      function recordDownload(this: HTMLAnchorElement) {
        activatedLink = this
      },
    )

    render(
      <DocumentDownloadAction
        fileName="Thistle Run passport.pdf"
        fileState="available"
        fileUrl="https://files.example/passport"
      />,
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Download Thistle Run passport.pdf',
      }),
    )

    await waitFor(() => expect(activatedLink).toBeDefined())

    expect(fetchMock).toHaveBeenCalledWith(
      'https://files.example/passport',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
    expect(createObjectUrl).toHaveBeenCalledWith(file)
    expect(activatedLink?.download).toBe('Thistle Run passport.pdf')
    expect(activatedLink?.href).toBe('blob:downloaded-passport')
    await waitFor(() =>
      expect(revokeObjectUrl).toHaveBeenCalledWith('blob:downloaded-passport'),
    )
  })

  it('prevents duplicate downloads while the file is being prepared', async () => {
    let resolveFile: ((value: Blob) => void) | undefined
    const filePromise = new Promise<Blob>((resolve) => {
      resolveFile = resolve
    })
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      blob: () => filePromise,
    })
    vi.stubGlobal('fetch', fetchMock)
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn().mockReturnValue('blob:download'),
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    })
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      () => undefined,
    )

    render(
      <DocumentDownloadAction
        fileName="vaccination.pdf"
        fileState="available"
        fileUrl="https://files.example/vaccination"
      />,
    )

    const button = screen.getByRole('button', {
      name: 'Download vaccination.pdf',
    })
    fireEvent.click(button)
    fireEvent.click(button)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(button.getAttribute('aria-busy')).toBe('true')
    expect((button as HTMLButtonElement).disabled).toBe(true)

    resolveFile?.(new Blob(['vaccination']))

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Download vaccination.pdf' }),
      ).toHaveProperty('disabled', false),
    )
  })

  it('explains how to recover when the download fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

    render(
      <DocumentDownloadAction
        fileName="insurance.pdf"
        fileState="available"
        fileUrl="https://files.example/insurance"
      />,
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Download insurance.pdf' }),
    )

    await waitFor(() =>
      expect(toastMocks.showAppErrorToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Could not download document',
        }),
      ),
    )
    expect(
      screen.getByRole<HTMLButtonElement>('button', {
        name: 'Download insurance.pdf',
      }).disabled,
    ).toBe(false)
  })

  it('keeps the download action visible but disabled when no file is attached', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    render(
      <DocumentDownloadAction
        fileName="insurance summary.pdf"
        fileState="metadata-only"
      />,
    )

    const button = screen.getByRole<HTMLButtonElement>('button', {
      name: 'Download unavailable for insurance summary.pdf: No file is attached',
    })

    expect(button.disabled).toBe(true)
    expect(button.title).toBe('')
    expect(button.textContent).toBe('Download')
    expect(button.className).toContain('border-primary')
    expect(button.parentElement?.getAttribute('aria-label')).toBe(
      'Download unavailable: No file is attached',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
