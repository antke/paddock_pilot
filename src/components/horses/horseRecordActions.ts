import {
  BellIcon,
  FilePlusIcon,
  FirstAidKitIcon,
  GrainsIcon,
  PillIcon,
  ScalesIcon,
} from '@phosphor-icons/react'
import { useT } from '#/i18n/LocaleProvider'

export type HorseCreateAction =
  'reminder' | 'health' | 'nutrition' | 'weight' | 'medication' | 'document'
declare module '@tanstack/react-router' {
  interface HistoryState {
    horseCreateAction?: HorseCreateAction
  }
}

/**
 * Record tasks shared by the mobile horse action menu and the desktop Add
 * record menu. Each opens the section-owned form through `horseCreateAction`.
 */
export function useHorseRecordActions() {
  const t = useT()
  return [
    {
      id: 'reminder',
      label: t('reminders.addCare'),
      Icon: BellIcon,
      to: '/horses/$horseId/care',
      search: {},
    },
    {
      id: 'health',
      label: t('careRecords.addHealthIssue'),
      Icon: FirstAidKitIcon,
      to: '/horses/$horseId/care',
      search: { careView: 'health' },
    },
    {
      id: 'medication',
      label: t('careRecords.addMedication'),
      Icon: PillIcon,
      to: '/horses/$horseId/care',
      search: { careView: 'medication' },
    },
    {
      id: 'nutrition',
      label: t('careRecords.addNutrition'),
      Icon: GrainsIcon,
      to: '/horses/$horseId/nutrition',
      search: {},
    },
    {
      id: 'weight',
      label: t('careRecords.addWeight'),
      Icon: ScalesIcon,
      to: '/horses/$horseId/nutrition',
      search: { nutritionView: 'weight' },
    },
    {
      id: 'document',
      label: t('documents.add'),
      Icon: FilePlusIcon,
      to: '/horses/$horseId/documents',
      search: {},
    },
  ] as const
}
