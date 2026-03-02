import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="page-wrap px-4 py-16">
      <section className="mx-auto max-w-2xl space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--sea-ink-soft)]">
          Welcome
        </p>
        <h1 className="m-0 text-4xl font-extrabold text-[var(--sea-ink)] sm:text-5xl">
          PaddockPilot
        </h1>
        <p className="m-0 text-base leading-relaxed text-[var(--sea-ink-soft)]">
          Your TanStack Start app is running with a clean baseline route. Build
          the homepage from here.
        </p>
        <div className="pt-4 space-x-4">
          <Link
            to="/convex-test"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Convex Form Test
          </Link>

          <Link
            to="/blog"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Blog
          </Link>
        </div>
      </section>
    </main>
  )
}
