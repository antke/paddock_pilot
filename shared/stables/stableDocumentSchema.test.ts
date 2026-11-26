import { describe, expect, it } from 'vitest'

import {
  maxDocumentBytes,
  stableDocumentFormSchema,
} from './stableDocumentSchema'

const baseDocument = {
  horseId: '',
  type: 'other' as const,
  fileName: 'Passport scan',
  notes: '',
}

describe('stable document form schema', () => {
  it('requires a selected file before submission', () => {
    expect(stableDocumentFormSchema.safeParse(baseDocument).success).toBe(false)
    expect(
      stableDocumentFormSchema.safeParse({
        ...baseDocument,
        file: { length: 1 } as FileList,
      }).success,
    ).toBe(true)
  })

  it('refuses files over the upload limit before uploading', () => {
    const file = (size: number) =>
      ({ length: 1, 0: { size } }) as unknown as FileList
    expect(
      stableDocumentFormSchema.safeParse({
        ...baseDocument,
        file: file(maxDocumentBytes),
      }).success,
    ).toBe(true)
    expect(
      stableDocumentFormSchema.safeParse({
        ...baseDocument,
        file: file(maxDocumentBytes + 1),
      }).success,
    ).toBe(false)
  })
})
