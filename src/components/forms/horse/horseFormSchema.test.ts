import { describe, expect, it } from 'vitest'

import { horseFormSchema } from './horseFormSchema'

const validHorse = {
  name: 'Maple',
  ownerName: 'Alex Rider',
  age: '' as const,
  breed: '',
  color: '',
  height: '',
  dateOfBirth: '',
  passportNumber: '',
  microchipNumber: '',
  insuranceProvider: '',
  insurancePolicyNumber: '',
  sire: '',
  dam: '',
  discipline: '',
  dewormingNotes: '',
  allergies: [],
  emergencyNotes: '',
  vetName: '',
  vetPhone: '',
  farrierName: '',
  farrierPhone: '',
  nutritionNotes: '',
  nutritionRecommended: [],
  nutritionAvoid: [],
  feedingRoutine: '',
}

describe('horseFormSchema birth details', () => {
  it('accepts a birth year without invented month and day values', () => {
    expect(
      horseFormSchema.safeParse({ ...validHorse, dateOfBirth: '2016' }).success,
    ).toBe(true)
  })

  it('accepts an approximate age instead of a birth date', () => {
    expect(horseFormSchema.safeParse({ ...validHorse, age: 10 }).success).toBe(
      true,
    )
  })

  it('requires either a birth year or an age', () => {
    const result = horseFormSchema.safeParse(validHorse)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path[0])).toEqual(
        expect.arrayContaining(['dateOfBirth', 'age']),
      )
    }
  })

  it('rejects impossible partial dates', () => {
    expect(
      horseFormSchema.safeParse({
        ...validHorse,
        dateOfBirth: '2016-13',
      }).success,
    ).toBe(false)
  })
})
