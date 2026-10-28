/** A scheduled wall-clock time or an explicit whole-day choice. No timezone conversion. */
export const ALL_DAY_TIME = 'all-day'

export function isAllDay(time: string | undefined) {
  return time === ALL_DAY_TIME
}

/** Whole-day entries precede timed entries on the same date. */
export function compareEventTimes(left: string, right: string) {
  return (isAllDay(left) ? '' : left).localeCompare(
    isAllDay(right) ? '' : right,
  )
}
