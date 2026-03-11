import { ClerkLoading, SignedIn, SignedOut } from '@clerk/clerk-react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/')({
  component: HomePage,
  ssr: false,
})

function HomePage() {
  const identity = useQuery(api.users.getCurrentIdentity)
  console.log(identity)

  return (
    <main className="page-wrap px-4 py-16">
      <ClerkLoading>LOADING</ClerkLoading>
      <SignedOut>
        <h3>Hello sign up</h3>
      </SignedOut>

      <SignedIn>
        <h3>Welcome back {identity?.name}</h3>
        <h2>
          to musi byc zrobione lepiej i ladowac sie w pre-flight, ustawiac
          suspense
        </h2>
      </SignedIn>
    </main>
  )
}
