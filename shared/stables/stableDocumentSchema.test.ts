import { describe, expect, it } from 'vitest'

import { stableDocumentFormSchema } from './stableDocumentSchema'

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
})
