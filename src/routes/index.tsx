import { createFileRoute } from '@tanstack/react-router'

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
      </section>
    </main>
  )
}
