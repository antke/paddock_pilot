import { Link } from '@tanstack/react-router'
import ClerkHeader from '../integrations/clerk/header-user.tsx'
import ThemeToggle from './ThemeToggle'
import { Show } from '@clerk/tanstack-react-start'

const navLinkClass =
  'rounded-full px-3 py-1.5 text-sm font-semibold text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-foreground'
const activeNavLinkClass = 'bg-primary/10 text-primary dark:bg-primary/15'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-md">
      <nav className="page-wrap flex flex-wrap items-center justify-between gap-3 py-3">
        <Link
          to="/"
          activeOptions={{ exact: true }}
          activeProps={{ className: activeNavLinkClass }}
          className="rounded-full px-3 py-1.5 text-sm font-extrabold tracking-tight text-[var(--sea-ink)] no-underline transition-colors hover:bg-[var(--chip-bg)]"
        >
          PaddockPilot
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-5">
          <Show when="signed-in">
            <div className="flex items-center gap-1 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] p-1">
              <Link
                to="/stables"
                activeProps={{ className: activeNavLinkClass }}
                className={navLinkClass}
              >
                Stables
              </Link>
              <Link
                to="/stables/create"
                activeProps={{ className: activeNavLinkClass }}
                className={navLinkClass}
              >
                Add Stable
              </Link>
            </div>
          </Show>

          <div className="flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] p-1">
            <ClerkHeader />

            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  )
}
