import type { ComponentProps } from 'react'
import { ButtonLink } from '#/components/ui/button'
import { EditActionLink } from '#/components/ui/edit-action'
import { useTaskOriginState } from '#/components/layout/mobileTaskNavigation'
import type { HorseEditSection } from '#/components/forms/horse/horseEditSection'

/**
 * Opens the shared horse editor at one task's section. The origin is kept so a
 * saved edit returns to the view that opened it.
 *
 * `appearance="icon"` is the quiet form used in record group titles: an
 * always-visible pencil in the group's top-right corner.
 */
export function HorseEditEntry({
  horseId,
  stableId,
  section,
  label,
  className,
  size = 'sm',
  appearance = 'text',
  'aria-label': ariaLabel,
}: {
  horseId: string
  stableId?: string
  section: HorseEditSection
  label: string
  className?: string
  size?: ComponentProps<typeof ButtonLink>['size']
  appearance?: 'text' | 'icon'
  'aria-label'?: string
}) {
  const taskState = useTaskOriginState()
  const link = {
    to: stableId
      ? ('/stables/$stableId/horses/$horseId/edit' as const)
      : ('/horses/$horseId/edit' as const),
    params: { horseId, stableId: stableId ?? '' },
    search: { section },
    state: taskState,
  }

  if (appearance === 'icon') {
    return (
      <EditActionLink
        {...link}
        label={ariaLabel ?? label}
        className={className}
      />
    )
  }

  return (
    <ButtonLink
      {...link}
      variant="ghost"
      size={size}
      action="edit"
      className={className}
      aria-label={ariaLabel}
    >
      {label}
    </ButtonLink>
  )
}
