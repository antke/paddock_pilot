import { Checkbox } from '#/components/ui/checkbox'
import { FieldLabel } from '#/components/ui/field'
import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useLocale } from '#/i18n/LocaleProvider'

export type SharingChoice = { horseId: string; enabled: boolean }
export function NewRecordAudience({
  defaultShared = false,
  horseIds,
  choices = [],
  onChange,
  disabled,
}: {
  defaultShared?: boolean
  horseIds: Array<string>
  choices?: Array<SharingChoice>
  onChange: (choices: Array<SharingChoice>) => void
  disabled?: boolean
}) {
  const audience = useQuery(api.recordSharing.creationAudience, {
    horseIds: horseIds as Array<Id<'horses'>>,
  })
  if (!horseIds.length || !audience) return null
  return (
    <RecordAudienceChoices
      defaultShared={defaultShared}
      audience={audience}
      choices={choices}
      onChange={onChange}
      disabled={disabled}
    />
  )
}

export function RecordAudienceChoices({
  defaultShared = false,
  audience,
  choices = [],
  onChange,
  disabled,
}: {
  defaultShared?: boolean
  audience: Array<{
    horseId: string
    stableId: string
    stableName: string
    fixed: boolean
  }>
  choices?: Array<SharingChoice>
  onChange: (choices: Array<SharingChoice>) => void
  disabled?: boolean
}) {
  const { locale } = useLocale()
  const pl = locale === 'pl'
  if (!audience.length)
    return (
      <p className="text-sm text-muted-foreground">
        {pl
          ? 'Nieudostępnione stajni. Dostęp zachowują zaproszeni opiekunowie.'
          : 'Not shared with a stable. Invited carers keep their access.'}
      </p>
    )
  const groups = new Map<string, typeof audience>()
  for (const item of audience) {
    const key = `${item.stableId}:${item.fixed}`
    groups.set(key, [...(groups.get(key) ?? []), item])
  }
  return (
    <fieldset
      className="space-y-3 border-b border-border pb-4"
      disabled={disabled}
    >
      <legend className="sr-only">{pl ? 'Udostępnianie' : 'Sharing'}</legend>
      {[...groups.entries()].map(([key, group]) => {
        const { stableName, fixed } = group[0]
        if (fixed)
          return (
            <p key={key} className="text-sm">
              {pl
                ? `Udostępnione stajni ${stableName} i właścicielowi konia`
                : `Shared with ${stableName} and the horse owner`}
            </p>
          )
        const checked = group.every(
          (item) =>
            choices.find((choice) => choice.horseId === item.horseId)
              ?.enabled ?? defaultShared,
        )
        return (
          <FieldLabel
            key={key}
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium"
          >
            <Checkbox
              aria-label={
                pl
                  ? `Udostępnij stajni ${stableName}`
                  : `Share with ${stableName}`
              }
              checked={checked}
              onCheckedChange={(nextChecked) => {
                const ids = new Set(group.map((item) => item.horseId))
                onChange([
                  ...choices.filter((choice) => !ids.has(choice.horseId)),
                  ...group.map((item) => ({
                    horseId: item.horseId,
                    enabled: nextChecked,
                  })),
                ])
              }}
            />
            {pl
              ? `Udostępnij stajni ${stableName}`
              : `Share with ${stableName}`}
          </FieldLabel>
        )
      })}
      <p className="text-sm text-muted-foreground">
        {pl
          ? 'Członkowie widzą harmonogram i status. Administratorzy widzą udostępnione szczegóły.'
          : 'Members see the schedule and status. Administrators see shared details.'}
      </p>
    </fieldset>
  )
}
