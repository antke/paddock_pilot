// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { getFunctionName } from 'convex/server'
import { useDocumentActions } from './useDocumentActions'

const mocks = vi.hoisted(() => ({
  add: vi.fn(),
  upload: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}))
vi.mock('convex/react', () => ({
  useMutation: (ref: Parameters<typeof getFunctionName>[0]) =>
    getFunctionName(ref).endsWith('generateUploadUrl')
      ? mocks.upload
      : mocks.add,
}))
vi.mock('#/components/ui/sonner', () => ({
  showAppSuccessToast: mocks.success,
  showAppErrorToast: mocks.error,
}))
afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

it.each([{}, null, { storageId: '' }, { storageId: 42 }])(
  'rejects an unacknowledged upload %j without saving a fileless document',
  async (body) => {
    mocks.upload.mockResolvedValue('https://upload.test')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => body }),
    )
    const { result } = renderHook(() => useDocumentActions({}))
    const file = new File(['sample'], 'sample.pdf', { type: 'application/pdf' })
    await act(async () => {
      await expect(
        result.current.add({
          type: 'other',
          fileName: 'sample.pdf',
          notes: '',
          file: { item: () => file, length: 1 } as unknown as FileList,
        }),
      ).rejects.toThrow('not acknowledged')
    })
    expect(mocks.add).not.toHaveBeenCalled()
    expect(mocks.success).not.toHaveBeenCalled()
  },
)
