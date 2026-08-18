import { describe, expect, it } from 'vitest'
import { shouldDeleteEventWithHorse } from './horseDeletion'

describe('shouldDeleteEventWithHorse', () => {
  it('deletes an event associated only with the deleted horse', () => {
    expect(
      shouldDeleteEventWithHorse({
        horseId: 'horse-1',
        eventHorseIds: ['horse-1'],
        associatedHorseIds: ['horse-1'],
      }),
    ).toBe(true)
  })

  it('preserves an event with another confirmed horse', () => {
    expect(
      shouldDeleteEventWithHorse({
        horseId: 'horse-1',
        eventHorseIds: ['horse-1', 'horse-2'],
        associatedHorseIds: ['horse-1', 'horse-2'],
      }),
    ).toBe(false)
  })

  it('preserves an event when another horse only has an invitation row', () => {
    expect(
      shouldDeleteEventWithHorse({
        horseId: 'horse-1',
        eventHorseIds: ['horse-1'],
        associatedHorseIds: ['horse-1', 'horse-2'],
      }),
    ).toBe(false)
  })
})
