import { useWorkspace } from '#/components/layout/WorkspaceContext'
import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { Link } from '@tanstack/react-router'
import { LockSimpleIcon, UsersThreeIcon } from '@phosphor-icons/react'
import { useLocale } from '#/i18n/LocaleProvider'
import { FormHelpTooltip } from '#/components/forms/FormHelpTooltip'

/**
 * Who can see a horse record, as one quiet status line: an icon and the audience, the
 * rules behind a help button, and Manage sharing for those who can change it. A fact,
 * not a disclosure, so it reads at a glance and sits inside the record it describes.
 */
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
  const shared = sharedCalendars.length > 0
  const Icon = shared ? UsersThreeIcon : LockSimpleIcon
  return (
    // A span, so it can sit in a card's description paragraph.
    <span
      data-slot="record-audience"
      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"
    >
      <span className="inline-flex min-w-0 items-center gap-1.5">
        <Icon aria-hidden="true" className="size-4 shrink-0" />
        <span className="[overflow-wrap:anywhere]">
          {shared
            ? `${pl ? 'Udostępnione' : 'Shared'} · ${sharedCalendars.map((stable) => stable.name).join(', ')}`
            : pl
              ? 'Prywatne · właściciel i opiekunowie'
              : 'Private · owner and carers'}
        </span>
      </span>
      <FormHelpTooltip inline label={pl ? 'Kto to widzi' : 'Who can see this'}>
        {pl
          ? 'Zaproszeni opiekunowie zachowują dostęp. Po udostępnieniu członkowie widzą harmonogram i status, a administratorzy szczegóły.'
          : 'Invited carers keep access. When shared, members see schedule and status; administrators see details.'}
      </FormHelpTooltip>
      {audience.canManage && (
        <Link
          to="/horses/$horseId/manage"
          params={{ horseId }}
          // Text-height in the line; the overlay keeps a 44px tap target on touch screens.
          className="app-control-focus relative rounded-control font-semibold text-primary underline-offset-4 hover:underline pointer-coarse:after:absolute pointer-coarse:after:-inset-y-3 pointer-coarse:after:inset-x-0 pointer-coarse:after:content-['']"
        >
          {pl ? 'Zarządzaj udostępnianiem' : 'Manage sharing'}
        </Link>
      )}
    </span>
  )
}

/** Specimens without a workspace do not issue authenticated queries. */
export function WorkspaceRecordAudience(
  props: Parameters<typeof RecordAudienceLabel>[0],
) {
  const workspace = useWorkspace()
  return workspace ? <RecordAudienceLabel {...props} /> : null
}
