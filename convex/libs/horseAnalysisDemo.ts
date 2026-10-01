import type { Doc } from '../_generated/dataModel'
import { dateNumber, shiftDate } from '../../shared/analysis/horseComparison'

type Evidence<T> = Omit<
  T,
  | '_id'
  | '_creationTime'
  | 'horseId'
  | 'stableId'
  | 'createdBy'
  | 'createdAt'
  | 'updatedAt'
>
type DemoEvent = Omit<Evidence<Doc<'events'>>, 'horseIds'>
export const analysisDemoLabel = '[Demo analysis year]'

/** Deterministic, illustrative history. These patterns are not health advice or causal evidence. */
export function buildHorseAnalysisDemo(
  end: string,
  reference?: { date: string; kg: number; bodyConditionScore?: number },
) {
  const start = shiftDate(end, -364)
  const date = (day: number) => shiftDate(start, day)
  const timestamp = (day: number) => dateNumber(date(day)) + 12 * 3_600_000
  const key = (kind: string, index: number) =>
    `${analysisDemoLabel} ${end}/${kind}/${index}`
  const note = (kind: string, index: number, text: string) =>
    `${key(kind, index)}\nSynthetic comparison data. ${text}`
  const weights: Array<Evidence<Doc<'horseWeightRecords'>>> = []
  const nutrition: Array<Evidence<Doc<'horseNutritionLogs'>>> = []
  const health: Array<Evidence<Doc<'horseHealthIssues'>>> = []
  const medications: Array<Evidence<Doc<'horseMedicationRecords'>>> = []
  const events: Array<{
    key: string
    event: DemoEvent
    training?: {
      status: Doc<'trainingRecords'>['status']
      details: Doc<'trainingRecords'>['details']
      outcome?: string
    }
  }> = []
  const anchors = [
    [0, 452],
    [75, 459],
    [145, 469],
    [215, 460],
    [265, 453],
    [300, 451],
    [364, 458],
  ]
  const curve = (day: number) => {
    const upper = anchors.findIndex(([d]) => d >= day)
    const [d1, w1] = anchors[Math.max(0, upper - 1)]
    const [d2, w2] = anchors[upper]
    return (
      w1 +
      ((w2 - w1) * (day - d1)) / Math.max(1, d2 - d1) +
      Math.sin(day * 0.31) * 1.2
    )
  }
  const referenceDay = reference
    ? Math.max(
        0,
        Math.min(
          364,
          (dateNumber(reference.date) - dateNumber(start)) / 86_400_000,
        ),
      )
    : 0
  const offset = reference ? reference.kg - curve(referenceDay) : 0
  const condition = reference?.bodyConditionScore ?? 5
  let index = 0
  for (let day = 0; day <= 364; day += [9, 12, 8, 13][index++ % 4]) {
    const kg = Math.round(curve(day) + offset)
    const pounds = index % 9 === 0
    weights.push({
      weight: pounds ? Math.round((kg / 0.45359237) * 10) / 10 : kg,
      unit: pounds ? 'lb' : 'kg',
      measuredAt: timestamp(day),
      bodyConditionScore:
        index % 5 === 0
          ? undefined
          : Math.min(9, day > 90 && day < 170 ? condition + 1 : condition),
      notes: note(
        'weight',
        index,
        'Measured on a different schedule from training; small observation-to-observation variation.',
      ),
    })
  }
  const feeding = [
    [
      0,
      'Autumn maintenance plan',
      'Forage-led routine and a consistent morning/evening feed schedule.',
    ],
    [
      58,
      'Winter forage routine',
      'Recorded increase in winter forage provision as turnout changes.',
    ],
    [
      132,
      'Review of winter ration',
      'Revised maintenance ration following the winter weight review.',
    ],
    [
      174,
      'Spring turnout transition',
      'Gradual change to spring turnout with a revised feed routine.',
    ],
    [
      223,
      'Competition-season feeding review',
      'Consistent meal timing around travel and schooling days.',
    ],
    [
      260,
      'Quiet-week feeding plan',
      'Recorded routine for a period of reduced work.',
    ],
    [
      298,
      'Late-summer ration review',
      'Updated forage and feed routine after the late-summer weigh-in.',
    ],
    [
      337,
      'Autumn routine restored',
      'Regular feeding schedule alongside returning training frequency.',
    ],
  ] as const
  feeding.forEach(([day, title, routine], i) =>
    nutrition.push({
      changedAt: timestamp(day),
      summary: `${analysisDemoLabel} ${title}`,
      feedingRoutineSnapshot: routine,
      recommendedSnapshot: [
        'Keep the recorded routine consistent',
        'Review the next recorded weigh-in',
      ],
      avoidSnapshot: ['Unrecorded abrupt routine changes'],
      notes: note(
        'nutrition',
        i,
        'Illustrative recorded plan, not measured intake or a feeding recommendation.',
      ),
    }),
  )
  const issues = [
    [
      105,
      113,
      'Brief hoof soreness',
      'A quiet period with several recorded skipped sessions.',
    ],
    [
      256,
      268,
      'Minor skin irritation',
      'Reduced work followed by a gradual return to the usual schedule.',
    ],
    [
      330,
      336,
      'Stiffness noted after travel',
      'A short interruption before normal schooling resumes.',
    ],
  ] as const
  issues.forEach(([from, to, title, description], i) => {
    health.push({
      title: `${analysisDemoLabel} ${title}`,
      description: note('health', i, description),
      notedAt: timestamp(from),
      resolvedAt: timestamp(to),
      status: 'resolved',
      severity: 'low',
    })
    medications.push({
      medicationName: `${analysisDemoLabel} Example vet-directed course ${i + 1}`,
      dosage: 'Synthetic placeholder — no real drug or dose',
      frequency: 'As recorded in the illustrative care plan',
      startDate: date(from + 1),
      endDate: date(to - 1),
      prescribedBy: 'Demo veterinary team',
      reason: title,
      status: 'completed',
      notes: note(
        'medication',
        i,
        'Display-only example of a recorded course; not a treatment instruction.',
      ),
    })
  })
  for (let day = 0; day <= 364; day++) {
    const weekday = new Date(timestamp(day)).getUTCDay()
    const winter = day >= 75 && day < 155
    if (![1, 3, 5, 6].includes(weekday) || (winter && weekday === 6)) continue
    const i = events.length
    const quiet = issues.some(([from, to]) => day >= from && day <= to)
    const returning = issues.some(([, to]) => day > to && day <= to + 10)
    const status = quiet
      ? 'skipped'
      : day % 37 === 0
        ? 'cancelled'
        : 'completed'
    const activities: Doc<'trainingRecords'>['details']['activities'] =
      returning
        ? ['groundwork']
        : weekday === 6
          ? ['hacking']
          : weekday === 3
            ? ['flatwork', 'jumping']
            : ['flatwork']
    const details: Doc<'trainingRecords'>['details'] = {
      activities,
      format: weekday === 3 && day % 3 === 0 ? 'lesson' : 'regular',
      durationMinutes:
        status !== 'completed' || day % 31 === 0
          ? undefined
          : returning
            ? 20
            : winter
              ? 30 + (day % 3) * 5
              : 35 + (day % 5) * 5,
      rider: 'Demo rider',
      focus: returning
        ? 'Easy return to routine'
        : winter
          ? 'Winter maintenance'
          : 'Rhythm, balance and fitness',
      nextFocus: 'Review the next session alongside the recorded condition.',
    }
    events.push({
      key: key('training', day),
      event: {
        type: 'training',
        date: date(day),
        time: '10:00',
        title: `${analysisDemoLabel} ${returning ? 'Easy groundwork' : weekday === 6 ? 'Hack' : 'Schooling'}`,
        status: status === 'completed' ? 'completed' : 'cancelled',
        training: details,
        description: note(
          'training',
          day,
          'Synthetic session and outcome for comparison testing.',
        ),
      },
      training: {
        status,
        details,
        outcome: `${analysisDemoLabel} ${status === 'skipped' ? 'Skipped during the recorded quiet period.' : status === 'cancelled' ? 'Cancelled because of weather.' : `Session ${i + 1}: ${returning ? 'Easy work after the interruption.' : 'Steady rhythm; notes recorded after schooling.'}`}`,
      },
    })
  }
  const care = (
    day: number,
    type: DemoEvent['type'],
    title: string,
    cost: number,
  ) =>
    events.push({
      key: key(type, day),
      event: {
        type,
        date: date(day),
        time: '14:00',
        title: `${analysisDemoLabel} ${title}`,
        status: 'completed',
        providerName: 'Demo provider',
        location: 'Paddock Pilot Demo Yard',
        totalCost: cost,
        costPerHorse: cost,
        description: note(
          type,
          day,
          'Illustrative completed appointment; spacing is sample history, not a recommended care interval.',
        ),
        notesAfterCompletion: `${analysisDemoLabel} Visit completed and observations recorded.`,
      },
    })
  for (let day = 12; day <= 364; day += 45)
    care(day, 'hoof_trimming', 'Farrier visit', 65)
  for (const day of [40, 221]) care(day, 'dentist', 'Dental visit', 90)
  for (const day of [75, 106, 257, 331])
    care(day, 'vet', 'Veterinary review', 110)
  for (const day of [155, 234, 308])
    care(day, 'massage', 'Bodywork appointment', 60)
  for (const day of [35, 168, 202, 237, 294, 328])
    care(day, 'competition', 'Schooling competition', 45)
  return { start, end, weights, nutrition, health, medications, events }
}
