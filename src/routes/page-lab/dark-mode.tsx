import { createFileRoute } from '@tanstack/react-router'
import { DarkModeLab } from '#/components/dark-mode-lab/DarkModeLab'
import { parseDarkModeSearch } from '#/components/dark-mode-lab/darkModePalettes'

export const Route = createFileRoute('/page-lab/dark-mode')({
  validateSearch: parseDarkModeSearch,
  head: () => ({
    meta: [
      { title: 'Dark mode studies · Paddock Pilot' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: DarkModeLabRoute,
})

function DarkModeLabRoute() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <DarkModeLab
      search={search}
      onChange={(next) =>
        void navigate({
          search: { ...search, ...next },
          replace: true,
          resetScroll: false,
          // A colour comparison keeps the form mounted and preserves its draft.
          // Changing the specimen still respects the form's navigation guard.
          ignoreBlocker:
            next.surface === undefined || next.surface === search.surface,
        })
      }
    />
  )
}
