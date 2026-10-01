import type { Locale } from 'shared/i18n/locale'
import type { LabTimelineSignal } from './analysisCentreData'
import { localeInstances } from '#/i18n/resources'
import { formatDecimal } from '#/lib/numberDisplay'
import { formatMetaText } from '#/lib/textDisplay'

/** Translate generated labels, preserving names, notes, dosage and frequency verbatim. */
export function localizeAnalysisSignal(
  signal: LabTimelineSignal,
  locale: Locale,
): LabTimelineSignal {
  const t = localeInstances[locale].t
  const display = signal.displayData
  if (signal.kind === 'health')
    return {
      ...signal,
      detail: formatMetaText([
        signal.severity
          ? t(`careLabels.severity.${signal.severity}`)
          : undefined,
        signal.status === 'active' || signal.status === 'resolved'
          ? t(`careLabels.healthStatus.${signal.status}`)
          : signal.status,
      ]),
    }
  if (signal.kind === 'reminder')
    return {
      ...signal,
      detail: formatMetaText([
        signal.priority
          ? t(`careLabels.priority.${signal.priority}`)
          : undefined,
        signal.status === 'pending' ||
        signal.status === 'completed' ||
        signal.status === 'dismissed'
          ? t(`careLabels.reminderStatus.${signal.status}`)
          : signal.status,
      ]),
    }
  if (signal.kind === 'nutrition')
    return { ...signal, detail: t('careLabels.nutritionChange') }
  if (signal.kind === 'medication' && display)
    return {
      ...signal,
      detail: formatMetaText([
        signal.status === 'active' || signal.status === 'completed'
          ? t(`careLabels.medicationStatus.${signal.status}`)
          : signal.status,
        display.dosage,
        display.frequency,
      ]),
    }
  if (signal.kind === 'weight' && display?.weight !== undefined)
    return {
      ...signal,
      title:
        `${formatDecimal(display.weight, locale)} ${display.unit ?? ''}`.trim(),
      detail: formatMetaText([
        t('careLabels.weight'),
        display.bodyConditionScore !== undefined
          ? `BCS ${formatDecimal(display.bodyConditionScore, locale)}`
          : undefined,
      ]),
    }
  return signal
}
