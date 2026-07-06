import type { LabTimelineSignalKind } from './analysisPageLabData'

export const timelineSignalKindOrder = [
  'health',
  'reminder',
  'medication',
  'nutrition',
  'weight',
] as const satisfies ReadonlyArray<LabTimelineSignalKind>

export const timelineSignalKindLabels = {
  health: 'Health',
  medication: 'Medication',
  nutrition: 'Nutrition',
  weight: 'Weight',
  reminder: 'Reminder',
} satisfies Record<LabTimelineSignalKind, string>

export const timelineSignalKindAccentColors = {
  health: 'var(--destructive)',
  medication: 'rgb(3 105 161)',
  nutrition: 'rgb(6 95 70)',
  weight: 'rgb(146 64 14)',
  reminder: 'var(--primary)',
} satisfies Record<LabTimelineSignalKind, string>
