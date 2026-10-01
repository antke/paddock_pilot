// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LocaleProvider } from './LocaleProvider'
import { LanguageSelector } from './LanguageSelector'
import { HorseTimelineView } from '#/components/horses/HorseTimelinePage'
import type { HorseTimeline } from '#/components/horses/HorseTimelinePage'
import type { Id } from 'convex/_generated/dataModel'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  localStorage.clear()
})

it('translates generated training history while preserving user-entered notes', async () => {
  localStorage.clear()
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-GB'])
  const timeline: HorseTimeline = {
    horse: createDashboardLabFixtureData().horses[0],
    entries: [
      {
        id: 'record' as Id<'trainingRecords'>,
        kind: 'event',
        occurredAt: 1,
        title: 'Łąka — trening',
        eventType: 'training',
        status: 'cancelled',
        date: '2026-09-29',
        time: '10:00',
        endDate: undefined,
        description: 'Skipped · Przejścia',
        providerName: undefined,
        notesAfterCompletion: undefined,
        requestedServiceNotes: undefined,
        horseCompletionNotes: 'Next focus: Stęp',
        costShare: undefined,
        trainingRecord: {
          status: 'skipped',
          focus: 'Przejścia',
          nextFocus: 'Stęp',
        },
      },
    ],
  }
  await act(async () =>
    render(
      <LocaleProvider>
        <LanguageSelector />
        <HorseTimelineView timeline={timeline} />
      </LocaleProvider>,
    ),
  )
  expect(screen.getByText('Skipped')).toBeTruthy()
  expect(screen.getByText('Next focus')).toBeTruthy()
  fireEvent.change(screen.getByRole('combobox', { name: 'Language' }), {
    target: { value: 'pl' },
  })
  expect(screen.getByText('Pominięto')).toBeTruthy()
  expect(screen.getByText('Łąka — trening')).toBeTruthy()
  expect(screen.getByText('Przejścia')).toBeTruthy()
  expect(screen.getByText('Stęp')).toBeTruthy()
  expect(screen.queryByText(/Skipped|Next focus/)).toBeNull()
})
