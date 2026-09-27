// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import type {
  DashboardCommandData,
  DashboardCommandEvent,
} from './dashboardTypes'
import { getDashboardAttention } from './dashboardAttention'
import {
  HealthIssuesCard,
  CareRemindersSummaryCard,
  PriorityQueueCard,
} from './PriorityQueueCard'
import { TodayBriefingCard } from './TodayBriefingCard'
import { createDashboardCommandData } from './dashboardData'

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

async function openView(view: ReactNode) {
  const root = createRootRoute({ component: () => view })
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
}

function attentionData(): DashboardCommandData {
  const data = createDashboardLabFixtureData()
  const horses = Array.from({ length: 7 }, (_, index) => ({
    horseId:
      `attention-${index}` as DashboardCommandData['horses'][number]['_id'],
    stableId: data.stable._id,
    horseName: `Health horse ${index + 1}`,
    ownerName: undefined,
    breed: undefined,
    profileImageUrl: undefined,
    stableName: data.stable.name,
    highIssueCount: 1,
    activeIssueCount: 1,
    activeMedicationCount: 0,
    overdueReminderCount: 0,
  }))
  return {
    ...data,
    horses: [],
    attentionHorses: horses,
    dueReminders: [],
    overview: {
      ...data.overview,
      stableSummaries: [],
      summary: {
        ...data.overview.summary,
        highSeverityIssueCount: 7,
        dueReminderCount: 0,
      },
    },
  }
}

describe('dashboard attention access and counts', () => {
  it('opens high-severity horse care even when absent from the roster and exposes the complete named queue', async () => {
    const data = attentionData()
    await openView(<PriorityQueueCard data={data} />)
    const first = await screen.findByRole('link', { name: /Health horse 1/ })
    expect(first.getAttribute('href')).toBe(
      `/stables/${data.stable._id}/horses/attention-0/care?careView=health`,
    )
    expect(
      screen.getByText('No reminders are due within 14 days.'),
    ).toBeTruthy()
    expect(screen.queryByRole('link', { name: /Health horse 7/ })).toBeNull()
    const expand = screen.getByRole('button', {
      name: 'Show all 7 horses with health issues',
    })
    expand.focus()
    fireEvent.click(expand)
    const region = screen.getByRole('region', {
      name: 'Horses with high-severity health issues',
    })
    expect(region.getAttribute('tabindex')).toBe('0')
    expect(within(region).getAllByRole('link')).toHaveLength(7)
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Show fewer horses' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Show fewer horses' }))
    expect(screen.queryByRole('link', { name: /Health horse 7/ })).toBeNull()
    expect(document.activeElement).toBe(expand)
  })

  it('uses active-stable totals and honestly discloses a capped or incomplete preview', async () => {
    const data = attentionData()
    const sample = createDashboardLabFixtureData().dueReminders[0]
    data.dueReminders = [{ ...sample, stableId: data.stable._id }]
    data.overview.stableSummaries = [
      {
        ...data.overview.summary,
        stableId: data.stable._id,
        stableName: data.stable.name,
        location: data.stable.location,
        highSeverityIssueCount: 9,
        dueReminderCount: 12,
      },
    ]
    data.overview.summary.highSeverityIssueCount = 100
    expect(getDashboardAttention(data)).toMatchObject({
      healthIssueCount: 9,
      reminderCount: 12,
      missingHealthIssueCount: 2,
    })
    await openView(<PriorityQueueCard data={data} />)
    expect(
      await screen.findByText(/2 additional high-severity issues/),
    ).toBeTruthy()
    expect(
      screen.getByText(/11 more reminders due within 14 days/),
    ).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'View horses' }).getAttribute('href'),
    ).toBe(`/stables/${data.stable._id}/horses`)
  })
})

describe('dashboard occurrence presentation', () => {
  it('retains original event routes while identifying a continuing cancelled calendar entry', async () => {
    const fixture = createDashboardLabFixtureData()
    const event = {
      ...fixture.events[0],
      _id: 'sample-series' as DashboardCommandEvent['_id'],
      title: 'Sample continuing event',
      date: '2040-02-27',
      endDate: '2040-02-29',
      status: 'cancelled' as const,
      recurrence: undefined,
    }
    const data = createDashboardCommandData({
      ...fixture,
      events: [event],
      todayKey: '2040-02-28',
    })
    await openView(<TodayBriefingCard data={data} />)
    const link = await screen.findByRole('link', {
      name: /Sample continuing event/,
    })
    expect(link.getAttribute('href')).toBe(
      `/stables/${fixture.stable._id}/events/sample-series`,
    )
    expect(within(link).getByText('Continues')).toBeTruthy()
    expect(within(link).getByText('Cancelled')).toBeTruthy()
    expect(within(link).getByText(/27.*29/)).toBeTruthy()
  })
})

describe('separate dashboard attention sections', () => {
  it('keeps health expansion and reminder navigation in their own sections', async () => {
    const data = attentionData()
    const openReminders = vi.fn()
    await openView(
      <>
        <HealthIssuesCard data={data} />
        <CareRemindersSummaryCard data={data} onViewReminders={openReminders} />
      </>,
    )
    const healthHeading = await screen.findByRole('heading', {
      name: 'Health issues',
      level: 2,
    })
    const careHeading = screen.getByRole('heading', {
      name: 'Care reminders',
      level: 2,
    })
    const health = healthHeading.closest('section')!
    const care = careHeading.closest('section')!
    expect(health).not.toBe(care)
    expect(
      screen.queryByRole('heading', { name: 'Needs attention' }),
    ).toBeNull()
    expect(
      within(health).queryByText('No reminders are due within 14 days.'),
    ).toBeNull()
    expect(
      within(care).queryByRole('link', { name: /Health horse/ }),
    ).toBeNull()
    fireEvent.click(
      within(health).getByRole('button', {
        name: 'Show all 7 horses with health issues',
      }),
    )
    expect(
      within(health).getByRole('link', { name: /Health horse 7/ }),
    ).toBeTruthy()
    fireEvent.click(
      within(care).getByRole('button', { name: 'View reminders' }),
    )
    expect(openReminders).toHaveBeenCalledOnce()
  })

  it('shows an explicit empty health state without implying all care is clear', async () => {
    const data = attentionData()
    data.attentionHorses = []
    data.overview.summary.highSeverityIssueCount = 0
    await openView(<HealthIssuesCard data={data} />)
    expect(
      await screen.findByText('No high-severity health issues.'),
    ).toBeTruthy()
    expect(
      screen.queryByText('No reminders are due within 14 days.'),
    ).toBeNull()
  })
})
