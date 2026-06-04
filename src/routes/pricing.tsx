import { PricingTable } from '@clerk/tanstack-react-start'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
})

function PricingPage() {
  return (
    <main className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-10">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-semibold">Choose your plan</h1>
        <p className="text-sm text-muted-foreground">
          Personal Plus unlocks stable member access and horse management.
        </p>
      </div>
      <PricingTable />
    </main>
  )
}
