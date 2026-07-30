import type { LabTimelineSignalKind } from './analysisCentreData'

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
  medication: 'var(--chart-1)',
  nutrition: 'var(--chart-2)',
  weight: 'var(--chart-4)',
  reminder: 'var(--primary)',
} satisfies Record<LabTimelineSignalKind, string>
