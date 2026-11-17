import { ArrowRightIcon } from '@phosphor-icons/react'
import { createLink } from '@tanstack/react-router'
import { forwardRef } from 'react'
import type { ComponentProps } from 'react'
import { buttonVariants } from '#/components/ui/button'
import { cn } from '#/lib/utils'

const SeeAllAnchor = forwardRef<HTMLAnchorElement, ComponentProps<'a'>>(
  function SeeAllAnchorRender({ children, className, ...props }, ref) {
    return (
      <a
        ref={ref}
        data-slot="button"
        className={cn(
          // Same outlined control and height as the filled Add beside it; colour carries the hierarchy.
          buttonVariants({ variant: 'outline', size: 'sm' }),
          'min-h-11',
          className,
        )}
        {...props}
      >
        {children}
        <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
      </a>
    )
  },
)

/** The one “All …” link of a dashboard section; it goes in the title row's `actions`, before the filled Add. */
export const SeeAllLink = createLink(SeeAllAnchor)
