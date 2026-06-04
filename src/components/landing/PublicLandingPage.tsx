import { buttonVariants } from '#/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Link } from '@tanstack/react-router'

const features = [
  {
    title: 'Stable overview',
    description: 'Keep each stable, location, and owner profile organized.',
  },
  {
    title: 'Horse records',
    description: 'Track horses with profile details and scheduled work.',
  },
  {
    title: 'Event calendar',
    description: 'Plan vet, training, dental, trimming, and custom events.',
  },
]

export function PublicLandingPage() {
  return (
    <div className="grid gap-12 py-8">
      <section className="grid gap-6 text-center md:py-12">
        <div className="mx-auto grid max-w-3xl gap-4">
          <p className="text-sm font-medium text-muted-foreground">
            Horse stable management
          </p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Run your stable schedule without losing the details.
          </h1>
          <p className="text-muted-foreground md:text-lg">
            Paddock Pilot helps you manage stables, horses, and recurring care
            events in one clean workspace.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/sign-up/$" className={buttonVariants()}>
            Get started
          </Link>
          <Link
            to="/sign-in/$"
            className={buttonVariants({ variant: 'outline' })}
          >
            Sign in
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  )
}
