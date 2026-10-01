// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { LocaleProvider, useT } from './LocaleProvider'
import { LanguageSelector } from './LanguageSelector'
import { StableBasicsStepView } from '#/components/onboarding/StableBasicsStep'
import { FirstHorseStepView } from '#/components/onboarding/FirstHorseStep'
import { OnboardingLayout } from '#/components/onboarding/OnboardingLayout'
import { InvitationPageView } from '#/components/invitations/InvitationPageView'
import { createInvitationSample } from '#/components/page-lab/prototypes/InvitationsPageLab'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'

const data = createDashboardLabFixtureData()
beforeEach(() => {
  localStorage.clear()
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-GB'])
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
function changeLanguage(value: 'en' | 'pl') {
  fireEvent.change(screen.getByRole('combobox'), { target: { value } })
}
function Shell({ children }: { children: ReactNode }) {
  const t = useT()
  return (
    <>
      <LanguageSelector />
      <OnboardingLayout
        title={t('onboarding.stableBasics')}
        pageTitle={t('onboarding.createFirst')}
        pageDescription={t('onboarding.createFirstHelp')}
        description={t('onboarding.stableBasicsHelp')}
        steps={[
          { id: 'stable', label: t('onboarding.stable'), status: 'current' },
        ]}
      >
        {children}
      </OnboardingLayout>
    </>
  )
}

describe('localized onboarding and invitation interaction', () => {
  it('revalidates visible stable errors without losing values or moving focus', async () => {
    const save = vi.fn()
    render(
      <LocaleProvider>
        <Shell>
          <StableBasicsStepView onSave={save} onSaved={() => {}} />
        </Shell>
      </LocaleProvider>,
    )
    const name = screen.getByLabelText<HTMLInputElement>('Stable name')
    fireEvent.change(name, { target: { value: 'Ł' } })
    fireEvent.change(screen.getByLabelText('Location'), {
      target: { value: 'Łódź' },
    })
    fireEvent.submit(name.closest('form')!)
    await screen.findByText('Name must have at least 3 characters.')
    name.focus()
    changeLanguage('pl')
    await screen.findByText('Nazwa musi mieć co najmniej 3 znaki.')
    expect(
      screen.queryByText('Name must have at least 3 characters.'),
    ).toBeNull()
    expect(name.value).toBe('Ł')
    expect(screen.getByLabelText<HTMLInputElement>('Lokalizacja').value).toBe(
      'Łódź',
    )
    expect(document.activeElement).toBe(name)
    expect(save).not.toHaveBeenCalled()
  })
  it('retains an acknowledged save across a language change and retries only continuation', async () => {
    const save = vi.fn().mockResolvedValue(data.stable._id)
    const continueSetup = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(undefined)
    render(
      <LocaleProvider>
        <Shell>
          <StableBasicsStepView onSave={save} onSaved={continueSetup} />
        </Shell>
      </LocaleProvider>,
    )
    fireEvent.change(screen.getByLabelText('Stable name'), {
      target: { value: 'Stajnia Żuraw' },
    })
    fireEvent.change(screen.getByLabelText('Location'), {
      target: { value: 'Łódź' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'Create stable and continue' }),
    )
    await screen.findByText(/Your changes were saved, but/)
    changeLanguage('pl')
    expect(screen.getByText(/Zmiany zostały zapisane, ale/)).toBeTruthy()
    fireEvent.click(
      screen.getByRole('button', { name: 'Kontynuuj bez ponownego zapisu' }),
    )
    await waitFor(() => expect(continueSetup).toHaveBeenCalledTimes(2))
    expect(save).toHaveBeenCalledTimes(1)
    expect(save).toHaveBeenCalledWith({
      name: 'Stajnia Żuraw',
      location: 'Łódź',
    })
  })
  it('translates horse validation and submits the same numeric values', async () => {
    const save = vi.fn().mockResolvedValue(undefined)
    render(
      <LocaleProvider>
        <LanguageSelector />
        <FirstHorseStepView
          stableId={data.stable._id}
          onSave={save}
          onSaved={() => {}}
          onDeferred={() => {}}
        />
      </LocaleProvider>,
    )
    fireEvent.change(screen.getByLabelText('Horse name'), {
      target: { value: 'Śnieżka' },
    })
    fireEvent.change(screen.getByLabelText('Or current age'), {
      target: { value: '150' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'Add horse and continue' }),
    )
    await screen.findByText('Use a valid birth date or age from 0 to 100.')
    changeLanguage('pl')
    await screen.findByText(
      'Podaj prawidłową datę urodzenia lub wiek od 0 do 100 lat.',
    )
    expect(screen.getByLabelText<HTMLInputElement>('Imię konia').value).toBe(
      'Śnieżka',
    )
    expect(save).not.toHaveBeenCalled()
    fireEvent.change(screen.getByLabelText('Lub aktualny wiek'), {
      target: { value: '12' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'Dodaj konia i kontynuuj' }),
    )
    await waitFor(() =>
      expect(save).toHaveBeenCalledWith({
        name: 'Śnieżka',
        age: 12,
        dateOfBirth: undefined,
      }),
    )
  })
  it('changes an invitation failure and retry label without repeating the decision', async () => {
    const accept = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(undefined)
    const view = (
      <LocaleProvider>
        <LanguageSelector />
        <InvitationPageView
          preview={createInvitationSample(data, 'pending')}
          signedIn
          onAccept={accept}
        />
      </LocaleProvider>
    )
    const root = createRootRoute({ component: () => view })
    const router = createRouter({
      routeTree: root,
      history: createMemoryHistory({ initialEntries: ['/'] }),
    })
    await router.load()
    render(<RouterProvider router={router} />)
    fireEvent.click(
      await screen.findByRole('button', { name: 'Accept invitation' }),
    )
    await screen.findByText(/Could not accept this invitation/)
    changeLanguage('pl')
    expect(screen.getByRole('alert').textContent).toContain(
      'Nie udało się przyjąć zaproszenia',
    )
    expect(accept).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'Ponów przyjęcie' }))
    await waitFor(() => expect(accept).toHaveBeenCalledTimes(2))
    expect(
      await screen.findByText('Twoje członkostwo w stajni jest aktywne.'),
    ).toBeTruthy()
  })
})
