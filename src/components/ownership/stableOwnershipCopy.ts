import { useLocale } from '#/i18n/LocaleProvider'

const en = {
  creating: 'Creating horse…',
  horse: 'Horse',
  allHorses: 'All horses',
  kind: 'Record type',
  allKinds: 'All record types',
  filtersHelp:
    'Filters apply to loaded records. Load more to include older records and horses.',
  noMatches: 'No loaded records match these filters.',
  clearFilters: 'Clear filters',
  loading: 'Loading records…',
  retainedOn: (date: string) => `Retained on ${date}`,
  record: 'Record',
  kinds: {
    horseHealthIssues: 'Health issue',
    horseWeightRecords: 'Weight record',
    horseMedicationRecords: 'Medication',
    horseNutritionLogs: 'Nutrition record',
    trainingRecords: 'Training record',
    stableDocuments: 'Document',
    event: 'Appointment',
    reminder: 'Care task',
  },
}

const pl: typeof en = {
  creating: 'Tworzenie konia…',
  horse: 'Koń',
  allHorses: 'Wszystkie konie',
  kind: 'Rodzaj wpisu',
  allKinds: 'Wszystkie rodzaje wpisów',
  filtersHelp:
    'Filtry obejmują wczytane wpisy. Wczytaj więcej, aby uwzględnić starsze wpisy i konie.',
  noMatches: 'Żaden wczytany wpis nie pasuje do tych filtrów.',
  clearFilters: 'Wyczyść filtry',
  loading: 'Wczytywanie wpisów…',
  retainedOn: (date: string) => `Zachowano ${date}`,
  record: 'Wpis',
  kinds: {
    horseHealthIssues: 'Problem zdrowotny',
    horseWeightRecords: 'Pomiar masy',
    horseMedicationRecords: 'Leki',
    horseNutritionLogs: 'Wpis żywieniowy',
    trainingRecords: 'Zapis treningu',
    stableDocuments: 'Dokument',
    event: 'Wizyta',
    reminder: 'Zadanie opieki',
  },
}

export function useStableOwnershipCopy() {
  const { locale } = useLocale()
  const c = locale === 'pl' ? pl : en
  return {
    ...c,
    kindLabel: (kind: string) =>
      Object.hasOwn(c.kinds, kind)
        ? c.kinds[kind as keyof typeof c.kinds]
        : c.record,
  }
}
