import { SignIn } from '@clerk/tanstack-react-start'
import { createFileRoute } from '@tanstack/react-router'
import { AuthPageShell } from '#/components/layout/AuthPageShell'

export const Route = createFileRoute('/sign-in/$')({
  component: SignInPage,
})

function SignInPage() {
  return (
    <AuthPageShell>
      <SignIn />
    </AuthPageShell>
  )
}
