import { BackLink } from '#/components/ui/back-action'
import { useId, useLayoutEffect, useState } from 'react'
import { LandingLabThemeBoundary } from '#/components/landing-lab/LandingLabThemeBoundary'
import { AppShell, AppSkipLink } from '#/components/layout/AppShell'
import { PageLayout } from '#/components/layout/PageLayout'
import { WorkspaceNavigationView } from '#/components/layout/WorkspaceNavigationShell'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { DashboardLayoutGrid } from '#/components/dashboard/DashboardLayoutGrid'
import { StableCommandCenter } from '#/components/dashboard/command-center/StableCommandCenter'
import { StableEventsPage } from '#/components/events/StableEventsPage'
import type { EventsView } from '#/components/events/StableEventsPage'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import {
  createDashboardAuditSample,
  createTodayTrainingSample,
} from '#/components/page-lab/prototypes/dashboardAnalysisFixtures'
import { HorseFormPageLab } from '#/components/page-lab/prototypes/HorseFormPageLab'
import { useLocalDateContext } from '#/lib/useLocalDateContext'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { ChoiceButtonGroup } from '#/components/ui/choice-button-group'
import { Input } from '#/components/ui/input'
import { Field, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import { darkModePalettes, darkModePreviewCss } from './darkModePalettes'
import type { DarkModeSearch } from './darkModePalettes'

export function DarkModeLab({
  search,
  onChange,
}: {
  search: DarkModeSearch
  onChange: (next: Partial<DarkModeSearch>) => void
}) {
  const id = useId()
  const [eventsView, setEventsView] = useState<EventsView>('calendar')
  const [notice, setNotice] = useState('')
  const { today } = useLocalDateContext()
  const palette = darkModePalettes.find((item) => item.id === search.palette)!
  const sample = createDashboardAuditSample(
    createDashboardLabFixtureData(),
    'routine',
    today,
  )
  const data = {
    ...sample,
    todayTraining: createTodayTrainingSample(sample, today),
  }
  const theme = search.reference === 'light' ? 'light' : 'dark'
  const previewId =
    search.reference === 'candidate' ? palette.id : search.reference

  useLayoutEffect(() => {
    const root = document.documentElement
    const previous = root.getAttribute('data-dark-study')
    root.setAttribute('data-dark-study', previewId)
    return () => {
      if (previous === null) root.removeAttribute('data-dark-study')
      else root.setAttribute('data-dark-study', previous)
    }
  }, [previewId])

  return (
    <LandingLabThemeBoundary theme={theme}>
      <style>{darkModePreviewCss}</style>
      <AppShell
        onClickCapture={(event) => {
          const link =
            event.target instanceof Element ? event.target.closest('a') : null
          if (
            link &&
            !link.hasAttribute('data-lab-exit') &&
            !link.getAttribute('href')?.startsWith('#')
          ) {
            event.preventDefault()
            event.stopPropagation()
            setNotice(
              'Sample link. Choose Dashboard, Calendar, Horse form or Controls to explore this theme.',
            )
          }
        }}
      >
        <AppSkipLink />
        <WorkspaceNavigationView
          pathname={`/stables/${data.stable._id}`}
          stables={[{ _id: data.stable._id, name: data.stable.name }]}
          canManageStable
          compactAccountActions={
            <span className="text-sm text-muted-foreground">Preview</span>
          }
          accountActions={
            <div className="grid gap-1 px-2 text-sm">
              <span>Jamie · Sample account</span>
              <span className="text-muted-foreground">Theme preview only</span>
            </div>
          }
        />
        <PageLayout>
          <div className="grid min-w-0 gap-6 pb-20">
            <DashboardPageHeader
              title="Dark mode studies"
              description={
                <span className="hidden sm:inline">
                  Three directions, the same Paddock Pilot. Compare them with
                  the current themes, then explore the dashboard, calendar and
                  forms.
                </span>
              }
              backAction={
                <BackLink data-lab-exit to="/style-lab">
                  Back to style lab
                </BackLink>
              }
            />
            <div className="grid min-w-0 gap-4 border-b border-border-subtle pb-6">
              <ChoiceButtonGroup
                aria-label="Dark palette"
                value={search.palette}
                options={darkModePalettes.map((item) => ({
                  value: item.id,
                  label: (
                    <span className="inline-flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="inline-flex overflow-hidden rounded-sm border border-input"
                      >
                        {['--background', '--card', '--primary'].map(
                          (token) => (
                            <span
                              key={token}
                              className="size-4"
                              style={{
                                backgroundColor:
                                  item.tokens[token as `--${string}`],
                              }}
                            />
                          ),
                        )}
                      </span>
                      {item.name}
                    </span>
                  ),
                }))}
                onValueChange={(paletteId) =>
                  onChange({ palette: paletteId, reference: 'candidate' })
                }
              />
              <p
                className="max-w-3xl text-sm leading-relaxed text-muted-foreground"
                aria-live="polite"
              >
                {search.reference === 'light'
                  ? 'Your current bright theme, unchanged. Switch back to the candidate to compare the same screen.'
                  : search.reference === 'current'
                    ? 'Your current dark theme is Charcoal & pine: charcoal surfaces, paper-coloured text and pine green actions.'
                    : palette.description}
              </p>
              <div className="grid grid-cols-2 items-end gap-4 sm:flex sm:flex-wrap">
                <Field className="min-w-0 sm:w-56">
                  <FieldLabel htmlFor={`${id}-reference`}>
                    Compare with
                  </FieldLabel>
                  <Select
                    id={`${id}-reference`}
                    value={search.reference}
                    onChange={(event) =>
                      onChange({
                        reference: event.target
                          .value as DarkModeSearch['reference'],
                      })
                    }
                  >
                    <option value="candidate">{palette.name}</option>
                    <option value="current">Current dark theme</option>
                    <option value="light">Current bright theme</option>
                  </Select>
                </Field>
                <Field className="min-w-0 sm:w-48">
                  <FieldLabel htmlFor={`${id}-surface`}>
                    Preview screen
                  </FieldLabel>
                  <Select
                    id={`${id}-surface`}
                    value={search.surface}
                    onChange={(event) => {
                      setNotice('')
                      onChange({
                        surface: event.target
                          .value as DarkModeSearch['surface'],
                      })
                    }}
                  >
                    <option value="dashboard">Dashboard</option>
                    <option value="calendar">Calendar</option>
                    <option value="form">Horse form</option>
                    <option value="controls">Controls & dialogs</option>
                  </Select>
                </Field>
                <span className="col-span-2 pb-2 text-sm text-muted-foreground">
                  Fictional records · Theme choices are not saved
                </span>
              </div>
              {notice && (
                <p role="status" className="text-sm text-muted-foreground">
                  {notice}
                </p>
              )}
            </div>
            <div data-dark-study-surface>
              {search.surface === 'dashboard' && (
                <StableCommandCenter data={data} />
              )}
              {search.surface === 'calendar' && (
                <StableEventsPage
                  stableId={data.stable._id}
                  events={data.events}
                  view={eventsView}
                  onViewChange={setEventsView}
                />
              )}
              {search.surface === 'form' && <HorseFormPageLab data={data} />}
              {search.surface === 'controls' && <ControlSamples />}
            </div>
          </div>
        </PageLayout>
      </AppShell>
    </LandingLabThemeBoundary>
  )
}

function ControlSamples() {
  const id = useId()
  const [selected, setSelected] = useState('upcoming')
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  return (
    <DashboardLayoutGrid variant="equal">
      <DashboardSection title="Actions & selection" size="panel">
        <p className="text-sm text-muted-foreground">
          Green identifies an action; neutral stone marks a selection.
        </p>
        <div className="flex flex-wrap gap-3">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>Add care reminder</DialogTrigger>
            <DialogContent>
              <DialogTitle>Add care reminder</DialogTitle>
              <DialogDescription>
                This is a local preview. Saving does not create a real reminder.
              </DialogDescription>
              <form
                className="grid gap-4"
                onSubmit={(event) => {
                  event.preventDefault()
                  setOpen(false)
                  setSaved(true)
                }}
              >
                <Field>
                  <FieldLabel htmlFor={`${id}-reminder`}>Reminder</FieldLabel>
                  <Input
                    id={`${id}-reminder`}
                    defaultValue="Book the farrier"
                    required
                  />
                </Field>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save sample</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => setSaved(false)}>
            Reset sample
          </Button>
          <Button disabled>Saving…</Button>
        </div>
        {saved && (
          <p role="status" className="text-sm text-primary">
            Sample reminder saved for this preview.
          </p>
        )}
        <ChoiceButtonGroup
          aria-label="Reminder filter"
          value={selected}
          onValueChange={setSelected}
          options={[
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'completed', label: 'Completed' },
          ]}
        />
        <p className="text-sm">
          {selected === 'upcoming'
            ? 'Book the farrier · Due next week'
            : 'No completed reminders in this sample.'}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">Completed</Badge>
          <Badge variant="warning">Due soon</Badge>
          <Badge variant="destructive">Overdue</Badge>
          <Badge variant="info">Active</Badge>
          <Badge variant="neutral">Dismissed</Badge>
        </div>
      </DashboardSection>
      <DashboardSection title="Fields & feedback" size="panel">
        <Field>
          <FieldLabel htmlFor={`${id}-horse`}>Horse name</FieldLabel>
          <Input id={`${id}-horse`} placeholder="e.g. Juniper" />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-date`}>Next visit</FieldLabel>
          <Input id={`${id}-date`} type="date" />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-error`}>Reminder title</FieldLabel>
          <Input
            id={`${id}-error`}
            aria-invalid="true"
            aria-describedby={`${id}-error-message`}
            placeholder="Add a short title"
          />
          <p id={`${id}-error-message`} className="text-sm text-destructive">
            A title is required. Example validation state.
          </p>
        </Field>
      </DashboardSection>
    </DashboardLayoutGrid>
  )
}
