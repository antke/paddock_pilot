import { Link } from '@tanstack/react-router'
import ClerkHeader from '../integrations/clerk/header-user.tsx'
import ThemeToggle from './ThemeToggle'
import { Show } from '@clerk/tanstack-react-start'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur">
      <nav className="page-wrap flex items-center justify-between gap-4 py-3">
        <Link
          to="/"
          className="rounded-md px-2 py-1 text-sm font-semibold text-[var(--sea-ink)] no-underline transition-colors hover:bg-[var(--chip-bg)]"
        >
          PaddockPilot
        </Link>

        <div className="flex align-middle gap-8">
          <Show when="signed-in">
            <div className="flex items-center gap-2">
              <Link to="/stables">Stables</Link>
            </div>
          </Show>

          <Show when="signed-in">
            <div className="flex items-center gap-2">
              <Link to="/stables/create">Add Stable</Link>
            </div>
          </Show>

          <div className="flex items-center gap-2">
            <ClerkHeader />

            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  )
}
