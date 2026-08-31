import { Badge } from '#/components/ui/badge'
import type { ComponentProps } from 'react'

type HorseBadgeProps = Omit<ComponentProps<typeof Badge>, 'children' | 'size'>

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
