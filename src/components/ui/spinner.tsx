import { useT } from '#/i18n/LocaleProvider'
import { SpinnerIcon } from '@phosphor-icons/react'

import { cn } from '#/lib/utils.ts'

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  const t = useT()
  return (
    <SpinnerIcon
      data-slot="spinner"
      role="status"
      aria-label={t('common.loading')}
      className={cn(
        'size-4 animate-spin text-primary motion-reduce:animate-none',
        className,
      )}
      weight="bold"
      {...props}
    />
  )
}

export { Spinner }
