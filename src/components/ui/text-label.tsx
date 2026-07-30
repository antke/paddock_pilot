import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { createElement } from 'react'
import type { HTMLAttributes } from 'react'

import { cn } from '#/lib/utils'

const textLabelVariants = cva('uppercase text-muted-foreground', {
  variants: {
    size: {
      nano: 'text-[10px]',
      micro: 'text-[0.68rem]',
      xs: 'text-xs',
      sm: 'text-sm',
    },
    weight: {
      medium: 'font-medium',
      semibold: 'font-semibold',
      black: 'font-black',
    },
    tracking: {
      standard: 'tracking-normal',
      tight: 'tracking-normal',
      loose: 'tracking-normal',
      wide: 'tracking-normal',
      none: '',
    },
  },
  defaultVariants: {
    size: 'xs',
    weight: 'medium',
    tracking: 'standard',
  },
})

type TextLabelElement = 'span' | 'div' | 'p' | 'h3' | 'legend'

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
    className: cn(textLabelVariants({ size, weight, tracking }), className),
    ...props,
  })
}

export { TextLabel, textLabelVariants }
