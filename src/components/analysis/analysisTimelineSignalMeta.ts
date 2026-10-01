import type { Locale } from 'shared/i18n/locale'
import { localeInstances } from '#/i18n/resources'
import type { LabTimelineSignalKind } from './analysisCentreData'

export const timelineSignalKindOrder = [
  'health',
  'reminder',
  'medication',
  'nutrition',
  'weight',
] as const satisfies ReadonlyArray<LabTimelineSignalKind>

export function getTimelineSignalKindLabels(locale: Locale) {
  const t = localeInstances[locale].t
  return {
    health: t('analysisViews.health'),
    medication: t('analysisViews.medication'),
    nutrition: t('analysisViews.nutrition'),
    weight: t('analysisViews.weight'),
    reminder: t('analysisViews.reminder'),
  } satisfies Record<LabTimelineSignalKind, string>
}
export const timelineSignalKindLabels = getTimelineSignalKindLabels('en')

export const timelineSignalKindAccentColors = {
  health: 'var(--destructive)',
  medication: 'var(--chart-1)',
  nutrition: 'var(--chart-2)',
  weight: 'var(--chart-4)',
  reminder: 'var(--primary)',
} satisfies Record<LabTimelineSignalKind, string>
