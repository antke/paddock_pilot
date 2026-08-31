import { ArrowRightIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

import {
  DashboardItemCardContent,
  DashboardItemLinkCard,
} from '#/components/dashboard/DashboardItemCard'

type StableCardLinkProps = {
  location?: ReactNode
  meta?: ReadonlyArray<ReactNode>
  name: string
  stableId: string
}

export function StableCardLink({
  location,
  meta,
  name,
  stableId,
}: StableCardLinkProps) {
  const metaContent = [location, ...(meta ?? [])].filter(
    (item): item is Exclude<ReactNode, null | undefined | false> =>
      item !== undefined && item !== null && item !== false,
  )

  return (
    <DashboardItemLinkCard
      to="/stables/$stableId"
      params={{ stableId }}
      chrome="soft"
      density="compact"
    >
      <DashboardItemCardContent
        title={name}
        titleTone="open"
        meta={metaContent.length > 0 ? metaContent : undefined}
        metaSeparator="dot"
        badges={
          <ArrowRightIcon
            aria-hidden="true"
            className="size-4 text-primary"
            weight="bold"
          />
        }
      />
    </DashboardItemLinkCard>
  )
}
