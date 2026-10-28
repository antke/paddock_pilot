import { useWorkspace } from '#/components/layout/WorkspaceContext'
import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useLocale } from '#/i18n/LocaleProvider'
import { ButtonLink } from '#/components/ui/button'

/** The same audience disclosure is used from personal and stable detail routes. */
export function RecordAudienceLabel({
  horseId,
  recordId,
  date,
}: {
  horseId: Id<'horses'>
  recordId: string
  date?: string
}) {
  const { locale } = useLocale()
  const pl = locale === 'pl'
  const audience = useQuery(api.recordSharing.audience, {
    horseId,
    recordId,
    occurrenceDate: date,
  })
  if (!audience) return null
  const sharedCalendars = [
    ...new Map(
      [
        ...(audience.shared && audience.stable ? [audience.stable] : []),
        ...(audience.activityCalendars ?? []),
      ].map((stable) => [stable._id, stable]),
    ).values(),
  ]
  return (
    <details className="text-sm">
      <summary className="app-control-focus min-h-11 cursor-pointer py-3">
        {sharedCalendars.length
          ? `${pl ? 'Udostępnione' : 'Shared'} · ${sharedCalendars.map((stable) => stable.name).join(', ')}`
          : pl
            ? 'Prywatne · właściciel i opiekunowie'
            : 'Private · owner and carers'}
      </summary>
      <p className="text-muted-foreground">
        {pl
          ? 'Zaproszeni opiekunowie zachowują dostęp. Po udostępnieniu członkowie widzą harmonogram i status, a administratorzy szczegóły.'
          : 'Invited carers keep access. When shared, members see schedule and status; administrators see details.'}
      </p>
      {audience.canManage && (
        <ButtonLink
          to="/horses/$horseId/manage"
          params={{ horseId }}
          variant="link"
        >
          {pl ? 'Zarządzaj udostępnianiem' : 'Manage sharing'}
        </ButtonLink>
      )}
    </details>
  )
}

/** Specimens without a workspace do not issue authenticated queries. */
export function WorkspaceRecordAudience(
  props: Parameters<typeof RecordAudienceLabel>[0],
) {
  const workspace = useWorkspace()
  return workspace ? <RecordAudienceLabel {...props} /> : null
}
