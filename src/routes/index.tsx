import { Show } from '@clerk/tanstack-react-start'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from '../../convex/_generated/api'
import { Suspense } from 'react'

export const Route = createFileRoute('/')({
  component: () => (
    <Suspense fallback={null}>
      <HomePage />
    </Suspense>
  ),
})

function HomePage() {
  const { data: user } = useSuspenseQuery(convexQuery(api.users.getCurrentUser))

  return (
    <main className="page-wrap px-4 py-16">
      <Show when="signed-out">
        <h3>Hello sign up</h3>
      </Show>

      <Show when="signed-in">
        <h3>
          Welcome back {user?.firstName} {user?.lastName}
          <br />
          fix weird behaviour on refresh - indicator of a race condition?
        </h3>
      </Show>
    </main>
  )
}
