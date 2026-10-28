// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { Id } from 'convex/_generated/dataModel'
import { WorkspaceContext } from './WorkspaceContext'
import { DashboardPageHeader } from '../dashboard/DashboardPageHeader'
import { useRecordCreationAudience } from '../sharing/useRecordCreationAudience'

vi.mock('convex/react', () => ({
  useQuery: () => [
    {
      horseId: 'horse',
      stableId: 'stable',
      stableName: 'Oak Farm',
      fixed: false,
    },
  ],
}))
vi.mock('#/components/ui/button', () => ({
  ButtonLink: ({ children }: { children: React.ReactNode }) => (
    <a>{children}</a>
  ),
}))
afterEach(cleanup)

it('keeps the workspace in the visible heading independently of navigation', () => {
  const { rerender } = render(
    <WorkspaceContext.Provider value={{ label: 'Personal' }}>
      <DashboardPageHeader title="Events" />
    </WorkspaceContext.Provider>,
  )
  expect(screen.getByRole('heading', { name: 'Events' })).toBeTruthy()
  rerender(
    <WorkspaceContext.Provider
      value={{ label: 'Oak Farm', stableId: 'stable' as Id<'stables'> }}
    >
      <DashboardPageHeader title="Events" />
    </WorkspaceContext.Provider>,
  )
  expect(
    screen.getByRole('heading', { name: 'Events · Oak Farm' }),
  ).toBeTruthy()
  expect(
    screen.queryByRole('heading', { name: 'Events · Personal' }),
  ).toBeNull()
})

function FormAudience() {
  const audience = useRecordCreationAudience('horse' as Id<'horses'>)
  return (
    <>
      {audience.control}
      <output>{String(audience.options.shareWithStable)}</output>
    </>
  )
}
it('starts Personal private and submits the explicit sharing choice', () => {
  render(
    <WorkspaceContext.Provider value={{ label: 'Personal' }}>
      <FormAudience />
    </WorkspaceContext.Provider>,
  )
  expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe(
    'false',
  )
  expect(screen.getByRole('status').textContent).toBe('false')
  fireEvent.click(screen.getByRole('checkbox'))
  expect(screen.getByRole('status').textContent).toBe('true')
})
it('starts stable creation shared with the named audience visible', () => {
  render(
    <WorkspaceContext.Provider
      value={{ label: 'Oak Farm', stableId: 'stable' as Id<'stables'> }}
    >
      <FormAudience />
    </WorkspaceContext.Provider>,
  )
  expect(
    screen
      .getByRole('checkbox', { name: /Share with Oak Farm/ })
      .getAttribute('aria-checked'),
  ).toBe('true')
  expect(screen.getByRole('status').textContent).toBe('true')
})
