import { useMutation, useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useLocale, useT } from '#/i18n/LocaleProvider'
import { ConfirmActionButton } from '#/components/ui/confirm-action'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'

export function AttendingPeople({
  eventId,
  title,
}: {
  eventId: Id<'events'>
  title?: string
}) {
  // Page Lab fixture ids are not valid Convex ids.
  const fixtureMode = useDevAuthBypassEnabled()
  const people = useQuery(
    api.events.attendingPeople,
    fixtureMode ? 'skip' : { eventId },
  )
  const { locale } = useLocale()
  const t = useT()
  const leave = useMutation(api.events.leaveAttendance)
  if (!people?.length) return null
  return (
    <DashboardSectionCard
      title={locale === 'pl' ? 'Uczestnicy' : 'Attending'}
      actions={
        people.some((person) => person.isMe) ? (
          <ConfirmActionButton
            size="sm"
            label={t('eventViews.leaveAttendance')}
            title={t('eventViews.leaveAttendanceNamed', {
              title: title ?? '',
            })}
            description={t('eventViews.leaveAttendanceHelp')}
            cancelLabel={t('eventViews.stayAttending')}
            failedLabel={t('eventViews.leaveAttendanceFailed', {
              title: title ?? '',
            })}
            onConfirm={() => leave({ eventId })}
          />
        ) : undefined
      }
    >
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {people.map((person) => (
          <li key={person.id}>{person.name}</li>
        ))}
      </ul>
    </DashboardSectionCard>
  )
}
