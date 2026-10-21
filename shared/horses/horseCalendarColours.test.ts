import { describe, expect, it } from 'vitest'
import {
  eventCalendarHorses,
  getHorseCalendarColour,
  horseCalendarColourIds,
  nextHorseCalendarColour,
  uniqueCalendarHorses,
} from './horseCalendarColours'

describe('shared horse calendar identity', () => {
  const horses = [
    { _id: 'zapi', name: 'Zapi', calendarColourId: 'sage' },
    { _id: 'luna', name: 'Luna', calendarColourId: 'violet' },
  ]
  it('deduplicates sessions by horse and keeps stable order across inputs', () => {
    expect(uniqueCalendarHorses([...horses, horses[0]])).toEqual(
      uniqueCalendarHorses([...horses].reverse()),
    )
    expect(uniqueCalendarHorses([...horses, horses[0]])).toHaveLength(2)
  })
  it('keeps legacy identity independent of name and roster order', () => {
    expect(getHorseCalendarColour({ _id: 'legacy' })).toBe(
      getHorseCalendarColour({ _id: 'legacy', calendarColourId: 'invalid' }),
    )
    expect(getHorseCalendarColour(horses[0])).toBe('sage')
  })
  it('allocates unused colours, then reuses the least-used without changing others', () => {
    expect(nextHorseCalendarColour(horses)).toBe('sky')
    const full = horseCalendarColourIds.map((colour) => ({
      _id: colour,
      name: colour,
      calendarColourId: colour,
    }))
    expect(nextHorseCalendarColour([...full, horses[0]])).toBe('sky')
  })
  it('keeps historical context and permission-limited rosters from exposing other participants', () => {
    expect(
      eventCalendarHorses({ horseIds: ['zapi', 'luna', 'private'] }, horses),
    ).toHaveLength(2)
    expect(
      eventCalendarHorses(
        { horseIds: ['luna'], contextHorseId: 'zapi' },
        horses,
      ),
    ).toEqual([horses[0]])
    expect(eventCalendarHorses({ horseIds: ['private'] }, horses)).toEqual([])
  })
})
