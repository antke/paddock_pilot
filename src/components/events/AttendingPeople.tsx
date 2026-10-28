import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useLocale } from '#/i18n/LocaleProvider'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'

export function AttendingPeople({ eventId }: { eventId: Id<'events'> }) {
  const people = useQuery(api.events.attendingPeople, { eventId })
  const { locale } = useLocale()
  if (!people?.length) return null
  return (
    <DashboardSectionCard title={locale === 'pl' ? 'Uczestnicy' : 'Attending'}>
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {people.map((person) => (
          <li key={person.id}>{person.name}</li>
        ))}
      </ul>
    </DashboardSectionCard>
  )
}
