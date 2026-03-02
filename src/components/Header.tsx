import { Link } from '@tanstack/react-router'
import ClerkHeader from '../integrations/clerk/header-user.tsx'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur">
      <nav className="page-wrap flex items-center justify-between py-3">
        <Link
          to="/"
          className="rounded-md px-2 py-1 text-sm font-semibold text-[var(--sea-ink)] no-underline transition-colors hover:bg-[var(--chip-bg)]"
        >
          PaddockPilot
        </Link>

        <div className="flex items-center gap-2">
          <ClerkHeader />

          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
