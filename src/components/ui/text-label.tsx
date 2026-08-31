import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { createElement } from 'react'
import type { HTMLAttributes } from 'react'

import { cn } from '#/lib/utils'

const textLabelVariants = cva('uppercase text-muted-foreground', {
  variants: {
    size: {
      nano: 'text-xs',
      micro: 'text-xs',
      xs: 'text-xs',
      sm: 'text-sm',
    },
    weight: {
      medium: 'font-medium',
      semibold: 'font-semibold',
      black: 'font-black',
    },
    tracking: {
      standard: 'tracking-[0.035em]',
      tight: 'tracking-[0.015em]',
      loose: 'tracking-[0.06em]',
      wide: 'tracking-[0.08em]',
      none: '',
    },
  },
  defaultVariants: {
    size: 'xs',
    weight: 'semibold',
    tracking: 'standard',
  },
})

type TextLabelElement = 'span' | 'div' | 'p' | 'h3' | 'legend' | 'dt'

type TextLabelProps = HTMLAttributes<HTMLElement> &
  VariantProps<typeof textLabelVariants> & {
    as?: TextLabelElement
  }

function TextLabel({
  as = 'span',
  className,
  size,
  weight,
  tracking,
  ...props
}: TextLabelProps) {
  return createElement(as, {
    'data-slot': 'text-label',
    className: cn(textLabelVariants({ size, weight, tracking }), className),
    ...props,
  })
}

export { TextLabel, textLabelVariants }
