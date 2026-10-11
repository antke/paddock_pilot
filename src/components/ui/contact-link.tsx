import type { ComponentProps } from 'react'
import { cn } from '#/lib/utils'

export function contactHref(kind: 'phone' | 'email', value: string) {
  const trimmed = value.trim()
  if (kind === 'phone') {
    if (!/^\+?[\d\s().-]+$/.test(trimmed)) return undefined
    const number = trimmed.replace(/[\s().-]/g, '')
    return /\d{3}/.test(number) ? `tel:${number}` : undefined
  }
  // Do not allow mailto headers or additional recipients in saved addresses.
  return /^[^\s@?&#%,;:]+@[^\s@?&#%,;:]+\.[^\s@?&#%,;:]+$/.test(trimmed)
    ? `mailto:${trimmed}`
    : undefined
}

/** Shared contact action; unrecognised values remain readable plain text. */
export function ContactLink({
  kind,
  value,
  children,
  className,
  ...props
}: Omit<ComponentProps<'a'>, 'href'> & {
  kind: 'phone' | 'email'
  value: string
}) {
  const href = contactHref(kind, value)
  if (!href) return <span className={className}>{children ?? value}</span>
  return (
    <a
      href={href}
      className={cn(
        'inline-flex max-w-full items-center break-all max-md:min-h-11 pointer-coarse:min-h-11 rounded-sm text-primary underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring',
        className,
      )}
      {...props}
    >
      {children ?? value}
    </a>
  )
}
