import type { ComponentProps } from 'react'
import { RouteStatusAlert } from '#/components/layout/RouteStatusAlert'
import { useActionErrorText } from '#/lib/actionError'

/**
 * A failed action: the title says what failed ("Couldn’t withdraw the horse"),
 * the text says why and what to do, read from the error itself.
 */
export function ActionErrorAlert({
  title,
  error,
  ...props
}: { title: string; error: unknown } & Omit<
  ComponentProps<typeof RouteStatusAlert>,
  'title' | 'description' | 'tone' | 'children'
>) {
  const describe = useActionErrorText()
  return (
    <RouteStatusAlert
      tone="danger"
      title={title}
      description={describe(error)}
      {...props}
    />
  )
}
