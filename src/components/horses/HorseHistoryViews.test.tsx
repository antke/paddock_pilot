// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import {
  createHorseHistorySummary,
  createHorseHistoryTimeline,
} from '#/components/page-lab/prototypes/horseHistoryFixtures'
import { HorseCareSummaryView } from './HorseCareSummaryPage'
import { HorseTimelineView } from './HorseTimelinePage'

afterEach(cleanup)

describe('Horse history views', () => {
  it('identifies the horse in the printable summary and invokes the real print action boundary', () => {
    const summary = createHorseHistorySummary(
      createDashboardLabFixtureData(),
      'standard',
    )
    const print = vi.fn()
    render(<HorseCareSummaryView summary={summary} onPrint={print} />)
    expect(
      screen.getByRole('heading', { level: 2, name: 'Juniper — care summary' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Profile and identification',
      }),
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', { level: 4, name: 'Right fore lameness' }),
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Print summary' }))
    expect(print).toHaveBeenCalledTimes(1)
    expect(screen.getByText('GB1234567890')).toBeTruthy()
  })

  it('distinguishes a missing horse from a sparse profile and empty care records', () => {
    const data = createDashboardLabFixtureData()
    const { rerender } = render(
      <HorseCareSummaryView
        summary={createHorseHistorySummary(data, 'empty')}
      />,
    )
    expect(screen.getByText('No active medication.')).toBeTruthy()
    expect(screen.getByText('No recent events.')).toBeTruthy()
    expect(document.body.textContent).not.toContain('undefined')
    rerender(
      <HorseCareSummaryView summary={{ horse: null, hasAccess: true }} />,
    )
    expect(screen.getByRole('alert').textContent).toContain(
      'This care summary is no longer available',
    )
    expect(screen.queryByRole('button', { name: 'Print summary' })).toBeNull()
  })

  it('filters all real record kinds, recovers from no results, and preserves chronological order', () => {
    const summary = createHorseHistorySummary(
      createDashboardLabFixtureData(),
      'standard',
    )
    const timeline = createHorseHistoryTimeline(summary, 'standard')
    timeline.entries = timeline.entries
      .map((entry) =>
        entry.kind === 'healthIssue'
          ? { ...entry, occurredAt: Date.UTC(2099, 0, 1) }
          : entry,
      )
      .reverse()
    render(<HorseTimelineView timeline={timeline} />)
    const titles = screen
      .getAllByRole('heading', { level: 3 })
      .map((element) => element.textContent)
    expect(titles[0]).toBe('Right fore lameness')
    fireEvent.click(screen.getByRole('button', { name: 'Toggle filters' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Record type' }), {
      target: { value: 'medicationRecord' },
    })
    expect(
      screen.getByRole('heading', { name: 'Sample prescribed medication' }),
    ).toBeTruthy()
    expect(
      screen.queryByRole('heading', { name: 'Right fore lameness' }),
    ).toBeNull()
    const search = screen.getByRole('searchbox', {
      name: 'Search care history',
    })
    fireEvent.change(search, { target: { value: 'no-such-record' } })
    expect(screen.getByText('No matching records')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(
      screen.getByRole('heading', { name: 'Right fore lameness' }),
    ).toBeTruthy()
    fireEvent.change(search, { target: { value: 'Low-dust forage' } })
    expect(
      screen.getByRole('heading', { name: 'Autumn feed review' }),
    ).toBeTruthy()
    expect(
      screen.queryByRole('heading', { name: 'Sample prescribed medication' }),
    ).toBeNull()
  })

  it('distinguishes empty timeline from missing horse without exposing unusable filters', () => {
    const data = createDashboardLabFixtureData()
    const { rerender } = render(
      <HorseTimelineView
        timeline={createHorseHistoryTimeline(
          createHorseHistorySummary(data, 'empty'),
          'empty',
        )}
      />,
    )
    expect(screen.getByText('No timeline entries yet')).toBeTruthy()
    expect(screen.queryByRole('searchbox')).toBeNull()
    rerender(<HorseTimelineView timeline={{ horse: null, entries: [] }} />)
    expect(screen.getByRole('alert').textContent).toContain(
      'This care history is no longer available',
    )
    expect(screen.queryByText('No timeline entries yet')).toBeNull()
  })
})
