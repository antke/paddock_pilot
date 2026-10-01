import { expect, it } from 'vitest'
import { localizeAnalysisSignal } from './analysisSignalDisplay'
import type { LabTimelineSignal } from './analysisCentreData'

const base: LabTimelineSignal = {
  id: 'record',
  kind: 'weight',
  date: '2026-09-29',
  title: '520.5 kg',
  urgent: false,
}
it('localizes generated measurements independently and preserves legacy query output', () => {
  const record = {
    ...base,
    displayData: { weight: 520.5, unit: 'kg', bodyConditionScore: 5.5 },
  }
  expect(localizeAnalysisSignal(record, 'pl')).toMatchObject({
    title: '520,5 kg',
    detail: 'Masa ciała · BCS 5,5',
  })
  expect(localizeAnalysisSignal(record, 'en').title).toBe('520.5 kg')
  expect(record.title).toBe('520.5 kg')
  expect(localizeAnalysisSignal(base, 'pl')).toBe(base)
})
it('translates status without interpreting user-entered names, dosage or frequency', () => {
  const record: LabTimelineSignal = {
    ...base,
    kind: 'medication',
    title: 'Lek Łąka',
    status: 'active',
    displayData: {
      dosage: '2 ml',
      frequency: 'After breakfast / po śniadaniu',
    },
  }
  const translated = localizeAnalysisSignal(record, 'pl')
  expect(translated.title).toBe(record.title)
  expect(translated.detail).toContain('2 ml · After breakfast / po śniadaniu')
  expect(translated.detail).not.toContain('active')
  expect(
    localizeAnalysisSignal(
      {
        ...base,
        kind: 'nutrition',
        title: 'Nowa pasza',
        detail: 'Nutrition change',
      },
      'pl',
    ),
  ).toMatchObject({ title: 'Nowa pasza', detail: 'Zmiana żywienia' })
})
