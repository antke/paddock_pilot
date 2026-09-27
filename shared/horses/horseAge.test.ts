import { describe, expect, it } from 'vitest'

import {
  birthDateForHorseAge,
  calculateHorseAge,
  composeHorseBirthDate,
  getTodayDateKey,
  splitHorseBirthDate,
} from './horseAge'

describe('birthDateForHorseAge', () => {
  const asOf = new Date(2026, 8, 27)

  it('estimates only the year when the birthday is unknown', () => {
    expect(birthDateForHorseAge(10, '', asOf)).toBe('2016')
    expect(birthDateForHorseAge(0, '', asOf)).toBe('2026')
    expect(birthDateForHorseAge(100, '', asOf)).toBe('1926')
  })

  it.each(['2016-03-12', '2015-10-12', '2016-09-27', '2015-09-28', '2015-10'])(
    'preserves birthday precision and produces the requested age for %s',
    (birthday) => {
      const result = birthDateForHorseAge(8, birthday, asOf)
      expect(result.slice(4)).toBe(birthday.slice(4))
      expect(calculateHorseAge(result, asOf)).toBe(8)
    },
  )

  it('drops an impossible leap day without inventing a new birthday', () => {
    const today = new Date(2026, 1, 28)
    expect(birthDateForHorseAge(8, '2020-02-29', today)).toBe('2018-02')
    expect(
      calculateHorseAge(birthDateForHorseAge(8, '2020-02-29', today), today),
    ).toBe(8)
  })

  it.each([-1, 101, 2.5, NaN])(
    'does not infer a birth date for invalid age %s',
    (age) => {
      expect(birthDateForHorseAge(age, '', asOf)).toBe('')
    },
  )
})

describe('calculateHorseAge', () => {
  const asOf = new Date(2026, 6, 23)

  it('calculates age after the birthday has passed', () => {
    expect(calculateHorseAge('2017-04-12', asOf)).toBe(9)
  })

  it('subtracts a year when the birthday is still upcoming', () => {
    expect(calculateHorseAge('2017-09-03', asOf)).toBe(8)
  })

  it('returns zero for a foal born today', () => {
    expect(calculateHorseAge('2026-07-23', asOf)).toBe(0)
  })

  it('returns undefined for impossible dates', () => {
    expect(calculateHorseAge('2026-02-31', asOf)).toBeUndefined()
  })

  it('accepts a known birth year without inventing a month or day', () => {
    expect(calculateHorseAge('2016', asOf)).toBe(10)
  })

  it('uses a known month without requiring a day', () => {
    expect(calculateHorseAge('2017-09', asOf)).toBe(8)
    expect(calculateHorseAge('2017-04', asOf)).toBe(9)
  })
})

describe('partial horse birth dates', () => {
  it('composes and splits year, month and day precision', () => {
    expect(composeHorseBirthDate({ year: '2016' })).toBe('2016')
    expect(composeHorseBirthDate({ year: '2016', month: '4' })).toBe('2016-04')
    expect(composeHorseBirthDate({ year: '2016', month: '4', day: '9' })).toBe(
      '2016-04-09',
    )
    expect(splitHorseBirthDate('2016-04')).toEqual({
      year: '2016',
      month: '04',
      day: '',
    })
  })
})

describe('getTodayDateKey', () => {
  it('formats a local calendar date for a date input', () => {
    expect(getTodayDateKey(new Date(2026, 6, 3))).toBe('2026-07-03')
  })
})
