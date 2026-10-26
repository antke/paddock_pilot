import type { ComponentProps } from 'react'
import { createLink } from '@tanstack/react-router'
import { ArrowLeftIcon } from '@phosphor-icons/react'
import { Button, ButtonAnchor } from './button'
import { cn } from '#/lib/utils'
import { useT } from '#/i18n/LocaleProvider'

const backActionClassName =
  'min-h-11 w-fit justify-self-start justify-start gap-2 border-0 bg-transparent px-0 text-left text-sm font-semibold text-primary shadow-none hover:bg-transparent'

type BackButtonProps = Omit<
  ComponentProps<typeof Button>,
  'variant' | 'size' | 'action'
>
export function BackButton({ children, className, ...props }: BackButtonProps) {
  const t = useT()
  return (
    <Button
      type="button"
      {...props}
      variant="link"
      className={cn(backActionClassName, className)}
    >
      <ArrowLeftIcon aria-hidden="true" />
      {children ?? t('dashboard.back')}
    </Button>
  )
}

function BackAnchor({
  children,
  className,
  ...props
}: Omit<ComponentProps<typeof ButtonAnchor>, 'variant' | 'size' | 'action'>) {
  const t = useT()
  return (
    <ButtonAnchor
      {...props}
      variant="link"
      className={cn(backActionClassName, className)}
    >
      <ArrowLeftIcon aria-hidden="true" />
      {children ?? t('dashboard.back')}
    </ButtonAnchor>
  )
}
export const BackLink = createLink(BackAnchor)
