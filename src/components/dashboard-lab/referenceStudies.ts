export type ReferenceStudy = {
  id: string
  name: string
  thesis: string
  tradeoff: string
  source: string
  canvas: 'ivory' | 'oat' | 'warm'
  header: 'plain' | 'wash' | 'rule'
  density: 'comfortable' | 'compact'
  rows: 'open' | 'lanes' | 'cards' | 'ledger'
  layout: 'balanced' | 'priority' | 'agenda' | 'directory' | 'sheet'
  grouping: 'none' | 'date' | 'horse'
  emphasis: 'labels' | 'summary' | 'heading'
  anchors: boolean
}

export const referenceStudies: ReferenceStudy[] = [
  {
    id: '01',
    name: 'Paper rooms',
    thesis:
      'Lighter working sections on a warm canvas. Generous spacing and aligned records do the separating.',
    tradeoff: 'The calmest baseline, but long lists take more vertical space.',
    source: '1 + 5',
    canvas: 'ivory',
    header: 'plain',
    density: 'comfortable',
    rows: 'open',
    layout: 'balanced',
    grouping: 'none',
    emphasis: 'labels',
    anchors: false,
  },
  {
    id: '02',
    name: 'Oat canvas',
    thesis:
      'A stronger canvas-to-paper difference makes compact, borderless sections immediately visible.',
    tradeoff: 'More surface contrast; less breathing room within records.',
    source: '1 + 4',
    canvas: 'oat',
    header: 'plain',
    density: 'compact',
    rows: 'open',
    layout: 'balanced',
    grouping: 'none',
    emphasis: 'labels',
    anchors: true,
  },
  {
    id: '03',
    name: 'Quiet headers',
    thesis:
      'An integrated header wash identifies each section, with consistent heading sizes and quiet open records.',
    tradeoff:
      'Headers carry more visual weight than in the other soft treatments.',
    source: '3 + 5',
    canvas: 'ivory',
    header: 'wash',
    density: 'compact',
    rows: 'open',
    layout: 'balanced',
    grouping: 'none',
    emphasis: 'heading',
    anchors: false,
  },
  {
    id: '04',
    name: 'Readable lanes',
    thesis:
      'Alternating soft row fills support scanning inside clear sections. Horse initials anchor the reminder list.',
    tradeoff: 'The repeating fills become more noticeable in very long lists.',
    source: '1 + 4',
    canvas: 'ivory',
    header: 'plain',
    density: 'compact',
    rows: 'lanes',
    layout: 'balanced',
    grouping: 'none',
    emphasis: 'labels',
    anchors: true,
  },
  {
    id: '05',
    name: 'Care first',
    thesis:
      'Attention leads the dashboard. A small urgent summary carries emphasis while the records stay neutral.',
    tradeoff: 'Urgent care takes precedence over the daily schedule.',
    source: '4',
    canvas: 'oat',
    header: 'plain',
    density: 'compact',
    rows: 'open',
    layout: 'priority',
    grouping: 'date',
    emphasis: 'summary',
    anchors: true,
  },
  {
    id: '06',
    name: 'Daily plan',
    thesis:
      'Today and the week span the page before the horse and care sections. Reminders are grouped by timing.',
    tradeoff: 'Care and horse details sit farther down the dashboard.',
    source: '3 + 5',
    canvas: 'ivory',
    header: 'plain',
    density: 'comfortable',
    rows: 'open',
    layout: 'agenda',
    grouping: 'date',
    emphasis: 'labels',
    anchors: true,
  },
  {
    id: '07',
    name: 'Horse by horse',
    thesis:
      'The horse directory becomes the main working area. Reminder groups keep each horse’s care together.',
    tradeoff:
      'Chronological order is secondary to horse identity. The dashboard returns to Today-first order on narrow screens.',
    source: '2 + 4',
    canvas: 'oat',
    header: 'plain',
    density: 'compact',
    rows: 'lanes',
    layout: 'directory',
    grouping: 'horse',
    emphasis: 'labels',
    anchors: true,
  },
  {
    id: '08',
    name: 'Independent tasks',
    thesis:
      'Detailed reminders are independent cards with their own actions; short dashboard summaries remain open rows.',
    tradeoff: 'Cards improve ownership of actions but use more space.',
    source: '2 + 5',
    canvas: 'oat',
    header: 'plain',
    density: 'comfortable',
    rows: 'cards',
    layout: 'balanced',
    grouping: 'none',
    emphasis: 'labels',
    anchors: false,
  },
  {
    id: '09',
    name: 'Working ledger',
    thesis:
      'Aligned date, record and action columns support a dense care list. Quiet horizontal rules belong only to that list.',
    tradeoff: 'More utilitarian; long notes make the list less compact.',
    source: '2 + 4',
    canvas: 'ivory',
    header: 'rule',
    density: 'compact',
    rows: 'ledger',
    layout: 'agenda',
    grouping: 'none',
    emphasis: 'labels',
    anchors: false,
  },
  {
    id: '10',
    name: 'Shared journal',
    thesis:
      'One planning surface holds Today, the week and horses. Attention has a separate surface; reminders group by date.',
    tradeoff:
      'Planning uses fewer containers, with subtler internal boundaries.',
    source: '1 + 5',
    canvas: 'oat',
    header: 'rule',
    density: 'comfortable',
    rows: 'open',
    layout: 'sheet',
    grouping: 'date',
    emphasis: 'heading',
    anchors: false,
  },
  {
    id: '11',
    name: 'Gentle emphasis',
    thesis:
      'Warm, softly outlined sections and roomy records. Color is limited to the attention heading and explicit status.',
    tradeoff:
      'The quietest boundaries may be less distinct on low-contrast displays.',
    source: '3 + 5',
    canvas: 'warm',
    header: 'plain',
    density: 'comfortable',
    rows: 'open',
    layout: 'balanced',
    grouping: 'horse',
    emphasis: 'heading',
    anchors: true,
  },
  {
    id: '12',
    name: 'Balanced synthesis',
    thesis:
      'Paper sections on oat, compact rows, restrained header washes and a small urgent summary. Reminders use readable lanes.',
    tradeoff:
      'Combines more visual cues; compare against the simpler Paper rooms baseline.',
    source: '1–5',
    canvas: 'oat',
    header: 'wash',
    density: 'compact',
    rows: 'lanes',
    layout: 'balanced',
    grouping: 'date',
    emphasis: 'summary',
    anchors: true,
  },
]

export const consolidatedStudy: ReferenceStudy = {
  ...referenceStudies[1],
  id: 'candidate',
  name: 'Soft sections with readable rows',
  thesis:
    'Oat-backed paper sections, shaded rows and separate health and care areas. Open a reminder’s details when you need more context.',
  tradeoff:
    'Compact summaries keep the overview short; longer reminder notes open on demand.',
  rows: 'lanes',
}

export function getReferenceStudy(version: string) {
  if (version === 'candidate') return consolidatedStudy
  return referenceStudies.find((study) => `reference-${study.id}` === version)
}
