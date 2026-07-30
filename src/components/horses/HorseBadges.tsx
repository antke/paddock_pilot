import { Badge } from '#/components/ui/badge'
import { formatCountLabel } from '#/lib/numberDisplay'
import type { ComponentProps } from 'react'

type HorseBadgeProps = Omit<ComponentProps<typeof Badge>, 'children' | 'size'>

export function HorseNameBadge({
  name,
  ...props
}: HorseBadgeProps & {
  name: string
}) {
  return (
    <Badge variant="success" {...props}>
      {name}
    </Badge>
  )
}

export function HorseCountBadge({
  count,
  ...props
}: HorseBadgeProps & {
  count: number
}) {
  return (
    <Badge variant="success" {...props}>
      {formatCountLabel(count, 'horse')}
    </Badge>
  )
}

export function HorseAllergyBadge({
  allergy,
  ...props
}: HorseBadgeProps & {
  allergy: string
}) {
  return (
    <Badge variant="outline" {...props}>
      {allergy}
    </Badge>
  )
}
