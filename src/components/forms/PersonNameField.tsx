import { useConvex, useConvexAuth, useQueries } from 'convex/react'
import type { RequestForQueries } from 'convex/react'
import { useMemo } from 'react'
import { api } from 'convex/_generated/api'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'
import { useT } from '#/i18n/LocaleProvider'
import { PersonNameAutocomplete } from './PersonNameAutocomplete'
import type { PersonNameAutocompleteProps } from './PersonNameAutocomplete'

export type PersonNameScope = {
  stableId?: string
  horseIds?: ReadonlyArray<string>
}
type Props = Omit<PersonNameAutocompleteProps, 'suggestions'> & {
  scope?: PersonNameScope
  suggestions?: PersonNameAutocompleteProps['suggestions']
}

export function PersonNameField({ scope, suggestions, ...props }: Props) {
  if (suggestions)
    return <PersonNameAutocomplete {...props} suggestions={suggestions} />
  return <AutomaticPersonNameField {...props} scope={scope} />
}

function AutomaticPersonNameField({
  scope,
  ...props
}: Omit<Props, 'suggestions'>) {
  const client = useConvex()
  const fixture = useDevAuthBypassEnabled()
  // Standalone forms and sample routes stay usable without a live account.
  if (!client || fixture)
    return <PersonNameAutocomplete {...props} suggestions={[]} />
  return <ConnectedPersonNameField {...props} scope={scope} />
}

function ConnectedPersonNameField({
  scope,
  ...props
}: Omit<Props, 'suggestions'>) {
  const t = useT()
  const { isAuthenticated } = useConvexAuth()
  const stableId = scope?.stableId
  const horseIds = scope?.horseIds
  // useQueries keys its subscription by this object's identity. Recreating it
  // during its own state update would keep scheduling renders indefinitely.
  const queries = useMemo<RequestForQueries>((): RequestForQueries => {
    if (!isAuthenticated) return {}
    return {
      people: {
        query: api.people.suggestNames,
        args: {
          ...(stableId ? { stableId } : {}),
          horseIds: [...new Set(horseIds ?? [])].sort(),
        },
      },
    }
  }, [isAuthenticated, stableId, horseIds])
  // A failed suggestion request must not prevent entering or saving a name.
  const result = useQueries(queries).people
  return (
    <PersonNameAutocomplete
      {...props}
      showEmptySuggestions
      emptyMessage={
        result instanceof Error
          ? t('listControls.peopleSuggestionsFailed')
          : result === undefined
            ? t('listControls.peopleSuggestionsLoading')
            : props.emptyMessage
      }
      suggestions={Array.isArray(result) ? result : []}
    />
  )
}
