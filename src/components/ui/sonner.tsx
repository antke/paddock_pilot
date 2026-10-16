import { useT } from '#/i18n/LocaleProvider'
import { useTheme } from 'next-themes'
import { Toaster as Sonner, toast } from 'sonner'
import type { ExternalToast, ToasterProps } from 'sonner'
import {
  CheckCircleIcon,
  InfoIcon,
  WarningIcon,
  XCircleIcon,
} from '@phosphor-icons/react'
import { buttonVariants } from './button'
import { Spinner } from './spinner'

const appToastOptions = {
  position: 'top-right',
} satisfies ExternalToast

type AppErrorToastOptions = ExternalToast & {
  title?: string
}

type AppSuccessToastOptions = ExternalToast & {
  title: string
}

type AppValidationToastOptions = ExternalToast & {
  title?: string
}

function showAppSuccessToast({ title, ...options }: AppSuccessToastOptions) {
  toast.success(title, {
    ...appToastOptions,
    ...options,
  })
}

/** One notification follows the real operation from pending to its outcome. */
function showAppPromiseToast<T>(
  promise: Promise<T>,
  options: NonNullable<Parameters<typeof toast.promise<T>>[1]>,
) {
  return toast.promise(promise, { ...appToastOptions, ...options })
}

function showAppErrorToast({
  title,
  description,
  ...options
}: AppErrorToastOptions = {}) {
  toast.error(title ?? <DefaultToastMessage message="common.errorToast" />, {
    ...appToastOptions,
    description: description ?? (
      <p>
        <DefaultToastMessage message="common.tryAgain" />
      </p>
    ),
    ...options,
  })
}

function showAppValidationToast({
  title,
  ...options
}: AppValidationToastOptions = {}) {
  toast.error(
    title ?? <DefaultToastMessage message="common.validationToast" />,
    {
      ...appToastOptions,
      ...options,
    },
  )
}

function DefaultToastMessage({
  message,
}: {
  message: 'common.errorToast' | 'common.tryAgain' | 'common.validationToast'
}) {
  const t = useT()
  return t(message)
}

const Toaster = ({ ...props }: ToasterProps) => {
  const t = useT()
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      data-slot="toaster"
      containerAriaLabel={t('common.notifications')}
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      closeButton
      icons={{
        success: (
          <CheckCircleIcon
            className="app-success-feedback size-4 text-primary"
            weight="bold"
          />
        ),
        info: <InfoIcon className="size-4 text-chart-2" weight="bold" />,
        warning: <WarningIcon className="size-4 text-chart-3" weight="bold" />,
        error: (
          <XCircleIcon className="size-4 text-destructive" weight="bold" />
        ),
        loading: <Spinner />,
      }}
      style={
        {
          fontFamily: 'var(--font-sans)',
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--gray11':
            'color-mix(in srgb, var(--popover-foreground) 82%, transparent)',
          '--gray12': 'var(--popover-foreground)',
          '--success-bg': 'var(--popover)',
          '--success-text': 'var(--popover-foreground)',
          '--success-border': 'var(--primary)',
          '--info-bg': 'var(--popover)',
          '--info-text': 'var(--popover-foreground)',
          '--info-border': 'var(--chart-2)',
          '--warning-bg': 'var(--popover)',
          '--warning-text': 'var(--popover-foreground)',
          '--warning-border': 'var(--chart-3)',
          '--error-bg': 'var(--popover)',
          '--error-text': 'var(--popover-foreground)',
          '--error-border': 'var(--destructive)',
          '--border-radius': 'var(--radius-panel)',
        } as React.CSSProperties
      }
      toastOptions={{
        closeButtonAriaLabel: t('common.closeNotification'),
        style: { paddingInlineEnd: '3.5rem', minHeight: '4rem' },
        classNames: {
          toast:
            'border-border bg-popover text-popover-foreground shadow-control [&_[data-description]]:text-popover-foreground/80 [&_[data-title]]:text-popover-foreground',
          title: 'text-sm !font-bold !text-popover-foreground',
          description: 'text-sm !font-medium !text-popover-foreground/80',
          actionButton: buttonVariants({ variant: 'default', size: 'xs' }),
          cancelButton: buttonVariants({ variant: 'outline', size: 'xs' }),
          // Override Sonner's unlayered styles; the invisible inset keeps a 44px tap target.
          closeButton:
            "top-2! start-auto! end-2! size-8! transform-none! rounded-control! border-0! bg-transparent! text-muted-foreground! shadow-none! hover:bg-primary/8! hover:text-foreground! active:bg-primary/15! focus-visible:outline-2! focus-visible:outline-offset-2! focus-visible:outline-solid! focus-visible:outline-ring! after:absolute after:-inset-1.5 after:content-['']",
        },
      }}
      {...props}
    />
  )
}

export {
  showAppPromiseToast,
  showAppErrorToast,
  showAppSuccessToast,
  showAppValidationToast,
  Toaster,
}
