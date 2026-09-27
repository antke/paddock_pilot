import { describe, expect, it } from 'vitest'
import { stableLocationSchema, stableNameSchema } from './stableSchema'

describe('human-readable stable names and locations', () => {
  it.each([
    'Stajnia Łąka',
    'Żółta Róża',
    'D’Ávila & Sons',
    "Ecurie de l'Étoile",
    'Łódź / Śródmieście',
    '牧場 12',
    'Cafe\u0301 Ranch',
  ])('accepts international letters and familiar punctuation: %s', (value) => {
    expect(stableNameSchema.parse(value)).toBe(value)
    expect(stableLocationSchema.parse(value)).toBe(value)
  })

  it.each([
    'ab',
    'A'.repeat(51),
    'Yard\nNorth',
    '<yard>',
    'Yard\u0000North',
    '🐎 Ranch',
  ])('preserves length and unsupported-character checks: %s', (value) => {
    expect(stableNameSchema.safeParse(value).success).toBe(false)
    expect(stableLocationSchema.safeParse(value).success).toBe(false)
  })

  it('names the location field accurately in errors and trims surrounding whitespace', () => {
    expect(stableNameSchema.parse('  Stajnia Łąka  ')).toBe('Stajnia Łąka')
    const result = stableLocationSchema.safeParse('')
    expect(result.success).toBe(false)
    if (!result.success)
      expect(result.error.issues[0].message).toContain('Location')
  })
})
