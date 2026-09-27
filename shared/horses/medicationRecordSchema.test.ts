import { describe, expect, it } from 'vitest'
import {
  medicationRecordAddSchema,
  medicationRecordFormSchema,
} from './medicationRecordSchema'

const base = {
  horseId: 'sample',
  medicationName: 'Sample course',
  dosage: 'As prescribed',
  frequency: '',
  startDate: '2026-09-18',
  prescribedBy: '',
  reason: '',
  notes: '',
  status: 'active' as const,
}
describe('medication date order', () => {
  it.each([medicationRecordAddSchema, medicationRecordFormSchema])(
    'rejects reversed dates at the shared form and server boundary',
    (schema) => {
      const result = schema.safeParse({ ...base, endDate: '2026-09-17' })
      expect(result.success).toBe(false)
      if (!result.success)
        expect(result.error.issues[0].path).toEqual(['endDate'])
      expect(schema.safeParse({ ...base, endDate: '2026-09-18' }).success).toBe(
        true,
      )
      expect(schema.safeParse({ ...base, endDate: '' }).success).toBe(true)
    },
  )
})
