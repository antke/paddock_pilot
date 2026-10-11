// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { useState } from 'react'
import { CreateRecordDialog } from '#/components/list-layout/CreateRecordDialog'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { useSmallScreen } from '#/lib/useSmallScreen'
import { HorseDetail } from './HorseDetail'

vi.mock('#/lib/useSmallScreen', () => ({ useSmallScreen: vi.fn() }))
beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})

function SectionCreate({ actionId }: { actionId: string }) {
  const [open, setOpen] = useState(false)
  return (
    <CreateRecordDialog
      actionId={actionId}
      open={open}
      onOpenChange={setOpen}
      title={`Create ${actionId}`}
      triggerLabel={`Add ${actionId}`}
    >
      <button onClick={() => setOpen(false)}>Save record</button>
    </CreateRecordDialog>
  )
}
vi.mock('./HorseProfileSection', () => ({
  HorseProfileSection: () => <p>Profile content</p>,
}))
vi.mock('./HorseActivitySection', () => ({
  HorseActivitySection: () => <p>Activity content</p>,
}))
vi.mock('./HorseCareSection', () => ({
  HorseCareSection: ({ activeTab }: { activeTab: string }) => (
    <SectionCreate
      key={activeTab}
      actionId={activeTab === 'health' ? 'health' : 'reminder'}
    />
  ),
}))
vi.mock('./HorseNutritionSection', () => ({
  HorseNutritionSection: ({ activeTab }: { activeTab: string }) => (
    <SectionCreate key={activeTab} actionId={activeTab} />
  ),
}))
vi.mock('./HorseDocumentsSection', () => ({
  HorseDocumentsSection: () => <SectionCreate actionId="document" />,
}))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  localStorage.clear()
  sessionStorage.clear()
  vi.resetAllMocks()
})

async function renderHeader({
  mobile,
  canManageHorse,
  section = 'analysis',
  canRecord = false,
}: {
  mobile: boolean
  canManageHorse: boolean
  section?: string
  canRecord?: boolean
}) {
  vi.mocked(useSmallScreen).mockReturnValue(mobile)
  const horse = createDashboardLabFixtureData().horses[0]
  const router = createRouter({
    scrollRestoration: true,
    routeTree: createRootRoute({
      component: () => (
        <HorseDetail
          horse={horse}
          events={[]}
          canManageHorse={canManageHorse}
          canAddRecords={canRecord}
          trainingData={{
            horses: [{ ...horse, canRecord }],
            records: [],
            events: [],
          }}
        >
          <p>Section content</p>
        </HorseDetail>
      ),
    }),
    history: createMemoryHistory({
      initialEntries: [`/horses/${horse._id}/${section}`],
    }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
  await screen.findByRole('heading', { name: horse.name })
  return { horse, router }
}

it.each([true, false])(
  'keeps mobile Analysis accessible under More while respecting management permission (%s)',
  async (canManageHorse) => {
    const { horse } = await renderHeader({ mobile: true, canManageHorse })
    expect(screen.queryByRole('link', { name: 'Add event' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Edit horse' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Analysis' })).toBeNull()
    const more = screen.getByRole('button', { name: 'More' })
    fireEvent.click(more)
    const analysis = await screen.findByRole('link', { name: 'Analysis' })
    expect(analysis.getAttribute('href')).toBe(`/horses/${horse._id}/analysis`)
    expect(analysis.getAttribute('aria-current')).toBe('page')
    fireEvent.click(more)
    const trigger = screen.queryByRole('button', {
      name: `Actions for ${horse.name}`,
    })
    if (canManageHorse) {
      expect(trigger).toBeTruthy()
      fireEvent.click(trigger!)
      await screen.findByRole('menu')
      expect(
        screen
          .getByRole('menuitem', { name: 'Add event' })
          .getAttribute('href'),
      ).toBe(`/events/create?horseId=${horse._id}`)
      expect(
        screen
          .getByRole('menuitem', { name: 'Edit horse' })
          .getAttribute('href'),
      ).toBe(`/horses/${horse._id}/edit`)
    } else {
      expect(trigger).toBeNull()
    }
  },
)

it('keeps Analysis directly available in the desktop header', async () => {
  const { horse } = await renderHeader({ mobile: false, canManageHorse: true })
  expect(
    screen.getByRole('link', { name: 'Analysis' }).getAttribute('href'),
  ).toBe(`/horses/${horse._id}/analysis`)
  expect(screen.getByRole('link', { name: 'Add event' })).toBeTruthy()
  expect(screen.getByRole('link', { name: 'Edit horse' })).toBeTruthy()
})

it('leaves mobile editing to the form controls', async () => {
  await renderHeader({ mobile: true, canManageHorse: true, section: 'edit' })
  expect(screen.queryByRole('button', { name: /^Actions for/ })).toBeNull()
  expect(screen.queryByRole('link', { name: 'Add event' })).toBeNull()
  expect(screen.queryByRole('link', { name: 'Edit horse' })).toBeNull()
})

it.each(['Add event', 'Edit horse'])(
  'keeps the horse and return context when choosing %s',
  async (label) => {
    const { horse, router } = await renderHeader({
      mobile: true,
      canManageHorse: true,
    })
    fireEvent.click(
      screen.getByRole('button', { name: `Actions for ${horse.name}` }),
    )
    const item = await screen.findByRole('menuitem', { name: label })
    const href = item.getAttribute('href')
    fireEvent.click(item)
    await waitFor(() => expect(router.state.location.href).toBe(href))
    expect(router.state.location.state.taskOrigin).toMatchObject({
      href: `/horses/${horse._id}/analysis`,
      index: 0,
      scrollY: 0,
    })
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  },
)

it.each([
  { canManageHorse: true, canRecord: true },
  { canManageHorse: true, canRecord: false },
  { canManageHorse: false, canRecord: true },
  { canManageHorse: false, canRecord: false },
])(
  'combines training actions without a duplicate bottom bar ($canManageHorse / $canRecord)',
  async (permissions) => {
    const { horse } = await renderHeader({
      mobile: true,
      section: 'training',
      ...permissions,
    })
    await screen.findByRole('button', { name: 'Week' })
    expect(document.querySelector('[data-slot="mobile-action-bar"]')).toBeNull()
    const trigger = screen.queryByRole('button', {
      name: `Actions for ${horse.name}`,
    })
    if (!permissions.canManageHorse && !permissions.canRecord) {
      expect(trigger).toBeNull()
      return
    }
    fireEvent.click(trigger!)
    const menu = await screen.findByRole('menu')
    expect(within(menu).getAllByRole('menuitem')).toHaveLength(
      (permissions.canManageHorse ? 2 : 0) + (permissions.canRecord ? 7 : 0),
    )
    const record = screen.queryByRole('menuitem', { name: 'Add training log' })
    if (permissions.canRecord) {
      expect(record?.getAttribute('href')).toBe(
        `/events/create?horseId=${horse._id}&training=true&intent=record`,
      )
    } else {
      expect(record).toBeNull()
    }
    expect(
      Boolean(screen.queryByRole('menuitem', { name: 'Edit horse' })),
    ).toBe(permissions.canManageHorse)
    expect(Boolean(screen.queryByRole('menuitem', { name: 'Add event' }))).toBe(
      permissions.canManageHorse,
    )
  },
)

it.each(['profile', 'activity', 'training', 'care', 'nutrition', 'documents'])(
  'has one shared action menu with every permitted creation action on %s',
  async (section) => {
    const { horse } = await renderHeader({
      mobile: true,
      canManageHorse: true,
      canRecord: true,
      section,
    })
    expect(
      document.querySelectorAll('[data-slot="mobile-action-menu"]'),
    ).toHaveLength(1)
    expect(
      document.querySelector('[data-slot="record-dialog-floating-trigger"]'),
    ).toBeNull()
    expect(
      document.querySelector('[data-slot="record-dialog-desktop-trigger"]'),
    ).toBeNull()
    fireEvent.click(
      screen.getByRole('button', { name: `Actions for ${horse.name}` }),
    )
    const menu = await screen.findByRole('menu')
    expect(within(menu).getAllByRole('menuitem')).toHaveLength(9)
    expect(
      within(menu).getByRole('menuitem', { name: 'Add training log' }),
    ).toBeTruthy()
    expect(
      within(menu).getByRole('menuitem', { name: 'Edit horse' }),
    ).toBeTruthy()
  },
)

it.each([
  'reminder',
  'health',
  'nutrition',
  'weight',
  'medication',
  'document',
])(
  'opens %s once from the shared menu and returns focus after saving',
  async (actionId) => {
    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockImplementation(
      () => [new DOMRect(0, 0, 56, 56)] as unknown as DOMRectList,
    )
    const { horse, router } = await renderHeader({
      mobile: true,
      canManageHorse: true,
      canRecord: true,
      section: 'profile',
    })
    fireEvent.click(
      screen.getByRole('button', { name: `Actions for ${horse.name}` }),
    )
    const labels: Record<string, string> = {
      reminder: 'Add care reminder',
      health: 'Add health issue',
      nutrition: 'Add nutrition log',
      weight: 'Add weight',
      medication: 'Add medication',
      document: 'Add document',
    }
    fireEvent.click(
      await screen.findByRole('menuitem', { name: labels[actionId] }),
    )
    const dialog = await screen.findByRole('dialog', {
      name: `Create ${actionId}`,
    })
    await waitFor(() =>
      expect(router.state.location.state.horseCreateAction).toBeUndefined(),
    )
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save record' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: `Actions for ${horse.name}` }),
      ),
    )
    expect(
      document.querySelectorAll('[data-slot="mobile-action-menu"]'),
    ).toHaveLength(1)
    expect(
      document.querySelector('[data-slot="record-dialog-floating-trigger"]'),
    ).toBeNull()
    // An action on the already-active tab must work again after its intent was consumed.
    fireEvent.click(
      screen.getByRole('button', { name: `Actions for ${horse.name}` }),
    )
    fireEvent.click(
      await screen.findByRole('menuitem', { name: labels[actionId] }),
    )
    expect(
      await screen.findByRole('dialog', { name: `Create ${actionId}` }),
    ).toBeTruthy()
  },
)

it.each([true, false])(
  'preserves page scroll when selecting horse sections (mobile: %s)',
  async (mobile) => {
    const { horse, router } = await renderHeader({
      mobile,
      canManageHorse: false,
      section: 'profile',
    })
    await waitFor(() => expect(router.state.status).toBe('idle'))
    vi.mocked(window.scrollTo).mockClear()
    fireEvent.click(screen.getByRole('link', { name: 'Activity' }))
    await waitFor(() =>
      expect(router.state.location.pathname).toBe(
        `/horses/${horse._id}/activity`,
      ),
    )
    await screen.findByText('Activity content')
    expect(window.scrollTo).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('link', { name: 'Profile' }))
    await screen.findByText('Profile content')
    expect(window.scrollTo).not.toHaveBeenCalled()
  },
)
