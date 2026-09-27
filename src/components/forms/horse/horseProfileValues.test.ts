import { afterEach, describe, expect, it, vi } from 'vitest'
import { uploadHorseProfileImage } from './horseProfileValues'

afterEach(() => vi.unstubAllGlobals())

describe('horse photo upload acknowledgement', () => {
  it('sends the selected image and returns only an acknowledged storage identifier', async () => {
    const file = new File(['image'], 'horse.png', { type: 'image/png' })
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ storageId: 'sample-storage' }),
    })
    vi.stubGlobal('fetch', fetch)
    await expect(
      uploadHorseProfileImage(
        file,
        async () => 'https://sample.invalid/upload',
      ),
    ).resolves.toBe('sample-storage')
    expect(fetch).toHaveBeenCalledWith('https://sample.invalid/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'image/png' },
      body: file,
    })
  })

  it.each([
    { ok: false, json: async () => ({ storageId: 'not-saved' }) },
    { ok: true, json: async () => ({ storageId: '' }) },
    { ok: true, json: async () => ({}) },
  ])('rejects failed or unacknowledged uploads', async (response) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
    await expect(
      uploadHorseProfileImage(
        new File(['image'], 'horse.png', { type: 'image/png' }),
        async () => 'https://sample.invalid/upload',
      ),
    ).rejects.toThrow()
  })
})
