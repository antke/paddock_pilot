import { describe, expect, it } from 'vitest'
import { getHorseDisplayName } from './horseDisplayName'
import { horseInputSchema } from './horseSchema'

describe('horse display names', () => {
  it('only uses a nonblank nickname when explicitly enabled', () => {
    const horse = { name: 'Secretariat', nickname: ' Big Red ' }
    expect(getHorseDisplayName(horse)).toBe('Secretariat')
    expect(getHorseDisplayName({ ...horse, useNickname: false })).toBe(
      'Secretariat',
    )
    expect(getHorseDisplayName({ ...horse, useNickname: true })).toBe('Big Red')
    expect(
      getHorseDisplayName({ name: 'Secretariat', useNickname: true }),
    ).toBe('Secretariat')
    expect(
      getHorseDisplayName({ ...horse, nickname: ' ', useNickname: true }),
    ).toBe('Secretariat')
    expect(getHorseDisplayName(null)).toBeUndefined()
  })

  it('trims nicknames, allows legacy records, and rejects enabled blank or oversized nicknames', () => {
    const horse = { name: 'Secretariat', age: 10, ownerName: 'Alex' }
    expect(horseInputSchema.safeParse(horse).success).toBe(true)
    expect(
      horseInputSchema.parse({ ...horse, nickname: ' Red ', useNickname: true })
        .nickname,
    ).toBe('Red')
    for (const nickname of ['', ' ', undefined, 'a'.repeat(101)]) {
      const result = horseInputSchema.safeParse({
        ...horse,
        nickname,
        useNickname: true,
      })
      expect(result.success).toBe(false)
      if (!result.success)
        expect(result.error.issues[0].path).toEqual(['nickname'])
    }
    expect(
      horseInputSchema.parse({ ...horse, nickname: '', useNickname: false })
        .nickname,
    ).toBeUndefined()
  })
})
