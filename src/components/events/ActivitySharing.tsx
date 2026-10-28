import { useMutation, useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useState } from 'react'
import { CalendarSourceChoices } from './CalendarSourceChoices'
import { useLocale } from '#/i18n/LocaleProvider'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'

export function ActivitySharing({ eventId }: { eventId: Id<'events'> }) {
  const settings = useQuery(api.activitySharing.choices, { eventId })
  const stables = useQuery(api.stables.list)
  const save = useMutation(api.activitySharing.setCalendars)
  const { locale } = useLocale()
  const pl = locale === 'pl'
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  if (!settings || !stables || (!stables.length && !settings.originStableId))
    return null
  return (
    <DashboardSectionCard title={pl ? 'Udostępnianie' : 'Sharing'}>
      <CalendarSourceChoices
        label={pl ? 'Udostępnianie' : 'Sharing'}
        choices={[
          {
            id: 'mine',
            name: pl ? 'Mój kalendarz' : 'My calendar',
            disabled: true,
          },
          ...stables.map((stable) => ({
            id: stable._id,
            name: stable.name,
            disabled: stable._id === settings.originStableId,
          })),
        ]}
        value={[
          'mine',
          ...(settings.originStableId && settings.originShared
            ? [settings.originStableId]
            : []),
          ...settings.stableIds,
        ]}
        disabled={busy}
        onChange={async (ids) => {
          setBusy(true)
          setError(false)
          try {
            await save({
              eventId,
              stableIds: ids.filter(
                (id) =>
                  id !== 'mine' &&
                  id !== settings.originStableId &&
                  stables.some((stable) => stable._id === id),
              ) as Id<'stables'>[],
            })
          } catch {
            setError(true)
          } finally {
            setBusy(false)
          }
        }}
      />
      <p className="text-sm text-muted-foreground">
        {pl
          ? 'Członkowie wybranych stajni widzą harmonogram i status. Administratorzy widzą udostępnione szczegóły. Właściciele i uprawnieni opiekunowie zachowują dostęp.'
          : 'Selected stable members see the schedule and status. Administrators see shared details. Owners and authorized carers keep their access.'}
      </p>
      {settings.originStableId && (
        <p className="text-sm text-muted-foreground">
          {pl
            ? 'Udostępnianiem stajni, w której utworzono wpis, zarządza się osobno dla każdego konia.'
            : 'Sharing with the original stable is managed separately for each horse.'}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {pl
            ? 'Nie udało się zmienić udostępniania.'
            : 'Could not update sharing.'}
        </p>
      )}
    </DashboardSectionCard>
  )
}
