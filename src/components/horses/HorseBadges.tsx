import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils'
import type { ComponentProps } from 'react'

type HorseBadgeProps = Omit<ComponentProps<typeof Badge>, 'children' | 'size'>

export function HorseAllergyBadge({
  allergy,
  className,
  ...props
}: HorseBadgeProps & {
  allergy: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'max-w-full whitespace-normal wrap-anywhere text-left',
        className,
      )}
      {...props}
    >
      {allergy}
    </Badge>
  )
}
