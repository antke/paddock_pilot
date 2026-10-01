import { useT } from '#/i18n/LocaleProvider'
import { Badge } from '#/components/ui/badge'
import type { ComponentProps } from 'react'
import type { StableDocumentFileState } from 'shared/stables/stableDocumentSchema'

type DocumentBadgeProps = Omit<
  ComponentProps<typeof Badge>,
  'children' | 'size'
>

export function DocumentFileStateBadge({
  fileState = 'metadata-only',
  ...props
}: DocumentBadgeProps & {
  fileState?: Exclude<StableDocumentFileState, 'available'>
}) {
  const t = useT()

  return (
    <Badge
      variant={fileState === 'unavailable' ? 'warning' : 'secondary'}
      {...props}
    >
      {fileState === 'unavailable'
        ? t('documents.unavailable')
        : t('documents.noFile')}
    </Badge>
  )
}
