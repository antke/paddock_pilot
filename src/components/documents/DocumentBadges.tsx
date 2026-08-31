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
  return (
    <Badge
      variant={fileState === 'unavailable' ? 'warning' : 'secondary'}
      {...props}
    >
      {fileState === 'unavailable' ? 'File unavailable' : 'No file attached'}
    </Badge>
  )
}
