import { describe, expect, it } from 'vitest'
import { compareWeightRecordsNewestFirst } from './weightRecordOrder'

describe('weight record chronology', () => {
  it('orders same-date entries by newest creation regardless of source ordering', () => {
    const old = { measuredAt: 100, createdAt: 10, _creationTime: 10 }
    const recent = { measuredAt: 100, createdAt: 20, _creationTime: 20 }
    for (const input of [
      [old, recent],
      [recent, old],
    ])
      expect(input.sort(compareWeightRecordsNewestFirst)).toEqual([recent, old])
    const earlierMeasurement = {
      measuredAt: 50,
      createdAt: 30,
      _creationTime: 30,
    }
    expect(
      [earlierMeasurement, old, recent].sort(compareWeightRecordsNewestFirst),
    ).toEqual([recent, old, earlierMeasurement])
  })
})
