import type { Id } from 'convex/_generated/dataModel'
import type { StableDashboardEvent } from '#/components/stables/stableDashboardDates'
import { formatDateKey } from '#/lib/dateDisplay'

export type CalendarSampleScenario = 'dense' | 'sparse' | 'empty'
export type CalendarSampleMonth =
  'current' | 'leap' | 'december' | 'january' | 'sunday' | 'monday'

export const calendarSampleMonths: Array<{
  value: CalendarSampleMonth
  label: string
}> = [
  { value: 'current', label: 'Current month' },
  { value: 'leap', label: 'February 2024 · leap year' },
  { value: 'december', label: 'December 2026' },
  { value: 'january', label: 'January 2027' },
  { value: 'sunday', label: 'February 2026 · Sunday start' },
  { value: 'monday', label: 'June 2026 · Monday start' },
]

export function getCalendarSampleMonth(
  month: CalendarSampleMonth,
  now = new Date(),
) {
  const fixed = {
    leap: [2024, 1],
    december: [2026, 11],
    january: [2027, 0],
    sunday: [2026, 1],
    monday: [2026, 5],
  } satisfies Record<Exclude<CalendarSampleMonth, 'current'>, Array<number>>
  if (month === 'current') return new Date(now.getFullYear(), now.getMonth(), 1)
  const [year, index] = fixed[month]
  return new Date(year, index, 1)
}

export function createCalendarSampleEvents(
  month: Date,
  scenario: CalendarSampleScenario,
  denseDayCount: 0 | 2 | 6 = 6,
): Array<StableDashboardEvent> {
  if (scenario === 'empty') return []
  const date = (day: number) =>
    formatDateKey(new Date(month.getFullYear(), month.getMonth(), day))
  const event = (
    id: string,
    title: string,
    day: number,
    time: string,
    extras: Partial<StableDashboardEvent> = {},
  ): StableDashboardEvent => ({
    _id: `sample-calendar-${id}` as Id<'events'>,
    _creationTime: 0,
    stableId: 'sample-calendar-stable' as Id<'stables'>,
    createdBy: 'sample-calendar-user' as Id<'users'>,
    horseIds: [],
    title,
    date: date(day),
    time,
    type: 'other',
    status: 'planned',
    ...extras,
  })
  const shared = [
    event('spanning', 'Three-day yard clinic', 0, '09:00', {
      endDate: date(2),
      type: 'training',
    }),
    event('weekly', 'Weekly condition check', 1, '07:30', {
      type: 'vet',
      recurrence: {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [month.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6],
        end: { type: 'after_occurrences', count: 2 },
      },
    }),
  ]
  if (scenario === 'sparse')
    return [
      ...shared,
      event(
        'sparse-one',
        'Arena confidence session with a visiting instructor for the young horses',
        4,
        '08:00',
        {
          location:
            'Covered school beside the north paddock and the old stable entrance',
          type: 'training',
        },
      ),
      event('sparse-completed', 'Farrier follow-up', 10, '09:15', {
        type: 'hoof_trimming',
        status: 'completed',
      }),
      event('sparse-cancelled', 'Evening massage appointment', 10, '18:45', {
        type: 'massage',
        status: 'cancelled',
      }),
    ]
  const dense = [
    event(
      'dense-1',
      'Arena confidence session with visiting instructor — young horses',
      18,
      '08:00',
      { type: 'training' },
    ),
    event(
      'dense-2',
      'Arena confidence session with visiting instructor — returning horses',
      18,
      '09:00',
      { type: 'training' },
    ),
    event('dense-3', 'Farrier follow-up', 18, '10:15', {
      type: 'hoof_trimming',
      status: 'completed',
    }),
    event('dense-4', 'Dental review', 18, '12:30', { type: 'dentist' }),
    event('dense-5', 'Evening massage appointment', 18, '16:45', {
      type: 'massage',
      status: 'cancelled',
    }),
    event('dense-6', 'Visiting instructor clinic', 17, '09:30', {
      endDate: date(19),
      type: 'training',
    }),
  ]
  return [
    ...shared,
    ...dense.slice(0, denseDayCount),
    event('second-1', 'Saddle fitting', 21, '08:30'),
    event('second-2', 'Groundwork session', 21, '11:00', { type: 'training' }),
    event('second-3', 'Evening checks', 21, '17:00'),
  ]
}
