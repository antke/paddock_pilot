import {
  useCanGoBack,
  useMatches,
  useParams,
  useRouter,
} from '@tanstack/react-router'
import type { ComponentProps } from 'react'

import { BackButton, BackLink } from '#/components/ui/back-action'
import { pageBackRuleFor } from './pageHierarchy'
import type { PageBackTarget } from './pageHierarchy'

type PageBackProps = {
  /** Replace navigation with a task exit, such as a form's guarded close. */
  onClick?: ComponentProps<typeof BackButton>['onClick']
  disabled?: boolean
  /** Only for pages whose parent depends on loaded data (activity type). */
  target?: PageBackTarget
}

/**
 * The page's top-left Back. Page headers render it by default; its destination
 * comes from `pageBackRules`, so individual pages do not place Back by hand.
 */
export function PageBack(props: PageBackProps) {
  // Isolated renders (component tests, specimens) have no router to read.
  const router = useRouter({ warn: false })
  return router ? <RoutedPageBack {...props} /> : null
}

function RoutedPageBack({ onClick, disabled, target }: PageBackProps) {
  const matches = useMatches()
  const params = useParams({ strict: false })
  const router = useRouter()
  const canGoBack = useCanGoBack()
  const routeId = matches.at(-1)?.routeId ?? ''
  const rule = target ?? pageBackRuleFor(routeId)

  if (onClick) {
    if (rule === 'none') return null
    return (
      <BackButton data-slot="page-back" onClick={onClick} disabled={disabled} />
    )
  }
  // Lab specimens preview production headers, so they keep a Back to the lab.
  if (rule === 'none' && routeId === '/page-lab/$page')
    return <BackLink data-slot="page-back" to="/page-lab" />
  if (rule === false || rule === 'none') return null

  return (
    <BackLink
      data-slot="page-back"
      // Params are shared by name across the tree; unused ones are ignored.
      to={rule.to}
      params={params as never}
      disabled={disabled}
      onClick={(event) => {
        if (!rule.preferHistory || !canGoBack) return
        event.preventDefault()
        router.history.back()
      }}
    />
  )
}
