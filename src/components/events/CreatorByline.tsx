import { useT } from '#/i18n/LocaleProvider'

export function CreatorByline({ name }: { name?: string | null }) {
  const t = useT()
  return (
    <span className="block text-sm font-normal text-muted-foreground wrap-anywhere">
      {name
        ? t('eventViews.createdBy', { name })
        : t('eventViews.creatorUnavailable')}
    </span>
  )
}
