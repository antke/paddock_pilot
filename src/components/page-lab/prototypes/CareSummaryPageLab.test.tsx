// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { HorseCareSummaryView } from '#/components/horses/HorseCareSummaryPage'
import {
  CareSummaryPageLab,
  createCareSummaryPrintFixture,
} from './CareSummaryPageLab'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('Care summary print specimen', () => {
  it('preserves every document and the full oversized body inside the real print groups', () => {
    const summary = createCareSummaryPrintFixture(
      createDashboardLabFixtureData(),
    )
    expect(summary.horse).toBeTruthy()
    if (!summary.horse) throw new Error('Expected specimen horse')
    expect(summary.documents).toHaveLength(24)
    expect(new Set(summary.documents.map((record) => record._id)).size).toBe(24)
    const description = summary.activeHealthIssues[0].description
    expect(description.length).toBeLessThanOrEqual(1000)
    expect(description.split('\n')).toHaveLength(82)

    const { container } = render(<HorseCareSummaryView summary={summary} />)
    const root = container.querySelector('[data-print-summary]')!
    expect(root).toBeTruthy()
    for (const document of summary.documents) {
      const heading = within(root as HTMLElement).getByRole('heading', {
        name: document.fileName,
      })
      const record = heading.closest('[data-print-summary-record]')!
      expect(record.closest('[data-print-summary-section]')).toBeTruthy()
      expect(
        record.querySelector('[data-print-summary-body]')?.textContent,
      ).toBe(document.notes)
    }
    const longRecord = screen
      .getByRole('heading', { name: 'Sample multiline handover record' })
      .closest('[data-print-summary-record]')!
    expect(
      longRecord.querySelector('[data-print-summary-body]')?.textContent,
    ).toBe(description)
    expect(screen.getByText('POL-2026-000123456789')).toBeTruthy()
    expect(screen.queryByText(/Sample care summary —/)).toBeNull()
  })

  it('uses the real print action and keeps sample provenance outside production content', () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    render(<CareSummaryPageLab data={createDashboardLabFixtureData()} />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Sample records' }), {
      target: { value: 'multipage' },
    })
    expect(
      screen.getByText(/Sample care summary — illustrative records/),
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', {
        name: 'Juniper — care and identification record 24.pdf',
      }),
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Print summary' }))
    expect(print).toHaveBeenCalledTimes(1)
    expect(
      screen.getByRole<HTMLSelectElement>('combobox', {
        name: 'Sample records',
      }).value,
    ).toBe('multipage')

    fireEvent.change(screen.getByRole('combobox', { name: 'Sample records' }), {
      target: { value: 'empty' },
    })
    expect(screen.getByText('No active medication.')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: /record 24.pdf/ })).toBeNull()
    fireEvent.change(screen.getByRole('combobox', { name: 'Sample records' }), {
      target: { value: 'missing' },
    })
    expect(screen.queryByRole('button', { name: 'Print summary' })).toBeNull()
    expect(screen.queryByText(/Sample care summary —/)).toBeNull()
    expect(document.querySelector('[data-print-summary]')).toBeNull()
  })

  it('does not manufacture a horse when the stable has no horses', () => {
    const data = { ...createDashboardLabFixtureData(), horses: [] }
    expect(createCareSummaryPrintFixture(data)).toEqual({
      horse: null,
      hasAccess: true,
    })
    render(<CareSummaryPageLab data={data} />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Sample records' }), {
      target: { value: 'multipage' },
    })
    expect(screen.getByRole('alert').textContent).toContain(
      'This care summary is no longer available',
    )
    expect(screen.queryByRole('button', { name: 'Print summary' })).toBeNull()
  })
})
