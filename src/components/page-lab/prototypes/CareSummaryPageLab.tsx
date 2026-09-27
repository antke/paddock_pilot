import { useState } from 'react'
import type { Id } from 'convex/_generated/dataModel'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { HorseCareSummaryView } from '#/components/horses/HorseCareSummaryPage'
import { Field, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { createHorseHistorySummary } from './horseHistoryFixtures'
import type { HorseHistoryScenario } from './horseHistoryFixtures'

type CareSummaryScenario = HorseHistoryScenario | 'multipage'

export function createCareSummaryPrintFixture(data: DashboardLabData) {
  const summary = createHorseHistorySummary(data, 'standard')
  if (!summary.horse) return summary
  const document = summary.documents[0]
  const healthIssue = summary.activeHealthIssues[0]
  return {
    ...summary,
    horse: {
      ...summary.horse,
      name: 'Żuraw — Cedar Ridge Juniper',
      passportNumber: 'POL-2026-000123456789',
    },
    activeHealthIssues: [
      {
        ...healthIssue,
        title: 'Sample multiline handover record',
        // Short lines exercise a record taller than paper while staying within
        // the real 1,000-character description limit.
        description: [
          'Start of sample handover log.',
          ...Array.from(
            { length: 80 },
            (_, index) => `Line ${String(index + 1).padStart(2, '0')}`,
          ),
          'End of sample handover log.',
        ].join('\n'),
      },
    ],
    documents: Array.from({ length: 24 }, (_, index) => ({
      ...document,
      _id: `lab-print-document-${index}` as Id<'stableDocuments'>,
      fileName: `Juniper — care and identification record ${String(index + 1).padStart(2, '0')}.pdf`,
      notes:
        'Illustrative document metadata for a multipage print check. No file is attached. Recorded by Łucja Kowalska at Żuraw Stable.',
      createdAt: document.createdAt - index * 86_400_000,
    })),
  }
}

export function CareSummaryPageLab({ data }: { data: DashboardLabData }) {
  const [scenario, setScenario] = useState<CareSummaryScenario>('standard')
  const summary =
    scenario === 'multipage'
      ? createCareSummaryPrintFixture(data)
      : createHorseHistorySummary(data, scenario)
  return (
    <DashboardPage>
      <div className="print:hidden">
        <DashboardPageHeader
          title="Care summary sample"
          description="Illustrative care records rendered by the actual care-summary view. Print opens your browser's print preview; no records are saved."
        />
        <Field>
          <FieldLabel htmlFor="care-summary-sample">Sample records</FieldLabel>
          <Select
            id="care-summary-sample"
            value={scenario}
            onChange={(event) =>
              setScenario(event.target.value as CareSummaryScenario)
            }
          >
            <option value="standard">Complete sample</option>
            <option value="empty">Sparse profile and empty records</option>
            <option value="long">Long name, identifiers and notes</option>
            <option value="multipage">Multipage records and long body</option>
            <option value="missing">Missing horse</option>
          </Select>
        </Field>
      </div>
      {summary.horse && (
        <p className="hidden print:block">
          Sample care summary — illustrative records, not a real care handover.
        </p>
      )}
      <HorseCareSummaryView summary={summary} />
    </DashboardPage>
  )
}
