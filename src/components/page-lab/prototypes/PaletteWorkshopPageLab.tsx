import { useId, useState } from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Field, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { ChoiceButtonGroup } from '#/components/ui/choice-button-group'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { StableCommandCenter } from '#/components/dashboard/command-center/StableCommandCenter'
import { StableEventsPage } from '#/components/events/StableEventsPage'
import type { EventsView } from '#/components/events/StableEventsPage'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { useLocalDateContext } from '#/lib/useLocalDateContext'
import { HorseFormPageLab } from './HorseFormPageLab'
import {
  createDashboardAuditSample,
  createTodayTrainingSample,
} from './dashboardAnalysisFixtures'
import { paletteContrast, workshopPalettes } from './paletteWorkshopPalettes'
import type { PaletteMode, PaletteTokens } from './paletteWorkshopPalettes'

export function PaletteWorkshopPageLab() {
  const id = useId()
  const [selected, setSelected] = useState('pine')
  const [mode, setMode] = useState<PaletteMode>('light')
  const [surface, setSurface] = useState('dashboard')
  const [eventsView, setEventsView] = useState<EventsView>('calendar')
  const [overrides, setOverrides] = useState<PaletteTokens>({})
  const [notice, setNotice] = useState('')
  const palette = workshopPalettes.find((item) => item.id === selected)!
  const tokens = { ...palette[mode], ...overrides }
  const { today } = useLocalDateContext()
  const data = createDashboardAuditSample(
    createDashboardLabFixtureData(),
    'routine',
    today,
  )
  const controls = [
    {
      label: 'Green accent',
      token: '--primary',
      aliases: ['--ring', '--chart-1'],
    },
    { label: 'Canvas', token: '--surface-muted', aliases: ['--background'] },
    {
      label: 'Paper',
      token: '--card',
      aliases: ['--popover', '--surface-elevated'],
    },
  ] as const
  const checks = [
    [
      'Button text',
      paletteContrast(tokens['--primary-foreground'], tokens['--primary']),
    ],
    ['Body text', paletteContrast(tokens['--foreground'], tokens['--card'])],
    [
      'Secondary text',
      paletteContrast(tokens['--muted-foreground'], tokens['--surface-muted']),
    ],
  ] as const
  return (
    <div className="grid min-w-0 gap-6">
      <DashboardPageHeader
        title="Palette workshop"
        description="Compare the same app in different colours. These are local previews; choosing a palette here does not apply it to the app."
      />
      <div className="grid min-w-0 gap-4 rounded-panel border border-border bg-card p-4 lg:sticky lg:top-[var(--app-header-scroll-clearance,1rem)] lg:z-40">
        <ChoiceButtonGroup
          aria-label="Palette direction"
          value={selected}
          options={workshopPalettes.map((item) => ({
            value: item.id,
            label: (
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex overflow-hidden rounded-sm border border-border"
                >
                  {['--surface-muted', '--card', '--primary'].map((token) => (
                    <span
                      key={token}
                      className="size-4"
                      style={{
                        backgroundColor:
                          item[mode][token as keyof PaletteTokens],
                      }}
                    />
                  ))}
                </span>
                {item.name}
              </span>
            ),
          }))}
          onValueChange={(value) => {
            setSelected(value)
            setOverrides({})
          }}
        />
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {palette.description}
        </p>
        <div className="flex flex-wrap items-end gap-4">
          <Field className="w-40">
            <FieldLabel htmlFor={`${id}-surface`}>Preview</FieldLabel>
            <Select
              id={`${id}-surface`}
              value={surface}
              onChange={(e) => setSurface(e.target.value)}
            >
              <option value="dashboard">Dashboard</option>
              <option value="events">Events</option>
              <option value="form">Horse form</option>
            </Select>
          </Field>
          <Field className="w-32">
            <FieldLabel htmlFor={`${id}-mode`}>Appearance</FieldLabel>
            <Select
              id={`${id}-mode`}
              value={mode}
              onChange={(e) => {
                setMode(e.target.value as PaletteMode)
                setOverrides({})
              }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </Select>
          </Field>
          {controls.map(({ label, token, aliases }) => (
            <Field key={token} className="w-28">
              <FieldLabel htmlFor={`${id}-${token}`}>{label}</FieldLabel>
              <Input
                id={`${id}-${token}`}
                type="color"
                value={tokens[token]}
                onInput={(event) => {
                  const value = event.currentTarget.value
                  setOverrides((previous) => ({
                    ...previous,
                    [token]: value,
                    ...Object.fromEntries(
                      aliases.map((alias) => [alias, value]),
                    ),
                  }))
                }}
              />
            </Field>
          ))}
          <Button
            variant="outline"
            disabled={!Object.keys(overrides).length}
            onClick={() => setOverrides({})}
          >
            Reset tweaks
          </Button>
        </div>
        <div
          className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground"
          aria-live="polite"
        >
          {checks.map(([label, ratio]) => (
            <span
              key={label}
              className={
                ratio !== undefined && ratio < 4.5
                  ? 'font-bold text-destructive'
                  : undefined
              }
            >
              {label}: {ratio?.toFixed(1)}:1
              {ratio !== undefined && ratio < 4.5 ? ' — below AA' : ''}
            </span>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground" role="status">
        {notice ||
          'Fictional records. Links stay inside the workshop; form saves are simulated.'}
      </p>
      <div
        data-palette-preview
        className={`${mode === 'dark' ? 'dark ' : ''}min-w-0 rounded-panel bg-surface-muted p-4 text-foreground sm:p-6`}
        style={{ ...tokens, colorScheme: mode }}
        onClickCapture={(event) => {
          if (event.target instanceof Element && event.target.closest('a')) {
            event.preventDefault()
            event.stopPropagation()
            setNotice(
              'This link is part of the preview. Use the Preview selector to inspect another page.',
            )
          }
        }}
      >
        {surface === 'dashboard' && (
          <StableCommandCenter
            data={{
              ...data,
              todayTraining: createTodayTrainingSample(data, today),
            }}
          />
        )}
        {surface === 'events' && (
          <StableEventsPage
            stableId={data.stable._id}
            events={data.events}
            view={eventsView}
            onViewChange={setEventsView}
          />
        )}
        {surface === 'form' && <HorseFormPageLab data={data} />}
      </div>
    </div>
  )
}
