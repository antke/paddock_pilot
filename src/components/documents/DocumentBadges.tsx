import { Badge } from '#/components/ui/badge'
import type { ComponentProps } from 'react'
import { stableDocumentTypeLabels } from 'shared/stables/stableDocumentSchema'
import type { StableDocumentType } from 'shared/stables/stableDocumentSchema'

type DocumentBadgeProps = Omit<
  ComponentProps<typeof Badge>,
  'children' | 'size'
>

export function DocumentTypeBadge({
  type,
  ...props
}: DocumentBadgeProps & {
  type: StableDocumentType
}) {
  return (
    <Badge variant="outline" {...props}>
      {stableDocumentTypeLabels[type]}
    </Badge>
  )
}

export function DocumentMetadataOnlyBadge(props: DocumentBadgeProps) {
  return (
    <Badge variant="secondary" {...props}>
      Metadata only
    </Badge>
  )
}
