import { describe, expect, it } from 'vitest'
import { createTrainingSchemas } from './trainingSchema'

describe('training duration form values', () => {
  const schemas = createTrainingSchemas()
  const values = {
    activities: ['flatwork'],
    format: 'regular',
    status: 'completed',
  }

  it('converts cleared form durations to absent payload values without accepting empty strings in backend schemas', () => {
    for (const schema of [
      schemas.trainingDetailsFormSchema,
      schemas.trainingRecordFormSchema,
    ]) {
      expect(
        schema.parse({ ...values, durationMinutes: '' }).durationMinutes,
      ).toBeUndefined()
      expect(
        schema.parse({ ...values, durationMinutes: 45 }).durationMinutes,
      ).toBe(45)
    }
    for (const schema of [
      schemas.trainingDetailsSchema,
      schemas.trainingRecordSchema,
    ]) {
      expect(schema.safeParse({ ...values, durationMinutes: '' }).success).toBe(
        false,
      )
    }
  })

  it.each([0, -1, 1441, 1.5, '45', null, NaN])(
    'still rejects invalid duration %s',
    (durationMinutes) => {
      for (const schema of [
        schemas.trainingDetailsFormSchema,
        schemas.trainingRecordFormSchema,
      ]) {
        expect(schema.safeParse({ ...values, durationMinutes }).success).toBe(
          false,
        )
      }
    },
  )
})
