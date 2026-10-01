import type { HorseComparisonRecord } from 'shared/analysis/horseComparison'
import { shiftDate } from 'shared/analysis/horseComparison'

/** Illustrative data only. The preview uses the production comparison component. */
export function createHorseComparisonSample(
  today: string,
): Array<HorseComparisonRecord> {
  const records: Array<HorseComparisonRecord> = []
  for (const [index, offset] of [-82, -67, -48, -30, -12, -2].entries()) {
    const value = [510, 507, 503, 504, 506, 508][index]
    records.push({
      id: `sample-weight-${index}`,
      kind: 'weight',
      date: shiftDate(today, offset),
      value,
      originalValue: value,
      originalUnit: 'kg',
    })
    if (index !== 2)
      records.push({
        id: `sample-condition-${index}`,
        kind: 'condition',
        date: shiftDate(today, offset),
        value: index < 3 ? 6 : 5.5,
      })
  }
  for (const [index, offset] of [
    -88, -84, -74, -67, -64, -58, -45, -40, -31, -25, -18, -10, -5, -1,
  ].entries())
    records.push({
      id: `sample-training-${index}`,
      kind: 'training',
      date: shiftDate(today, offset),
      durationMinutes: index === 3 ? undefined : 25 + (index % 5) * 5,
      title: 'Sample schooling session',
      status:
        index === 6 ? 'skipped' : index === 8 ? 'unconfirmed' : 'completed',
      activities: ['flatwork'],
      details: [{ label: 'focus', value: 'Rhythm and transitions' }],
    })
  records.push(
    {
      id: 'sample-nutrition-1',
      kind: 'nutrition',
      date: shiftDate(today, -70),
      title: 'Forage routine updated',
      details: [
        { label: 'feedingRoutine', value: 'Sample revised forage routine' },
      ],
    },
    {
      id: 'sample-nutrition-2',
      kind: 'nutrition',
      date: shiftDate(today, -29),
      title: 'Feed plan reviewed',
      notes: 'Illustrative feeding change; compare surrounding measurements.',
    },
    {
      id: 'sample-health-1',
      kind: 'health',
      date: shiftDate(today, -47),
      endDate: shiftDate(today, -35),
      title: 'Recorded health issue',
      status: 'resolved',
      notes: 'Illustrative record of an issue marked resolved.',
    },
    {
      id: 'sample-medication-1',
      kind: 'medication',
      date: shiftDate(today, -46),
      endDate: shiftDate(today, -39),
      title: 'Recorded medication course',
      status: 'completed',
    },
    {
      id: 'sample-care-1',
      kind: 'care',
      date: shiftDate(today, -61),
      title: 'Farrier visit',
      status: 'completed',
    },
    {
      id: 'sample-care-2',
      kind: 'care',
      date: shiftDate(today, -19),
      title: 'Farrier visit',
      status: 'completed',
    },
    {
      id: 'sample-competition-1',
      kind: 'competition',
      date: shiftDate(today, -8),
      title: 'Sample competition',
      status: 'completed',
    },
  )
  return records.sort((a, b) => a.date.localeCompare(b.date))
}
