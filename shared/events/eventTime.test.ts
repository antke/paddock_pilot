import { expect, it } from 'vitest'
import { ALL_DAY_TIME, compareEventTimes, isAllDay } from './eventTime'
import { eventTimeSchema } from './eventSchema'

it('accepts whole-day and real clock times while rejecting missing or invalid times', () => {
  for (const value of [ALL_DAY_TIME, '00:00', '23:59'])
    expect(eventTimeSchema.safeParse(value).success).toBe(true)
  for (const value of ['', '24:00', '10:60', 'whole day'])
    expect(eventTimeSchema.safeParse(value).success).toBe(false)
  expect(isAllDay('00:00')).toBe(false)
  expect(isAllDay(ALL_DAY_TIME)).toBe(true)
})

it('places whole-day entries before timed entries without changing clock ordering', () => {
  expect(
    ['23:59', '09:30', ALL_DAY_TIME, '00:00'].sort(compareEventTimes),
  ).toEqual([ALL_DAY_TIME, '00:00', '09:30', '23:59'])
})
