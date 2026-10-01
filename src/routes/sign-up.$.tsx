import { SignUp } from '@clerk/tanstack-react-start'
import { createFileRoute } from '@tanstack/react-router'
import { AuthPageShell } from '#/components/layout/AuthPageShell'

export const Route = createFileRoute('/sign-up/$')({
  component: SignUpPage,
})

function SignUpPage() {
  return (
    <AuthPageShell>
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </AuthPageShell>
  )
}
