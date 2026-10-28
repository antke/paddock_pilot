import { FieldLabel } from '#/components/ui/field'
import { trainingActivities } from 'shared/training/trainingSchema'
import type { TrainingActivity } from 'shared/training/trainingSchema'
import { Checkbox } from '#/components/ui/checkbox'
import { useId, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import type { FunctionReturnType } from 'convex/server'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Select } from '#/components/ui/select'
import { Textarea } from '#/components/ui/textarea'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { useLocalDateContext } from '#/lib/useLocalDateContext'
import { formatEventDateTime } from './eventDisplay'
import { useLocale, useT } from '#/i18n/LocaleProvider'
import { useActivityCopy } from './activityCopy'

export function ActivityPeople({
  eventId,
  date,
}: {
  eventId: Id<'events'>
  date: string
}) {
  const c = useActivityCopy()
  const id = useId()
  const data = useQuery(api.activityParticipants.forEvent, { eventId, date })
  const invite = useMutation(api.activityParticipants.invite)
  const revoke = useMutation(api.activityParticipants.revoke)
  const [email, setEmail] = useState('')
  const [horseId, setHorseId] = useState('')
  const [role, setRole] = useState<'rider' | 'instructor'>('rider')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const [sent, setSent] = useState(false)
  if (!data?.horses.length) return null
  async function run(action: () => Promise<unknown>) {
    setBusy(true)
    setError(false)
    try {
      await action()
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }
  return (
    <DashboardSectionCard title={c.participants}>
      <p className="max-w-prose text-sm text-muted-foreground">
        {c.participantHelp}
      </p>
      <p className="max-w-prose text-sm text-muted-foreground">{c.inApp}</p>
      <ul className="divide-y divide-border-subtle">
        {data.participants.map((person) => (
          <li
            key={person.id}
            className="flex flex-wrap items-center justify-between gap-3 py-3"
          >
            <div className="min-w-0">
              <p className="break-all font-medium">{person.email}</p>
              <p className="text-sm text-muted-foreground">
                {person.horseName} · {c[person.role]} · {c[person.status]}
              </p>
            </div>
            {(person.status === 'accepted' || person.status === 'invited') && (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => void run(() => revoke({ id: person.id }))}
              >
                {c.remove}
              </Button>
            )}
          </li>
        ))}
      </ul>
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault()
          void run(async () => {
            await invite({
              eventId,
              date,
              horseId: (horseId || data.horses[0].id) as Id<'horses'>,
              email,
              role,
            })
            setEmail('')
            setSent(true)
          })
        }}
      >
        <FieldLabel
          width="full"
          className="grid gap-2 text-sm font-medium"
          htmlFor={`${id}-horse`}
        >
          {c.horse}
          <Select
            id={`${id}-horse`}
            value={horseId || data.horses[0].id}
            onChange={(e) => setHorseId(e.target.value)}
            disabled={busy}
          >
            {data.horses.map((horse) => (
              <option key={horse.id} value={horse.id}>
                {horse.name}
              </option>
            ))}
          </Select>
        </FieldLabel>
        <FieldLabel
          width="full"
          className="grid gap-2 text-sm font-medium"
          htmlFor={`${id}-role`}
        >
          {c.role}
          <Select
            id={`${id}-role`}
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
            disabled={busy}
          >
            <option value="rider">{c.rider}</option>
            <option value="instructor">{c.instructor}</option>
          </Select>
        </FieldLabel>
        <FieldLabel
          width="full"
          className="grid gap-2 text-sm font-medium sm:col-span-2"
          htmlFor={`${id}-email`}
        >
          {c.email}
          <Input
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
          />
        </FieldLabel>
        <Button
          type="submit"
          disabled={busy}
          className="sm:col-span-2 sm:justify-self-start"
        >
          {busy ? c.pending : c.invite}
        </Button>
      </form>
      {sent && (
        <p role="status" className="text-sm text-muted-foreground">
          {c.inApp}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {c.failed}
        </p>
      )}
    </DashboardSectionCard>
  )
}

type Participation = FunctionReturnType<
  typeof api.activityParticipants.mine
>[number]
export function MyActivityInvitations({
  eventId,
  invitationsOnly = false,
}: {
  eventId?: string
  invitationsOnly?: boolean
}) {
  const c = useActivityCopy()
  const rows = useQuery(api.activityParticipants.mine, {})
  const selected = rows?.filter(
    (row) =>
      (!eventId || row.eventId === eventId) &&
      (!invitationsOnly || row.status === 'invited'),
  )
  if (!selected?.length) return null
  return (
    <DashboardSectionCard
      title={invitationsOnly ? c.invitations : c.myActivities}
    >
      <div className="divide-y divide-border-subtle">
        {selected.map((row) => (
          <ActivityInvitation key={row.id} row={row} />
        ))}
      </div>
    </DashboardSectionCard>
  )
}
function ActivityInvitation({ row }: { row: Participation }) {
  const t = useT()
  const c = useActivityCopy()
  const { locale } = useLocale()
  const { today } = useLocalDateContext()
  const id = useId()
  const respond = useMutation(api.activityParticipants.respond)
  const report = useMutation(api.activityParticipants.reportRide)
  const [editing, setEditing] = useState(false)
  const [activities, setActivities] = useState<TrainingActivity[]>(
    row.report?.details.activities ?? row.plannedTraining?.activities ?? [],
  )
  const [format, setFormat] = useState<'regular' | 'lesson' | 'workshop'>(
    row.report?.details.format ?? row.plannedTraining?.format ?? 'regular',
  )
  const [outcome, setOutcome] = useState(row.report?.outcome ?? '')
  const [minutes, setMinutes] = useState(
    String(
      row.report?.details.durationMinutes ??
        row.plannedTraining?.durationMinutes ??
        '',
    ),
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  async function run(action: () => Promise<unknown>) {
    setBusy(true)
    setError(false)
    try {
      await action()
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="grid gap-3 py-4">
      <div>
        <h3 className="font-medium">
          {row.title} · {row.horseName}
        </h3>
        <p className="text-sm text-muted-foreground">
          {formatEventDateTime(row.date, row.time, undefined, locale)} ·{' '}
          {c[row.role]}
        </p>
        {row.location && <p className="text-sm">{row.location}</p>}
      </div>
      <p className="max-w-prose text-sm text-muted-foreground">{c.privacy}</p>
      {row.status === 'invited' ? (
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={busy}
            onClick={() =>
              void run(() => respond({ id: row.id, accept: true }))
            }
          >
            {c.accept}
          </Button>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() =>
              void run(() => respond({ id: row.id, accept: false }))
            }
          >
            {c.decline}
          </Button>
        </div>
      ) : (
        <>
          {row.report && (
            <p role="status">
              {c.saved}
              {row.report.outcome ? ` · ${row.report.outcome}` : ''}
            </p>
          )}
          {row.reported && !row.report && (
            <p className="text-sm">{c.reported}</p>
          )}
          {row.canReport && row.date > today && (
            <p className="text-sm text-muted-foreground">{c.future}</p>
          )}
          {row.canReport && row.date <= today && !editing && (
            <Button
              variant="outline"
              className="justify-self-start"
              onClick={() => setEditing(true)}
            >
              {c.report}
            </Button>
          )}
          {editing && row.canReport && (
            <form
              className="grid gap-3"
              onSubmit={(e) => {
                e.preventDefault()
                void run(async () => {
                  await report({
                    id: row.id,
                    details: {
                      ...row.report?.details,
                      activities,
                      format,
                      durationMinutes: minutes ? Number(minutes) : undefined,
                    },
                    outcome,
                  })
                  setEditing(false)
                })
              }}
            >
              <fieldset className="grid gap-2">
                <legend className="mb-2 text-sm font-medium">
                  {t('eventForm.workType')}
                </legend>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {trainingActivities.map((activity) => (
                    <FieldLabel
                      width="full"
                      key={activity}
                      className="flex min-h-11 items-center gap-2 text-sm"
                    >
                      <Checkbox
                        aria-label={t(`training.activities.${activity}`)}
                        checked={activities.includes(activity)}
                        disabled={busy}
                        onCheckedChange={(checked) =>
                          setActivities(
                            checked
                              ? [...activities, activity]
                              : activities.filter(
                                  (value) => value !== activity,
                                ),
                          )
                        }
                      />
                      {t(`training.activities.${activity}`)}
                    </FieldLabel>
                  ))}
                </div>
              </fieldset>
              <FieldLabel
                width="full"
                htmlFor={`${id}-format`}
                className="grid gap-2 text-sm font-medium"
              >
                {t('eventForm.sessionFormat')}
                <Select
                  id={`${id}-format`}
                  value={format}
                  onChange={(e) => setFormat(e.target.value as typeof format)}
                  disabled={busy}
                >
                  {(['regular', 'lesson', 'workshop'] as const).map((value) => (
                    <option key={value} value={value}>
                      {t(`training.formats.${value}`)}
                    </option>
                  ))}
                </Select>
              </FieldLabel>
              <FieldLabel
                width="full"
                htmlFor={`${id}-minutes`}
                className="grid gap-2 text-sm font-medium"
              >
                {c.minutes}
                <Input
                  id={`${id}-minutes`}
                  type="number"
                  min={1}
                  max={1440}
                  step={1}
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  disabled={busy}
                />
              </FieldLabel>
              <FieldLabel
                width="full"
                htmlFor={`${id}-outcome`}
                className="grid gap-2 text-sm font-medium"
              >
                {c.outcome}
                <Textarea
                  id={`${id}-outcome`}
                  value={outcome}
                  maxLength={1000}
                  onChange={(e) => setOutcome(e.target.value)}
                  disabled={busy}
                />
              </FieldLabel>
              <Button
                type="submit"
                disabled={busy || activities.length === 0}
                className="justify-self-start"
              >
                {busy ? c.pending : c.save}
              </Button>
            </form>
          )}
        </>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {c.failed}
        </p>
      )}
    </section>
  )
}
