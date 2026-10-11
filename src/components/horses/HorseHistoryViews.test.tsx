// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import {
  createHorseHistorySummary,
  createHorseHistoryTimeline,
} from '#/components/page-lab/prototypes/horseHistoryFixtures'
import { HorseCareSummaryView } from './HorseCareSummaryPage'
import { HorseTimelineView } from './HorseTimelinePage'
import { formatLongDateKey } from '#/lib/dateDisplay'

afterEach(cleanup)

describe('Horse history views', () => {
  it('groups care notes, contacts, identification and clinical records into distinct named regions', () => {
    const summary = createHorseHistorySummary(
      createDashboardLabFixtureData(),
      'standard',
    )
    if (!summary.horse) throw new Error('Expected horse')
    summary.horse.dewormingNotes = 'Recorded deworming note'
    render(<HorseCareSummaryView summary={summary} />)
    const care = screen.getByRole('region', { name: 'Care information' })
    expect(within(care).getByText('Dusty hay')).toBeTruthy()
    expect(within(care).getByText('Recorded deworming note')).toBeTruthy()
    const contacts = screen.getByRole('region', {
      name: 'Emergency and care contacts',
    })
    expect(within(contacts).queryByText('Recorded deworming note')).toBeNull()
    expect(
      within(
        screen.getByRole('region', { name: 'Identification and insurance' }),
      ).getByText('GB1234567890'),
    ).toBeTruthy()
    const health = screen.getByRole('region', { name: 'Active health issues' })
    const medication = screen.getByRole('region', { name: 'Active medication' })
    expect(within(health).getByRole('listitem').textContent).toContain(
      'Right fore lameness',
    )
    expect(within(medication).getByRole('listitem').textContent).toContain(
      'Sample prescribed medication',
    )
    expect(within(medication).queryByText('Right fore lameness')).toBeNull()
  })
  it('previews care details on hover and focus, dismisses with Escape, and still opens the selected day', async () => {
    const timeline = createHorseHistoryTimeline(
      createHorseHistorySummary(createDashboardLabFixtureData(), 'standard'),
      'standard',
    )
    timeline.entries = timeline.entries.filter(
      (entry) => entry.kind !== 'event',
    )
    render(<HorseTimelineView timeline={timeline} />)
    fireEvent.click(screen.getByRole('button', { name: 'Calendar' }))
    const medication = screen.getByRole('button', {
      name: /^Sample prescribed medication,/,
    })
    expect(medication.textContent).toBe('Sample prescribed medication')
    fireEvent.mouseEnter(medication)
    const preview = await screen.findByRole('tooltip')
    expect(
      within(preview).getByText('As recorded by the veterinarian'),
    ).toBeTruthy()
    expect(
      within(preview).getByText(
        'Illustrative data only; not treatment instructions.',
      ),
    ).toBeTruthy()
    expect(medication.getAttribute('aria-describedby')).toBe(preview.id)
    fireEvent.keyDown(medication, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
    const nutrition = screen.getByRole('button', {
      name: /^Autumn feed review,/,
    })
    act(() => nutrition.focus())
    expect(
      within(await screen.findByRole('tooltip')).getByText('Low-dust forage'),
    ).toBeTruthy()
    fireEvent.keyDown(nutrition, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
    fireEvent.click(nutrition)
    expect(
      screen.getByRole('region', {
        name: `Records on ${formatLongDateKey('2026-09-15')}`,
      }).textContent,
    ).toContain('Low-dust forage')
  })

  it('browses calendar months, opens complete day records, and shares filters with the log', () => {
    const timeline = createHorseHistoryTimeline(
      createHorseHistorySummary(createDashboardLabFixtureData(), 'standard'),
      'standard',
    )
    timeline.entries = timeline.entries.filter(
      (entry) => entry.kind !== 'event',
    )
    render(<HorseTimelineView timeline={timeline} />)
    fireEvent.click(screen.getByRole('button', { name: 'Calendar' }))
    expect(
      screen.getByRole('table', { name: 'September 2026 care calendar' }),
    ).toBeTruthy()
    fireEvent.click(
      screen.getByRole('button', {
        name: `Select ${formatLongDateKey('2026-09-17')}: 1 record`,
      }),
    )
    expect(
      screen.getByRole('heading', { name: 'Sample prescribed medication' }),
    ).toBeTruthy()
    expect(
      screen.getByText('Illustrative data only; not treatment instructions.'),
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }))
    expect(
      screen.getByRole('table', { name: 'October 2026 care calendar' }),
    ).toBeTruthy()
    expect(screen.getByText('No records this month.')).toBeTruthy()
    expect(
      screen.queryByRole('heading', { name: 'Sample prescribed medication' }),
    ).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }))
    fireEvent.change(
      screen.getByRole('searchbox', { name: 'Search care history' }),
      { target: { value: 'Low-dust forage' } },
    )
    fireEvent.click(
      screen.getByRole('button', {
        name: `Select ${formatLongDateKey('2026-09-15')}: 1 record`,
      }),
    )
    expect(
      screen.getByRole('heading', { name: 'Autumn feed review' }),
    ).toBeTruthy()
    expect(screen.getByText('Low-dust forage')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Log' }))
    expect(
      screen.getByRole('heading', { name: 'Autumn feed review' }),
    ).toBeTruthy()
    expect(
      screen.queryByRole('heading', { name: 'Sample prescribed medication' }),
    ).toBeNull()
  })

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
        name: 'Horse details',
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
