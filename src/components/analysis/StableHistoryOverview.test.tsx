// @vitest-environment jsdom
import type { ComponentProps } from 'react'
import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { StableHistoryOverview } from './StableHistoryOverview'

type HorseOverview = ComponentProps<
  typeof StableHistoryOverview
>['horses'][number]

function horse(
  name: string,
  completedCount: number,
  recordedMinutes: number | null,
): HorseOverview {
  return {
    horseId: name as HorseOverview['horseId'],
    horseName: name,
    summaryComplete: true,
    latestWeight: null,
    periodWeight: null,
    currentCare: null,
    training: {
      completedCount,
      recordedMinutes,
      withDurationCount: recordedMinutes === null ? 0 : completedCount,
      missingDurationCount: recordedMinutes === null ? completedCount : 0,
      recordIds: [],
    },
  }
}

afterEach(cleanup)

it('distinguishes no completed training from completed sessions missing duration', () => {
  const { rerender } = render(
    <StableHistoryOverview
      horses={[horse('Willow', 0, null)]}
      onHorseSelect={() => {}}
    />,
  )
  expect(
    screen.getAllByText('No completed training recorded in this period.'),
  ).toHaveLength(2)
  expect(screen.queryByText('Duration unknown', { exact: false })).toBeNull()
  expect(screen.queryByText(/Duration recorded for/)).toBeNull()

  rerender(
    <StableHistoryOverview
      horses={[
        horse('Willow', 0, null),
        horse('Hazel', 2, null),
        horse('Fern', 1, 35),
      ]}
      onHorseSelect={() => {}}
    />,
  )
  const hazelRow = screen
    .getByRole('button', { name: 'Hazel' })
    .closest('article')!
  expect(within(hazelRow).getByText('2 · Duration unknown')).toBeTruthy()
  expect(
    within(hazelRow).getByText('Duration recorded for 0 of 2 sessions'),
  ).toBeTruthy()
  const fernRow = screen
    .getByRole('button', { name: 'Fern' })
    .closest('article')!
  expect(within(fernRow).getByText(/35/)).toBeTruthy()
  expect(screen.getByText(/Duration recorded for 1 of 3 sessions/)).toBeTruthy()
})
