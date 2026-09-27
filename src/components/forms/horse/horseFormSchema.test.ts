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

describe('horseFormSchema photo constraints', () => {
  function imageFiles(size: number, type = 'image/png') {
    const file = new File(['sample'], 'photo.png', { type })
    Object.defineProperty(file, 'size', { value: size })
    return Object.assign([file], {
      item: (index: number) => (index === 0 ? file : null),
    })
  }

  it('matches the backend inclusive 5 MiB image limit', () => {
    expect(
      horseFormSchema.safeParse({
        ...validHorse,
        age: 10,
        profileImage: imageFiles(5 * 1024 * 1024),
      }).success,
    ).toBe(true)
    for (const profileImage of [
      imageFiles(5 * 1024 * 1024 + 1),
      imageFiles(10, 'application/pdf'),
      { length: 1 },
    ]) {
      const result = horseFormSchema.safeParse({
        ...validHorse,
        age: 10,
        profileImage,
      })
      expect(result.success).toBe(false)
      if (!result.success)
        expect(result.error.issues[0].path).toEqual(['profileImage'])
    }
  })

  it('accepts an omitted or cleared optional photo without retaining null in the payload', () => {
    for (const profileImage of [undefined, null]) {
      expect(
        horseFormSchema.parse({ ...validHorse, age: 10, profileImage })
          .profileImage,
      ).toBeUndefined()
    }
  })
})
