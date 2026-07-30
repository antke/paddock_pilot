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

function showAppErrorToast({
  title = 'Oops! Something went wrong.',
  description = <p>Please try again.</p>,
  ...options
}: AppErrorToastOptions = {}) {
  toast.error(title, {
    ...appToastOptions,
    description,
    ...options,
  })
}

function showAppValidationToast({
  title = 'Check the form',
  ...options
}: AppValidationToastOptions = {}) {
  toast.error(title, {
    ...appToastOptions,
    ...options,
  })
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      data-slot="toaster"
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      closeButton
      icons={{
        success: (
          <CheckCircleIcon className="size-4 text-primary" weight="bold" />
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
        classNames: {
          toast:
            'border-border bg-popover text-popover-foreground shadow-control [&_[data-description]]:text-popover-foreground/80 [&_[data-title]]:text-popover-foreground',
          title: 'text-sm !font-bold !text-popover-foreground',
          description: 'text-sm !font-medium !text-popover-foreground/80',
          actionButton: buttonVariants({ variant: 'default', size: 'xs' }),
          cancelButton: buttonVariants({ variant: 'outline', size: 'xs' }),
          closeButton:
            'border-border bg-surface-elevated text-foreground/70 hover:bg-primary/8 hover:text-foreground',
        },
      }}
      {...props}
    />
  )
}

export {
  showAppErrorToast,
  showAppSuccessToast,
  showAppValidationToast,
  Toaster,
}
